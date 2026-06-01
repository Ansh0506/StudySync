import Activity from '../models/Activity.js';

// Returns the latest room activity entries for timeline/history UI.
export const getRoomActivity = async (req, res) => {
    try {
        const { roomId } = req.params;

        const activities = await Activity.find({ roomId })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching activity history', error: error.message });
    }
};
