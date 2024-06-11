const bcrypt = require("bcryptjs");

const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const User = require("../models/User");

//
const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  //// get data from requests -nhan yeu cau
  const { email, password } = req.body;

  //// business logic validation -kiem chung database
  const user = await User.findOne({ email }, "+password");
  if (!user) throw new AppError(400, "Invalid credentials", "Login error");

  //// process -xu ly, check if match with data
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(400, "Wrong password", "Login error");
  const accessToken = await user.generateToken();

  //// response result, success or not
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Login successfully"
  );
});

module.exports = authController;
