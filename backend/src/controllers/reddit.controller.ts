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

    // Make request to Reddit API with proper headers
    const response = await axios({
      method: "get",
      url: `${REDDIT_API_BASE}/r/${subreddit}/hot.json`,
      params: {
        limit: Number(limit),
        raw_json: 1,
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    // Check if we have valid data
    if (!response.data?.data?.children) {
      return res.status(404).json({
        success: false,
        error: "No posts found in this subreddit",
      });
    }

    // Extract and transform posts
    const posts = response.data.data.children
      .filter((post: any) => post?.data) // Filter out any invalid posts
      .map((post: any) => ({
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
        subreddit_name_prefixed: post.data.subreddit_name_prefixed,
        subreddit_subscribers: post.data.subreddit_subscribers,
        post_hint: post.data.post_hint,
        domain: post.data.domain,
      }));

    // Return success response
    return res.json({
      success: true,
      data: {
        posts,
        subreddit,
        total: posts.length,
        after: response.data.data.after,
        before: response.data.data.before,
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
            error: "Unable to access subreddit. Please try again later.",
          });
        case 429:
          return res.status(429).json({
            success: false,
            error: "Too many requests. Please try again in a few minutes.",
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
