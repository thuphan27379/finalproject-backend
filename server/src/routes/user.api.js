const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const validators = require('../midlewares/validators');
const authentication = require('../midlewares/authentication');
const userController = require('../controllers/user.controller');

// @route POST/users
// @desc register new user
// @body (name, email, password)
// @access public
router.post(
  '/register',
  // verify data: email, pw
  validators.validate([
    body('name', 'invalid name').exists().notEmpty(),
    body('email', 'invalid email')
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password', 'invalid password').exists().notEmpty(),
  ]),
  userController.register
);

// @route GET/users/page=1&limit=10
// @desc get users with pagination
// @access log in required
router.get('/', authentication.loginRequired, userController.getUsers);

// @route GET/users/me
// @desc get current user info
// @access log in required
router.get('/me', authentication.loginRequired, userController.getCurrentUser);

// @route GET/users/:id
// @desc get user profile
// @access log in required
router.get(
  '/:id',
  authentication.loginRequired,
  validators.validate([
    param('id').exists().isString().custom(validators.checkObjectId),
  ]),
  //
  userController.getSingleUser
);

// @route PUT/users/:id
// @desc update user profile
// @body (name, avatarURL, aboutMe, city, country, company, jobtitle, social links)
// @access log in required
router.put(
  '/:id',
  authentication.loginRequired,
  validators.validate([
    param('id').exists().isString().custom(validators.checkObjectId),
  ]),
  //
  userController.updateProfile
);

//
module.exports = router;
