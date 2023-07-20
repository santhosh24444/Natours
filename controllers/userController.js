const user = require('./../models/usermodel');
const catchAsync = require('./../utils/catchAsync');
const apifeatures = require('./../utils/api-features');
const AppError = require('../utils/appError');
const factory = require('./handlefactory');
const filterobj = (obj, ...allowedfeilds) => {//this function is for removing all the unwanted feilfs when using the updateme route.we want to remove all and only allow etio update email and name.
  const newobj = {};
  Object.keys(obj).forEach(el => {
    if (allowedfeilds.includes(el)) newobj[el] = obj[el]
  });
  return newobj;
}
exports.getAllUsers = factory.getall(user);
  
exports.getme = (req, res, next) => {
  console.log(req.user);
  req.params.id = req.user.id;
  next();
}

 exports.updateme =catchAsync(async (req, res, next) => {
   if (req.body.password || req.body.passwordconfirm) {
     return next(new AppError('You cant update your password here.Please use another route (/updatemypassword)',400))
   }
   const filteredbody = filterobj(req.body, 'name', 'email')
   console.log(req.body);
   const User = await user.findByIdAndUpdate(req.user.id,filteredbody,{new:true,runValidators:true});
   res.status(200).json({
     status: 'success',
     data: {
       User:User
     }
   })
 })
exports.deleteme = catchAsync(async (req, res, next) => {
  await user.findByIdAndUpdate(req.user, { active: false });
  res.status(204).json({
    status: 'success',
    dtat:null
  })
})
exports.getUser = factory.getone(user);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use signup instead'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = factory.updateone(user);
exports.deleteUser = factory.deleteone(user);
