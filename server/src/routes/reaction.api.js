const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const authentication = require("../midlewares/authentication");
const validators = require("../midlewares/validators");
const reactionController = require("../controllers/reaction.controller");

// @route POST/reactions
// @description reaction a post and comment
// @body {targetType: 'Post' or 'Comment', targetId, emoji: 'like' or 'dislike'}
// @access login required
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("targetType", "Invalid targetType").exists().isIn(["Post", "Comment"]),
    body("targetId", "Invalid targetId") //targetType trong codecomm-be
      .exists()
      .custom(validators.checkObjectId),
    body("emoji", "Invalid emoji").exists().isIn(["like", "dislike"]),
  ]),
  reactionController.saveReaction
);

//
module.exports = router;
