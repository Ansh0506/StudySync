import express from "express";
import protect from "../middlewares/AuthMiddleware.js";
import Message from "../models/Message.js";

const router = express.Router();

router.get("/:roomId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch {
    res.status(500).json({ message: "Failed to load messages" });
  }
});

export default router;
