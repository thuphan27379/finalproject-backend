const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const authController = require("../controllers/auth.controller");
const validators = require("../midlewares/validators");

// @route POST/auth/login
// @description user log in with email and password
// @body (email, password)
// @access public
router.post(
  "/login",
  validators.validate([
    body("email", "invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "invalid password").exists().notEmpty(),
  ]),
  authController.loginWithEmail
);

module.exports = router;
