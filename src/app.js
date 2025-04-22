import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import startCronJobs from "./cron/startCronJobs.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import spotifyRoutes from "./routes/spotifyRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import cloudinaryRoutes from "./routes/cloudinaryRoutes.js";
import personalityTestRoutes from "./routes/personalityTestRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import faqsRoutes from "./routes/faqsRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import certificationRoutes from "./routes/certificationRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import { fileURLToPath } from "url";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: [process.env.VITE_API_BASE_URL, process.env.LIVE_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const currentPath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentPath);
const publicFolder = path.join(currentDirectory, "..", "public");
console.log(publicFolder);

app.use(express.static(publicFolder));

// Start cron jobs; update the sitemap (SEO)
// startCronJobs();

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", spotifyRoutes);
app.use("/api", eventRoutes);
app.use("/api", blogRoutes);
app.use("/api", contentRoutes);
app.use("/api", cloudinaryRoutes);
app.use("/api", personalityTestRoutes);
app.use("/api", testimonialRoutes);
app.use("/api", courseRoutes);
app.use("/api", faqsRoutes);
app.use("/api", contactRoutes);
app.use("/api", newsletterRoutes);
app.use("/api", certificationRoutes);
app.use("/api", auditLogRoutes);

export default app;
