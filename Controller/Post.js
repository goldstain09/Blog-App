const postModel = require("../Model/Post");
const userModel = require("../Model/User");
const Post = postModel.Post;
const User = userModel.User;

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
    post.userId = user._id.toString();
    await post.save();
    // post data which will saved in user profile
    const postid = post._id.toString();
    user.myPosts.push({
      postId: postid,
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

exports.getAllPosts = async (req, res) => {
  try {
    const allPostsData = await Post.find();
    res.json({
      allPosts: allPostsData,
    });
  } catch (error) {
    res.json({
      errorMessage: error.message,
    });
  }
};

exports.likePost = async (req, res) => {
  const userData = req.userData.user;
  const { postId } = req.body;
  try {
    // the post which is liked by user
    const post = await Post.findById(postId);

    // the user who liked the post
    const LikerUser = await User.findOne({ userName: userData.userName });

    // now first of all adding one like in the post
    post.postLikes.push({
      userName: LikerUser.userName,
      userId: LikerUser._id,
      profilePicture: LikerUser.profilePicture,
    });
    await Post.findByIdAndUpdate(postId, {
      $set: { postLikes: post.postLikes },
    });

    // now updating that user who likes the post
    LikerUser.likedPost.push({
      postId: postId,
      postImage: post.postImage,
    });
    const updatedUser = await User.findByIdAndUpdate(
      LikerUser._id,
      {
        $set: { likedPost: LikerUser.likedPost },
      },
      { new: true }
    );
    const user = { ...updatedUser };
    delete user._doc.Password;
    // in response we will send liker means user updated data!
    res.json({
      userData: user,
      liked: true,
    });
  } catch (error) {
    res.json({
      liked: false,
      errorMessage: error.message,
    });
  }
};
exports.unlikePost = async (req, res) => {
  const userData = req.userData.user;
  const { postId } = req.body;
  try {
    // the post which is unliked
    const post = await Post.findById(postId);
    // the user who unlike this post
    const unlikerUser = await User.findOne({ userName: userData.userName });

    // now first of all remove that user's like from post.postLikes
    const newUpdatedPostLikes = post.postLikes.filter(
      (item) => item.userId.toString() !== unlikerUser._id.toString()
    );
    // console.log(newUpdatedPostLikes);
    await Post.findByIdAndUpdate(post._id, {
      $set: { postLikes: newUpdatedPostLikes },
    });

    // now remove from likedPosts of user or unliker--
    const newUpdatedLikedPosts = unlikerUser.likedPost.filter(
      (item) => item.postId !== postId
    );
    const updatedUser = await User.findByIdAndUpdate(
      unlikerUser._id,
      { $set: { likedPost: newUpdatedLikedPosts } },
      { new: true }
    );
    const user = { ...updatedUser };
    delete user._doc.Password;
    res.json({
      userData: user._doc,
      unliked: true,
    });
  } catch (error) {
    res.json({
      errorMessage: error.message,
      unliked: false,
    });
  }
};
exports.savePost = async (req, res) => {
  const userData = req.userData.user;
};
exports.unsavePost = async (req, res) => {
  const userData = req.userData.user;
};

// // the user whose post is it!!
// const WhosePostUser = await User.findById(post.userId);

// now updating the user whose post is it
// const thatOnePostFromUserMyPosts = WhosePostUser.myPosts.filter(
//   (item) => item.postId === postId
// );
// // thatOnePostFromUserMyPosts[0].postLikes.push({
// //   userName: LikerUser.userName,
// //   userId: LikerUser._id,
// //   profilePicture: LikerUser.profilePicture,
// // });
// thatOnePostFromUserMyPosts[0].postLikes = post.postLikes; // these are two diff. methods but i think this is more stable!!!
// await User.findByIdAndUpdate(post.userId, {
//   $set: { myPosts: WhosePostUser.myPosts },
// });

// next step is to also sett updated likes into whose post it is ,, so that their my posts are also up to date!
// const thatOnePostFromUserMyPosts = whosePostUser.myPosts.filter((item) => item.postId === postId);
// thatOnePostFromUserMyPosts[0].postLikes = newUpdatedPostLikes;
// await User.findByIdAndUpdate(whosePostUser._id, {$set:{myPosts}})
