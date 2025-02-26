const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Friend = require('../models/Friend');
const { sendResponse, AppError, catchAsync } = require('../helpers/utils');
const { use } = require('../routes/user.api');

//
const userController = {};

// role
userController.adminManageUsers = catchAsync(async (req, res, next) => {
  // Only admins can access this
  const users = await User.find({ isDeleted: false }).sort({ createdAt: -1 });
  sendResponse(res, 200, true, users, null, 'Manage users successfully');
});

// register new user/create a new account
// catchAsync \helpers\utils.js
userController.register = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  let { name, email, password } = req.body;

  // business logic validation - kiem chung database
  let user = await User.findOne({ email });
  if (user)
    throw new AppError(400, 'User already exists', 'Registration error');

  // process - xu ly
  const salt = await bcrypt.genSalt(10); // ma hoa password
  password = await bcrypt.hash(password, salt);

  user = await User.create({ name, email, password }); // create a new account
  // user = await User.create({
  //   name,
  //   email,
  //   password,
  //   roles: req.body.roles || 'user', /// ROLE // in register page, make UI roles option for choose NOT YET //
  // });
  const accessToken = await user.generateToken();

  // response result, success or not
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    'Create user successfully'
  );
});

// get users with pagination and filter
userController.getUsers = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  // return res.send(req.userId);
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  // business logic validation - kiem chung database
  // biome-ignore lint/style/useNumberNamespace: <explanation>
  page = parseInt(page) || 1; // page number
  // biome-ignore lint/style/useNumberNamespace: <explanation>
  limit = parseInt(limit) || 10; // users per page

  //
  const filterConditions = [{ isDeleted: false }];
  if (filter.name) {
    filterConditions.push({
      name: { $regex: filter.name, $options: 'i' },
    });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  // process - xu ly
  const count = await User.countDocuments(filterCriteria); // dem so luong trong data
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1); // phan le~

  // biome-ignore lint/style/useConst: <explanation>
  let users = await User.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
  // console.log(users);

  //  list of users
  const promises = users.map(async (user) => {
    // biome-ignore lint/style/useConst: <explanation>
    let temp = user.toJSON();
    temp.friendship = await Friend.findOne({
      // friend status ???
      $or: [
        { from: currentUserId, to: user._id },
        { from: user._id, to: currentUserId },
      ],
    });
    return temp;
  });
  const usersWithFriendship = await Promise.all(promises);

  // response result, success or not
  return sendResponse(
    res,
    200,
    true,
    { users: users, totalPages, count },
    null,
    'Get Users successfully'
  );
});

// get current user info
userController.getCurrentUser = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  const currentUserId = req.userId;

  // business logic validation - kiem chung database
  const user = await User.findById(currentUserId);
  if (!user) {
    throw new AppError(400, 'User is not found', 'Get current user error');
  }

  // process -xu ly

  // response result, success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success
    user, // data
    null, // error
    'Get current user successfully' // message
  );
});

// get user profile
userController.getSingleUser = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const userId = req.params.id;

  // business logic validation - kiem chung database
  let user = await User.findById(userId);
  if (!user)
    throw new AppError(400, 'User is not found', 'Get single user error');

  // process -xu ly
  // relationship of users, for UI friend status
  user = user.toJSON();
  user.friendship = await Friend.findOne({
    $or: [
      { from: currentUserId, to: user._id },
      { from: user._id, to: currentUserId },
    ],
  });

  // response result, success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success
    user, // data
    null, // error
    'Get single user successfully' // message
  );
});

// update user profile
userController.updateProfile = catchAsync(async (req, res, next) => {
  // get data from requests - nhan yeu cau
  const currentUserId = req.userId;
  const userId = req.params.id;

  // business logic validation - kiem chung database
  if (currentUserId !== userId)
    throw new AppError(400, 'Permission required', 'Update user error');

  // biome-ignore lint/style/useConst: <explanation>
  let user = await User.findById(userId);
  if (!user) {
    throw new AppError(400, 'User is not found', 'Update user error');
  }

  // process -xu ly
  const allows = [
    'name',
    'avatarUrl',
    'aboutMe',
    'city',
    'country',
    'company',
    'others',
    'facebookLink',
    'instagramLink',
    'linkedinLink',
    'twitterLink',
    'youtubeLink',
  ];

  // biome-ignore lint/complexity/noForEach: <explanation>
  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  await user.save();

  // response result, success or not
  return sendResponse(
    res, // res
    200, // status
    true, // success
    user, // data
    null, // error
    'Update user successfully' // message
  );
});

//
module.exports = userController;
