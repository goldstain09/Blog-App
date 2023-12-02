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
.put('/addUserEmail',auth, userController.addUserEmail);

exports.userRoutes = userRouter;