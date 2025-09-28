import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
export const getAllContacts = async (req, res) => {
  try {
    const logedInUserId = req.user._id;

    const filteredUser = await User.find({
      _id: { $ne: logedInUserId },
    }).select("-password");
    res.status(200).json(filteredUser);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessageByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;
    // Use correct field names (senderId) and allow Mongoose to cast string ids
    const message = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(message);
  } catch (error) {
    console.error("Error fetching messages by user id:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    // receiver id comes from route param: POST /send/:id
    const receiverId = req.params.id;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required" });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot send messages to yourself" });
    }

    const receiverExist = await User.exists({ _id: receiverId });
    if (!receiverExist) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const savedMessage = await newMessage.save();

    // Return the populated message with sender/receiver info if needed
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("senderId", "fullName profilePicture")
      .populate("receiverId", "fullName profilePicture");

    //todo send message in realtime if user is online - socket.io
    res.status(201).json(populatedMessage || savedMessage);
  } catch (error) {
    console.log("error in sending message controller", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

export const getChatParteners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    //find all the message where the loggedin user is the sender or the recevier
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartenerId = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatParteners = await User.find({
      _id: { $in: chatPartenerId },
    }).select("-password");
    res.status(200).json(chatParteners);
  } catch (error) {
    console.log("error in sending message controller", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};
