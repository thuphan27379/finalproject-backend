const express = require("express");
const router = express.Router();

const homeController = require("../controllers/home.controller");

// /about
// /project
// /startup
// /domain

// company
// - @route GET /about
// - @description: information of company: about us, contact, transfer domain, donate,...
// - @body
// - @access Public
// router.get("/about", homeController.getAbout);

// - @route GET /project
// - @description: Our projects, cooperate,...
// - @body: name, topLevel, ideas
// - @access Public
router.get("/project", homeController.getProjectList);

// - @route GET /startup
// - @description: startup support program, domain for startup,...
// - @body: name, topLevel, description, ideas, price
// - @access Public
router.get("/startup", homeController.getStartupList);

// - @route GET /about
// - @description: domain for sale, investing, auction,...
// - @body: name, topLevel, description, price
// - @access Public
router.get("/domain", homeController.getDomainList);

// - @route GET /about
// - @description: search domain by name
// - @body: name, topLevel, description, price
// - @access Public
// router.get("/domain", homeController.getSearchDomain);

//
module.exports = router;
