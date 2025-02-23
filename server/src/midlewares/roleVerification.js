const { AppError } = require('../helpers/utils');

// Middleware for verifying user roles
const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user; // Assuming the authenticated user is attached to req object

    // Check if the user's role is allowed
    if (!user || !allowedRoles.includes(user.roles)) {
      return next(
        new AppError(
          403,
          'You do not have permission to perform this action',
          'Role verification error'
        )
      );
    }
    // console.log(req.user);

    // If the role is valid, proceed to the next middleware
    next();
  };
};

module.exports = { verifyRole };
