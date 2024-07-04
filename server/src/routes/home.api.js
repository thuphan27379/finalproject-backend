const express = require("express");
const router = express.Router();

// company
// - @route GET /home
// - @description: information of company
// - @body
// - @access Public
router.get("/", homeController);

//
module.exports = router;
