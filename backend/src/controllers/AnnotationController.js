import Annotation from '../models/Annotation.js';

// SAVE A NEW ANNOTATION
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
        
        // Populate the user data so the frontend knows who drew it
        await savedAnnotation.populate('userId', 'name avatar');

        res.status(201).json(savedAnnotation);
    } catch (error) {
        res.status(500).json({ message: 'Server error saving annotation', error: error.message });
    }
};

// GET ALL ANNOTATIONS FOR A SPECIFIC PDF
export const getPdfAnnotations = async (req, res) => {
    try {
        const { pdfId } = req.params;

        const annotations = await Annotation.find({ pdfId })
            .populate('userId', 'name avatar')
            .sort({ createdAt: 1 }); // Oldest first, so they draw in the correct order

        res.status(200).json(annotations);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching annotations', error: error.message });
    }
};