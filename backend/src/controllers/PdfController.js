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
        // if (pdf.uploadedBy.toString() !== req.user.id) {
        //     return res.status(403).json({ message: 'Not authorized to delete this PDF' });
        // }

        // 1. Delete the physical file from the server
        // Make sure the path resolves correctly based on how you saved it
        const fullPath = path.resolve(pdf.filePath); 
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        // 2. Delete the record from the database
        await Pdf.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ message: 'PDF deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting PDF', error: error.message });
    }
};
