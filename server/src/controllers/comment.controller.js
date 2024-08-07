const { sendResponse, AppError, catchAsync } = require("../helpers/utils"); //
const Post = require("../models/Post"); //
const User = require("../models/User");
const Comment = require("../models/Comment"); //
const Friend = require("../models/Friend");

//
const commentController = {};

// count comments
const calculateCommentCount = async (postId) => {
  const commentCount = await Comment.countDocuments({
    post: postId,
    isDeleted: false,
  });
  await Post.findByIdAndUpdate(postId, { commentCount });
};

// create a new comment
commentController.createNewComment = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const { content, postId } = req.body;

  // business logic validation - kiem chung database check posts exists
  const post = Post.findById(postId);
  if (!post)
    throw new AppError(400, "Post not found", "Create new comment error");

  // process - xu ly
  let comment = await Comment.create({
    author: currentUserId,
    post: postId,
    content,
  });

  // update commentCount of the post
  await calculateCommentCount(postId);
  comment = await comment.populate("author");

  // response result, success or not
  return sendResponse(
    res,
    200,
    true,
    { content },
    null,
    "Create new comment successfully"
  );
});

// update a comment // NOT YET, edit btn
commentController.updateSingleComment = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  const commentId = req.params.id;
  const { content } = req.body;

  // process
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, author: currentUserId },
    { content },
    { new: true }
  );

  // business logic validation
  if (!comment)
    throw new AppError(
      400,
      "Comment not found or user not authorized",
      "Update comment error"
    );

  // response result
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Update comment successfully"
  );
});

// delete a comment
commentController.deleteSingleComment = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  const commentId = req.params.id;

  // process
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    author: currentUserId,
  });

  // business logic validation
  if (!comment)
    throw new AppError(
      400,
      "Comment not found or user not authorized",
      "Delete comment error"
    );
  await calculateCommentCount(comment.post);

  // response result
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Delete comment successfully"
  );
});

// get details of a comment
commentController.getSingleComment = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  const commentId = req.params.id;

  // process
  let comment = await Comment.findById(commentId);

  // business logic validation
  if (!comment)
    throw new AppError(400, "Comment not found", "Get single comment error");

  // response result
  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Get single comment successfully"
  );
});

//
module.exports = commentController;
