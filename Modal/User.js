const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  likedPost: { type: [Object] },
  savedPost: { type: [Object] },
  myPosts: { type: [Object] },
  Followers: { type: [Object] },
  Followings: { type: [Object] },
  profilePicture: {type:String, default:''},
  jwToken: String,
  Biography: String,
  createdAt: { type: Date, default: Date.now },
});

exports.User = mongoose.model("User", userSchema);
