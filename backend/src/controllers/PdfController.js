import Pdf from "../models/pdf.js";
import Room from "../models/Room.js";

export const uploadPdf = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId || !req.file) {
      return res.status(400).json({ message: "Missing data" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const pdf = await Pdf.create({
      roomId,
      uploadedBy: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path
    });

    // mark active PDF in room
    room.activePdf = pdf._id;
    await room.save();

    res.status(201).json(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF upload failed" });
  }
};
