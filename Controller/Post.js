const postModal = require("../Model/Post");
const userModal = require("../Model/User");
const Post = postModal.Post;
const User = userModal.User;

exports.postBlog = async (req, res) => {
  const newUsertoken = req.newUserToken;
  const userData = req.userData.user;
  const postData = req.body.postData;
  try {
    const user = await User.findOne({ userName: userData.userName });
    const post = new Post(postData);
    // splitted tags in an array
    const splittedTags = postData.postTags.split(" ");
    let removeEmptySpaceValues = splittedTags.filter(
      (item) => item !== "" && item !== " "
    );

    post.postTags = removeEmptySpaceValues;
    post.userName = user.userName;
    post.userProfilePicture = user.profilePicture;
    await post.save();
    // post data which will saved in user profile
    const postid = post._id.toString();
    user.myPosts.push({
      postId: postid,
      postLikes: post.postLikes,
      postComments: post.postComments,
      postImage: post.postImage,
    });
    const updateData = {
      jwToken: newUsertoken,
      myPosts: user.myPosts,
    };
    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
    });
    const userr = { ...updatedUser };
    delete userr._doc.Password;
    res.json({
      blogPosted: true,
      userData: userr._doc,
    });
  } catch (error) {
    res.json({
      blogPosted: false,
      errorMessage: error.message,
    });
  }
};

exports.getPostData = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    res.json({
      post: post,
    });
  } catch (error) {
    res.json({
      errorMessage: error.message,
    });
  }
};

exports.updateBlog = async (req, res) => {
  const newUsertoken = req.newUserToken;
  const userData = req.userData.user;
  const postDataToUpdate = req.body.postData;
  try {
    const user = await User.findOne({ userName: userData.userName });
    // post data to update
    let splittedTags = postDataToUpdate.postTags.split(" ");
    let removeEmptySpaceValues = splittedTags.filter(
      (item) => item !== "" && item !== " "
    );
    const updateData = {
      postTitle: postDataToUpdate.postTitle,
      postCaption: postDataToUpdate.postCaption,
      postBlogsPara: postDataToUpdate.postBlogsPara,
      postTags: removeEmptySpaceValues,
    };
    await Post.findByIdAndUpdate(postDataToUpdate.postId, updateData);
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { jwToken: newUsertoken } },
      { new: true }
    );
    const userr = { ...updatedUser };
    delete userr._doc.Password;
    res.json({
      postUpdated: true,
      userData: userr._doc,
    });
  } catch (error) {
    res.json({
      postUpdated: false,
      errorMessage: error.message,
    });
  }
};

exports.deleteBlog = async (req, res) => {
  const newUsertoken = req.newUserToken;
  const userData = req.userData.user;
  const postId = req.params.postId;
  try {
    const user = await User.findOne({ userName: userData.userName });
    await Post.findByIdAndDelete(postId);
    const userRemainingPosts = user.myPosts.filter(
      (item) => item.postId !== postId
    );
    const updateData = {
      jwToken: newUsertoken,
      myPosts: userRemainingPosts,
    };
    const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
    });
    const userr = { ...updatedUser };
    delete userr._doc.Password;
    res.json({
      postDeleted: true,
      userData: userr._doc,
    });
  } catch (error) {
    res.json({
      postDeleted: false,
      errorMessage: error.message,
    });
  }
};
