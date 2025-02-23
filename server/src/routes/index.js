const express = require('express');
const router = express.Router();
const path = require('path');

const { sendResponse, AppError } = require('../helpers/utils');
const { verifyRole } = require('../midlewares/roleVerification'); // Adjust path as needed

/* GET home page */
router.get('/', (req, res, next) => {
  res.send({ status: 'ok', data: 'hello' });
});

// APIs
// ROLE
// router.get('/admin', verifyRole(['admin']), (req, res) => {
//   res.send('Admin content');
// });

// AdminApi
const adminApi = require('./admin.api');
router.use('/admin', adminApi);
// router.use('/admin', require('./admin.api')); // short way

// homeApi company, domain
const homeApi = require('./home.api');
router.use('/home', homeApi);

// contact us form
const contactApi = require('./contact.api');
router.use('/contact', contactApi);

// authApi
const authApi = require('./auth.api');
router.use('/auth', authApi);

// userApi
const userApi = require('./user.api');
router.use('/users', userApi);

// postApi
const postApi = require('./post.api');
router.use('/posts', postApi);

// commentApi
const commentApi = require('./comment.api');
router.use('/comments', commentApi);

// friendApi
const friendApi = require('./friend.api');
router.use('/friends', friendApi);

// reactionApi
const reactionApi = require('./reaction.api');
router.use('/reactions', reactionApi);

// groupApi /blog/group  OR /group/:groupId
const groupApi = require('./group.api');
router.use('/group', groupApi);

// error handlers
router.get('/template/:test', async (req, res, next) => {
  const { test } = req.params;

  try {
    // turn on to test error handling
    if (test === 'error') {
      throw new AppError(401, 'Access denied', 'Authentication Error');
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      sendResponse(
        res,
        200,
        true,
        { data: 'template' },
        null,
        'template success'
      );
    }
  } catch (err) {
    next(err);
  }
});

// Serve frontend for any non-API routes
router.use('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../frontend/build/index.html'));
});

//
module.exports = router;
