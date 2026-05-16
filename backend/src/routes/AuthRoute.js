import express from "express";
import { register, login } from "../controllers/AuthController.js";
import protect from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

router.put('/profile', protect, updateProfile);

export default router;
