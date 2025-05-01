import express from "express";
import { body } from "express-validator";
import * as userController from "../controllers/user.controller";
import { protect, admin } from "../middleware/auth.middleware";

const router = express.Router();

// Validation middleware
const profileUpdateValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
];

// Protected routes (require authentication)
router.get("/profile", protect, userController.getProfile);
router.put(
  "/profile",
  protect,
  profileUpdateValidation,
  userController.updateProfile
);
router.get("/credits", protect, userController.getCredits);

// Admin routes
router.get("/all", protect, admin, userController.getAllUsers);
router.put(
  "/credits/:userId",
  protect,
  admin,
  userController.updateUserCredits
);

export default router;
