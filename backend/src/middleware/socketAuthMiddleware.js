
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
dotenv.config();

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.headers.cookie?.split('; ').find(c => c.startsWith('jwt='))?.split('=')[1];
        if (!token) {
            throw new Error("Authentication token missing");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       const user = await User.findById(decoded.id).select('-password');
       if (!user) {
           throw new Error("User not found");
       }
       socket.user = user;
       socket.userID = user._id.toString();
       console.log(`Socket authenticated: ${user.fullName} (${socket.userID})`);
        next();
    } catch (error) {
        console.error("Socket authentication error:", error);
        next(new Error("Unauthorized"));
    }
}