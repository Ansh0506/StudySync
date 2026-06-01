import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All uploaded files are stored under backend/Uploads for local development.
const uploadsPath = path.join(__dirname, '../../Uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Multer writes files with unique names while preserving the original extension.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

// The same upload middleware supports PDF documents and profile images.
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only PDFs and Images are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
