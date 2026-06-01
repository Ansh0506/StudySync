import express from "express";
import { register, login, updateProfile } from "../controllers/AuthController.js";
import protect from "../middlewares/AuthMiddleware.js";
import { validateRegister, validateLogin } from '../middlewares/ValidationMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// Public auth routes return a token when registration/login succeeds.
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// The frontend uses this to restore the session after a page refresh.
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

// Profile updates can include multipart avatar data handled by multer.
router.put('/profile', protect, upload.single('avatar'), updateProfile);

export default router;
