import express from 'express';
import { saveAnnotation, getPdfAnnotations } from '../controllers/AnnotationController.js';
import protect from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.post('/save', protect, saveAnnotation);
router.get('/pdf/:pdfId', protect, getPdfAnnotations);

export default router;