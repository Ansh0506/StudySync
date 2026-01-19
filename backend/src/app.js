import express from "express";
import cors from "cors";
import authRoute from "./routes/AuthRoute.js";
import roomRoutes from "./routes/RoomRoute.js";
import ChatRoutes from "./routes/ChatRoute.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoutes);
app.use("/api/chat", ChatRoutes);

app.get("/", (req, res) => {
  res.send("StudySync Backend is running 🚀");
});

export default app;
