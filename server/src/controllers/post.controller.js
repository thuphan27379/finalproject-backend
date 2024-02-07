const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Friend = require("../models/Friend");

//
const postController = {};

const calculatePostCount = async (userId) => {
  const postCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
  });
  await User.findByIdAndUpdate(userId, { postCount });
};

// create a new post//////////////////
postController.createNewPost = catchAsync(async (req, res, next) => {
  //// get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const { content, image } = req.body;
  //// business logic validation - kiem chung database
  //// process -xu ly
  let post = await Post.create({
    content,
    image,
    author: currentUserId,
  });

  await calculatePostCount(currentUserId);

  post = await post.populate("author");
  //// response result, success or not
  return sendResponse(
    res,
    200,
    true,
    post,
    null,
    "create new post successfully"
  );
});

// update a single post////////////////////////////
postController.updateSinglePost = catchAsync(async (req, res, next) => {
  //// get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const postId = req.params.id;

  //// business logic validation - kiem chung database
  let post = await Post.findById(postId);
  if (!post) throw new AppError(400, "post is not found", "update post error");
  if (!post.author.equals(currentUserId))
    throw new AppError(400, "only author can edit post", "update post error");

  //// process -xu ly
  const allows = ["content", "image"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });
  await post.save();

  //// response result", success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success post,
    post, // data
    null, // error
    "update post successfully" // message
  );
});

// get a single post////////////////////////////
postController.getSinglePost = catchAsync(async (req, res, next) => {
  //// get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const postId = req.params.id;

  //// business logic validation - kiem chung database
  let post = await Post.findById(postId);
  if (!post)
    throw new AppError(400, "post is not found", "get single post error");

  post = post.toJSON();
  post.comments = await Comment.find(post._id).populate("author");

  //// process -xu ly
  //// response result, success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success
    post, // data
    null, // error
    "get single post successfully" // message
  );
});

// get all posts and user can see with pagination ////////////////////////
postController.getPosts = catchAsync(async (req, res, next) => {
  // return res.send(req.userId);
  const currentUserId = req.userId;
  const userId = req.params.userId; //get userId of request
  let { page, limit, ...filter } = { ...req.query };

  let user = await User.findById(userId); //check userId in database exist or not
  if (!user) throw new AppError(400, "user is not found", "get posts error");

  page = parseInt(page) || 1; //page
  limit = parseInt(limit) || 10;

  // find friends
  let userFriendIDs = await Friend.find({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });

  if (userFriendIDs && userFriendIDs.length) {
    userFriendIDs = userFriendIDs.map((friend) => {
      if (friend.from._id.equals(userId)) return friend.to;
      return friend.from;
    });
  } else {
    userFriendIDs = [];
  }

  userFriendIDs = [...userFriendIDs, userId];

  // for finding posts
  const filterConditions = [
    { isDeleted: false },
    { author: { $in: userFriendIDs } },
  ];
  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  // for pagination
  const count = await Post.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // return posts and page
  let posts = await Post.find(filterCriteria)
    .sort({ createtAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");
  //
  return sendResponse(res, 200, true, { posts, totalPages, count }, null, "");
});

// delete a post /////////////////
postController.deleteSinglePost = catchAsync(async (req, res, next) => {
  //// get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const postId = req.params.id;

  //// business logic validation - kiem chung database

  //// process - xu ly
  post = await Post.findByIdAndUpdate(
    { _id: postId, author: currentUserId },
    { isDeleted: true },
    { new: true }
  );

  if (!post)
    throw new AppError(
      400,
      "post not found or user not authorized",
      "delete post error"
    );
  await calculatePostCount(currentUserId);

  //// response result, success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success post, // data
    post,
    null, // error
    "delete post successfully" // message
  );
});

// get comments of a post/////////////////////
postController.getCommentsOfPost = catchAsync(async (req, res, next) => {
  //// get data from requests
  const postId = res.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  //// business logic validation
  if (!post)
    throw new AppError(404, "comments not found", "get comments of post error");

  //// process
  const count = await Comment.countDocuments({ post: postId });
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const comments = await Comment.find({ post: postId }).sort(
    { createtAt: -1 }.limit(limit).populate("author")
  );

  //// response result
  return sendResponse(
    res,
    200,
    true,
    { comments, totalPages, count },
    null,
    "get comments of post successfully"
  );
});

//
module.exports = postController;
