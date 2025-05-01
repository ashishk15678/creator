import { Request, Response } from "express";
import axios from "axios";
import { IUser } from "../models/User";

// Reddit API configuration
const REDDIT_API_BASE = "https://www.reddit.com";

// Get popular posts from Reddit
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { limit = 25, sort = "hot" } = req.query;

    // Make request to Reddit API
    const response = await axios({
      method: "get",
      url: `${REDDIT_API_BASE}/${sort}.json`,
      params: {
        limit: Number(limit),
        raw_json: 1,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    // Transform posts to match frontend interface
    const posts = response.data.data.children.map((post: any) => ({
      id: post.data.id,
      title: post.data.title,
      content: post.data.selftext,
      author: post.data.author,
      subreddit: post.data.subreddit,
      score: post.data.score,
      num_comments: post.data.num_comments,
      created_utc: post.data.created_utc,
      permalink: post.data.permalink,
      thumbnail:
        post.data.thumbnail ||
        "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
      is_video: post.data.is_video,
      media: post.data.media,
    }));

    // Return success response
    return res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch Reddit posts",
    });
  }
};

// Share a post
export const sharePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { postId } = req.params;
    const user = req.user as IUser;

    // Award points for sharing
    const pointsEarned = 5;
    user.credits += pointsEarned;
    await user.save();

    return res.json({
      success: true,
      data: {
        postId,
        pointsEarned,
        credits: user.credits,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to share post",
    });
  }
};

// Record a view
export const viewPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { postId } = req.params;
    const user = req.user as IUser;

    // Award points for viewing
    const pointsEarned = 1;
    user.credits += pointsEarned;
    await user.save();

    return res.json({
      success: true,
      data: {
        postId,
        pointsEarned,
        credits: user.credits,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to record view",
    });
  }
};

export const handleRedditCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  const { user } = req as { user: IUser };

  if (!code) {
    return res.status(400).json({ message: "Authorization code is required" });
  }

  try {
    // ... existing code ...
  } catch (error) {
    console.error("Reddit callback error:", error);
    return res
      .status(500)
      .json({ message: "Error processing Reddit callback" });
  }
};

export const refreshRedditToken = async (user: IUser) => {
  if (!user.redditRefreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    // ... existing code ...
  } catch (error) {
    console.error("Error refreshing Reddit token:", error);
    throw error;
  }
};
