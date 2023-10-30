const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/catchAndSyncError");
const ErrorHandler = require("../utils/errorHander");

exports.isAuthenticatedUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData._id);

  next();
});
