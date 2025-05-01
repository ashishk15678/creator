import React from "react";
import { useSelector } from "react-redux";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import { TrendingUp, Stars, BookmarkBorder, Share } from "@mui/icons-material";
import { RootState } from "../store";

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: 1,
            p: 1,
            mr: 2,
            display: "flex",
            alignItems: "center",
          }}
        >
          {React.cloneElement(icon as React.ReactElement, { sx: { color } })}
        </Box>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Mock data - replace with actual data from your backend
  const stats = {
    credits: user?.credits || 0,
    savedPosts: 12,
    sharedPosts: 8,
    dailyStreak: 5,
  };

  const creditGoal = 100;
  const progress = (stats.credits / creditGoal) * 100;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.username}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your progress and engage with content to earn more credits.
            </Typography>
          </Paper>
        </Grid>

        {/* Credit Progress */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Credits Progress
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Box sx={{ flexGrow: 1, mr: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {stats.credits}/{creditGoal}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Credits"
            value={stats.credits}
            icon={<Stars />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Saved Posts"
            value={stats.savedPosts}
            icon={<BookmarkBorder />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Shared Posts"
            value={stats.sharedPosts}
            icon={<Share />}
            color="#f50057"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Daily Streak"
            value={stats.dailyStreak}
            icon={<TrendingUp />}
            color="#ff9800"
          />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Earned 5 credits for completing your profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Saved 2 posts from your feed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Shared content with your network
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
