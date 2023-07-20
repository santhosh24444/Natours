/*eslint-disable*/

const { promisify } = require('util');
const crypto = require('crypto');
const user = require('./../models/usermodel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const sendemail = require('./../utils/emails');
const AppError = require('./../utils/appError');
const { reset } = require('nodemon');
//const { response } = require('../app');
const signtoken = id => {
  return jwt.sign(
    {
      id
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES
    }
  );
};
const createsendtoken = (user, statuscode, res) => {
  const token = signtoken(user._id);
  const cookieoptions = {
    expries: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRESIN),
    //secure: true,//tj=he cookie will be sent noly in encrypteed and only in https only
    httpOnly: true
  };
  res.cookie('jwt', token, cookieoptions);
  if (process.env.NODE_ENV === 'production') cookieoptions.secure = true;
  //remove password from output
  user.password = undefined;

  res.status(statuscode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newuser = await user.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordconfirm: req.body.passwordconfirm,
    role: req.body.role
  });

  const token = signtoken(newuser._id);
  createsendtoken(newuser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new AppError('Please provide password or email', 400));
  }
  const user1 = await user.findOne({ email }).select('+password');
  if (!user1 || !(await user1.correctPassword(password, user1.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createsendtoken(user1, 200, res);

  const token = signtoken(user1._id);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in. Please log in to Access the features',
        401
      )
    );
  }

  //2 verifying
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);
  const freshuser = await user.findById(decoded.id);
  //console.log(freshuser);
  if (!freshuser) {
    return next(
      new AppError('The user belonging to the token no longer exists', 401)
    );
  }
  //check whether the user has changed pass after the token was issued
  if (freshuser.changedpasswordafter(decoded.iat)) {
    return next(
      new AppError('User recently cahnged password! Please login again', 401)
    );
  }
  req.user = freshuser;
  next();
});
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );
    const freshuser = await user.findById(decoded.id);
    if (!freshuser) {
      return next();
    }
    //check whether the user has changed pass after the token was issued
    if (freshuser.changedpasswordafter(decoded.iat)) {
      return next();
    }
    res.locals.user = freshuser; //

    return next();
  }
  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
//when user hites the routeforgot password
//we find the account by email and if not then error
//
exports.forgotpassword = catchAsync(async (req, res, next) => {
  const USER = await user.findOne({ email: req.body.email });
  if (!USER) {
    return next(new AppError('There is no user with this email', 404));
  }
  const reseToken = USER.createPasswordResetToken();
  await USER.save({ validateBeforeSave: false });

  //sending mail
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${reseToken}`;
  const message = `forgot your password? submit a PATCH request with your new password and passwordconfirm to:${resetURL}.\n If not please ignore`;
  try {
    await sendemail({
      email: USER.email,
      subject: 'Your password reset token valid for 10 mins',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    USER.PasswordResetToken = undefined;
    USER.passwordResetExpires = undefined;
    await USER.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error in sending the email. Try again later')
    );
  }
});
exports.resetpassword = catchAsync(async (req, res, next) => {
  //Get user based on the token
  const hashedtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user1 = await user.findOne({
    PasswordResetToken: hashedtoken,
    passwordResetExpries: { $gt: Date.now() }
  });

  //If token has not expired,and
  if (!user1) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user1.password = req.body.password;
  user1.passwordconfirm = req.body.passwordconfirm;
  user1.passwordResetExpries = undefined;
  user1.PasswordResetToken = undefined;
  await user1.save();
  createsendtoken(user1, 200, res);
});
exports.updatepasssword = catchAsync(async (req, res, next) => {
  const User = await user.findById(req.user.id).select('+password');
  if (!(await User.correctPassword(req.body.passwordcurrent, User.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  User.password = req.body.password;
  User.passwordconfirm = req.body.passwordconfirm;
  await User.save();
  createsendtoken(User, 200, res);
});
