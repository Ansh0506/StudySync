import Activity from '../models/Activity.js';

export const getRoomActivity = async (req, res) => {
    try {
        const { roomId } = req.params;

        const activities = await Activity.find({ roomId })
            .populate('userId', 'name avatar') // Get the user's details
            .sort({ createdAt: -1 }) // Newest first
            .limit(50); // Optional: Limit to the last 50 events to save bandwidth

        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching activity history', error: error.message });
    }
};