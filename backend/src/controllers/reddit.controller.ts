import { Request, Response } from "express";
import axios from "axios";
import { IUser } from "../models/User";

// Reddit API configuration
const REDDIT_API_BASE = "https://www.reddit.com";
const REDDIT_API_HEADERS = {
  "User-Agent": "CreatorDash/1.0.0 (by /u/YourRedditUsername)",
  Accept: "application/json",
};

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

    const response = await axios.get(
      `${REDDIT_API_BASE}/r/${subreddit}/hot.json`,
      {
        headers: REDDIT_API_HEADERS,
        params: {
          limit: Number(limit),
          raw_json: 1,
        },
      }
    );

    if (!response.data?.data?.children) {
      throw new Error("Invalid response format from Reddit API");
    }

    const posts = response.data.data.children.map((post: any) => ({
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
    }));

    res.json({
      success: true,
      data: {
        posts,
        subreddit,
        total: posts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return res.status(404).json({
          success: false,
          error: "Subreddit not found",
        });
      }
      if (error.response?.status === 403) {
        return res.status(403).json({
          success: false,
          error:
            "Access to subreddit forbidden. Please try again in a few minutes.",
          details: error.response.data,
        });
      }
      if (error.response?.status === 429) {
        return res.status(429).json({
          success: false,
          error: "Too many requests. Please try again in a few minutes.",
        });
      }
    }

    res.status(500).json({
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

    res.json({
      success: true,
      data: {
        postId,
        pointsEarned,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({
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

    res.json({
      success: true,
      data: {
        postId,
        pointsEarned,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("Error recording view:", error);
    res.status(500).json({
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
