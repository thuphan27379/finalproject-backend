const bcrypt = require('bcryptjs');

const { catchAsync, sendResponse, AppError } = require('../helpers/utils');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Domain = require('../models/Domain');
const { admin } = require('../routes/admin.api');
const { user } = require('../routes/user.api');
const { home } = require('../routes/home.api');

// ADMIN MANAGEMENT FOR CONTENT OF COMPANY & DOMAIN AND USER ACCOUNT
// how about create admin account, mongoDB?
const adminController = {}; // Initialize the controller object

// role admin

// admin login
adminController.login = catchAsync(async (req, res, next) => {
  // get data from requests
  const { email, password } = req.body;

  // business logic validation
  const admin = await Admin.findOne({ email }, '+password');

  if (!admin)
    throw new AppError(
      400,
      'Invalid credentials. Try again or Contact us.',
      'Admin Login error'
    );

  // process check if match with data
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    console.log('Stored Hash:', admin.password); // Debugging line
    console.log('Provided Password:', password); // Debugging line
    throw new AppError(400, 'Wrong password', 'Admin Login error');
  }
  const accessToken = await admin.generateToken();

  // response result, success or not
  sendResponse(
    res,
    200,
    true,
    { admin, accessToken },
    null,
    'Admin Login successfully'
  );
});

// domain management, domain list with pagination and sort and search
adminController.getDomain = catchAsync(async (req, res, next) => {
  let { q, page, limit, ...filter } = { ...req.query };

  if (req.user.roles !== 'admin') {
    throw new AppError(403, 'Permission denied', 'Authorization error');
  }

  // Set up search query (e.g., search by domain name)
  const searchQuery = q ? { name: { $regex: `${q}`, $options: 'i' } } : {};

  // Pagination setup
  page = parseInt(page) || 1; // Default to page 1
  limit = parseInt(limit) || 25; // Default limit of 25 items per page
  const offset = limit * (page - 1);

  // Get the total number of matching domains
  const count = await Domain.countDocuments(searchQuery);
  const totalPages = Math.ceil(count / limit);

  // Fetch the actual domain data, sorted by creation date
  const domains = await Domain.find(searchQuery)
    .limit(limit)
    .skip(offset)
    .sort({ createdAt: -1 }); // Sort by creation date

  // Map the domains to the format React-Admin expects (with `id` field)
  const domainList = domains.map((domain) => ({
    id: domain._id, // Map MongoDB _id to id field
    name: domain.name,
    topLevel: domain.topLevel,
    description: domain.description,
    ideas: domain.ideas,
    price: domain.price,
    renew: domain.renew, //
    isProject: domain.isProject,
    isStartup: domain.isStartup,
    isSale: domain.isSale,
  }));

  // Send the response back to the frontend
  sendResponse(
    res,
    200,
    true,
    { domainList, totalDomain: count, totalPages, currentPage: page },
    null,
    'Management domain list successfully'
  );
});

// edit domain
adminController.updateDomain = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Get domain ID from the URL

  const updatedDomain = await Domain.findByIdAndUpdate(id, req.body, {
    new: true, // Return the updated document
    runValidators: true, // Ensure that the data is validated
  });

  if (!updatedDomain) {
    throw new AppError(404, 'Domain not found', 'Update error');
  }

  sendResponse(
    res,
    200,
    true,
    { updatedDomain },
    null,
    'Domain updated successfully'
  );
});

// getOneDomain
adminController.getOneDomain = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the domain by ID
  const domain = await Domain.findById(id);

  if (!domain) {
    throw new AppError(404, 'Domain not found', 'Fetch error');
  }

  sendResponse(res, 200, true, domain, null, 'Domain fetched successfully');
});

// create a new domain item
adminController.createDomain = catchAsync(async (req, res, next) => {
  if (req.user.roles !== 'admin') {
    throw new AppError(403, 'Permission denied', 'Authorization error');
  }

  const { name, topLevel, description, price, ideas, isStartup, isSale } =
    req.body;

  const newDomain = await Domain.create({
    name,
    topLevel,
    description,
    price,
    ideas,
    isStartup,
    isSale,
  });

  sendResponse(res, 200, true, newDomain, null, 'Domain created successfully');
});

// delete domain, update isDeleted is true, soft delete
adminController.deleteDomain = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const domain = await Domain.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  if (!domain) {
    throw new AppError(404, 'Domain not found', 'Delete error');
  }

  sendResponse(res, 200, true, null, null, 'Domain deleted successfully');
});

// register a new admin account /// NOT YET
adminController.register = catchAsync(async (req, res, next) => {
  // get data from requests
  let { name, email, password } = req.body;

  // business logic validation
  let admin = await Admin.findOne({ email });
  if (admin)
    throw new AppError(400, 'Admin already exists', 'Registration error');

  // process
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  /// & update Roll in User model ///
  admin = await Admin.create({ name, email, password: hashedPassword }); // create a new account
  // populate: { path: 'author' }, // populate author cua post
  const accessToken = await admin.generateToken();

  // response result
  sendResponse(
    res,
    200,
    true,
    { admin, accessToken },
    null,
    'Create admin account successfully'
  );
});

// company content

// manage Users
adminController.manageUsers = catchAsync(async (req, res, next) => {
  if (req.user.roles !== 'admin') {
    throw new AppError(403, 'Permission denied', 'Authorization error');
  }

  const users = await User.find({ isDeleted: false }).sort({ createdAt: -1 });
  sendResponse(res, 200, true, users, null, 'Manage users successfully');
});

module.exports = adminController;
