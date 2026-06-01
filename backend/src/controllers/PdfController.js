import Pdf from "../models/pdf.js";
import Room from "../models/Room.js";
import fs from 'fs';
import path from 'path';
import Activity from '../models/Activity.js';
import Annotation from '../models/Annotation.js';

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
      filePath: `Uploads/${req.file.filename}`
    });

    // mark active PDF in room
    room.activePdf = pdf._id;
    await room.save();

    await Activity.create({
      roomId: req.body.roomId,
      userId: req.user.id,
      action: 'UPLOADED_PDF',
      description: `Uploaded a new PDF: ${req.file.originalname}`
    });

    res.status(201).json(pdf);
} catch (error) {
        console.error("PDF upload failed:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET PDF DETAILS
export const getPdf = async (req, res) => {
    try {
        const pdf = await Pdf.findById(req.params.id);
        
        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }
        
        res.status(200).json(pdf);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving PDF', error: error.message });
    }
};

// SMART DELETE PDF
export const deletePdf = async (req, res) => {
    try {
        const pdf = await Pdf.findById(req.params.id);
        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        const room = await Room.findById(pdf.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Associated room not found' });
        }

        const userId = req.user._id.toString();

        // 1. Initialize the array if it doesn't exist yet (for older PDFs)
        if (!pdf.deletedBy) {
            pdf.deletedBy = [];
        }

        // 2. Add the current user to the deletedBy list if they aren't in it
        if (!pdf.deletedBy.includes(userId)) {
            pdf.deletedBy.push(userId);
        }

        // 3. Check for Consensus: Has every current member of the room deleted it?
        // We check if every member in the room's member array exists in the pdf's deletedBy array.
        const allMembersDeleted = room.members.every(memberId => 
            pdf.deletedBy.includes(memberId.toString())
        );

        // CASE A: Everyone has deleted it -> remove it permanently
        if (allMembersDeleted) {
            console.log(`🗑️ [BACKEND] Consensus reached. Permanently deleting PDF: ${pdf._id}`);
            
            if (pdf.filePath) {
                const fullPath = path.resolve(pdf.filePath); 
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
            
            await Annotation.deleteMany({ pdfId: pdf._id });
            await Pdf.findByIdAndDelete(pdf._id);
            
            return res.status(200).json({ message: 'PDF permanently deleted', action: 'permanently_deleted' });
        } 
        
        // CASE B: Only this user deleted it -> Just hide it
        console.log(`👁️ [BACKEND] User ${userId} hid PDF: ${pdf._id}`);
        await pdf.save();
        
        return res.status(200).json({ message: 'PDF removed from your view', action: 'hidden' });

    } catch (error) {
        console.error('❌ [BACKEND] Delete PDF Error:', error);
        res.status(500).json({ message: 'Server error deleting PDF', error: error.message });
    }
};
// GET ALL PDFs FOR A SPECIFIC ROOM
export const getRoomPdfs = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        // Find all PDFs for this room, BUT exclude ones where this user is in the deletedBy array
        const pdfs = await Pdf.find({ 
            roomId,
            deletedBy: { $ne: userId } // $ne means "Not Equal to" or "Does not contain"
        }).sort({ createdAt: -1 });

        res.status(200).json(pdfs);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching PDFs', error: error.message });
    }
};

// DOWNLOAD PDF
export const downloadPdf = async (req, res) => {
    try {
        // 1. Find the PDF in the database
        const pdf = await Pdf.findById(req.params.id);
        
        if (!pdf) {
            return res.status(404).json({ message: 'PDF metadata not found' });
        }

        // 2. Locate the physical file on the server
        const fullPath = path.resolve(pdf.filePath); 
        
        // 3. Double-check that the file actually exists on the hard drive
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ message: 'Physical file not found on server' });
        }

        // 4. Force the download (sends the file to the user)
        res.download(fullPath, pdf.fileName);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error downloading PDF', error: error.message });
    }
};
