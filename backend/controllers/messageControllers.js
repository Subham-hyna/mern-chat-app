const asyncHandler = require("../middleware/catchAndSyncError");
const Chat = require("../model/chatModel");
const Message = require("../model/messageModel");
const User = require("../model/userModel");
const ErrorHandler = require("../utils/errorHander");

exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return next(new ErrorHandler("Please fill all the deatils"), 400);
  }

  const userExist = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: req.user._id } },
  });

  if (!userExist) {
    return next(new ErrorHandler("You are not a part of the chat"), 400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  let message = await Message.create(newMessage);

  message = await message.populate("sender", "name pic");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "name pic email",
  });

  await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

  res.status(200).json({
    success: true,
    message: message,
  });
});

exports.allMessages = asyncHandler(async (req, res, next) => {
  const userExist = await Chat.findOne({
    _id: req.params.chatId,
    users: { $elemMatch: { $eq: req.user._id } },
  });

  // if (!userExist) {
  //   return next(new ErrorHandler("You are not a part of the chat"), 400);
  // }

  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name pic email avatar")
    .populate("chat");
  res.status(200).json({
    success: true,
    messages,
  });
});

exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const { messageId } = req.body;

  const message = await Message.findOne({
    _id: messageId,
    sender: req.user._id,
  });

  if (!message) {
    return next(new ErrorHandler("Message cannot be deleted"), 400);
  }

  await Message.findByIdAndDelete(messageId);

  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name pic email avatar")
    .populate("chat");
  res.status(200).json({
    success: true,
    messages,
  });
});
