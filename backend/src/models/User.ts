import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Define the User interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  credits: number;
  savedPosts: string[];
  totalInteractions: number;
  redditAccessToken?: string;
  redditRefreshToken?: string;
  redditTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

// Define the User schema
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    credits: {
      type: Number,
      default: 0,
    },
    savedPosts: [
      {
        type: String,
        ref: "Post",
      },
    ],
    totalInteractions: {
      type: Number,
      default: 0,
      min: [0, "Total interactions cannot be negative"],
    },
    redditAccessToken: String,
    redditRefreshToken: String,
    redditTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || "your-secret-key",
    {
      expiresIn: "30d",
    }
  );
};

// Export the model
export const User = mongoose.model<IUser>("User", userSchema);
