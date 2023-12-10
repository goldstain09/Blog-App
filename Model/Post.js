const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userId:{type:String,required:true},
  userProfilePicture: { type: String, required: true },
  postTitle: { type: String, required: true },
  postCaption: { type: String, required: true },
  postImage: { type: String, required: true },
  postImageAddress: { type: String, required: true },
  postBlogsPara: { type: [String], required: true },
  postCategory: { type: String, required: true },
  postTags: { type: [String] },
  postComments: { type: [Object] },
  postLikes: { type: [Object] },
  postSaves: { type: [Object] },
  postedAt: { type: Date, default: Date.now },
});

exports.Post = mongoose.model("Post", postSchema);
