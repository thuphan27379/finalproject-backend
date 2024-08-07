const { AppError } = require("../helpers/utils");
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// token
const authentication = {};

authentication.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    // console.log(tokenString);
    if (!tokenString)
      throw new AppError(401, "Login required", "Authentication error");
    //
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          throw new AppError(
            401,
            "Token expired & Login again",
            "Authentication error"
          ); // chuyen qua loginPage?
        } else {
          throw new AppError(
            401,
            "Token is invalid & Login again",
            "Authentication error"
          );
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
