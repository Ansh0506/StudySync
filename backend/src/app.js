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

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//TOP LEVEL MIDDLEWARES
app.use(requestLogger);
app.use(express.json());

app.use(cors());
app.use(express.json());

// Serve the Uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../Uploads')));

app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/pdf", pdfRoutes);
app.use('/api/annotations', annotationRoutes);
app.use('/api/activity', activityRoutes);

app.get("/", (req, res) => {
  res.send("StudySync Backend is running 🚀");
});

// ERROR HANDLING
app.use(notFoundHandler); // Catches 404s
app.use(errorHandler);    // Catches all other errors
export default app;
