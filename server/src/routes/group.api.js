const express = require("express"); //
const router = express.Router(); //
const { body, param } = require("express-validator"); //

const authController = require("../controllers/auth.controller"); // accessToken for login require
const validators = require("../midlewares/validators"); // validate input data of request
const authentication = require("../midlewares/authentication");

const userController = require("../controllers/user.controller");
const postController = require("../controllers/post.controller");
const friendController = require("../controllers/friend.controller");
const commentController = require("../controllers/comment.controller");
const reactionController = require("../controllers/reaction.controller");
const groupController = require("../controllers/group.controller");
const { post } = require("./user.api");

// @route POST/group
// @description create a new group (groupForm)
// @body (userId, name, description, categories, interests..)
// @access login required
// creator group.members
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("name", "description", "interests").exists().notEmpty().isString(),
  ]),
  groupController.createNewGroup
);

// @route GET/group
// @description get list of group & interest & search
// @body (userId, groupId, name, categories, interests)
// @access login required
router.get(
  "/groupList",
  authentication.loginRequired,
  groupController.getListOfGroups
);

// @route PUT/group ???/members
// @description join a group (add user into members list)
// @body (userId, groupId)
// @access login required
router.put(
  "/:groupId/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    param("groupId").exists().isString().custom(validators.checkObjectId),
  ]),
  groupController.joinGroup
);

// @route DELETE/group ???/members Or PUT ?
// @description leave a group (delete user in members list)
// @body (userId, groupId)
// @access login required
router.delete(
  "/:groupId",
  authentication.loginRequired,
  validators.validate([
    param("groupId").exists().isString().custom(validators.checkObjectId),
  ]),
  groupController.leaveGroup
);

// @route GET/group
// @description get single group
// @body (groupId)
// @access login required
router.get(
  "/:groupId",
  authentication.loginRequired,
  validators.validate([
    param("groupId").exists().isString().custom(validators.checkObjectId),
  ]),
  groupController.getSingleGroup
);

// @route GET/group/members ???params groupId
// @description get list of members (memberList)
// @body (userId, groupId)
// @access login required
router.get(
  "/",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    param("groupId").exists().isString().custom(validators.checkObjectId),
  ]),
  groupController.getListOfMembers
);

// @route POST/group/posts
// @description create a new post in the group (postForm)
// @body (userId, groupId, content)
// @access login required
router.post(
  "/:groupId/posts",
  authentication.loginRequired,
  validators.validate([
    param("groupId").exists().isString().custom(validators.checkObjectId),
    body("content", "missing content").exists().notEmpty(),
  ]),
  groupController.createNewGroupPost
);

// @route GET/group/posts
// @description get list of posts in group(postList)
// @body (userId, groupId, postId)
// @access login required
router.get(
  "/:groupId/posts",
  authentication.loginRequired,
  validators.validate([
    param("groupId").exists().isString().custom(validators.checkObjectId),
  ]),
  groupController.getListOfPosts
);

module.exports = router;
