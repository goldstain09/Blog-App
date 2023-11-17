const express = require('express');
const userRouter = express.Router();
const userController = require('../Controller/User');
const { auth } = require('../Middleware/User.Auth');

userRouter.post('/createNewUser',userController.createNewUser)
.get('/verifyUserAuth',auth,userController.verifyUserAuth);

exports.userRoutes = userRouter;