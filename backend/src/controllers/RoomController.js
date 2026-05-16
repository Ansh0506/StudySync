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

// DELETE ROOM (Only Room Head)
export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // 1. Verify that the user deleting the room is the room head
        if (room.head.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: Only the room head can delete this room' });
        }

        // 2. Clean up: Delete all physical PDF files associated with this room
        const pdfs = await Pdf.find({ roomId: room._id });
        for (const pdf of pdfs) {
            const fullPath = path.resolve(pdf.filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        // 3. Clean up: Delete database records for PDFs and Messages
        await Pdf.deleteMany({ roomId: room._id });
        await Message.deleteMany({ roomId: room._id });

        // 4. Finally, delete the room itself
        await Room.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Room and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting room', error: error.message });
    }
};

// LEAVE ROOM
export const leaveRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // 1. Check if user is actually in the room
        if (!room.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are not a member of this room' });
        }

        // 2. Handle the case where the room head tries to leave
        if (room.head.toString() === req.user.id) {
            if (room.members.length > 1) {
                // Reassign the head to the first member who isn't the current head
                const newHead = room.members.find(memberId => memberId.toString() !== req.user.id);
                room.head = newHead;
            } else {
                return res.status(400).json({ 
                    message: 'You are the only member. Please delete the room instead of leaving.' 
                });
            }
        }

        // 3. Remove the user from the members array
        room.members = room.members.filter(memberId => memberId.toString() !== req.user.id);
        await room.save();

        res.status(200).json({ message: 'Successfully left the room' });
    } catch (error) {
        res.status(500).json({ message: 'Server error leaving room', error: error.message });
    }
};

// GET ALL ROOMS FOR CURRENT USER
export const getUserRooms = async (req, res) => {
    try {
        // Find rooms where the current user's ID is in the members array
        const rooms = await Room.find({ members: req.user.id })
            .populate('head', 'name email avatar') // Optional: Populates the creator's details
            .sort({ createdAt: -1 }); // Sort by newest first
            
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching user rooms', error: error.message });
    }
};