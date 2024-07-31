const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Friend = require("../models/Friend");

//
const postController = {};

// post count
const calculatePostCount = async (userId) => {
  const postCount = await Post.countDocuments({
    author: userId,
    isDeleted: false,
  });
  await User.findByIdAndUpdate(userId, { postCount });
};

// create a new post// postController.createPost ??
// & on the group ?!?!
postController.createPost = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const currentGroupId = req.params.groupId; //?
  const { content, image, fromGroup, groupId } = req.body;

  // business logic validation - kiem chung database
  // process -xu ly
  let post = await Post.create({
    content,
    image,
    author: currentUserId,
    // fromGroup: fromGroup || false, // Default to false if not provided
    fromGroup: !!fromGroup, // Convert to boolean if necessary
    groupId: fromGroup ? groupId : null, // Only set groupId if fromGroup is true
  });

  await calculatePostCount(currentUserId);

  post = await post.save();
  post = await post.populate("author");

  // response result, success or not
  return sendResponse(
    res,
    200,
    true,
    post,
    null,
    "Create new post successfully"
  );
});

// update a single post//
postController.updateSinglePost = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const postId = req.params.id;

  // business logic validation - kiem chung database
  let post = await Post.findById(postId);
  if (!post) throw new AppError(400, "Post is not found", "Update post error");
  if (!post.author.equals(currentUserId))
    throw new AppError(400, "Only author can edit post", "Update post error");

  // process - xu ly
  const allows = ["content", "image"];
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });
  await post.save();

  // response result", success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success post,
    post, // data
    null, // error
    "Update post successfully" // message
  );
});

// get a single post//
postController.getSinglePost = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const postId = req.params.id;

  // business logic validation - kiem chung database
  let post = await Post.findById(postId);
  if (!post)
    throw new AppError(400, "Post is not found", "Get single post error");

  // process - xu ly
  post = post.toJSON();
  post.comments = await Comment.find(post._id).populate("author");

  // response result, success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success
    post, // data
    null, // error
    "Get single post successfully" // message
  );
});

// get all posts and user can see with pagination //
postController.getPosts = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  // return res.send(req.userId);
  const currentUserId = req.userId;
  const userId = req.params.userId; //get userId of request
  let { page, limit } = { ...req.query };

  // business logic validation - kiem chung database
  let user = await User.findById(userId); //check userId in database exist or not
  if (!user) throw new AppError(400, "user is not found", "get posts error");

  // post from group,  Retrieve user's group memberships
  const userGroups = await Group.find({
    members: currentUserId,
    fromGroup: false, // not post from group
  });
  // Extract groupIds where user is a member
  const groupIds = userGroups.map((group) => group._id);

  // process - xu ly
  page = parseInt(page) || 1; //page
  limit = parseInt(limit) || 10;

  // for find friends's ID to get friend's posts
  let userFriendIDs = await Friend.find({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });

  if (userFriendIDs && userFriendIDs.length) {
    // lay ra ~ id only of friends for array userFriendIDs
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
    {
      isDeleted: false,
      fromGroup: false, // not post from group
    },
    { author: { $in: userFriendIDs } },
  ];
  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  // for pagination
  const count = await Post.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // if post from group & by groupId (postsByGroupId)
  // const posts = await Post.find({
  //   fromGroup: true,
  //   group: { $in: groupIds },
  // });

  // return posts and page
  let posts = await Post.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  // response result, success or not
  return sendResponse(res, 200, true, { posts, totalPages, count }, null, "");
});

// delete a post // soft               && delete in postsByGroupId also ?
postController.deleteSinglePost = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const postId = req.params.id;

  // business logic validation - kiem chung database
  // process - xu ly
  const post = await Post.findByIdAndUpdate(
    { _id: postId, author: currentUserId },
    { isDeleted: true }, // update isDeleted
    { new: true } //sau do tra lai 1 object moi
  );

  // // also remove postId trong postsByGroupId[] of Group
  // const updatePostByGroup = await Group.findByIdAndUpdate(
  //   postId, groupId,
  //   { $pull: { "groups.$._id": postId } },
  //   { new: true }
  // );

  if (!post)
    throw new AppError(
      400,
      "Post not found or user not authorized",
      "Delete post error"
    );

  await calculatePostCount(currentUserId);

  // response result, success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success post,
    post, // data
    null, // error
    "Delete post successfully" // message
  );
});

// get comments of a post//
postController.getCommentsOfPost = catchAsync(async (req, res, next) => {
  // get data from requests
  const postId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // business logic validation
  // if (!post)
  //   throw new AppError(404, "Comments not found", "get comments of post error");

  //// process
  const count = await Comment.countDocuments({ post: postId });
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");
  // response result
  return sendResponse(
    res,
    200,
    true,
    { comments, totalPages, count },
    null,
    "Get comments of post successfully"
  );
});

// get all posts for wall
postController.getAllPosts = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  let { page, limit } = { ...req.query };

  // business logic validation - kiem chung database

  // process - xu ly
  page = parseInt(page) || 1; //page
  limit = parseInt(limit) || 10;

  // for finding posts
  const filterConditions = [
    {
      isDeleted: false,
      fromGroup: false, // not post from group, post truoc day chua "fromGroup" thi xu ly sao?
    },
  ];
  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  // for pagination
  const count = await Post.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  //     fromGroup: false,

  // return posts and page
  let posts = await Post.find(filterCriteria)
    .sort({
      createdAt: -1,
      // fromGroup: false, // not post from group
    })
    .skip(offset)
    .limit(limit)
    .populate("author");

  // response result, success or not
  return sendResponse(res, 200, true, { posts, totalPages, count }, null, "");
});

// get all posts by selectedUser
postController.getAllPostsBySelectedUser = catchAsync(
  async (req, res, next) => {
    // get data from requests - nhan yeu cau
    let { page, limit } = { ...req.query };
    const selectedUserId = req.params.userId;
    // console.log("select", selectedUserId);
    // business logic validation - kiem chung database

    // process - xu ly
    page = parseInt(page) || 1; //page
    limit = parseInt(limit) || 10;

    // for finding posts
    const filterConditions = [{ author: selectedUserId }, { isDeleted: false }];
    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};

    // for pagination
    const count = await Post.countDocuments(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    // return posts and page
    let posts = await Post.find(filterCriteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("author");

    // response result, success or not
    return sendResponse(res, 200, true, { posts, totalPages, count }, null, "");
  }
);

//
module.exports = postController;
