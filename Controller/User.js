// modals
const userModal = require("../Modal/User");
const User = userModal.User;

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
