const asyncHandler = require("../middleware/catchAndSyncError");
const Chat = require("../model/chatModel");
const User = require("../model/userModel");
const ErrorHandler = require("../utils/errorHander");

exports.accessChat = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new ErrorHandler("UserId not sent", 400));
  }
  let isChat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat) {
    res.status(200).json({
      success: true,
      chat: isChat,
    });
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);

    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users"
    );

    res.status(200).json({
      success: true,
      chat: fullChat,
    });
  }
});

exports.fetchChat = asyncHandler(async (req, res) => {
  await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 })
    .then(async (results) => {
      results = await User.populate(results, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
      res.status(200).json({
        success: true,
        chats: results,
      });
    });
});

exports.createGroupChat = asyncHandler(async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return next(new ErrorHandler("Please fill all the fields properly", 400));
  }

  let users = req.body.users;

  if (users.length < 2) {
    return next(
      new ErrorHandler(
        "More than 2 users are required to form a group chat",
        400
      )
    );
  }

  users.push(req.user._id);

  const groupChat = await Chat.create({
    chatName: req.body.name,
    users: users,
    isGroupChat: true,
    groupAdmin: req.user._id,
  });

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate("users")
    .populate("groupAdmin");

  res.status(200).json({
    success: true,
    group: fullGroupChat,
  });
});

exports.renameGroup = asyncHandler(async (req, res, next) => {
  const { chatId, chatName } = req.body;

  const userExist = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: req.user._id } },
  });

  if (!userExist) {
    return next(new ErrorHandler("You are not the member of the group", 400));
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users")
    .populate("groupAdmin");

  if (!updatedChat) {
    return next(new ErrorHandler("Chat not found", 400));
  } else {
    res.status(200).json({
      success: true,
      chat: updatedChat,
    });
  }
});

exports.removeFromGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const chat = await Chat.findOne({ _id: chatId });

  // if(chat.groupAdmin.toString() !== req.user._id.toString()){
  //     return next( new ErrorHandler("You are not the admin",400));
  // }

  const userExist = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userId } },
  });

  if (!userExist) {
    return next(new ErrorHandler("User Not Exist", 400));
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users")
    .populate("groupAdmin");

  if (!removed) {
    return next(new ErrorHandler("Chat Not Found", 400));
  } else {
    res.status(200).json({
      success: true,
      chat: removed,
    });
  }
});

exports.addToGroup = asyncHandler(async (req, res, next) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const chat = await Chat.findOne({ _id: chatId });

  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not the admin", 400));
  }

  const userExist = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userId } },
  });

  if (userExist) {
    return next(new ErrorHandler("User already Exist", 400));
  }

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users")
    .populate("groupAdmin");

  if (!added) {
    return next(new ErrorHandler("Chat Not Found", 400));
  } else {
    res.status(200).json({
      success: true,
      chat: added,
    });
  }
});
