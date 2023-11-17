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
const privteKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

exports.createNewUser = async (req, res) => {
  const { userName, Name, Password } = req.body;
  try {
    const userToken = jwt.sign(
      { user: { userName: userName, Name: Name } },
      privteKey,
      { algorithm: "RS256", expiresIn: `1h` }
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
  try {
    const user = await User.findOne({ userName: userData.user.userName });
    delete user.Password;
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
