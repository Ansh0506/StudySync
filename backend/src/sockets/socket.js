import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";

const roomUsers = new Map();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  // 🔐 SOCKET AUTH
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 connected:", socket.user.name);

    // JOIN ROOM
    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);

      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Map());
      }

      roomUsers.get(roomId).set(socket.id, {
        userId: socket.user._id,
        name: socket.user.name
      });

      io.to(roomId).emit(
        "room-users",
        Array.from(roomUsers.get(roomId).values())
      );
    });

    // CHAT
    socket.on("send-message", async ({ roomId, text }) => {
      if (!text) return;

      const message = await Message.create({
        roomId,
        sender: socket.user._id,
        senderName: socket.user.name,
        text
      });

      io.to(roomId).emit("receive-message", {
        senderName: socket.user.name,
        text,
        createdAt: message.createdAt
      });
    });

    // ----------------------------------------------------
    // ✍️ TYPING INDICATORS
    // ----------------------------------------------------
    socket.on("typing", ({ roomId }) => {
      // socket.to() sends to everyone in the room EXCEPT the person typing
      socket.to(roomId).emit("user-typing", { userName: socket.user.name });
    });

    socket.on("stop-typing", ({ roomId }) => {
      socket.to(roomId).emit("user-stopped-typing", { userName: socket.user.name });
    });

    // ----------------------------------------------------
    // 🖍️ PDF ANNOTATIONS
    // ----------------------------------------------------
    socket.on("draw-annotation", (data) => {
      socket.to(data.roomId).emit("receive-annotation", data);
    });
    
    // 🗑️ DELETE/UNDO ANNOTATIONS (Make sure this is here!)
    socket.on("delete-annotation", (data) => {
      // socket.to() sends it to everyone in the room EXCEPT the sender
      socket.to(data.roomId).emit("remove-annotation", data);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      for (const [roomId, users] of roomUsers.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          io.to(roomId).emit(
            "room-users",
            Array.from(users.values())
          );
        }
      }

      console.log("🔴 disconnected:", socket.user.name);
    });
  });

  return io;
};

export default initSocket;