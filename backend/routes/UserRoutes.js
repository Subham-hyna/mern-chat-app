const express = require("express");
const {
  registerUser,
  loginUser,
  allUsers,
  logout,
  updateProfile,
  updatePassword,
} = require("../controllers/UserControllers");
const router = express.Router();
const upload = require("../utils/multer");
const { isAuthenticatedUser } = require("../middleware/auth");

router.route("/allusers").get(isAuthenticatedUser, allUsers);

router.route("/signup").post(upload.single("photo"), registerUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logout);

router
  .route("/updatePic")
  .put(isAuthenticatedUser, upload.single("photo"), updateProfile);

router.route("/updatePassword").put(isAuthenticatedUser, updatePassword);

module.exports = router;
