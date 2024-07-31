const { Promise } = require("mongoose");

const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const { use } = require("../routes/group.api");
const Group = require("../models/Group");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Reaction = require("../models/Reaction");
const Friend = require("../models/Friend");

//
const groupController = {};

// groupsCount
// const calculateGroupsCount = async (groupId) => {
//   const groupsCount = await Group.countDocuments({
//     group: groupId, //?
//     isDeleted: false,
//   });
//   await Group.findByIdAndUpdate(groupId, { groupsCount });
// };

// membersCount //Group.members[]???
// const calculateMembersCount = async (userId) => {
//   const membersCount = await Group.countDocuments({
//     members: userId,
//     isDeleted: false,
//   });

//   console.log(membersCount);
//   await Group.findByIdAndUpdate(userId, { membersCount });
// };

// // postsCount ???
// const calculatePostsCount = async (groupId) => {
//   const postsCount = await Post.countDocuments({
//     group: groupId, //?
//     post: postId, //?
//     author: userId,
//     isDeleted: false,
//   });
//   await Group.findByIdAndUpdate(groupId, { postsCount });
// };

// // commentsCount ???
// const calculateCommentsCount = async (postId) => {
//   const commentsCount = await Group.countDocuments({
//     post: postId, //?
//     group: groupId, //?
//     author: userId, //?
//     isDeleted: false,
//   });
//   await Group.findByIdAndUpdate(postId, { commentsCount });
// };

// // reactionsCount ???
// const calculateReactions = async (targetId, targetType) => {
//   const stats = await Reaction.aggregate([
//     { $match: { targetId: mongoose.Types.ObjectId(targetId) } },
//     {
//       $group: {
//         _id: "$targetId",
//         like: { $sum: { $cond: [{ $eq: ["emoji", "Like"] }, 1, 0] } },
//         dislike: { $sum: { $cond: [{ $eq: ["emoji", "DisLike"] }, 1, 0] } },
//       },
//     },
//   ]);
//   // console.log(stats);
//   const reactions = {
//     like: (stats[0] && stats[0].like) || 0,
//     dislike: (stats[0] && stats[0].dislike) || 0,
//   };

//   await mongoose.model(targetType).findByIdAndUpdate(targetId, { reactions });
//   return reactions;
// };

//
// create a new group - groupForm.js (fe)
groupController.createNewGroup = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  let { name, description, interests } = req.body; //input

  // business logic validation
  const user = User.findById(currentUserId);
  if (!user)
    throw new AppError(
      400,
      "Only user logged in is able to create a group",
      "Create new group error"
    );

  // process - xu ly
  let newGroup = await Group.create({
    creator: currentUserId, //members
    name,
    description,
    interests,
  });
  // console.log(currentUserId);

  // creator is a first member ???
  const memberArray = await Group.findOneAndUpdate(
    newGroup._id,
    { $push: { members: currentUserId } },
    { new: true }
  );

  // response result, success or not
  return sendResponse(
    res,
    200,
    true,
    { newGroup },
    null,
    "Create a new group successfully"
  );
});

// get group name and interest list and search by name
groupController.getListOfGroups = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  // business logic validation
  let user = await User.findById(currentUserId); //check userId in database exist or not
  if (!user)
    throw new AppError(400, "Group is not found", "Get groups list error");

  page = parseInt(page) || 1; //page
  limit = parseInt(limit) || 10;

  // process
  let groupsId = await Group.find({}); //???

  // for finding groups by name ???
  const filterConditions = [{ isDeleted: false }];
  if (filter.name) {
    filterConditions.push({
      ["name"]: { $regex: filter.name, $options: "i" },
    });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  // for pagination
  const count = await Group.countDocuments(filterCriteria);
  const totalGroups = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // return groups and page ???
  let groups = await Group.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  // response result
  return sendResponse(
    res,
    200,
    true,
    { groups, totalGroups },
    null,
    "Get list of groups successfully"
  );
});

// join a group
groupController.joinGroup = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.params.userId;
  const currentGroupId = req.params.groupId;

  // lay array members trong Group ra, check co usedId hay k, neu k thi update .push vo array, neu co thi bao join roi
  // business logic validation
  const user = User.findById(currentUserId);
  if (!user)
    throw new AppError(
      400,
      "User not found Or Only user logged in is able to join group",
      "Join a group error"
    );

  const group = await Group.findById(currentGroupId);
  if (!group) throw new AppError(400, "Group not found", "Join a group error");

  // check join chua
  if (group.members.includes(currentUserId))
    throw new AppError(400, "User already join", "Join a group error");

  // process - update members list
  const joinGroup = await Group.findByIdAndUpdate(
    currentGroupId,
    { $push: { members: currentUserId } }, // push
    { new: true }
  );

  // response result
  return sendResponse(
    res,
    200,
    true,
    { joinGroup },
    null,
    "Join a group successfully"
  );
});

// leave a group .findByIdAndDelete(userId) in members []
groupController.leaveGroup = catchAsync(async (req, res, next) => {
  // get data from requests
  // const currentUserId = req.params.userId;
  const currentUserId = req.userId;
  const currentGroupId = req.params.groupId;

  // business logic validation
  const user = await User.findById(currentUserId);
  if (!user)
    throw new AppError(
      400,
      "User not found Or Only user logged in is able to leave group",
      "Leave a group error"
    );

  const group = await Group.findById(currentGroupId);
  if (!group) throw new AppError(400, "Group not found", "Leave a group error");

  // check join chua
  if (!group.members.includes(currentUserId))
    throw new AppError(400, "User is not a member", "Leave a group error");

  // process
  const leaveGroup = await Group.findByIdAndUpdate(
    currentGroupId,
    { $pull: { members: currentUserId } }, // pull
    { new: true }
  );

  await group.save();

  // response result
  return sendResponse(
    res,
    200,
    true,
    { leaveGroup },
    null,
    "Leave a group successfully"
  );
});

// get single group to show group info after joined
groupController.getSingleGroup = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  const currentGroupId = req.params.groupId;

  // business logic validation
  // check user
  const user = await User.findById(currentUserId);
  if (!user)
    throw new AppError(
      400,
      "User not found Or Only user logged in is able to get single group",
      "Get single group error"
    );

  // check group
  const group = await Group.findById(currentGroupId);
  if (!group)
    throw new AppError(400, "Group not found", "Get single group error");

  // process ??
  const singleGroup = await Group.findById(currentGroupId);

  // response result
  return sendResponse(
    res,
    200,
    true,
    { singleGroup: group }, //, name, interests
    null,
    "Get single group successfully"
  );
});

// create a new post in the group
groupController.createNewGroupPost = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  const currentGroupId = req.params.groupId; //
  const { content, image, fromGroup } = req.body;

  // business logic validation
  const user = await User.findById(currentUserId);
  if (!user)
    throw new AppError(
      400,
      "Only user logged in is able to post in the group",
      "Create new post in the group error"
    );

  const group = await Group.findById(currentGroupId);
  if (!group)
    throw new AppError(
      400,
      "Group not found",
      "Create new post in the group error"
    );

  // check member join
  if (!group.members.includes(currentUserId))
    throw new AppError(400, "User has not join yet", "Post in the group error");

  // process
  let groupPost = await Post.create({
    content,
    image,
    author: currentUserId,
    fromGroup: true, // post of the group
  });
  // console.log(groupPost);
  // console.log(group);

  // check post
  if (group.postsByGroupId.includes(groupPost._id))
    throw new AppError(400, "Post already have", "Post in the group error");

  // update group model
  // groupPost = await group.populate("postsByGroupId"); //?
  const groupPostId = await Group.findByIdAndUpdate(
    currentGroupId,
    { $push: { postsByGroupId: groupPost._id } }, // push
    { isDeleted: true },
    { new: true }
  );
  // console.log(groupPostId);

  // response result
  return sendResponse(
    res,
    200,
    true,
    { groupPostId },
    null,
    "Create new post in the group successfully"
  );
});

// get posts list of the group
groupController.getListOfPosts = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  const currentGroupId = req.params.groupId;

  // business logic validation
  let user = await User.findById(currentUserId); //check userId in database exist or not
  if (!user)
    throw new AppError(
      400,
      "User is not found",
      "Get posts list of the group error"
    );

  const group = await Group.findById(currentGroupId);
  if (!group)
    throw new AppError(
      400,
      "List Posts Group not found",
      "Get posts list of the group error"
    );

  // check member join
  if (!group.members.includes(currentUserId))
    throw new AppError(
      400,
      "User has not join group yet",
      "Get posts list of the group error"
    );

  // process // fromGroup: true
  let groupPostsList = await Group.findById(currentGroupId).populate({
    path: "postsByGroupId",
    match: { isDeleted: false, fromGroup: true },
    populate: { path: "author" }, // populate author cua post
  });

  // response result
  return sendResponse(
    res,
    200,
    true,
    { groupPostsList },
    null,
    "Get list of group posts successfully"
  );
});

// get members list of the group ?!?!
groupController.getListOfMembers = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  const currentGroupId = req.groupId;

  let members = []; //??

  let { page, limit } = { ...req.query };

  // business logic validation
  let user = await User.findById(userId); //check userId in database exist or not
  if (!user)
    throw new AppError(400, "User is not found", "Get groups list error");

  page = parseInt(page) || 1; //page
  limit = parseInt(limit) || 10;

  // process
  // for find friends's ID to get friend's posts
  let groupsId = await Group.find({}); //???

  // for finding groups ???
  const filterConditions = [
    { isDeleted: false },
    { author: { $in: groupIDs } },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  // for pagination
  const count = await Group.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // return groups and page ???
  let groups = await Group.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  // response result
  return sendResponse(
    res,
    200,
    true,
    { membersList },
    null,
    "Get list of members successfully"
  );
});

// create a new comment on the post in the group
groupController.createNewGroupComment = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  const currentGroupId = req.groupId;
  const currentPostId = req.postId;
  const { content, postId } = req.body;

  // business logic validation
  const user = User.findById(userId);
  if (!user)
    throw new AppError(
      400,
      "Only user logged in is able to comment on the post in the group",
      "Create a new comment on the post in the group error"
    );

  const group = Group.findById(groupId);
  if (!group)
    throw new AppError(
      400,
      "Group not found",
      "Create a new comment on the post in the group error"
    );

  const post = Post.findById(postId);
  if (!post)
    throw new AppError(
      400,
      "Post not found",
      "Create a new comment on the post in the group error"
    );

  // check member join

  // process
  let comment = await Comment.create({
    author: currentUserId,
    group: groupId,
    post: postId,
    content,
  });

  // update commentCount of the post
  await calculateCommentCount(postId);
  comment = await comment.populate("author");

  // response result
  return sendResponse(
    res,
    200,
    true,
    { content },
    null,
    "Create a new comment in the post successfully"
  );
});

// reaction on the post/comment in the group
groupController.createNewGroupReactions = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  const { targetType, targetId, emoji } = req.body;

  // check member join

  // business logic validation
  // check targetType exists
  const targetObj = await mongoose.model(targetType).findById(targetId);
  if (!targetObj)
    throw new AppError(400, `${targetType} not found`, "Create reaction error");

  // find the reaction if exists
  let reaction = await Reaction.findOne({
    targetType,
    targetId,
    author: currentUserId,
  });

  // if there is no reaction in the DB => create a new one
  if (!reaction) {
    reaction = await Reaction.create({
      targetType,
      targetId,
      author: currentUserId,
      emoji,
    });
  } else {
    // if there is a previous reaction in the DB => compare the emojis
    if (reaction.emoji === emoji) {
      // if they are same => delete the reaction
      await reaction.delete();
    } else {
      // if they are different => update the reaction
      reaction.emoji = emoji;
      await reaction.save();
    }
  }

  const reactions = await calculateReactions(targetId, targetType);
  // process

  // response result
  return sendResponse(
    res,
    200,
    true,
    { reactions },
    null,
    "Create reaction successfully"
  );
});

// get comments list of the post in the group
groupController.getListOfComments = catchAsync(async (req, res, next) => {
  // get data from requests
  const currentUserId = req.userId;
  const currentGroupId = req.groupId;
  const currentPostId = req.postId;

  let { page, limit } = { ...req.query };

  // business logic validation
  let user = await User.findById(userId); //check userId in database exist or not
  if (!user)
    throw new AppError(400, "User is not found", "Get groups list error");

  page = parseInt(page) || 1; //page
  limit = parseInt(limit) || 10;

  // process

  // for pagination
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // response result
  return sendResponse(
    res,
    200,
    true,
    { commentsList },
    null,
    "Get comments list successfully"
  );
});

//
module.exports = groupController;
