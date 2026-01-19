import { io } from "socket.io-client";

const ROOM_ID = "696dd9abeca31e393505302d";

const socket = io("http://localhost:5000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NmRkOWFiZWNhMzFlMzkzNTA1MzAyZCIsImlhdCI6MTc2ODgwNjgyNywiZXhwIjoxNzY5NDExNjI3fQ.12_1wjTxhPZCjRgeHD3-WQsnOm5xQypxU6j0OqYxVoI"
  }
});

socket.on("connect", () => {
  console.log("✅ connected");

  socket.emit("join-room", { roomId: ROOM_ID });

  setTimeout(() => {
    socket.emit("send-message", {
      roomId: ROOM_ID,
      text: "Hello StudySync 🚀"
    });
  }, 1000);
});

socket.on("receive-message", (msg) => {
  console.log(`💬 ${msg.senderName}: ${msg.text}`);
});
