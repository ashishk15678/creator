import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import {
  Share as ShareIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { RootState, AppDispatch } from "../store";
import { getPosts, sharePost, viewPost } from "../store/slices/feedSlice";
import { updateCredits } from "../store/slices/authSlice";

const Feed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error } = useSelector(
    (state: RootState) => state.feed
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [shareDialog, setShareDialog] = useState({
    open: false,
    postId: "",
    permalink: "",
  });

  useEffect(() => {
    dispatch(getPosts("popular"));
  }, [dispatch]);

  const handleShare = async (postId: string, permalink: string) => {
    try {
      const result = await dispatch(sharePost(postId)).unwrap();
      dispatch(updateCredits(result.credits));
      setSnackbar({
        open: true,
        message: `Earned ${result.pointsEarned} credits for sharing!`,
        severity: "success",
      });
      setShareDialog({
        open: true,
        postId,
        permalink: `https://reddit.com${permalink}`,
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to share post",
        severity: "error",
      });
    }
  };

  const handleView = async (postId: string) => {
    try {
      const result = await dispatch(viewPost(postId)).unwrap();
      dispatch(updateCredits(result.credits));
      setSnackbar({
        open: true,
        message: `Earned ${result.pointsEarned} credits for viewing!`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to record view",
        severity: "error",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareDialog.permalink);
    setSnackbar({
      open: true,
      message: "Link copied to clipboard!",
      severity: "success",
    });
  };

  const handleCloseShareDialog = () => {
    setShareDialog({ ...shareDialog, open: false });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Card>
              {post.thumbnail && !post.is_video && (
                <CardMedia
                  component="img"
                  height="200"
                  image={post.thumbnail}
                  alt={post.title}
                  sx={{ objectFit: "cover" }}
                  onClick={() => handleView(post.id)}
                />
              )}
              {post.is_video && post.media?.reddit_video && (
                <video
                  controls
                  width="100%"
                  height="200"
                  style={{ objectFit: "cover" }}
                  onClick={() => handleView(post.id)}
                >
                  <source
                    src={post.media.reddit_video.fallback_url}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              )}
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Posted by {post.author} in r/{post.subreddit} on{" "}
                  {formatDate(post.created_utc)}
                </Typography>
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Score: {post.score} | Comments: {post.num_comments}
                  </Typography>
                  <Button
                    startIcon={<ShareIcon />}
                    onClick={() => handleShare(post.id, post.permalink)}
                    disabled={loading}
                  >
                    {loading ? "Sharing..." : "Share"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialog.open} onClose={handleCloseShareDialog}>
        <DialogTitle>Share Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={shareDialog.permalink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={handleCopyLink}>
                  <CopyIcon />
                </IconButton>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Feed;
