const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const User = require("../models/User");
const Friend = require("../models/Friend");

//
const friendController = {};

// calculate total friend
const calculatorFriendCount = async (userId) => {
  const friendCount = await Friend.countDocument({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  });
  await User.findByIdAndUpdate(userId, { friendCount: friendCount });
};

// send a friend request//////////////
friendController.sendFriendRequest = catchAsync(async (req, res, next) => {
  // get request
  const currentUserId = req.userId;
  const toUserId = req.body.to;

  // check DB
  const user = await User.findById(toUserId);
  if (!user)
    throw new AppError(400, "user not found", "send friend request error");

  // check friend status
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
      status: "pending",
    });
    //
    return sendResponse(res, 200, true, friend, null, "request sent");
  } else {
    switch (friend.status) {
      // status === pending => error: already sent
      case "pending":
        if (friend.from.equals(currentUserId)) {
          throw new AppError(
            400,
            "you have already send request to this user",
            "add friend error"
          );
        } else {
          throw new AppError(
            400,
            "you have received a request from this user",
            "add friend error"
          );
        }
      // status === accepted => error: already sent
      case "accepted":
        throw new AppError(400, "users are already friend", "add friend error");
      // status === declined => update status to pending sent request, send again
      case "declined":
        friend.from = currentUserId;
        friend.to = toUserId;
        friend.status = "pending";
        await friend.save();
        //
        return sendResponse(
          res,
          200,
          true,
          friend,
          null,
          "send request successfully"
        );
      default:
        throw new AppError(400, "friend status undefined", "add friend error");
    }
  }
});

// get list of received pending friend requests (incoming)//
friendController.getReceivedFriendRequestList = catchAsync(
  async (req, res, next) => {
    let { page, limit, ...filter } = { ...req.query };
    const currentUserId = req.userId;

    let requestList = await Friend.find({
      to: currentUserId,
      status: "pending",
    });

    const requesterIDs = requestList.map((friend) => {
      if (friend.from._id.equals(currentUserId)) return friend.req;
      return friend.from;
    });
    //
    const filterConditions = [{ _id: { $in: requesterIDs } }];
    if (filter.name) {
      filterConditions.push({
        [name]: { $regrex: filter.name, $options: "i" },
      });
    }
    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};
    //
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const count = await User.countDocument(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createAt: -1 })
      .skip(offset)
      .limit(limit);
    //
    const usersWithFriendship = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = friendList.find((friendship) => {
        if (friendship.from.equals(user._id) || friendship.to.equals(user._id))
          return { status: friendship.status };
        return false;
      });
      return temp;
    });
    //
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

// get list of sent pending friend requests (outgoing)//
friendController.getSentFriendRequestList = catchAsync(
  async (req, res, next) => {
    let { page, limit, ...filter } = { ...req.query };
    const currentUserId = req.userId;

    let requestList = await Friend.find({
      from: currentUserId,
      status: "pending",
    });

    const receipientIDs = requestList.map((friend) => {
      if (friend.from._id.equals(currentUserId)) return friend.to;
      return friend.from;
    });
    //
    const filterConditions = [{ _id: { $in: receipientIDs } }];
    if (filter.name) {
      filterConditions.push({
        [name]: { $regrex: filter.name, $options: "i" },
      });
    }
    const filterCriteria = filterConditions.length
      ? { $and: filterConditions }
      : {};
    //
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const count = await User.countDocument(filterCriteria);
    const totalPages = Math.ceil(count / limit);
    const offset = limit * (page - 1);

    const users = await User.find(filterCriteria)
      .sort({ createAt: -1 })
      .skip(offset)
      .limit(limit);
    //
    const usersWithFriendship = users.map((user) => {
      let temp = user.toJSON();
      temp.friendship = friendList.find((friendship) => {
        if (friendship.from.equals(user._id) || friendship.to.equals(user._id))
          return { status: friendship.status };
        return false;
      });
      return temp;
    });
    //
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

// get list of friends//
friendController.getFriendList = catchAsync(async (req, res, next) => {
  let { page, limit, ...filter } = { ...req.query };
  const currentUserId = req.userId;

  let friendList = await Friend.find({
    $or: [{ from: currentUserId }, { to: currentUserId }],
    status: "accepted",
  });

  const friendIDs = friendList.map((friend) => {
    if (friend.from._id.equals(currentUserId)) return friend.to;
    return friend.from;
  });
  //
  const filterConditions = [{ _id: { $in: friendIDs } }];
  if (filter.name) {
    filterConditions.push({
      [name]: { $regrex: filter.name, $options: "i" },
    });
  }
  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};
  //
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const count = await User.countDocument(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const users = await User.find(filterCriteria)
    .sort({ createAt: -1 })
    .skip(offset)
    .limit(limit);

  // hien thi tinh trang friendship, sent request when and who sent
  const usersWithFriendship = users.map((user) => {
    let temp = user.toJSON();
    temp.friendship = friendList.find((friendship) => {
      if (friendship.from.equals(user._id) || friendship.to.equals(user._id))
        return { status: friendship.status };
      return false;
    });
    return temp;
  });
  //
  return sendResponse(
    res,
    200,
    true,
    { users: usersWithFriendship, totalPages, count },
    null,
    null
  );
});

// accept/reject a received pending friend request//
friendController.reactFriendRequest = catchAsync(async (req, res, next) => {
  // get request
  const currentUserId = req.userId; //to
  const fromUserId = req.params.userId; //from
  const { status } = req.body; //status: accepted OR declined

  let friend = await Friend.findOne({
    from: fromUserId,
    to: currentUserId,
    status: "pending",
  });

  if (!friend)
    throw new AppError(
      400,
      "friend request not found",
      "react friend request error"
    );
  friend.status = status;
  await friend.save();
  if (status === "accepted") {
    //update friend count
    await calculatorFriendCount(currentUserId);
    await calculatorFriendCount(fromUserId);
  }
  return sendResponse(
    res,
    200,
    true,
    friend,
    null,
    "react friend request successfully"
  );
});

// cancel a friend request//
friendController.cancelFriendRequest = catchAsync(async (req, res, next) => {
  // get request
  const currentUserId = req.userId;
  const toUserId = req.params.userId;

  const friend = await Friend.findOne({
    from: currentUserId,
    to: toUserId,
    status: "pending",
  });

  if (!friend)
    throw new AppError(400, "friend request not found", "cancel request error");

  await friend.delete();

  return sendResponse(
    res,
    200,
    true,
    friend,
    null,
    "friend request has been cancelled"
  );
});

// remove friend//
friendController.removeFriend = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const friendId = req.params.userId;

  const friend = await Friend.findOne({
    $or: [
      { from: currentUserId, to: friendId },
      { from: friendId, to: currentUserId },
    ],
    status: "accepted",
  });
  if (!friend)
    throw new AppError(400, "friend not found", "remove friend error");
  await friend.delete();
  //update friend count
  await calculatorFriendCount(currentUserId);
  await calculatorFriendCount(friendId);

  return sendResponse(res, 200, true, friend, null, "friend has been removed");
});

//
module.exports = friendController;
