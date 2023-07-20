const review = require('./../models/reviewmodel');
const factory = require('./handlefactory');
const catchAsync = require('./../utils/catchAsync');
exports.setToursIDs = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourid;
  req.body.user = req.user.id;
  next();
};
exports.getallreviews = factory.getall(review);

exports.getreview = factory.getone(review);
exports.createreview = factory.createone(review);
exports.updatereview = factory.updateone(review);
exports.deletereview = factory.deleteone(review);
