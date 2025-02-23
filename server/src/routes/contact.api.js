const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

// contact us form for feedback
router.post('/', contactController.sendContact);

module.exports = router;
