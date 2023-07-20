const reviewcontroller = require('./../controllers/reviewcontroller');
const authcontroller = require('./../controllers/authcontroller');
const express = require('express');
const router=express.Router({ mergeParams: true });
router.use(authcontroller.protect);
router.route('/')
    .get(reviewcontroller.getallreviews).
    post(authcontroller.protect, authcontroller.restrictTo('user'),reviewcontroller.setToursIDs ,reviewcontroller.createreview);
module.exports = router;
router.route('/:id').get(reviewcontroller.getreview).patch(authcontroller.restrictTo('user', 'admin'), reviewcontroller.updatereview).delete(authcontroller.restrictTo('user', 'admin'), reviewcontroller.deletereview);