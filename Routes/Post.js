const express = require("express");
const postRouter = express.Router();
const postController = require("../Controller/Post");
const { auth } = require("../Middleware/User.Auth");

postRouter
  .post("/PostaBlog", auth, postController.postBlog)
  .get("/getPostData/:postId", auth, postController.getPostData)
  .put("/updateBlog", auth, postController.updateBlog)
  .delete("/deleteBlog/:postId", auth, postController.deleteBlog);

exports.postRoutes = postRouter;
