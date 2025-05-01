import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../services/api";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  thumbnail: string;
  is_video: boolean;
  media?: {
    reddit_video?: {
      fallback_url: string;
    };
  };
}

interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: FeedState = {
  posts: [],
  loading: false,
  error: null,
};

// Get posts
export const getPosts = createAsyncThunk(
  "feed/getPosts",
  async (subreddit: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reddit/posts?subreddit=${subreddit}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch posts"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// Share post
export const sharePost = createAsyncThunk(
  "feed/sharePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reddit/share/${postId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to share post"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

// View post
export const viewPost = createAsyncThunk(
  "feed/viewPost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reddit/view/${postId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to record view"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sharePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sharePost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sharePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(viewPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(viewPost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(viewPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = feedSlice.actions;
export default feedSlice.reducer;
