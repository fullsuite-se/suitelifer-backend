import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import spotifyRoutes from "./routes/spotifyRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import verifyJWT from "./middlewares/verifyJWT.js";
import helmet from "helmet";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", spotifyRoutes);
app.use("/api", eventRoutes);

// Example of a protected route
app.get("/api/protected", verifyJWT, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

export default app;
