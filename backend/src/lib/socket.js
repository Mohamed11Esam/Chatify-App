import {Server} from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

io.use(socketAuthMiddleware);

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.fullName} (${socket.userID})`);
    const userID = socket.userID;
    userSocketMap[userID] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.fullName} (${socket.userID})`);
        delete userSocketMap[userID];
         io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})


export {io, server,app};