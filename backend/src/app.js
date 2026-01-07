import express from "express";
import cors from "cors";
import authRoute from "./routes/AuthRoute.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);

app.get("/", (req, res) => {
  res.send("StudySync Backend is running 🚀");
});

export default app;
