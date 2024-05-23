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

// how to member required?!?! check group.member co userId

//create /POST
//get /GET
//update /PUT
//delete /DELETE

// group/ - groupId
// group/members - userId
// group/posts - postId
// group/comments - commentId

// @route POST/group
// @description create a new group (groupForm)
// @body (userId, name, description, categories, interests..)
// @access login required
// creator group.members
router.post(
  "/",
  authentication.loginRequired,
  validators.validate([
    body("name", "description", "categories", "interests")
      .exists()
      .notEmpty()
      .isString(),
  ]),
  groupController.createNewGroup
);

// @route PUT/group ???/members
// @description join a group (add user into members list)
// @body (userId, groupId)
// @access login required
router.put(
  "/",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    param("groupId").exists().isString().custom(validators.checkObjectId),
  ]),
  groupController.joinGroup
);

// @route DELETE/group ???/members
// @description leave a group (delete user in members list)
// @body (userId, groupId)
// @access login required
router.delete(
  "/",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    param("groupId").exists().isString().custom(validators.checkObjectId),
  ]),
  groupController.leaveGroup
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

// @route GET/group
// @description get list of group & search by name, or categories or interests (groupList)
// @body (userId, groupId, name, categories, interests)
// @access login required
router.get(
  "/",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    param("groupId").exists().isString().custom(validators.checkObjectId),

    body("name", "categories", "interests").exists().notEmpty().isString(),
    // memberCount, postCount, createdAt
  ]),
  groupController.getListOfGroups
);

// @route POST/group/posts
// @description create a new post in the group (postForm)
// @body (userId, groupId, content)
// @access login required
router.post(
  "/posts",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    param("groupId").exists().isString().custom(validators.checkObjectId),

    body("content", "missing content").exists().notEmpty(),
  ]),
  groupController.createNewGroupPost
);

// @route GET/group/posts
// @description get list of posts (postList)
// @body (userId, groupId, postId)
// @access login required
router.get(
  "/posts/",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    param("groupId").exists().isString().custom(validators.checkObjectId),
    // param("postId").exists().isString().custom(validators.checkObjectId),
  ]),
  groupController.getListOfPosts
);

// @route POST/group/comments
// @description comment on the post in the group (commentForm)
// @body (userId, groupId, postId )
// @access login required
router.post(
  "/comments",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    param("groupId").exists().isString().custom(validators.checkObjectId),
    param("postId").exists().isString().custom(validators.checkObjectId),

    body("content", "missing content").exists().notEmpty(),
  ]),
  groupController.createNewGroupComment
);

// @route POST/group/reactions
// @description reaction on the post and comment in the group
// @body {userId, groupId, postId, commentId, targetType: 'post' or 'comment', targetId, emoji: 'like' or 'dislike'}
// @access login required
router.post(
  "/reactions",
  authentication.loginRequired,
  validators.validate([
    param("userId").exists().isString().custom(validators.checkObjectId),
    param("groupId").exists().isString().custom(validators.checkObjectId),
    // param("postId").exists().isString().custom(validators.checkObjectId),
    // param("commentId").exists().isString().custom(validators.checkObjectId),

    body("targetType", "invalid targetType").exists().isIn(["Post", "Comment"]),
    body("targetId", "invalid targetId")
      .exists()
      .custom(validators.checkObjectId),
    body("emoji", "invalid emoji").exists().isIn(["Like", "Dislike"]),
  ]),
  groupController.createNewGroupReactions
);

// @route /group/
// @description (commentList)
// @body ()
// @access login required
// router.post(
//   "/group/",
//   authentication.loginRequired,
//   validators.validate([]),
//   groupController.
// );

module.exports = router;
