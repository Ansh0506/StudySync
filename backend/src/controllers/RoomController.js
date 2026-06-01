import Room from "../models/Room.js";
import generateRoomCode from "../utils/GenerateRoomCode.js";
import Annotation from '../models/Annotation.js';
import Activity from '../models/Activity.js';
import Pdf from '../models/pdf.js';
import Message from '../models/Message.js';
import fs from 'fs';
import path from 'path';

// Creates a study room and assigns the creator as both current head and permanent owner.
export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ message: "Room name required" });

    let roomCode;
    let exists = true;

    // Room codes are short, so keep generating until MongoDB confirms this one is unused.
    while (exists) {
      roomCode = generateRoomCode();
      exists = await Room.findOne({ roomCode });
    }

    const room = await Room.create({
      name,
      roomCode,
      head: req.user._id,
      master: req.user._id,
      tempMaster: null,
      members: [req.user._id]
    });

    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create room" });
  }
};

// Adds the current user to an existing room by room code.
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

    // Activity entries let the UI show a lightweight timeline for the room.
    await Activity.create({
      roomId: room._id,
      userId: req.user._id,
      action: 'JOINED',
      description: `${req.user.name} joined the room`
    });

    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to join room" });
  }
};

// Loads room details with enough user information for the workspace header/member views.
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

// Deletes a room for everyone when the permanent owner requests it; otherwise removes only the current member.
export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Convert ObjectIds to strings before comparison so populated and raw IDs behave the same.
        const userId = req.user._id.toString();
        
        // Older rooms may not have master set, so head is the fallback owner.
        const masterId = room.master ? room.master.toString() : room.head.toString();
        
        const isMaster = masterId === userId;
        const userIsMember = room.members.some(memberId => memberId.toString() === userId);

        // Owners delete the room globally and clean up all child records/files.
        if (isMaster) {
            console.log(`🗑️ [BACKEND] Master deleting room permanently: ${room._id}`);

            // Files live on disk, so remove them separately from MongoDB records.
            const pdfs = await Pdf.find({ roomId: room._id });
            for (const pdf of pdfs) {
                if (pdf.filePath) {
                    const fullPath = path.resolve(pdf.filePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            }

            // Delete dependent records before deleting the room document itself.
            await Annotation.deleteMany({ roomId: room._id });
            await Pdf.deleteMany({ roomId: room._id });
            await Message.deleteMany({ roomId: room._id });
            await Activity.deleteMany({ roomId: room._id });
            await Room.findByIdAndDelete(req.params.id);

            return res.status(200).json({ message: 'Room permanently deleted for all users.' });
        }

        // Members use the same dashboard delete button as a "leave this room" action.
        if (userIsMember) {
            console.log(`👤 [BACKEND] User leaving room (Delete from my side): ${room._id}`);
            
            // Remove this user while preserving the room for everyone else.
            room.members = room.members.filter(memberId => memberId.toString() !== userId);

            // If the temporary owner leaves, hand that role to the next remaining member.
            if (room.tempMaster && room.tempMaster.toString() === userId) {
                room.tempMaster = room.members.length > 0 ? room.members[0] : null;
            }

            await room.save();

            await Activity.create({
                roomId: room._id,
                userId: req.user._id,
                action: 'LEFT',
                description: `${req.user.name} left the room`
            });

            return res.status(200).json({ message: 'Successfully removed room from your view.' });
        }

        return res.status(403).json({ message: 'You are not a member of this room' });
    } catch (error) {
        console.error('❌ [BACKEND] Delete room error:', error);
        res.status(500).json({ message: 'Server error deleting room', error: error.message });
    }
};
// Explicit leave endpoint used when the UI wants "leave" separate from dashboard deletion.
export const leaveRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Reject requests from users who are not currently members.
        const userId = req.user.id;
        if (!room.members.some(memberId => memberId.toString() === userId)) {
            return res.status(400).json({ message: 'You are not a member of this room' });
        }

        const masterId = room.master ? room.master.toString() : room.head.toString();
        const tempMasterId = room.tempMaster ? room.tempMaster.toString() : null;
        const isMaster = masterId === userId;
        const isTempMaster = tempMasterId === userId;

        // If the permanent owner leaves, either assign a temporary owner or delete an empty room.
        if (isMaster) {
            console.log(`👑 [BACKEND] Master leaving room: ${room._id}`);
            
            // Keep the room usable by assigning the first remaining member as temporary owner.
            if (room.members.length > 1) {
                const newTempMaster = room.members.find(
                    memberId => memberId.toString() !== userId
                );
                room.tempMaster = newTempMaster;
                console.log(`⚡ [BACKEND] Temp master assigned`);
            } else {
                // A one-person room has no one left to own it, so remove it completely.
                console.log(`🗑️ [BACKEND] Last member (master) leaving - deleting room`);
                
                const pdfs = await Pdf.find({ roomId: room._id });
                for (const pdf of pdfs) {
                    const fullPath = path.resolve(pdf.filePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }

                await Annotation.deleteMany({ roomId: room._id });
                await Pdf.deleteMany({ roomId: room._id });
                await Message.deleteMany({ roomId: room._id });
                await Activity.deleteMany({ roomId: room._id });
                await Room.findByIdAndDelete(req.params.id);

                return res.status(200).json({ message: 'Room deleted as you were the last member' });
            }
        }

        // Normal leave flow: remove the user from the membership list.
        room.members = room.members.filter(memberId => memberId.toString() !== userId);
        await room.save();

        // Record the leave event for the room activity timeline.
        await Activity.create({
          roomId: room._id,
          userId: req.user._id,
          action: 'LEFT',
          description: `${req.user.name} left the room`
        });

        res.status(200).json({ message: 'Successfully left the room' });
    } catch (error) {
        console.error('❌ [BACKEND] Leave room error:', error);
        res.status(500).json({ message: 'Server error leaving room', error: error.message });
    }
};

// Returns the dashboard room list for the authenticated user.
export const getUserRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ members: req.user.id })
            .populate('head', 'name email avatar')
            .sort({ createdAt: -1 });
            
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching user rooms', error: error.message });
    }
};
