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

    if (
      post.postLikes.every((item) => item.userId !== LikerUser._id) &&
      LikerUser.likedPost.every((item) => item.postId !== postId)
    ) {
      // if it gives false means the liker user already liked that post so no action should execute!
      // now first of all adding one like in the post
      post.postLikes.push({
        userName: LikerUser.userName,
        userId: LikerUser._id,
        profilePicture: LikerUser.profilePicture,
      });

      // now updating that user who likes the post
      LikerUser.likedPost.push({
        postId: postId,
        postImage: post.postImage,
      });
      await Post.findByIdAndUpdate(postId, {
        $set: { postLikes: post.postLikes },
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
        userData: user._doc,
        liked: true,
      });
    }
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

    if (
      post.postLikes.every((item) => item.userId !== unlikerUser._id) &&
      unlikerUser.likedPost.every((item) => item.postId !== postId)
    ) {
    } else {
      // now first of all remove that user's like from post.postLikes
      const newUpdatedPostLikes = post.postLikes.filter(
        (item) => item.userId.toString() !== unlikerUser._id.toString()
      );
      // now remove from likedPosts of user or unliker--
      const newUpdatedLikedPosts = unlikerUser.likedPost.filter(
        (item) => item.postId !== postId
      );

      await Post.findByIdAndUpdate(post._id, {
        $set: { postLikes: newUpdatedPostLikes },
      });

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
    }
  } catch (error) {
    res.json({
      errorMessage: error.message,
      unliked: false,
    });
  }
};
exports.savePost = async (req, res) => {
  const userData = req.userData.user;
  const { postId } = req.body;
  try {
    // the post which is saved
    const post = await Post.findById(postId);
    // the user who saved this post
    const postSaver = await User.findOne({ userName: userData.userName });
    if (
      post.postSaves.every((item) => item.userId !== postSaver._id) && // checking that this user is already exist in postSaves or not--
      postSaver.savedPost.every((item) => item.postId !== postId) // checking that this post already exist in user's saved post or not
    ) {
      post.postSaves.push({
        userName: postSaver.userName,
        userId: postSaver._id,
        profilePicture: postSaver.profilePicture,
      });
      postSaver.savedPost.push({
        postId: postId,
        postImage: post.postImage,
      });
      await Post.findByIdAndUpdate(postId, {
        $set: { postSaves: post.postSaves },
      });
      const updatedUser = await User.findByIdAndUpdate(
        postSaver._id,
        { $set: { savedPost: postSaver.savedPost } },
        { new: true }
      );
      const user = { ...updatedUser };
      delete user._doc.Password;
      res.json({
        userData: user._doc,
        saved: true,
      });
    }
  } catch (error) {
    res.json({
      saved: false,
      errorMessage: error.message,
    });
  }
};
exports.unsavePost = async (req, res) => {
  const userData = req.userData.user;
  const { postId } = req.body;

  try {
    // post which is unsaved
    const post = await Post.findById(postId);
    // user  who unsaved the post
    const postUnsaver = await User.findOne({ userName: userData.userName });

    if (
      post.postSaves.every((item) => item.userId !== postUnsaver._id) &&
      postUnsaver.savedPost.every((item) => item.postId !== postId)
    ) {
    } else {
      // removing this user from postSaves
      const updatedPostSaves = post.postSaves.filter(
        (item) => item.userId !== postUnsaver._id
      );

      // removing this post from user's savedPosts
      const updatedSavedPost = postUnsaver.savedPost.filter(
        (item) => item.postId !== postId
      );

      await Post.findByIdAndUpdate(postId, {
        $set: { postSaves: updatedPostSaves },
      });
      const updatedUser = await User.findByIdAndUpdate(
        postUnsaver._id,
        { $set: { savedPost: updatedSavedPost } },
        { new: true }
      );
      const user = { ...updatedUser };
      delete user._doc.Password;
      res.json({
        userData: user._doc,
        unsaved: true,
      });
    }
  } catch (error) {
    res.json({
      errorMessage: error.message,
      unsaved: false,
    });
  }
};

exports.postComment = async (req, res) => {
  const userData = req.userData.user;
  const { postId, comment } = req.body;
  try {
    // the post on which user want to comment
    const post = await Post.findById(postId);
    // the user
    const Commenter = await User.findOne({ userName: userData.userName });

    // here i didnot check that user already had a comment on that post or not bcz a user can do multiple comments
    // so we directly push the comment!!
    const commentId = `${Commenter._id}${(Math.random() * 88888) / 9038}`;
    post.postComments.push({
      userId: Commenter._id,
      commentId: commentId,
      comment: comment,
    });
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: { postComments: post.postComments },
      },
      { new: true }
    );
    res.json({
      updatedPost: updatedPost,
      commentPosted: true,
    });
  } catch (error) {
    res.json({
      errorMessage: error.message,
      commentPosted: false,
    });
  }
};

exports.deleteComment = async (req, res) => {
  const { commentDetail, postId } = req.body;
  try {
    const post = await Post.findById(postId);
    const updatedComments = post.postComments.filter(
      (item) => item.commentId !== commentDetail.commentId
    );
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: { postComments: updatedComments } },
      { new: true }
    );

    res.json({
      updatedPost: updatedPost,
      commentDeleted: true,
    });
  } catch (error) {
    res.json({
      commentDeleted: false,
      errorMessage: error.message,
    });
  }
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
