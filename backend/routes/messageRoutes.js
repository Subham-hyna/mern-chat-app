const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const {
  sendMessage,
  allMessages,
  deleteMessage,
} = require("../controllers/messageControllers");
const router = express.Router();

router.route("/message").post(isAuthenticatedUser, sendMessage);

router.route("/chat/:chatId").get(isAuthenticatedUser, allMessages);

router
  .route("/deleteMessage/:chatId")
  .delete(isAuthenticatedUser, deleteMessage);

module.exports = router;
