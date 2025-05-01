import { Request, Response } from "express";
import axios from "axios";
import { IUser } from "../models/User";

// Reddit API configuration
const REDDIT_API_BASE = "https://www.reddit.com";
const REDDIT_API_HEADERS = {
  "User-Agent": "CreatorDash/1.0.0",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
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

    console.log(`Fetching posts from r/${subreddit}...`);

    const response = await axios.get(
      `${REDDIT_API_BASE}/r/${subreddit}/hot.json`,
      {
        headers: REDDIT_API_HEADERS,
        params: {
          limit: Number(limit),
          raw_json: 1,
          after: req.query.after || undefined,
          before: req.query.before || undefined,
          count: req.query.count || undefined,
          show: "all",
          sr_detail: true,
        },
        timeout: 10000, // 10 second timeout
        validateStatus: (status) => status < 500, // Accept all responses except 5xx errors
      }
    );

    // Log the response structure for debugging
    console.log("Reddit API Response Structure:", {
      hasData: !!response.data,
      hasDataData: !!response.data?.data,
      hasChildren: !!response.data?.data?.children,
      childrenLength: response.data?.data?.children?.length,
    });

    // More robust response validation
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response: No data received");
    }

    if (!response.data.data || typeof response.data.data !== "object") {
      throw new Error("Invalid response: No data.data object");
    }

    if (!Array.isArray(response.data.data.children)) {
      throw new Error("Invalid response: No children array");
    }

    const posts = response.data.data.children
      .filter((post: any) => post && post.data) // Filter out any invalid posts
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

    console.log(`Successfully processed ${posts.length} posts`);

    res.json({
      success: true,
      data: {
        posts,
        subreddit,
        total: posts.length,
        after: response.data.data.after,
        before: response.data.data.before,
        dist: response.data.data.dist,
      },
    });
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);

    // Log the full error object for debugging
    if (axios.isAxiosError(error)) {
      console.error("Axios Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data,
      });
    }

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
          headers: error.response.headers,
        });
      }
      if (error.response?.status === 429) {
        return res.status(429).json({
          success: false,
          error: "Too many requests. Please try again in a few minutes.",
          retryAfter: error.response.headers["retry-after"],
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
