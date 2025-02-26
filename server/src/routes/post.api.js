const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const authentication = require('../midlewares/authentication');
const validators = require('../midlewares/validators');
const postController = require('../controllers/post.controller');
const { post } = require('./user.api');

// @route GET/posts/user/userID?page=1&limit=10
// @desc get all posts and user can see with pagination
// @access login required
router.get(
  '/user/:userId',
  validators.validate([
    param('userId').exists().isString().custom(validators.checkObjectId),
  ]),
  postController.getAllPostsBySelectedUser
);

// @route GET/posts
// @desc get all posts for wall
// @access login required
router.get('/', postController.getAllPosts);

// @route POST/posts
// @desc create a new post
// @body (content, image)
// @access login required
router.post(
  '/',
  authentication.loginRequired,
  validators.validate([body('content', 'missing content').exists().notEmpty()]),
  postController.createPost
);

// @route PUT/posts/:id
// @desc update a post
// @body (content, image)
// @access login required
router.put(
  '/:id',
  authentication.loginRequired,
  validators.validate([
    param('id').exists().isString().custom(validators.checkObjectId),
  ]),
  postController.updateSinglePost
);

// @route DELETE/posts/:id
// @desc delete a post
// @access login required
router.delete(
  '/:id',
  authentication.loginRequired,
  validators.validate([
    param('id').exists().isString().custom(validators.checkObjectId),
  ]),
  postController.deleteSinglePost
);

// @route GET/posts/:id
// @desc get a single post
// @access login required
router.get(
  '/:id',
  authentication.loginRequired,
  validators.validate([
    param('id').exists().isString().custom(validators.checkObjectId),
  ]),
  postController.getSinglePost
);

// @route GET/posts/:id/comments
// @desc get comments of a post
// @access login required
// inside the function getSinglePost of postController
router.get(
  '/:id/comments',
  authentication.loginRequired,
  validators.validate([
    param('id').exists().isString().custom(validators.checkObjectId),
  ]),
  postController.getCommentsOfPost
);

//
module.exports = router;
