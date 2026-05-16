import mongoose from 'mongoose';

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
    // A short code for the action (e.g., 'JOINED', 'LEFT', 'UPLOADED_PDF')
    action: {
        type: String,
        required: true
    },
    // The human-readable message (e.g., 'Ansh uploaded Math_Notes.pdf')
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);