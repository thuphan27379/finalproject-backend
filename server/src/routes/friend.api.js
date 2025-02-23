const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const authentication = require('../midlewares/authentication');
const validators = require('../midlewares/validators');
const friendController = require('../controllers/friend.controller');

// @route POST/friends/request
// @desc send a friend request
// @body (to: User ID)
// @access login required
router.post(
  '/requests',
  authentication.loginRequired,
  validators.validate([
    body('to').exists().isString().custom(validators.checkObjectId),
  ]), // body("id")
  friendController.sendFriendRequest
);

// @route GET/friends/requests/incoming
// @desc get list of received pending requests
// @access login required
router.get(
  '/requests/incoming',
  authentication.loginRequired,
  friendController.getReceivedFriendRequestList
);

// @route GET/friends/requests/outgoing
// @desc get list of sent pending requests
// @access login required
router.get(
  '/requests/outgoing',
  authentication.loginRequired,
  friendController.getSentFriendRequestList
);

// @route GET/friends
// @desc get list of friends
// @access login required
router.get('/', authentication.loginRequired, friendController.getFriendList);

// @route PUT/friends/requests/:userId
// @desc accept/reject a received pending request
// @body {status: 'accepted' or 'declined'}
// @access login required
router.put(
  '/requests/:userId',
  authentication.loginRequired,
  validators.validate([
    param('userId').exists().isString().custom(validators.checkObjectId),
    body('status').exists().isString().isIn(['accepted', 'declined']),
  ]),
  friendController.reactFriendRequest
);

// @route DELETE/friends/request/:userId
// @desc cancel a friend request
// @access login required
router.delete(
  '/requests/:userId',
  authentication.loginRequired,
  validators.validate([
    param('userId').exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.cancelFriendRequest
);

// @route DELETE/friends/:userId
// @desc remove friend
// @access login required
router.delete(
  '/:userId',
  authentication.loginRequired,
  validators.validate([
    param('userId').exists().isString().custom(validators.checkObjectId),
  ]),
  friendController.removeFriend
);

//
module.exports = router;
