import express from "express";
import { body } from "express-validator";
import * as feedController from "../controllers/feed.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// Validation middleware
const reportValidation = [
  body("reason").trim().notEmpty().withMessage("Report reason is required"),
];

// Protected routes
router.get("/", protect, feedController.getFeed);
router.post("/save/:postId", protect, feedController.savePost);
router.delete("/save/:postId", protect, feedController.unsavePost);
router.post("/share/:postId", protect, feedController.sharePost);
router.post(
  "/report/:postId",
  protect,
  reportValidation,
  feedController.reportPost
);
router.get("/saved", protect, feedController.getSavedPosts);

export default router;
