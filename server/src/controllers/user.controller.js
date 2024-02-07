const bcrypt = require("bcryptjs");
const { Promise } = require("mongoose");

const User = require("../models/User");
const Friend = require("../models/Friend");
const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const { use } = require("../routes/user.api");

//
const userController = {};

// register new user/create a new account//////////////////////
// catchAsync \helpers\utils.js
userController.register = catchAsync(async (req, res, next) => {
  // try {
  //// get data from requests - nhan yeu cau
  let { name, email, password } = req.body;

  //// business logic validation - kiem chung database
  let user = await User.findOne({ email });
  if (user)
    throw new AppError(400, "user already exists", "registration error");

  //// process -xu ly
  const salt = await bcrypt.genSalt(10); // ma hoa password
  password = await bcrypt.hash(password, salt);

  user = await User.create({ name, email, password }); // create a new account

  const accessToken = await user.generateToken(); // authentication

  //// response result, success or not
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "create user successfully"
  );
  // } catch (error) {
  //   next(error);
  // }

  // res.send("user registration");
});

// get users with pagination////////////////////////
userController.getUsers = catchAsync(async (req, res, next) => {
  // return res.send(req.userId);
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [{ isDeleted: false }];
  if (filter.name) {
    filterConditions.push({
      name: { $regex: filter.name, $options: "i" },
    });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await User.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let users = await User.find(filterCriteria)
    .sort({ createtAt: -1 })
    .skip(offset)
    .limit(limit);

  console.log(users);
  //
  // const promises = users.map(async (user) => {
  //   let temp = user.toJSON();
  //   temp.friendship = await Friend.findOne({
  //     $or: [
  //       { from: currentUserId, to: user._id },
  //       { from: user._id, to: currentUserId },
  //     ],
  //   });
  //   return temp;
  // });
  // const usersWithFriendship = await Promise.all(promises);

  return sendResponse(
    res,
    200,
    true,
    { users: users, totalPages, count },
    null,
    ""
  );
});

// get current user info///////////////////////////////
userController.getCurrentUser = catchAsync(async (req, res, next) => {
  //// get data from requests - nhan yeu cau
  const currentUserId = req.userId;

  //// business logic validation - kiem chung database
  const user = await User.findById(currentUserId);
  if (!user) {
    throw new AppError(400, "user is not found", "get current user error");
  }

  //// process -xu ly

  //// response result, success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success
    user, // data
    null, // error
    "get current user successful" // message
  );
});

// get user profile////////////////////////////
userController.getSingleUser = catchAsync(async (req, res, next) => {
  //// get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const userId = req.params.id;

  //// business logic validation - kiem chung database
  let user = await User.findById(userId);
  if (!user)
    throw new AppError(400, "user is not found", "get single user error");

  // relationship of users, for UI
  user = user.toJSON();
  user.friendship = await Friend.findOne({
    $or: [
      { from: currentUserId, to: user._id },
      { from: user._id, to: currentUserId },
    ],
  });

  //// process -xu ly

  //// response result, success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success
    user, // data
    null, // error
    "get single user successfully" // message
  );
});

// update user profile////////////////////////////
userController.updateProfile = catchAsync(async (req, res, next) => {
  //// get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const userId = req.params.id;

  //// business logic validation - kiem chung database
  if (currentUserId !== userId)
    throw new AppError(400, "permission required", "update user error");

  let user = await User.findById(userId);
  if (!user) {
    throw new AppError(400, "user is not found", "update user error");
  }

  //// process -xu ly
  const allows = [
    "name",
    "avatarUrl",
    "coverUrl",
    "aboutMe",
    "city",
    "country",
    "company",
    "jobTitle",
    "facebookLink",
    "instagramLink",
    "linkedinLink",
    "twitterLink",
  ];

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  await user.save();

  //// response result", success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success
    user, // data
    null, // error
    "update user successfully" // message
  );
});

//
module.exports = userController;
