import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const rawClientUrl = process.env.CLIENT_URL?.trim().replace(/\/+$/, "");
const allowedOrigins = [
  "http://localhost:5173",
  ...(rawClientUrl ? [rawClientUrl] : []),
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "production") {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const userSocketMap = {};

export function getReceiverSocketId(userID) {
  return userSocketMap[userID];
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.fullName} (${socket.userID})`);
  const userID = socket.userID;
  userSocketMap[userID] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(
      `User disconnected: ${socket.user.fullName} (${socket.userID})`
    );
    delete userSocketMap[userID];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app, userSocketMap };
