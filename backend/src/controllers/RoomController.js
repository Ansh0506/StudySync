import Room from "../models/Room.js";
import generateRoomCode from "../utils/GenerateRoomCode.js";
import Annotation from '../models/Annotation.js';
import Activity from '../models/Activity.js';
import Pdf from '../models/pdf.js';
import Message from '../models/Message.js';
import fs from 'fs';
import path from 'path';

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
      master: req.user._id, // Set the creator as the permanent master
      tempMaster: null,
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

    // Create an activity log entry
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

// DELETE ROOM (Only master can delete permanently, others just leave)
export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Bulletproof ID checking
        const userId = req.user._id.toString();
        
        // Handle old rooms that might not have 'master' set by falling back to 'head'
        const masterId = room.master ? room.master.toString() : room.head.toString();
        
        const isMaster = masterId === userId;
        const userIsMember = room.members.some(memberId => memberId.toString() === userId);

        // CASE 1: ORIGINAL CREATOR (MASTER) -> PERMANENTLY DELETE FOR EVERYONE
        if (isMaster) {
            console.log(`🗑️ [BACKEND] Master deleting room permanently: ${room._id}`);

            // Safely clean up physical PDF files (This fixes the 500 crash!)
            const pdfs = await Pdf.find({ roomId: room._id });
            for (const pdf of pdfs) {
                if (pdf.filePath) { // <-- CRITICAL: Prevents crash if path is missing
                    const fullPath = path.resolve(pdf.filePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
            }

            // Clean up database records
            await Annotation.deleteMany({ roomId: room._id });
            await Pdf.deleteMany({ roomId: room._id });
            await Message.deleteMany({ roomId: room._id });
            await Activity.deleteMany({ roomId: room._id });
            await Room.findByIdAndDelete(req.params.id);

            return res.status(200).json({ message: 'Room permanently deleted for all users.' });
        }

        // CASE 2: NORMAL MEMBER (OR TEMP MASTER) -> REMOVE THEMSELVES ONLY (LEAVE)
        if (userIsMember) {
            console.log(`👤 [BACKEND] User leaving room (Delete from my side): ${room._id}`);
            
            // Remove user from members array
            room.members = room.members.filter(memberId => memberId.toString() !== userId);

            // If the leaving user was the tempMaster, reassign it to someone else
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
// LEAVE ROOM
export const leaveRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // 1. Check if user is actually in the room
        const userId = req.user.id;
        if (!room.members.some(memberId => memberId.toString() === userId)) {
            return res.status(400).json({ message: 'You are not a member of this room' });
        }

        const masterId = room.master ? room.master.toString() : room.head.toString();
        const tempMasterId = room.tempMaster ? room.tempMaster.toString() : null;
        const isMaster = masterId === userId;
        const isTempMaster = tempMasterId === userId;

        // 2. If master is leaving
        if (isMaster) {
            console.log(`👑 [BACKEND] Master leaving room: ${room._id}`);
            
            // If there are other members, set one as tempMaster
            if (room.members.length > 1) {
                const newTempMaster = room.members.find(
                    memberId => memberId.toString() !== userId
                );
                room.tempMaster = newTempMaster;
                console.log(`⚡ [BACKEND] Temp master assigned`);
            } else {
                // Master is the only member - delete the entire room
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

        // 3. Remove the user from members
        room.members = room.members.filter(memberId => memberId.toString() !== userId);
        await room.save();

        // Create activity log
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