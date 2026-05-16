import express from "express";
import { register, login , updateProfile} from "../controllers/AuthController.js";
import protect from "../middlewares/AuthMiddleware.js";
import { validateRegister, validateLogin } from '../middlewares/ValidationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

router.put('/profile', protect, updateProfile);

export default router;
