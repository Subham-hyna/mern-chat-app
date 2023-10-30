const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");
const router = express.Router();

router
  .route("/chat")
  .post(isAuthenticatedUser, accessChat)
  .get(isAuthenticatedUser, fetchChat);

router.route("/createGroup").post(isAuthenticatedUser, createGroupChat);

router.route("/renameGroup").put(isAuthenticatedUser, renameGroup);

router.route("/groupAdd").put(isAuthenticatedUser, addToGroup);

router.route("/groupRemove").put(isAuthenticatedUser, removeFromGroup);

module.exports = router;
