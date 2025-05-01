import { Request, Response } from "express";
import { validationResult } from "express-validator";
import User from "../models/User";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username or email is already taken
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already taken" });
      }
      user.email = email;
    }

    // Update last login
    user.lastLogin = new Date();

    await user.save();
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      credits: user.credits,
      savedPosts: user.savedPosts,
      totalInteractions: user.totalInteractions,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

export const getCredits = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("credits");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ credits: user.credits });
  } catch (error) {
    console.error("Error fetching credits:", error);
    res.status(500).json({ message: "Server error while fetching credits" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

export const updateUserCredits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { credits } = req.body;

    if (typeof credits !== "number" || credits < 0) {
      return res
        .status(400)
        .json({ message: "Credits must be a positive number" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.credits = credits;
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      credits: user.credits,
    });
  } catch (error) {
    console.error("Error updating credits:", error);
    res.status(500).json({ message: "Server error while updating credits" });
  }
};
