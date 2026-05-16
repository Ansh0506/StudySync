import express from "express";
import cors from "cors";
import authRoute from "./routes/AuthRoute.js";
import roomRoutes from "./routes/RoomRoute.js";
import ChatRoutes from "./routes/ChatRoute.js";
import pdfRoutes from "./routes/PdfRoute.js";
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve the Uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../Uploads')));

app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/pdf", pdfRoutes);

app.get("/", (req, res) => {
  res.send("StudySync Backend is running 🚀");
});

export default app;
