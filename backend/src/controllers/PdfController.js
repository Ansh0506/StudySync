import Pdf from "../models/pdf.js";
import Room from "../models/Room.js";
import fs from 'fs';
import path from 'path';
import Activity from '../models/Activity.js';
import Annotation from '../models/Annotation.js';

// Handles PDF upload, records metadata, and makes the uploaded PDF active in its room.
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

    // The newest upload becomes the room's active PDF by default.
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

// Returns one PDF metadata record by database ID.
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

// Hides a PDF for one user, then permanently deletes it when every room member has removed it.
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

        // Older PDF records may not have the deletedBy array yet.
        if (!pdf.deletedBy) {
            pdf.deletedBy = [];
        }

        // Mark that this user no longer wants to see the PDF.
        if (!pdf.deletedBy.includes(userId)) {
            pdf.deletedBy.push(userId);
        }

        // Only delete the physical file when every current member has removed it.
        const allMembersDeleted = room.members.every(memberId => 
            pdf.deletedBy.includes(memberId.toString())
        );

        // Consensus reached: remove annotations, metadata, and the file on disk.
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
        
        // No consensus yet: save the per-user hidden state.
        console.log(`👁️ [BACKEND] User ${userId} hid PDF: ${pdf._id}`);
        await pdf.save();
        
        return res.status(200).json({ message: 'PDF removed from your view', action: 'hidden' });

    } catch (error) {
        console.error('❌ [BACKEND] Delete PDF Error:', error);
        res.status(500).json({ message: 'Server error deleting PDF', error: error.message });
    }
};
// Lists room PDFs that are still visible to the current user.
export const getRoomPdfs = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const pdfs = await Pdf.find({ 
            roomId,
            deletedBy: { $ne: userId }
        }).sort({ createdAt: -1 });

        res.status(200).json(pdfs);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching PDFs', error: error.message });
    }
};

// Streams the stored PDF file back to the client as a download.
export const downloadPdf = async (req, res) => {
    try {
        const pdf = await Pdf.findById(req.params.id);
        
        if (!pdf) {
            return res.status(404).json({ message: 'PDF metadata not found' });
        }

        const fullPath = path.resolve(pdf.filePath); 
        
        // The metadata can exist even if the local file was removed or storage changed.
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ message: 'Physical file not found on server' });
        }

        res.download(fullPath, pdf.fileName);
        
    } catch (error) {
        res.status(500).json({ message: 'Server error downloading PDF', error: error.message });
    }
};
