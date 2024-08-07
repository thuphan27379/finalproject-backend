const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { sendResponse, AppError } = require("../helpers/utils");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send({ status: "ok", data: "hello" }); //
});

// API
// contact us form ?
const contactApi = require("./contact.api");
router.use("/contact", contactApi);

// homeApi // company
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

// groupApi /blog/group &/group/:groupId
const groupApi = require("./group.api");
router.use("/group", groupApi);

// error handlers
router.get("/template/:test", async (req, res, next) => {
  const { test } = req.params;

  try {
    // turn on to test error handling
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
