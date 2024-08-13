const express = require("express");
const router = express.Router();

const homeController = require("../controllers/home.controller");

// - @route GET /project
// - @description: Our projects, cooperate,...
// - @body: name, topLevel, ideas
// - @access Public
router.get("/project", homeController.getProjectList);

// - @route GET /startup
// - @description: startup sponsorship program, domain for startup,...
// - @body: name, topLevel, description, ideas, price
// - @access Public
router.get("/startup", homeController.getStartupList);

// - @route GET /about
// - @description: domain for sale, investing, auction,...
// - @body: name, topLevel, description, price
// - @access Public
router.get("/domain", homeController.getDomainList);

//
module.exports = router;
