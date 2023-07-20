const express = require('express');
const tourController = require('./../controllers/tourController');
const authcontroller = require('./../controllers/authcontroller');
const reviewrouter = require('./../routes/reviewroutes');
const router = express.Router();

router.use('/:tourid/reviews', reviewrouter);


// router.param('id', tourController.checkID);

router.route('/top-5-cheap').get(tourController.aliastoptours).get(tourController.getAllTours);
router.route('/monthly-plan/:year').get(authcontroller.protect,authcontroller.restrictTo('admin','lead-guide','guide'),tourController.getmonthlypplan);
router.route('/tour-stats').get(tourController.gettourstatus);
router.route('/tours-within/:distance/centre/:latlng/unit/:unit').get (tourController.gettourswithin);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(authcontroller.protect,authcontroller.restrictTo('admin','lead-guide'),tourController.createTour);
router.route('/distances/:latlng/unit/:unit').get(tourController.getdistances);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authcontroller.protect,authcontroller.restrictTo('admin','lead-guide')
    , tourController.deleteTour);

// router.route('/:tourid/reviews').post(authcontroller.protect,authcontroller.restrictTo('user'),reviewcontroller.createreview);

module.exports = router;
