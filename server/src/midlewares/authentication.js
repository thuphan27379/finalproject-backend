const jwt = require('jsonwebtoken');
const { AppError } = require('../helpers/utils');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const User = require('../models/User'); // Make sure to import the User model

// token
const authentication = {};

authentication.loginRequired = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    // console.log(tokenString);
    if (!tokenString)
      throw new AppError(401, 'Login required', 'Authentication error');

    //
    const token = tokenString.replace('Bearer ', ''); // Remove "Bearer " from token string

    // Verify the JWT token
    jwt.verify(token, JWT_SECRET_KEY, async (err, payload) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw new AppError(
            401,
            'Token expired & Login again',
            'Authentication error'
          ); // chuyen qua loginPage?
          // biome-ignore lint/style/noUselessElse: <explanation>
        } else {
          throw new AppError(
            401,
            'Token is invalid & Login again',
            'Authentication error'
          );
        }
      }

      req.userId = payload._id; // Attach user ID to the request
    });

    // Fetch the user details from the database, including their role
    const user = await User.findById(req.userId).select('+roles');
    if (!user) {
      throw new AppError(404, 'User not found', 'Authentication error');
    }

    // Attach the user object to req.user
    req.user = user;
    // req.user = user._id; // Attach user ID to the request
    // console.log(req.user);

    // Proceed to the next middleware
    next(); // next to userController.getUsers
  } catch (error) {
    next(error);
  }
};

//
module.exports = authentication;
