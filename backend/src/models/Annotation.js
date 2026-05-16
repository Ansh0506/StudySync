import mongoose from 'mongoose';

const annotationSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    pdfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pdf',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pageNumber: {
        type: Number,
        required: true
    },
    // The type of mark (e.g., 'highlight', 'draw', 'text')
    type: {
        type: String,
        default: 'highlight'
    },
    // The flexible object holding the X/Y coordinates, color, and text
    annotationData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Annotation', annotationSchema);