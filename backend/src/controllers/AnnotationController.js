import Annotation from '../models/Annotation.js';

// Saves one PDF annotation/highlight for the authenticated user.
export const saveAnnotation = async (req, res) => {
    try {
        const { roomId, pdfId, pageNumber, type, annotationData } = req.body;

        const newAnnotation = new Annotation({
            roomId,
            pdfId,
            userId: req.user.id,
            pageNumber,
            type,
            annotationData
        });

        const savedAnnotation = await newAnnotation.save();
        
        // Return author details immediately so the UI can show who made the mark.
        await savedAnnotation.populate('userId', 'name avatar');

        res.status(201).json(savedAnnotation);
    } catch (error) {
        res.status(500).json({ message: 'Server error saving annotation', error: error.message });
    }
};

// Loads all annotations for a PDF in drawing order.
export const getPdfAnnotations = async (req, res) => {
    try {
        const { pdfId } = req.params;

        const annotations = await Annotation.find({ pdfId })
            .populate('userId', 'name avatar')
            .sort({ createdAt: 1 });

        res.status(200).json(annotations);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching annotations', error: error.message });
    }
};
// Deletes a highlight by its frontend-generated annotationData.id, with MongoDB _id fallback.
export const deleteAnnotation = async (req, res) => {
    try {
        const targetId = req.params.id;
        console.log(`\n🗑️ [BACKEND] Attempting to delete highlight: ${targetId}`);
        
        // Most deletes pass the stable highlight ID stored inside annotationData.
        let deleted = await Annotation.findOneAndDelete({ 'annotationData.id': targetId });

        // If a MongoDB ObjectId is passed instead, still allow the delete.
        if (!deleted && targetId.length === 24) {
            deleted = await Annotation.findByIdAndDelete(targetId);
        }

        if (!deleted) {
            console.log("❌ [BACKEND] ERROR: Highlight NOT found in database!");
            return res.status(404).json({ message: 'Annotation not found in DB' });
        }

        console.log("✅ [BACKEND] Highlight permanently deleted!");
        res.status(200).json({ message: 'Annotation removed' });
    } catch (error) {
        console.error("❌ [BACKEND] Delete Error:", error);
        res.status(500).json({ message: 'Server error deleting annotation', error: error.message });
    }
};
