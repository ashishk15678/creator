import api from "./api";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// // Twitter API configuration
// const TWITTER_API_KEY = import.meta.env.VITE_TWITTER_API_KEY;
// const TWITTER_API_SECRET = import.meta.env.VITE_TWITTER_API_SECRET;
// const TWITTER_ACCESS_TOKEN = import.meta.env.VITE_TWITTER_ACCESS_TOKEN;
// const TWITTER_ACCESS_SECRET = import.meta.env.VITE_TWITTER_ACCESS_SECRET;

// // LinkedIn API configuration
// const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
// const LINKEDIN_CLIENT_SECRET = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET;
// const LINKEDIN_ACCESS_TOKEN = import.meta.env.VITE_LINKEDIN_ACCESS_TOKEN;
// const LINKEDIN_USER_ID = import.meta.env.VITE_LINKEDIN_USER_ID;

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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  credits?: number;
  creditReward?: number;
  rewardMessage?: string;
}

export const fetchSocialFeed = async (
  token: string
): Promise<ApiResponse<SocialMediaPost[]>> => {
  try {
    const response = await api.get("/social/feed");
    return {
      success: true,
      data: response.data.posts,
      credits: response.data.credits,
      creditReward: response.data.creditReward,
      rewardMessage: response.data.rewardMessage,
    };
  } catch (error) {
    console.error("Error fetching social feed:", error);
    throw error;
  }
};

export const shareToSocialMedia = async (
  platform: string,
  content: string,
  options: {
    url?: string;
    title?: string;
    subreddit?: string;
  }
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.post(`/social/share/${platform}`, {
      content,
      ...options,
    });
    return {
      success: true,
      credits: response.data.credits,
      creditReward: response.data.creditReward,
      rewardMessage: response.data.rewardMessage,
    };
  } catch (error) {
    console.error(`Error sharing to ${platform}:`, error);
    throw error;
  }
};

export const fetchTwitterFeed = async (): Promise<SocialMediaPost[]> => {
  try {
    const response = await api.get("/social/twitter-feed");
    return response.data.posts;
  } catch (error) {
    console.error("Error fetching Twitter feed:", error);
    return [];
  }
};

export const fetchLinkedInFeed = async (): Promise<SocialMediaPost[]> => {
  try {
    const response = await api.get("/social/linkedin-feed");
    return response.data.posts;
  } catch (error) {
    console.error("Error fetching LinkedIn feed:", error);
    return [];
  }
};

export const shareToTwitter = async (
  content: string,
  url?: string
): Promise<boolean> => {
  try {
    await api.post("/social/share/twitter", {
      content,
      url,
    });
    return true;
  } catch (error) {
    console.error("Error sharing to Twitter:", error);
    return false;
  }
};

export const shareToLinkedIn = async (
  content: string,
  url?: string
): Promise<boolean> => {
  try {
    await api.post("/social/share/linkedin", {
      content,
      url,
    });
    return true;
  } catch (error) {
    console.error("Error sharing to LinkedIn:", error);
    return false;
  }
};
