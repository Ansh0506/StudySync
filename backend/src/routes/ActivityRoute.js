import express from 'express';
import { getRoomActivity } from '../controllers/ActivityController.js';
import protect from '../middlewares/AuthMiddleware.js';

const router = express.Router();

// Room activity is protected because it can reveal member actions.
router.get('/room/:roomId', protect, getRoomActivity);

export default router;
