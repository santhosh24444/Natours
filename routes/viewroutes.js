const express = require('express');
const authcontroller = require('../controllers/authcontroller');
const viewscontroller=require('../controllers/viewscontroller')
const router = express.Router()
router.use(authcontroller.isLoggedIn);
router.get('/', viewscontroller.getoverview)
router.get('/tour/:slug',authcontroller.protect ,viewscontroller.getttour);
router.get('/login',viewscontroller.getloginform)
module.exports = router;