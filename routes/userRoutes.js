const express = require('express');
const userController = require('./../controllers/userController');
const authcontroller = require('./../controllers/authcontroller');
const router = express.Router();

router.post('/signup', authcontroller.signup);
router.post('/login', authcontroller.login);
router.patch('/resetPassword/:token', authcontroller.resetpassword);
router.post('/forgotPassword', authcontroller.forgotpassword);

router.use(authcontroller.protect)

router.patch('/updateMyPassword',  authcontroller.updatepasssword);
router.patch('/updateMe',  userController.updateme);
router.get('/me', userController.getme, userController.getUser);
router.use(authcontroller.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router.delete('/deleteMe',  userController.deleteme);  
/*protects all the user routes
 
 */
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
