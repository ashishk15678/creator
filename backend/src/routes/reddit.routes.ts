import express from "express";
import {
  getPosts,
  sharePost,
  viewPost,
} from "../controllers/reddit.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// Public routes
router.get("/posts", getPosts);

// Protected routes
router.post("/share/:postId", protect, sharePost);
router.post("/view/:postId", protect, viewPost);

export default router;
