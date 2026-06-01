import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import initSocket from "./src/sockets/socket.js";

const PORT = process.env.PORT || 5000;

// Express handles HTTP routes; Socket.IO attaches to the same HTTP server.
const server = http.createServer(app);

// Start database access before accepting requests, then register realtime events.
connectDB();
const io = initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
