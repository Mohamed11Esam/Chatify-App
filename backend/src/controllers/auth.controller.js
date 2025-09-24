import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import dotenv from "dotenv";
import cloudinary from "../lib/cloudinary.js";
dotenv.config();
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      const savedUser = await newUser.save();
      // generateToken expects (id, res) - make sure args are in correct order
      generateToken(savedUser._id, res);
      // return the saved user but remove sensitive fields like password
      const userObj = savedUser.toObject
        ? savedUser.toObject()
        : { ...savedUser };
      if (userObj.password) delete userObj.password;
      res
        .status(201)
        .json({ message: "User registered successfully", user: userObj });
      try {
        await sendWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          process.env.CLIENT_URL
        );
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Invalid user data" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid cradintials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid cradintials" });
    }
    generateToken(user._id, res);
    const userObj = user.toObject ? user.toObject() : { ...user };
    if (userObj.password) delete userObj.password;
    res.status(200).json({ message: "Login successful", user: userObj });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
  });
  res.send("Logged out successfully");
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    console.log("Update profile request:", {
      hasProfilePicture: !!profilePicture,
      userId: req.user?._id,
    });

    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const userId = req.user._id;

    // Only destroy old image if cloudinaryId exists
    if (req.user.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(req.user.cloudinaryId);
        console.log("Old image destroyed:", req.user.cloudinaryId);
      } catch (destroyError) {
        console.error("Error destroying old image:", destroyError);
        // Continue anyway, don't fail the whole operation
      }
    }

    // Upload new image
    console.log("Uploading new image to cloudinary...");
    const uploadResult = await cloudinary.uploader.upload(profilePicture, {
      folder: "profile_pictures",
    });
    console.log("Image uploaded successfully:", uploadResult.public_id);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePicture: uploadResult.secure_url,
        cloudinaryId: uploadResult.public_id,
      },
      { new: true }
    ).select("-password");

    console.log("User updated successfully");
    return res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
