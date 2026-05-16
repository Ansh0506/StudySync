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
      filePath: req.file.path
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF upload failed" });
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

// DELETE PDF
export const deletePdf = async (req, res) => {
    try {
        const pdf = await Pdf.findById(req.params.id);
        
        if (!pdf) {
            return res.status(404).json({ message: 'PDF not found' });
        }

        // Optional security check: Ensure only the uploader or room head can delete
        if (pdf.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this PDF' });
        }

        // 1. Delete the physical file from the server
        // Make sure the path resolves correctly based on how you saved it
        const fullPath = path.resolve(pdf.filePath); 
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
        // 2. Clean up any annotations associated with this PDF 
          await Annotation.deleteMany({ pdfId: req.params.id });

        // 3. Delete the record from the database
        await Pdf.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ message: 'PDF deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting PDF', error: error.message });
    }
};

// GET ALL PDFs FOR A SPECIFIC ROOM
export const getRoomPdfs = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find all PDFs associated with this room
        const pdfs = await Pdf.find({ roomId })
            .populate('uploadedBy', 'name avatar') // Fetches the uploader's details
            .sort({ createdAt: -1 }); // Sorts by newest first

        res.status(200).json(pdfs);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching room PDFs', error: error.message });
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