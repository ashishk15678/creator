import { Request, Response } from "express";
import axios from "axios";
import { IUser } from "../models/User";

// Reddit API configuration
const REDDIT_API_BASE = "https://www.reddit.com";

// Get posts from Reddit
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { subreddit = "popular", limit = 25 } = req.query;

    // Validate subreddit name
    if (typeof subreddit !== "string" || !/^[a-zA-Z0-9_]+$/.test(subreddit)) {
      return res.status(400).json({
        success: false,
        error: "Invalid subreddit name",
      });
    }

    // Make request to Reddit API
    const response = await axios({
      method: "get",
      url: `${REDDIT_API_BASE}/r/${subreddit}/hot.json`,
      params: {
        limit: Number(limit),
      },
      headers: {
        "User-Agent": "CreatorDash/1.0.0",
        Accept: "application/json",
      },
      timeout: 5000,
    });

    // Extract posts from response
    const posts =
      response.data?.data?.children?.map((post: any) => ({
        id: post.data.id,
        title: post.data.title,
        content: post.data.selftext,
        author: post.data.author,
        subreddit: post.data.subreddit,
        score: post.data.score,
        url: post.data.url,
        thumbnail:
          post.data.thumbnail ||
          "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
        created_utc: post.data.created_utc,
        num_comments: post.data.num_comments,
        permalink: post.data.permalink,
        is_video: post.data.is_video,
        media: post.data.media,
      })) || [];

    // Return success response
    return res.json({
      success: true,
      data: {
        posts,
        subreddit,
        total: posts.length,
      },
    });
  } catch (error) {
    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      // Handle different error status codes
      switch (status) {
        case 404:
          return res.status(404).json({
            success: false,
            error: "Subreddit not found",
          });
        case 403:
          return res.status(403).json({
            success: false,
            error: "Access to subreddit forbidden",
          });
        case 429:
          return res.status(429).json({
            success: false,
            error: "Too many requests. Please try again later",
          });
        default:
          return res.status(status || 500).json({
            success: false,
            error: "Failed to fetch Reddit posts",
            details: data,
          });
      }
    }

    // Handle other errors
    return res.status(500).json({
      success: false,
      error: "Failed to fetch Reddit posts",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
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
