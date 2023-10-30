const asyncHandler = require("../middleware/catchAndSyncError");
const User = require("../model/userModel");
const ErrorHandler = require("../utils/errorHander");
const sendToken = require("../utils/jwtToken");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

// Register User
exports.registerUser = asyncHandler(async (req, res, next) => {
  let { name, email, password, photo } = req.body;

  if (req.file) {
    const image = await cloudinary.uploader.upload(req.file.path);
    photo = image.secure_url;
  } else {
    photo =
      "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
  }

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill the Details Properly", 400));
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    return next(new ErrorHandler("User Already Exist", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: photo,
  });

  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  if (user) {
    sendToken(user, 201, res);
  } else {
    return next(new ErrorHandler("User Not Created", 400));
  }
});

//Login User
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please fill the Details Properly", 400));
  }

  let user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  user = await User.findOne({ email });

  sendToken(user, 200, res);
});

exports.allUsers = asyncHandler(async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.status(200).json({
    success: true,
    users,
  });
});

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorHandler("Please select a file"), 400);
  }

  const image = await cloudinary.uploader.upload(req.file.path);
  photo = image.secure_url;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: photo,
    },
    {
      new: true,
    }
  );

  fs.unlink(req.file.path, (err) => {
    if (err) {
      console.log(err);
    }
  });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});
