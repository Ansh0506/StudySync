import mongoose from 'mongoose';

// Stores human-readable events used for the room activity timeline.
const activitySchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Short machine-readable action code, such as JOINED or UPLOADED_PDF.
    action: {
        type: String,
        required: true
    },
    // Text shown directly in the activity feed.
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
