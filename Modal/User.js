const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Email: { type: String,default:""},
  Name: { type: String, required: true },
  likedPost: { type: [Object] },
  savedPost: { type: [Object] },
  myPosts: { type: [Object] },
  Followers: { type: [Object] },
  Followings: { type: [Object] },
  profilePicture: {type:String, default:'https://firebasestorage.googleapis.com/v0/b/blog-app-2d912.appspot.com/o/icon.webp?alt=media&token=99270953-b1b0-40bd-99a8-e381c255afcb'},
  jwToken: String,
  Biography:{ type:String,default:""},
  createdAt: { type: Date, default: Date.now },
});

exports.User = mongoose.model("User", userSchema);
