import express from "express";
import { register, login, updateProfile } from "../controllers/AuthController.js";
import protect from "../middlewares/AuthMiddleware.js";
import { validateRegister, validateLogin } from '../middlewares/ValidationMiddleware.js';
import upload from '../config/multer.js'; // Import your multer config

const router = express.Router();

// I cleaned up the duplicate register/login routes you had in your file!
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

// UPDATED: Add upload.single('avatar') to process the incoming image
router.put('/profile', protect, upload.single('avatar'), updateProfile);

export default router;