import axios from "axios";
import dotenv from "dotenv";
import { RateLimiter } from "limiter";

dotenv.config();

// Rate limiter for Reddit (60 requests per minute)
const redditLimiter = new RateLimiter({
  tokensPerInterval: 60,
  interval: "minute",
});

// LinkedIn API configuration (for development)
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_USER_ID = process.env.LINKEDIN_USER_ID;

// Reddit API configuration
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_REDIRECT_URI = process.env.REDDIT_REDIRECT_URI;

// Credit rewards for different actions
const CREDIT_REWARDS = {
  FETCH_FEED: 2, // Get 2 credits for viewing feed
  SHARE_POST: 5, // Get 5 credits for sharing a post
  SAVE_POST: 3, // Get 3 credits for saving a post
  PROFILE_UPDATE: 10, // Get 10 credits for updating profile
  DAILY_LOGIN: 5, // Get 5 credits for daily login
  REFERRAL: 20, // Get 20 credits for each referral
};

interface SocialMediaPost {
  id: string;
  platform: "linkedin" | "reddit";
  content: string;
  author: string;
  timestamp: string;
  url: string;
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
  subreddit?: string;
  title?: string;
}

class SocialMediaError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = "SocialMediaError";
  }
}

// Generate Reddit OAuth URL
export const getRedditAuthUrl = (): string => {
  if (!REDDIT_CLIENT_ID || !REDDIT_REDIRECT_URI) {
    throw new SocialMediaError("Reddit API credentials not configured", 500);
  }

  const state = Math.random().toString(36).substring(7);
  const scope = "identity read submit";

  return `https://www.reddit.com/api/v1/authorize?client_id=${REDDIT_CLIENT_ID}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(
    REDDIT_REDIRECT_URI
  )}&duration=permanent&scope=${scope}`;
};

// Exchange code for access token
export const getRedditAccessToken = async (code: string): Promise<string> => {
  try {
    if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_REDIRECT_URI) {
      throw new SocialMediaError("Reddit API credentials not configured", 500);
    }

    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(
        REDDIT_REDIRECT_URI
      )}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error getting Reddit access token:", error);
    throw new SocialMediaError("Failed to authenticate with Reddit", 500);
  }
};

// Mock LinkedIn data for development
const mockLinkedInPosts: SocialMediaPost[] = [
  {
    id: "linkedin-1",
    platform: "linkedin",
    content: "Excited to share our latest product launch! 🚀 #Innovation #Tech",
    author: "John Doe",
    timestamp: new Date().toISOString(),
    url: "https://linkedin.com/post/1",
    engagement: {
      likes: 150,
      shares: 45,
      comments: 23,
    },
  },
  {
    id: "linkedin-2",
    platform: "linkedin",
    content:
      "Just completed an amazing workshop on AI and Machine Learning! 🤖 #AI #ML",
    author: "Jane Smith",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    url: "https://linkedin.com/post/2",
    engagement: {
      likes: 89,
      shares: 12,
      comments: 15,
    },
  },
];

export const fetchRedditFeed = async (
  accessToken: string
): Promise<SocialMediaPost[]> => {
  try {
    await redditLimiter.removeTokens(1);

    const response = await axios.get(
      "https://oauth.reddit.com/r/Entrepreneur+startups+smallbusiness+marketing+socialmedia/hot",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "CreatorDash/1.0.0",
        },
        params: {
          limit: 10,
        },
      }
    );

    if (!response.data?.data?.children) {
      throw new SocialMediaError("Invalid response from Reddit API", 500);
    }

    return response.data.data.children.map((post: any) => ({
      id: post.data.id,
      platform: "reddit",
      title: post.data.title,
      content: post.data.selftext || post.data.title,
      author: post.data.author,
      timestamp: new Date(post.data.created_utc * 1000).toISOString(),
      url: `https://reddit.com${post.data.permalink}`,
      subreddit: post.data.subreddit,
      engagement: {
        likes: post.data.ups,
        shares: post.data.num_crossposts,
        comments: post.data.num_comments,
      },
    }));
  } catch (error) {
    if (error instanceof SocialMediaError) {
      throw error;
    }
    console.error("Error fetching Reddit feed:", error);
    throw new SocialMediaError("Failed to fetch Reddit feed", 500);
  }
};

export const fetchLinkedInFeed = async (): Promise<SocialMediaPost[]> => {
  // Return mock data for development
  return mockLinkedInPosts;
};

export const shareToReddit = async (
  accessToken: string,
  content: string,
  title: string,
  subreddit: string
): Promise<boolean> => {
  try {
    await redditLimiter.removeTokens(1);

    await axios.post(
      "https://oauth.reddit.com/api/submit",
      `kind=self&title=${encodeURIComponent(title)}&text=${encodeURIComponent(
        content
      )}&sr=${encodeURIComponent(subreddit)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "CreatorDash/1.0.0",
        },
      }
    );

    return true;
  } catch (error) {
    console.error("Error sharing to Reddit:", error);
    throw new SocialMediaError("Failed to share to Reddit", 500);
  }
};

export const shareToLinkedIn = async (
  content: string,
  url?: string
): Promise<boolean> => {
  // Mock LinkedIn sharing for development
  console.log("Mock LinkedIn share:", { content, url });
  return true;
};

export const getCreditReward = (
  action: keyof typeof CREDIT_REWARDS
): number => {
  return CREDIT_REWARDS[action] || 0;
};
