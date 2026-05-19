import express from "express";
import { uploadPdf, getPdf, deletePdf , getRoomPdfs , downloadPdf} from "../controllers/PdfController.js";
import protect from "../middlewares/AuthMiddleware.js";
import upload from "../config/multer.js";


const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadPdf
);
router.get('/room/:roomId', protect, getRoomPdfs);
router.get("/:id", protect, getPdf);
router.delete("/:id", protect, deletePdf);
router.get('/download/:id', protect, downloadPdf);
export default router;
