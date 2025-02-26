const { sendResponse, AppError, catchAsync } = require('../helpers/utils');
const User = require('../models/User');
const Friend = require('../models/Friend');

//
const friendController = {};

// calculate total friend
const calculatorFriendCount = async (userId) => {
  const friendCount = await Friend.countDocuments({
    $or: [{ from: userId }, { to: userId }],
    status: 'accepted',
  });
  await User.findByIdAndUpdate(userId, { friendCount: friendCount });
};

// send a friend request
friendController.sendFriendRequest = catchAsync(async (req, res, next) => {
  // get request
  const currentUserId = req.userId;
  const toUserId = req.body.to;

  // check DB
  const user = await User.findById(toUserId);
  if (!user)
    throw new AppError(400, 'User not found', 'Send friend request error');

  // check friend relationship
  let friend = await Friend.findOne({
    $or: [
      { from: toUserId, to: currentUserId },
      { from: currentUserId, to: toUserId },
    ],
  });

  if (!friend) {
    // create friend request
    friend = await Friend.create({
      from: currentUserId,
      to: toUserId,
      status: 'pending',
    });
    // res
    return sendResponse(res, 200, true, friend, null, 'Request sent');
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    switch (friend.status) {
      // status === pending => error: already sent
      case 'pending':
        if (friend.from.equals(currentUserId)) {
          throw new AppError(
            400,
            'You have already send request to this user',
            'Add friend error'
          );
          // biome-ignore lint/style/noUselessElse: <explanation>
        } else {
          throw new AppError(
            400,
            'You have received a request from this user',
            'Add friend error'
          );
        }
      // status === accepted => error: already sent
      case 'accepted':
        throw new AppError(400, 'Users are already friend', 'Add friend error');
      // status === declined => update status to pending sent request, send again
      case 'declined':
        friend.from = currentUserId;
        friend.to = toUserId;
        friend.status = 'pending';
        await friend.save();

        // res
        return sendResponse(
          res,
          200,
          true,
          friend,
          null,
          'Send request successfully'
        );
      default:
        throw new AppError(400, 'Friend status undefined', 'Add friend error');
    }
  }
});

// get list of received pending friend requests (incoming)
friendController.getReceivedFriendRequestList = catchAsync(
  async (req, res, next) => {
    // get request
    let { page, limit, ...filter } = { ...req.query };
    const currentUserId = req.userId;

    // validate
    // biome-ignore lint/style/useConst: <explanation>
    let requestList = await Friend.find({
      to: currentUserId,
      status: 'pending',
    });

    const requesterIDs = requestList.map((friend) => {
      if (friend.from._id.equals(currentUserId)) return friend.req;
      return friend.from;
    });

    // process
    const filterConditions = [{ _id: { $in: requesterIDs } }];

    if (filter.name) {
      filterConditions.push({
        [name]: { $regrex: filter.name, $options: 'i' },
      });
    }

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};
    //
    // biome-ignore lint/style/useNumberNamespace: <explanation>
    page = parseInt(page) || 1;
    // biome-ignore lint/style/useNumberNamespace: <explanation>
    limit = parseInt(limit) || 10;
    const count = await User.countDocuments(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createAt: -1 })
      .skip(offset)
      .limit(limit);

    // show friend relationship
    const usersWithFriendship = users.map((user) => {
      // biome-ignore lint/style/useConst: <explanation>
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (friendship.from.equals(user._id) || friendship.to.equals(user._id))
          return { status: friendship.status };
        return false;
      });
      return temp;
    });

    // response
    return sendResponse(
      res,
      200,
      true,
      { users: usersWithFriendship, totalPages, count },
      null,
      null
    );
  }
);

// get list of sent pending friend requests (outgoing)
friendController.getSentFriendRequestList = catchAsync(
  async (req, res, next) => {
    // get request
    let { page, limit, ...filter } = { ...req.query };
    const currentUserId = req.userId;

    // validate
    // biome-ignore lint/style/useConst: <explanation>
    let requestList = await Friend.find({
      from: currentUserId,
      status: 'pending',
    });

    const recipientIDs = requestList.map((friend) => {
      if (friend.from._id.equals(currentUserId)) return friend.to;
      return friend.from;
    });

    // process
    const filterConditions = [{ _id: { $in: recipientIDs } }];

    if (filter.name) {
      filterConditions.push({
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        ['name']: { $regrex: filter.name, $options: 'i' },
      });
    }

    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};
    //
    // biome-ignore lint/style/useNumberNamespace: <explanation>
    page = parseInt(page) || 1;
    // biome-ignore lint/style/useNumberNamespace: <explanation>
    limit = parseInt(limit) || 10;
    const count = await User.countDocuments(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createAt: -1 })
      .skip(offset)
      .limit(limit);

    // show relationship
    const usersWithFriendship = users.map((user) => {
      // biome-ignore lint/style/useConst: <explanation>
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (friendship.from.equals(user._id) || friendship.to.equals(user._id))
          return { status: friendship.status };
        return false;
      });
      return temp;
    });

    // response
    return sendResponse(
      res,
      200,
      true,
      { users: usersWithFriendship, totalPages, count },
      null,
      null
    );
  }
);

// get list of friends
friendController.getFriendList = catchAsync(async (req, res, next) => {
  // get request
  let { page, limit, ...filter } = { ...req.query };
  const currentUserId = req.userId;

  // validate
  // biome-ignore lint/style/useConst: <explanation>
  let friendList = await Friend.find({
    $or: [{ from: currentUserId }, { to: currentUserId }],
    status: 'accepted',
  });

  const friendIDs = friendList.map((friend) => {
    if (friend.from._id.equals(currentUserId)) return friend.to;
    return friend.from;
  });

  // process
  const filterConditions = [{ _id: { $in: friendIDs } }];

  if (filter.name) {
    filterConditions.push({
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      ['name']: { $regrex: filter.name, $options: 'i' },
    });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};
  //
  // biome-ignore lint/style/useNumberNamespace: <explanation>
  page = parseInt(page) || 1;
  // biome-ignore lint/style/useNumberNamespace: <explanation>
  limit = parseInt(limit) || 10;
  const count = await User.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const users = await User.find(filterCriteria)
    .sort({ createAt: -1 })
    .skip(offset)
    .limit(limit);

  // hien thi tinh trang friendship, sent request when and who sent
  const usersWithFriendship = users.map((user) => {
    // biome-ignore lint/style/useConst: <explanation>
    let temp = user.toJSON();

    temp.friendship = friendList.find((friendship) => {
      if (friendship.from.equals(user._id) || friendship.to.equals(user._id))
        return { status: friendship.status };
      return false;
    });
    return temp;
  });

  // response
  return sendResponse(
    res,
    200,
    true,
    { users: usersWithFriendship, totalPages, count },
    null,
    null
  );
});

// accept/reject a received pending friend request
friendController.reactFriendRequest = catchAsync(async (req, res, next) => {
  // get request
  const currentUserId = req.userId; // to
  const fromUserId = req.params.userId; // from
  const { status } = req.body; // status: accepted OR declined

  // validate
  // biome-ignore lint/style/useConst: <explanation>
  let friend = await Friend.findOne({
    from: fromUserId,
    to: currentUserId,
    status: 'pending',
  });

  // process
  if (!friend)
    throw new AppError(
      400,
      'Friend request not found',
      'React friend request error'
    );
  friend.status = status;
  await friend.save();

  // update friend count
  if (status === 'accepted') {
    await calculatorFriendCount(currentUserId);
    await calculatorFriendCount(fromUserId);
  }

  // response
  return sendResponse(
    res,
    200,
    true,
    friend,
    null,
    'React friend request successfully'
  );
});

// cancel a friend request
friendController.cancelFriendRequest = catchAsync(async (req, res, next) => {
  // get request
  const currentUserId = req.userId;
  const toUserId = req.params.userId;

  // validate
  const friend = await Friend.findOne({
    from: currentUserId,
    to: toUserId,
    status: 'pending',
  });
  // console.log("friend id", friend);

  // process logic
  if (!friend)
    throw new AppError(400, 'Friend request not found', 'Cancel request error');

  await Friend.findByIdAndDelete(friend._id);
  // await friend.save();

  // response result
  return sendResponse(
    res,
    200,
    true,
    friend,
    null,
    'Friend request has been cancelled'
  );
});

// remove friend
friendController.removeFriend = catchAsync(async (req, res, next) => {
  // get request
  const currentUserId = req.userId;
  const friendId = req.params.userId;

  // validate
  const friend = await Friend.findOne({
    $or: [
      { from: currentUserId, to: friendId },
      { from: friendId, to: currentUserId },
    ],
    status: 'accepted',
  });

  // process
  if (!friend)
    throw new AppError(400, 'Friend not found', 'Remove friend error');
  await friend.delete();

  // update friend count
  await calculatorFriendCount(currentUserId);
  await calculatorFriendCount(friendId);

  // response
  return sendResponse(res, 200, true, friend, null, 'Friend has been removed');
});

//
module.exports = friendController;
