const bcrypt = require("bcryptjs");

const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const User = require("../models/User");

// 
const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  //// get data from requests -nhan yeu cau
  const { email, password } = req.body;

  //// business logic validation -kiem chung database
  const user = await User.findOne({ email }, "password");
  if (!user) throw new AppError(400, "invalid credentials", "login error");

  //// process -xu ly, check if match with data
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(400, "wrong password", "login error");
  const accessToken = await user.generateToken();
  console.log(accessToken);

  //// response result, success or not
  sendResponse(res, 200, true, { user, accessToken }, null, "login successful");
});

module.exports = authController;
