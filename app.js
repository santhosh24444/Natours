/*eslint-disable*/

const express = require('express');
const cookieparser = require('cookie-parser');
const path = require('path'); /*a build in node module used to specify path refer 18th line   */
const ratelimit = require('express-rate-limit'); //to avoid too many requests
const helmet = require('helmet'); //it is simple package which contains all the security preventions functions
const { OrderedBulkOperation } = require('mongodb');
const hpp = require('hpp');
const apperror = require('./utils/appError');
const errcon = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const app = express();
const viewrouter = require('./routes/viewroutes');
const reviewrouter = require('./routes/reviewroutes');
const review = require('./models/reviewmodel');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 1) MIDDLEWARES
// Further HELMET configuration for Security Policy (CSP)
//app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} //devlopment logging
const limiter = ratelimit({
  max: 100, //number of requests  allowed from a ip
  windowMs: 60 * 60 * 1000, //represents the time ie 100  req allowed in an hour
  message: 'Too many requests,Please try again'
});
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'difficulty',
      'maxGroupSize',
      'ratingsAverage',
      'price'
    ]
  })
); //prevent parameter pollution
app.use('/api', limiter);
app.use(express.json({ limit: '10kb' })); //it will not accept aything which is larger than 40kb
app.use(cookieparser());
app.use(mongoSanitize());
app.use(xss());

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewrouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewrouter);

app.all('*', (req, res, next) => {
  next(new apperror(`can't find${req.originalUrl} on this server`, 400));
});
app.use(errcon);
module.exports = app;
