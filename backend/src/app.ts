import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import redditRoutes from "./routes/reddit.routes";

const app = express();

// CORS configuration
const allowedOrigins = [
  "https://creator-7553b.web.app",
  "https://creator-n900.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reddit", redditRoutes);

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);

    // Handle CORS errors specifically
    if (err.message === "Not allowed by CORS") {
      return res.status(403).json({
        success: false,
        error: "CORS Error: Origin not allowed",
        details: err.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Something went wrong!",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

export default app;
