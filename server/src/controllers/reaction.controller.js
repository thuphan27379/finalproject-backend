const { default: mongoose } = require("mongoose");

const Reaction = require("../models/Reaction");
const { sendResponse, AppError, catchAsync } = require("../helpers/utils");

//
const reactionController = {};

const calculateReactions = async (targetId, targetType) => {
  const stats = await Reaction.aggregate([
    { $match: { targetId: mongoose.Types.ObjectId(targetId) } },
    {
      $group: {
        _id: "targetId",
        like: { $sum: { $cond: [{ $eq: ["emoji", "Like"] }, 1, 0] } },
        dislike: { $sum: { $cond: [{ $eq: ["emoji", "DisLike"] }, 1, 0] } },
      },
    },
  ]);
  // console.log(stats);
  const reactions = {
    like: (stats[0] && stats[0].like) || 0,
    dislike: (stats[0] && stats[0].dislike) || 0,
  };
  await mongoose.model(targetType).findByIdAndUpdate(targetId, { reactions });
  return reactions;
};

//
reactionController.saveReaction = catchAsync(async (req, res, next) => {
  //// get data from requests:
  const currentUserId = req.userId;
  const { targetType, targetId, emoji } = req.body;

  //// process:
  //// check targetType exists
  const targetObj = await mongoose.model(targetType).findById(targetId);
  if (!targetObj)
    throw new AppError(400, `${targetType} not found`, "create reaction error");

  //// find the reaction if exists
  let reaction = await Reaction.findOne({
    targetType,
    targetId,
    author: currentUserId,
  });

  //// if there is no reaction in the DB => create a new one
  if (!reaction) {
    reaction = await Reaction.create({
      targetType,
      targetId,
      author: currentUserId,
      emoji,
    });
  } else {
    //// if there is a previous reation in the DB => compare the emojis
    if (reaction.emoji === emoji) {
      //// if they are same => delete the reaction
      await reaction.delete();
    } else {
      //// if they are different => update the reaction
      reaction.emoji = emoji;
      await reaction.save();
    }
  }

  const reactions = await calculateReactions(targetId, targetType);

  //// response result:
  return sendResponse(
    res,
    200,
    true,
    reactions,
    null,
    "save reaction successfully"
  );
});

//
module.exports = reactionController;
