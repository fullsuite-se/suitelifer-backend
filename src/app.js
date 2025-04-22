import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import generateSitemap from "./scripts/generateSitemap.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import spotifyRoutes from "./routes/spotifyRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import claudinaryRoutes from "./routes/claudinaryRoutes.js";
import personalityTestRoutes from "./routes/personalityTestRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import faqsRoutes from "./routes/faqsRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import certificationRoutes from "./routes/certificationRoutes.js";

const app = express();
dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const srcFolder = path.dirname(new URL(import.meta.url).pathname);
const publicFolder = path.join(srcFolder, "..", "public");
app.use(express.static(publicFolder));

app.use(
  cors({
    origin: [process.env.VITE_API_BASE_URL, process.env.LIVE_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", spotifyRoutes);
app.use("/api", eventRoutes);
app.use("/api", blogRoutes);
app.use("/api", contentRoutes);
app.use("/api", claudinaryRoutes);
app.use("/api", personalityTestRoutes);
app.use("/api", testimonialRoutes);
app.use("/api", courseRoutes);
app.use("/api", faqsRoutes);
app.use("/api", contactRoutes);
app.use("/api", newsletterRoutes);
app.use("/api", certificationRoutes);

generateSitemap();

export default app;
