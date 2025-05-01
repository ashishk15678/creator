import { Request, Response } from "express";
import axios from "axios";
import { IUser } from "../models/User";

// Reddit API configuration
const REDDIT_API_BASE = "https://www.reddit.com";

// Get popular posts from Reddit
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { limit = 25, sort = "hot" } = req.query;

    // Make request to Reddit API with proper headers
    const response = await axios({
      method: "get",
      url: `${REDDIT_API_BASE}/${sort}.json`,
      params: {
        limit: Number(limit),
        raw_json: 1,
      },
      headers: {
        "User-Agent": "CreatorDash/1.0 (by /u/ashish)",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      timeout: 10000,
    });

    if (!response.data?.data?.children) {
      return res.status(500).json({
        success: false,
        error: "Invalid response format from Reddit API",
      });
    }

    // Transform posts to match frontend interface
    const posts = response.data.data.children
      .filter((post: any) => post?.data) // Filter out any invalid posts
      .map((post: any) => ({
        id: post.data.id,
        title: post.data.title,
        content: post.data.selftext || "",
        author: post.data.author || "[deleted]",
        subreddit: post.data.subreddit,
        score: post.data.score || 0,
        num_comments: post.data.num_comments || 0,
        created_utc: post.data.created_utc,
        permalink: post.data.permalink,
        thumbnail:
          post.data.thumbnail &&
          post.data.thumbnail !== "self" &&
          post.data.thumbnail !== "default"
            ? post.data.thumbnail
            : "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
        is_video: post.data.is_video || false,
        media: post.data.media || null,
        url: post.data.url,
        domain: post.data.domain,
        over_18: post.data.over_18 || false,
        spoiler: post.data.spoiler || false,
        stickied: post.data.stickied || false,
        is_self: post.data.is_self || false,
        is_original_content: post.data.is_original_content || false,
        is_reddit_media_domain: post.data.is_reddit_media_domain || false,
        is_meta: post.data.is_meta || false,
        is_created_from_ads_ui: post.data.is_created_from_ads_ui || false,
        is_crosspostable: post.data.is_crosspostable || false,
        is_robot_indexable: post.data.is_robot_indexable || false,
        upvote_ratio: post.data.upvote_ratio || 0,
        total_awards_received: post.data.total_awards_received || 0,
        all_awardings: post.data.all_awardings || [],
        gilded: post.data.gilded || 0,
        author_flair_text: post.data.author_flair_text || null,
        author_flair_background_color:
          post.data.author_flair_background_color || null,
        author_flair_text_color: post.data.author_flair_text_color || null,
        author_flair_type: post.data.author_flair_type || null,
        author_flair_css_class: post.data.author_flair_css_class || null,
        author_flair_template_id: post.data.author_flair_template_id || null,
        author_flair_richtext: post.data.author_flair_richtext || [],
        author_flair_icon: post.data.author_flair_icon || null,
        author_flair_icon_url: post.data.author_flair_icon_url || null,
        author_flair_icon_emoji: post.data.author_flair_icon_emoji || null,
      }));

    // Return success response
    return res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      // Handle specific error cases
      switch (status) {
        case 403:
          return res.status(403).json({
            success: false,
            error:
              "Access to Reddit API is restricted. Please try again later.",
          });
        case 429:
          return res.status(429).json({
            success: false,
            error:
              "Too many requests to Reddit API. Please try again in a few minutes.",
          });
        case 404:
          return res.status(404).json({
            success: false,
            error: "Reddit API endpoint not found.",
          });
        default:
          return res.status(status || 500).json({
            success: false,
            error: "Failed to fetch Reddit posts",
            details:
              process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
          });
      }
    }

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
