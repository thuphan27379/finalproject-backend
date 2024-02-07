const express = require("express");
const router = express.Router();

const { sendResponse, AppError } = require("./src/helpers/utils");

// 
/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.send({ status: "ok", data: "hello" }); //
// });

// homeApi
const homeApi = require("./home.api");
router.use("/home", homeApi);

// authApi
const authApi = require("./auth.api");
router.use("/auth", authApi);

// userApi
const userApi = require("./user.api");
router.use("/users", userApi);

// postApi
const postApi = require("./post.api");
router.use("/posts", postApi);

// commentApi
const commentApi = require("./comment.api");
router.use("/comments", commentApi);

// friendApi
const friendApi = require("./friend.api");
router.use("/friends", friendApi);

// reactionApi
const reactionApi = require("./reaction.api");
router.use("/reactions", reactionApi);

// ?!?!?! // error handlers
router.get("/template/:test", async (req, res, next) => {
  const { test } = req.params;

  try {
    //turn on to test error handling
    if (test === "error") {
      throw new AppError(401, "Access denied", "Authentication Error");
    } else {
      sendResponse(
        res,
        200,
        true,
        { data: "template" },
        null,
        "template success"
      );
    }
  } catch (err) {
    next(err);
  }
});

//
module.exports = router;

/*
@route GET/home - get information of company

@route POST/auth/login - log in with email and password

@route POST/users - register new account x
@route GET/users/page=1&limit=10 - get users with pagination x
@route GET/users/me - get current user info x
@route GET/users/:id - get user profile x
@route PUT/users/:id/ - update user profile x
 
@route POST/posts - create a new post x
@route GET/posts/user/userID?page=1&limit=10 -get all posts and user can see with pagination x
@route GET/posts/:id - get detail of a post x
@route PUT/posts/:id - update a post x
@route DELETE/posts/:id - delete a post x
After User decides to delete a Post/Comment, a window will pop up asking for confirmation.
@route GET/posts/:id - get a single post x
@route GET/posts/:id/comments - get comment of a post x

@route POST/comments - create a new comment
@route PUT/comments - update a comment
@route DELETE/comments/:id - delete a comment***************
After User decides to delete a Post/Comment, a window will pop up asking for confirmation.

@route POST/friends/request - send a friend request
@route GET/friends/requests/incoming - get list of received pending requests
@route GET/friends/requests/outgoing - get list of sent pending requests*************
@route GET/friends - get list of friends
@route PUT/friends/requests/:userId - accept/reject a received pending request
@route DELETE/friends/:userId - remove friend
@route DELETE/friends/request/:userId - cancel a friend sent request**********

@route POST/reactions - reaction a post and comment
*/
