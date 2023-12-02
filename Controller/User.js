// modals
const userModal = require("../Modal/User");
const User = userModal.User;

// otp verification
const otpGenerator = require("otp-generator");
// mail sender
const nodemailer = require("nodemailer");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const util = require("util");
// i did this with the help of chat gpt
// because these genSalt and hash function didnot return promises they use callbacks
// so i use this because I'm not able to use await in that callback
// and use of await is required to save()  data to db...
const genSalt = util.promisify(bcrypt.genSalt);
const hashAsync = util.promisify(bcrypt.hash);

//keys
const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

exports.createNewUser = async (req, res) => {
  const { userName, Name, Password } = req.body;
  try {
    const userToken = jwt.sign(
      { user: { userName: userName, Name: Name } },
      privateKey,
      { algorithm: "RS256", expiresIn: `15m` }
    );
    const user = new User(req.body);
    user.jwToken = userToken;
    user.Name = Name;
    user.userName = userName;
    const SaltRounds = 14;
    const salt = await genSalt(SaltRounds);
    const hashPas = await hashAsync(Password, salt);
    if (hashPas) {
      user.Password = hashPas;
      await user.save();
      delete user.Password;
      res.json({ data: user, userCreated: true });
    }
  } catch (error) {
    if (error.hasOwnProperty("code") && error.hasOwnProperty("keyValue")) {
      if (error.code === 11000) {
        res.json({
          userCreated: false,
          userNameIsUnique: false,
        });
      }
    } else {
      res.json({
        errorMessage: error,
        userCreated: false,
      });
    }
  }
};

exports.verifyUserAuth = async (req, res) => {
  const userData = req.userData;
  const newUserToken = req.newUserToken;
  try {
    const user = await User.findOne({ userName: userData.user.userName });
    delete user.Password;
    await User.findByIdAndUpdate(user._id, { $set: { jwToken: newUserToken } });
    user.jwToken = newUserToken;
    res.json({
      data: user,
      verification: true,
    });
  } catch (error) {
    res.json({
      verification: false,
      errorMessage: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  const { userName, Password } = req.body;
  try {
    const user = await User.findOne({ userName: userName });
    if (user) {
      // i take help from chat gpt here because i want to update jwtoken in database also, with response
      // and inside compare function using await is giving error!!!!
      const result = await new Promise((resolve, reject) => {
        bcrypt.compare(Password, user.Password, (err, result) => {
          if (err) {
            throw Error(`Unable to login! ${err.message}`);
          } else {
            resolve(result);
          }
        });
      });
      if (result) {
        // first signing a new token
        const newUserToken = jwt.sign(
          { user: { userName: user.userName, Name: user.Name } },
          privateKey,
          { algorithm: "RS256", expiresIn: `15m` }
        );
        // now update that token in database
        await User.findByIdAndUpdate(user._id, {
          $set: { jwToken: newUserToken },
        });
        user.jwToken = newUserToken;
        delete user.Password;
        res.json({
          data: user,
          userLoginSuccess: true,
        });
      } else {
        res.json({
          PasswordIsWrong: true,
          userLoginSuccess: false,
        });
      }
    } else {
      res.json({
        userNameIsWrong: true,
        userLoginSuccess: false,
      });
    }
  } catch (error) {
    res.json({
      userLoginSuccess: false,
      errorMessage: error.message,
    });
  }
};

exports.checkUsernameAvailablity = async (req, res) => {
  const { userName } = req.params;
  try {
    const user = await User.findOne({ userName: userName });
    if (user) {
      res.json(false);
    } else {
      res.json(true);
    }
  } catch (error) {
    res.json({ someErrorOccured: error.message });
  }
};

exports.editUser = async (req, res) => {
  const { Name, userName, profilePicture, Biography } = req.body; // new data which user wants to update
  const userData = req.userData.user; // old data which is get by token
  try {
    const user = await User.findOne({ userName: userData.userName });
    // i m using auth middlewares newly created token but then i realised that token made with old name and username that will make problem in
    // future -- so i created a new token here with new info---
    const newUserToken = jwt.sign(
      { user: { userName: userName, Name: Name } },
      privateKey,
      { algorithm: "RS256", expiresIn: `15m` }
    );
    // here is update ones fields
    const updateFields = {
      userName: userName,
      Name: Name,
      profilePicture: profilePicture,
      Biography: Biography,
      jwToken: newUserToken,
    };
    const UpdatedUser = await User.findByIdAndUpdate(user._id, updateFields, {
      new: true,
    });
    const userr = { ...UpdatedUser };
    (userr._doc.updated = "true"), delete userr._doc.Password;
    res.json({
      data: userr._doc,
      userUpdated: true,
    });
  } catch (error) {
    res.json({
      userUpdated: false,
      errorMessage: error.Message,
    });
  }
};

exports.AddEmailOtpVerification = async (req, res) => {
  // const userData = req.userData.user;
  const newUserToken = req.newUserToken;
  const email = req.params.email;

  try {
    const generateOTP = () => {
      return otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
        alphabets: false,
        digits: true,
        length: 6,
        secret: true,
        expiration: 300,
        characters: "0123456789",
      });
    };
    const otp = generateOTP();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Bloggo Basho's Email Verification OTP",
      html: `<h1>Your OTP is: ${otp}</h1>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw Error(error.message);
      } else {
        res.json({
          message: "OTP is sent!",
          OtpSent: true,
          otpInfo: { otp: otp, info: info },
          jwToken: newUserToken,
        });
      }
    });
  } catch (error) {
    res.json({
      message: "Something went wrong, Please try again after sometime!",
      OtpSent: false,
      errorMessage: error.message,
    });
  }
};

exports.addUserEmail = async (req, res) => {
  const userData = req.userData.user;
  const newUserToken = req.newUserToken;
  const email = req.body.Email;
  try {
    const user = await User.findOne({ userName: userData.userName });
    const updateData = {
      Email: email,
      jwToken: newUserToken,
    };
    const UpdatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true }); // {$set:{Email:email}}
    const userr = {...UpdatedUser};
    (userr._doc.emailUpdated = "true"), delete userr._doc.Password;
    res.json({
      data: userr._doc,
      emailUpdated: true,
    });
  } catch (error) {
    res.json({
      errorMessage: error.message,
      emailUpdated: false,
    });
  }
};
