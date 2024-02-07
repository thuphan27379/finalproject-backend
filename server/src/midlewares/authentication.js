const { AppError } = require("../helpers/utils");
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authentication = {};

authentication.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    // console.log(tokenString);
    if (!tokenString)
      throw new AppError(401, "login required", "authentication error");
    //
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "tokenExpiredError") {
          throw new AppError(401, "token expired", "authentication error");
        } else {
          throw new AppError(401, "token is invalid", "authentication error");
        }
      }

      req.userId = payload._id;
    });
    next(); // next to userController.getUsers
  } catch (error) {
    next(error);
  }
};

//
module.exports = authentication;
