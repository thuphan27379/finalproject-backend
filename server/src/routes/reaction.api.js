const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const authentication = require("../midlewares/authentication");
const validators = require("../midlewares/validators");
const reactionController = require("../controllers/reaction.controller");

// @route POST/reactions
// @description reaction a post and comment
// @body {targetType: 'post' or 'comment', targetId, emoji: 'like' or 'dislike'}
// @access login required
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("targetType", "invalid targetType").exists().isIn(["Post", "Comment"]),
    body("targetType", "invalid targetType")
      .exists()
      .custom(validators.checkObjectId),
    body("emoji", "invalid emoji").exists().isIn(["Like", "Dislike"]),
  ]),
  reactionController.saveReaction
);

//
module.exports = router;
