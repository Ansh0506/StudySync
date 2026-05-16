import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import initSocket from "./src/sockets/socket.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

connectDB();
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
