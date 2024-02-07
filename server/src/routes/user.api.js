const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const userController = require("../controllers/user.controller"); //?!
const validators = require("../midlewares/validators");
const authentication = require("../midlewares/authentication");

// ?!?!?!?!?!
// const {
//   register,
//   getUsers,
//   getCurrentUser,
//   getSingleUser,
//   updateProfile,
// } = require("../controllers/user.controller");

// @route POST/users
// @description register new user
// @body (name, email, password)
// @access public
router.post(
  "/",
  validators.validate([
    body("name", "invalid name").exists().notEmpty(),
    body("email", "invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "invalid password").exists().notEmpty(),
  ]),
  //
  userController.register
);

// @route GET/users/page=1&limit=10
// @description get users with pagination
// @access log in required
router.get("/", authentication.loginRequired, userController.getUsers);

// @route GET/users/me
// @description get current user info
// @access log in required
router.get("/me", authentication.loginRequired, userController.getCurrentUser);

// @route GET/users/:id
// @description get user profile
// @access log in required
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  //
  userController.getSingleUser
);

// @route PUT/users/:id/
// @description update user profile
// @body (name, avatarURL, coverURL, aboutMe, city, country, company, jobtitle, social links)
// @access log in required
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  //
  userController.updateProfile
);

//
module.exports = router;
