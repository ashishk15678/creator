import express from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  fetchRedditFeed,
  fetchLinkedInFeed,
  shareToReddit,
  shareToLinkedIn,
  getCreditReward,
  getRedditAuthUrl,
  getRedditAccessToken,
} from "../services/socialMedia";
import { User } from "@/models/User";
const router = express.Router();

// Get Reddit OAuth URL
router.get("/reddit/auth", authenticateToken, (req, res) => {
  try {
    const authUrl = getRedditAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating Reddit auth URL:", error);
    res.status(500).json({ error: "Failed to generate Reddit auth URL" });
  }
});

// Handle Reddit OAuth callback
router.get("/reddit/callback", authenticateToken, async (req, res) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Invalid authorization code" });
    }

    const accessToken = await getRedditAccessToken(code);

    // Store the access token in the user's document
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.redditAccessToken = accessToken;
    await user.save();

    res.json({ message: "Reddit authentication successful" });
  } catch (error) {
    console.error("Error handling Reddit callback:", error);
    res.status(500).json({ error: "Failed to complete Reddit authentication" });
  }
});

// Get feed from all platforms
router.get("/feed", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [redditPosts, linkedInPosts] = await Promise.all([
      user.redditAccessToken
        ? fetchRedditFeed(user.redditAccessToken).catch((error) => {
            console.error("Reddit feed error:", error);
            return [];
          })
        : Promise.resolve([]),
      fetchLinkedInFeed().catch((error) => {
        console.error("LinkedIn feed error:", error);
        return [];
      }),
    ]);

    // Sort posts by timestamp
    const allPosts = [...redditPosts, ...linkedInPosts].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Add credits for viewing feed
    const creditReward = getCreditReward("FETCH_FEED");
    user.credits += creditReward;
    await user.save();

    res.json({
      posts: allPosts,
      credits: user.credits,
      creditReward,
      rewardMessage: `Earned ${creditReward} credits for viewing feed!`,
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

// Share post to a specific platform
router.post("/share/:platform", authenticateToken, async (req, res) => {
  try {
    const { platform } = req.params;
    const { content, url, title, subreddit } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate input
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    let success = false;
    if (platform === "reddit") {
      if (!user.redditAccessToken) {
        return res.status(401).json({ error: "Reddit not connected" });
      }
      if (!title || !subreddit) {
        return res
          .status(400)
          .json({ error: "Title and subreddit are required for Reddit posts" });
      }
      success = await shareToReddit(
        user.redditAccessToken,
        content,
        title,
        subreddit
      );
    } else if (platform === "linkedin") {
      success = await shareToLinkedIn(content, url);
    } else {
      return res.status(400).json({ error: "Invalid platform" });
    }

    if (success) {
      // Add credits for sharing
      const creditReward = getCreditReward("SHARE_POST");
      user.credits += creditReward;
      await user.save();

      res.json({
        success: true,
        credits: user.credits,
        creditReward,
        rewardMessage: `Earned ${creditReward} credits for sharing!`,
      });
    } else {
      res.status(500).json({ error: "Failed to share post" });
    }
  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({ error: "Failed to share post" });
  }
});

// Save post
router.post("/save/:postId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add post to saved posts and give credits
    if (!user.savedPosts.includes(req.params.postId)) {
      user.savedPosts.push(req.params.postId);
      const creditReward = getCreditReward("SAVE_POST");
      user.credits += creditReward;
      await user.save();

      res.json({
        success: true,
        credits: user.credits,
        creditReward,
        rewardMessage: `Earned ${creditReward} credits for saving!`,
      });
    } else {
      res.json({ success: false, message: "Post already saved" });
    }
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ error: "Failed to save post" });
  }
});

// Unsave post
router.delete("/save/:postId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove post from saved posts
    user.savedPosts = user.savedPosts.filter(
      (id: string) => id !== req.params.postId
    );
    await user.save();

    res.json({ success: true, message: "Post unsaved successfully" });
  } catch (error) {
    console.error("Error unsaving post:", error);
    res.status(500).json({ error: "Failed to unsave post" });
  }
});

export default router;
