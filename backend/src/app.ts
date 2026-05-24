import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import uploadRouter from "./routes/upload.route";
import communityRouter from "./routes/community.route";
import postRouter from "./routes/post.route";
import logger from "./utils/logger";

const app = express();

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "https://timber-nine-tau.vercel.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        // Prevent server crashes by using callback(null, false) instead of throwing a raw JavaScript Error object
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  })
);

app.use(
  express.json({
    limit: "30kb",
  })
);

app.use(cookieParser());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

// Health check routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Timber Backend Server is running successfully!",
    status: "Healthy"
  });
});

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Timber API v1 is running successfully!",
    status: "Healthy"
  });
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/community", communityRouter);
app.use("/api/v1/post", postRouter);
app.use(errorMiddleware);

export default app;
