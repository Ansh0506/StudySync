import express from "express";
import { uploadPdf, getPdf, deletePdf, getRoomPdfs, downloadPdf } from "../controllers/PdfController.js";
import protect from "../middlewares/AuthMiddleware.js";
import upload from "../config/multer.js";


const router = express.Router();

// Upload uses multipart form data; the controller creates the database record.
router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadPdf
);

// More specific routes must stay above "/:id" so Express matches them correctly.
router.get('/room/:roomId', protect, getRoomPdfs);
router.get('/download/:id', protect, downloadPdf);
router.get("/:id", protect, getPdf);
router.delete("/:id", protect, deletePdf);
export default router;
