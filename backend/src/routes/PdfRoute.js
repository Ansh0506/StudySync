import express from "express";
import protect from "../middlewares/AuthMiddleware.js";
import uploadPdf from "../config/multer.js";
import { uploadPdf as uploadPdfController , getPdf, deletePdf} from "../controllers/PdfController.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  uploadPdf.single("pdf"),
  uploadPdfController
);

router.get("/:id", protect, getPdf);
router.delete("/:id", protect, deletePdf);

export default router;
