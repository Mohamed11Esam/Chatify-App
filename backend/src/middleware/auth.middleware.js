import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
dotenv.config();
// Middleware to protect routes
export const protectRoute = async (req, res, next) => { 
   try {
    const token = req.cookies.jwt;
    if (!token) {
        console.log(token)
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
    }
    req.user = user; // Attach user to request object
    next();
   } catch (error) {
    console.log(error)
      return res.status(401).json({ message: "Not authorized, token failed" });
   }
};