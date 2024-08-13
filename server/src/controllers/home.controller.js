// company
const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const Domain = require("../models/Domain");

// /project   isProject: true
// /startup   isStartup: true
// /domain    isSale: true
const homeController = {};

// get domain for sale
homeController.getDomainList = catchAsync(async (req, res, next) => {
  // get data from requests
  let { q, page, limit } = req.query;
  const currentPage = page;

  // business logic validation

  // process
  page = parseInt(page) || 1; // page number
  limit = parseInt(limit) || 20;

  const searchQuery = q ? { name: { $regex: `${q}`, $options: "i" } } : {}; // search by name
  const domainForSale = { isSale: true };
  const query = { $and: [domainForSale, searchQuery] };

  // for pagination
  const count = await Domain.countDocuments(query);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  const domainsForSale = await Domain.find(query).limit(limit).skip(offset);
  // console.log("domain", domainForSale);

  const domains = domainsForSale.map((domain) => {
    return {
      id: domain._id,
      topLevel: domain.topLevel,
      name: domain.name,
      description: domain.description,
      price: domain.price,
      ideas: domain.ideas,
    };
  });

  // response result
  return sendResponse(
    res,
    200,
    true,
    { domains, totalPages, currentPage, count },
    null,
    "Get domains for sale successfully"
  );
});

// get domain for Startup
homeController.getStartupList = catchAsync(async (req, res, next) => {
  // get data from requests
  let { q, page, limit } = req.query;
  const currentPage = page;

  // business logic validation

  // process
  page = parseInt(page) || 1; // page
  limit = parseInt(limit) || 20;

  // search
  const searchQuery = q ? { name: { $regex: `${q}`, $options: "i" } } : {};
  const domainForStartup = { isStartup: true };
  const query = { $and: [domainForStartup, searchQuery] };

  // for pagination
  const count = await Domain.countDocuments(query);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // list
  const domainsForStartup = await Domain.find(query).limit(limit).skip(offset);
  // console.log("Startup", domainForStartup);

  const startups = domainsForStartup.map((startup) => {
    return {
      id: startup._id,
      topLevel: startup.topLevel,
      name: startup.name,
      description: startup.description,
      ideas: startup.ideas,
      price: startup.price,
    };
  });

  // response result
  return sendResponse(
    res,
    200,
    true,
    { startups, totalPages, currentPage },
    null,
    "Get domains for startup successfully"
  );
});

// get projects list
homeController.getProjectList = catchAsync(async (req, res, next) => {
  // get data from requests
  let { page, limit } = { ...req.query };

  // business logic validation

  // process
  page = parseInt(page) || 1; // page
  limit = parseInt(limit) || 10;

  const domainProject = await Domain.find({
    isProject: true,
  });
  // console.log("projects", domainProject);

  const projects = domainProject.map((project) => {
    return {
      id: project._id,
      topLevel: project.topLevel,
      name: project.name,
      description: project.description,
      ideas: project.ideas,
      // price: project.price,
    };
  });

  // for pagination
  const count = await Domain.countDocuments(domainProject);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // response result
  return sendResponse(
    res,
    200,
    true,
    { projects },
    null,
    "Get projects list successfully"
  );
});

module.exports = homeController;
