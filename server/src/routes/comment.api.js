const express = require("express"); //
const router = express.Router(); //
const { body, param } = require("express-validator"); //

const authentication = require("../midlewares/authentication"); //
const validators = require("../midlewares/validators"); //
const commentController = require("../controllers/comment.controller"); //
const { post } = require("./user.api");

// @route POST/comments
// @description create a new comment
// @body (content, postId)
// @access login required
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("content", "missing content").exists().notEmpty(),
    body("postId", "missing postId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  commentController.createNewComment
);

// @route PUT/comments/:id
// @description update a comment
// @access login required
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("content", "missing content").exists().notEmpty(),
  ]),
  commentController.updateSingleComment
);

// @route DELETE/comments/:id
// @description delete a comment
// @access login required
router.delete(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  commentController.deleteSingleComment
);

// @route GET/comments/:id
// @description get details of a comment
// @access login required
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  commentController.getSingleComment
);

//
module.exports = router;
