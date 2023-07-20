const AppError = require("../utils/appError");

const handlecasterrordb = err => {
  
  const message = `Invalid path and value.`
  return new AppError(message, 400);
}
const handleduplicatefeild = err => {
  const message = `Duplicate feild value:"${err.keyValue.name}".please use another name`;
  return (new AppError(message,400))
}
const handleJWTerror = err => new AppError('Invalid token. please login in again', 401);
const handleJWTexpirederror=err=> new AppError('Your token has expired. please login again',401)
const handlevalidationerror = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `invalid input data. ${errors.join('. ')}`;
  return new AppError(message,400)
}
const senderrordev = (err, res) => {
   res.status(err.statusCode).json({
    status: err.status,
     message: err.message,
     error: err,
    stack:err.stack
  });
  
}
const senderrorprod = (err, res) => {
  if (err.isOpertional) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.log('ERROR 🔥🔥', err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong'
    });
  }
}


module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === "development") {
    senderrordev(err, res);
  } else if (process.env.NODE_ENV === "production") {

    let error = Object.create(err);
    console.log(err._message,error.name,error.code);
    if (error.name === 'Error') error = handlecasterrordb(error);
   
    if (error.code === 11000) error = handleduplicatefeild(error);
    if (error.name === "ValidationError") error = handlevalidationerror(error);
    if (error.name === "JsonWebTokenError") error = handleJWTerror(error);
    if (error.name === "TokenExpiredError") error = handleJWTexpirederror(error);
    senderrorprod(error, res);
  }

 
}
