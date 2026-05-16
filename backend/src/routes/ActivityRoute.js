import express from 'express';
import { getRoomActivity } from '../controllers/ActivityController.js';
import { protect } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.get('/room/:roomId', protect, getRoomActivity);

export default router;