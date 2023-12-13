const express = require('express');
const userRouter = express.Router();
const userController = require('../Controller/User');
const { auth } = require('../Middleware/User.Auth');

userRouter.post('/createNewUser',userController.createNewUser)
.get('/verifyUserAuth',auth,userController.verifyUserAuth)
.post('/loginUser',userController.loginUser)
.get('/checkUserNameAvailableOrNOT/:userName',userController.checkUsernameAvailablity)
.put('/editUser',auth,userController.editUser)
.get('/AddEmailOtpVerification/:email',auth,userController.AddEmailOtpVerification)
.put('/addUserEmail',auth, userController.addUserEmail)
.put('/removeUserEmail',auth, userController.removeUserEmail)
.put('/changeUserPassword',auth, userController.changePassword)
.get('/changePasswordOtpVerification/:email',auth, userController.changePasswordOtpVerification)
.put('/forgetChangeUserPassword',auth, userController.forgetChangeUserPassword)
.put('/checkPasswordForDeleteAccount',auth,userController.checkPasswordForDeleteAccount)
.delete('/deleteUserAccount',auth,userController.deleteUserAccount)
.get('/getBloggerData',auth,userController.getBloggerData)
.get('/getUserUserNameAndDp/:userId',userController.getUserUserNameAndDp)
.put('/followBlogger',auth,userController.followBlogger)
.put('/unfollowBlogger',auth,userController.unfollowBlogger);

exports.userRoutes = userRouter;