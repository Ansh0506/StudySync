import express from "express";
import cors from "cors";
import authRoute from "./routes/AuthRoute.js";
import roomRoutes from "./routes/RoomRoute.js";
import ChatRoutes from "./routes/ChatRoute.js";
import pdfRoutes from "./routes/PdfRoute.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { requestLogger } from './middlewares/LogMiddleware.js';
import { notFoundHandler, errorHandler } from './middlewares/ErrorMiddleware.js';
import annotationRoutes from './routes/AnnotationRoute.js';
import activityRoutes from './routes/ActivityRoute.js';

// ES modules do not provide __dirname, so derive it for static file paths.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(requestLogger);
app.use(express.json());

// Only the configured frontend origin can call the API in browser environments.
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

// Uploaded PDFs and avatars are served from this public path.
app.use('/Uploads', express.static(path.join(__dirname, '../Uploads')));

// API modules are kept separate by feature so controllers stay focused.
app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/pdf", pdfRoutes);
app.use('/api/annotations', annotationRoutes);
app.use('/api/activity', activityRoutes);

app.get("/", (req, res) => {
  res.send("StudySync Backend is running 🚀");
});

// Error handlers must be mounted after routes so unmatched requests fall through.
app.use(notFoundHandler);
app.use(errorHandler);
export default app;
