import Room from "../models/Room.js";
import generateRoomCode from "../utils/GenerateRoomCode.js";

// CREATE ROOM
export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Room name required" });

    let roomCode;
    let exists = true;

    // ensure unique room code
    while (exists) {
      roomCode = generateRoomCode();
      exists = await Room.findOne({ roomCode });
    }

    const room = await Room.create({
      name,
      roomCode,
      head: req.user._id,
      members: [req.user._id]
    });

    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create room" });
  }
};

// JOIN ROOM
export const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;

    const room = await Room.findOne({ roomCode });
    if (!room)
      return res.status(404).json({ message: "Room not found" });

    if (room.members.includes(req.user._id))
      return res.json(room);

    room.members.push(req.user._id);
    await room.save();

    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to join room" });
  }
};

// GET ROOM DETAILS
export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("head", "name email")
      .populate("members", "name email");

    if (!room)
      return res.status(404).json({ message: "Room not found" });

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Failed to get room" });
  }
};
