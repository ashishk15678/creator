import { Request, Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/User";

// Mock social media data (replace with actual API calls)
const fetchSocialMediaPosts = async () => {
  return [
    {
      id: "1",
      platform: "twitter",
      content: "Sample Twitter post",
      author: "user1",
      timestamp: new Date(),
    },
    {
      id: "2",
      platform: "reddit",
      content: "Sample Reddit post",
      author: "user2",
      timestamp: new Date(),
    },
    {
      id: "3",
      platform: "linkedin",
      content: "Sample LinkedIn post",
      author: "user3",
      timestamp: new Date(),
    },
  ];
};

export const getFeed = async (req: Request, res: Response) => {
  try {
    const posts = await fetchSocialMediaPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feed" });
  }
};

export const savePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.savedPosts.includes(postId)) {
      return res.status(400).json({ message: "Post already saved" });
    }

    user.savedPosts.push(postId);
    user.credits += 1; // Reward for saving post
    await user.save();

    res.json({
      message: "Post saved successfully",
      credits: user.credits,
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving post" });
  }
};

export const unsavePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.savedPosts = user.savedPosts.filter((id) => id !== postId);
    await user.save();

    res.json({ message: "Post removed from saved" });
  } catch (error) {
    res.status(500).json({ message: "Error removing saved post" });
  }
};

export const sharePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Simulate share functionality
    user.credits += 2; // Reward for sharing
    await user.save();

    res.json({
      message: "Post shared successfully",
      credits: user.credits,
    });
  } catch (error) {
    res.status(500).json({ message: "Error sharing post" });
  }
};

export const reportPost = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { postId } = req.params;
    const { reason } = req.body;

    // Store report in database (implement this based on your needs)
    // For now, just acknowledge the report
    res.json({
      message: "Post reported successfully",
      report: {
        postId,
        reason,
        reportedBy: req.user._id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error reporting post" });
  }
};

export const getSavedPosts = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // In a real application, you would fetch the actual posts
    // For now, just return the IDs
    res.json({
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved posts" });
  }
};
