const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const validators = require('../midlewares/validators');
const authentication = require('../midlewares/authentication');
const adminController = require('../controllers/admin.controller'); //
const { verifyRole } = require('../midlewares/roleVerification');

// @route POST /admin/login
// @desc admin log in with email and password
// @body (email, password)
// @access public
router.post(
  '/login',
  validators.validate([
    body('email', 'invalid email')
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password', 'invalid password').exists().notEmpty(),
  ]),
  adminController.login
);

// @route GET /admin/domain
// @desc Admin management for domain LIST
// @body
// @access
router.get(
  '/domain',
  authentication.loginRequired,
  verifyRole(['admin']),
  adminController.getDomain
);

// @route PUT /admin/domain/:id
// @desc Admin management for update domain
// @body
// @access
router.put(
  '/domain/edit/:id',
  authentication.loginRequired,
  verifyRole(['admin']),
  adminController.updateDomain
);

// @route GET
// get one domain
router.get('/domain/:id', adminController.getOneDomain);

// @route POST /admin/domain
// @desc Admin management for create domain
// @body
// @access
router.post(
  '/domain',
  authentication.loginRequired,
  verifyRole(['admin']),
  adminController.createDomain
);
// @route DELETE /admin/domain/:id
// @desc Admin management for DELETE domain
// @body
// @access
router.delete(
  '/domain/:id',
  authentication.loginRequired,
  verifyRole(['admin']),
  adminController.deleteDomain
);

// @route POST /admin/register
// @desc create admin account with email and password
// @body (name, email, password)
// @access public
// router.post(
//   '/register',
//   validators.validate([
//     body("name", "invalid name").exists().notEmpty(),
//     body('email', 'invalid email')
//       .exists()
//       .isEmail()
//       .normalizeEmail({ gmail_remove_dots: false }),
//     body('password', 'invalid password').exists().notEmpty(),
//   ]),
//   adminController.register
// );

// @route GET /admin/manage-users
// @desc Admin management for user account
// @body
// @access
router.get(
  '/manage-users',
  authentication.loginRequired,
  verifyRole(['admin']),
  adminController.manageUsers
);

module.exports = router;
