import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import dotenv from "dotenv";
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

export const login = (req, res) => {
  res.send("login endpoint!");
};

export const logout = (req, res) => {
  res.send("logout endpoint!");
};
