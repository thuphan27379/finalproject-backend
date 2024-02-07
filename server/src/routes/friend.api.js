const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const authentication = require("../midlewares/authentication");
const validators = require("../midlewares/validators");
const friendController = require("../controllers/friend.controller");

// @route POST/friends/request
// @description send a friend request
// @body (to: User ID)
// @access login required
router.post(
  "/requests",
  authentication.loginRequired,
  validators.validate([
    body("id").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.sendFriendRequest
);

// @route GET/friends/requests/incoming
// @description get list of received pending requests
// @access login required
router.get(
  "/requests/incoming",
  authentication.loginRequired,
  friendController.getReceivedFriendRequestList
);

// @route GET/friends/requests/outgoing
// @description get list of sent pending requests
// @access login required
router.get(
  "/requests/outgoing",
  authentication.loginRequired,
  friendController.getSentFriendRequestList
);

// @route GET/friends
// @description get list of friends
// @access login required
router.get("/", 
  authentication.loginRequired,
  friendController.getFriendList);

// @route PUT/friends/requests/:userId
// @description accept/reject a received pending request
// @body {status: 'accepted' or 'declined'}
// @access login required
router.put(
  "/requests/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    body("status").exists().isString().isIn(["accept", "declined"]),
  ]),
  friendController.reactFriendRequest
);

// @route DELETE/friends/request/:userId
// @description cancel a friend request
// @access login required
router.delete(
  "/requests/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.cancelFriendRequest
);

// @route DELETE/friends/:userId
// @description remove friend
// @access login required
router.delete(
  "/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.removeFriend
);

//
module.exports = router;
