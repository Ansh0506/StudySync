import express from "express";
import protect from "../middlewares/AuthMiddleware.js";
import {
  createRoom,
  joinRoom,
  getRoom,
  deleteRoom,
  leaveRoom ,
  getUserRooms
} from "../controllers/RoomController.js";

const router = express.Router();

// Room routes cover dashboard listing, code-based joining, and workspace lookup.
router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);
router.get('/user', protect, getUserRooms);
router.get("/:id", protect, getRoom);
router.delete('/:id', protect, deleteRoom);
router.post('/:id/leave', protect, leaveRoom);


export default router;
