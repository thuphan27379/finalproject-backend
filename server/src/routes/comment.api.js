const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const authentication = require('../midlewares/authentication');
const validators = require('../midlewares/validators');
const commentController = require('../controllers/comment.controller');
const { post } = require('./user.api');

// @route POST/comments
// @desc create a new comment
// @body (content, postId)
// @access login required
router.post(
  '/',
  authentication.loginRequired,
  validators.validate([
    body('content', 'Missing content').exists().notEmpty(),
    body('postId', 'Missing postId')
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  commentController.createNewComment
);

// @route PUT/comments/:id
// @desc update a comment
// @access login required
router.put(
  '/:id',
  authentication.loginRequired,
  validators.validate([
    param('id').exists().isString().custom(validators.checkObjectId),
    body('content', 'Missing content').exists().notEmpty(),
  ]),
  commentController.updateSingleComment
);

// @route DELETE/comments/:id
// @desc delete a comment
// @access login required
router.delete(
  '/:id',
  authentication.loginRequired,
  validators.validate([
    param('id').exists().isString().custom(validators.checkObjectId),
  ]),
  commentController.deleteSingleComment
);

// @route GET/comments/:id
// @desc get details of a comment
// @access login required
router.get(
  '/:id',
  authentication.loginRequired,
  validators.validate([
    param('id').exists().isString().custom(validators.checkObjectId),
  ]),
  commentController.getSingleComment
);

//
module.exports = router;
