import express from "express";
import protect from "../middlewares/AuthMiddleware.js";
import {
  createRoom,
  joinRoom,
  getRoom
} from "../controllers/RoomController.js";

const router = express.Router();

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);
router.get("/:id", protect, getRoom);

export default router;
