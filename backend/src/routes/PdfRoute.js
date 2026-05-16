import express from "express";
import protect from "../middlewares/AuthMiddleware.js";
import upload from "../config/multer.js";
import { uploadPdf, getPdf, deletePdf} from "../controllers/PdfController.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("pdf"),
  uploadPdf
);

router.get("/:id", protect, getPdf);
router.delete("/:id", protect, deletePdf);

export default router;
