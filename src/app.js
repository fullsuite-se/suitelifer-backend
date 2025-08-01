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
import suitebiteRoutes from "./routes/suitebiteRoutes.js";
import { fileURLToPath } from "url";
import termsOfUseRoutes from "./routes/termsOfUseRoutes.js";
import privacyPolicyRoutes from "./routes/privacyPolicyRoutes.js";
import pointsRoutes from "./routes/points.js";
import moodRoutes from "./routes/moodRoutes.js";
import testMoodRoutes from "./routes/testMoodRoutes.js";

const app = express();
dotenv.config();

// CORS configuration using environment variables
const allowedOrigins = [
  process.env.FRONTEND_URL, // Current frontend URL from env
  process.env.VITE_FRONTEND_URL, // Frontend URL matching VITE naming convention
  process.env.LIVE_URL, // Live URL from env
  // "https://suitelifer-frontend-mu.vercel.app", // Legacy frontend
  "http://localhost:5173", // Frontend development server
  "http://localhost:5174", // Alternative frontend port
  "http://localhost:5175", // Alternative frontend port
  "http://localhost:5176", // Alternative frontend port
  "http://127.0.0.1:5173",  // Alternative localhost format
  "http://127.0.0.1:5174",  // Alternative localhost format
  "http://127.0.0.1:5175",  // Alternative localhost format
  "http://127.0.0.1:5176"   // Alternative localhost format
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // This allows cookies to be sent
  })
);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(helmet());

const currentPath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentPath);
const publicFolder = path.join(currentDirectory, "..", "public");
app.use(express.static(publicFolder));

// Start cron jobs; update the sitemap (for the SEO)
startCronJobs();

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", spotifyRoutes);
app.use("/api", eventRoutes);
app.use("/api", blogRoutes); // POSTPONE POSTMAN DOCU FOR NOW
app.use("/api", contentRoutes);
app.use("/api", cloudinaryRoutes); // POSTPONE POSTMAN DOCU FOR NOW
app.use("/api", personalityTestRoutes);
app.use("/api", testimonialRoutes);
app.use("/api", courseRoutes);
app.use("/api", faqsRoutes);
app.use("/api", contactRoutes);
app.use("/api", newsletterRoutes);
app.use("/api", certificationRoutes);
app.use("/api", auditLogRoutes);
app.use("/api/suitebite", suitebiteRoutes);
app.use("/api", termsOfUseRoutes);
app.use("/api", privacyPolicyRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api", moodRoutes);
app.use("/api", testMoodRoutes);

app.use("/", (req, res) => {
  res.send(
    "<pre>Hello, human!\n\nAuthors:\nDomingo, Hernani\nSalcedo, Lance Jericho\nGalano, Dan\nAlvaro, Allen James\nSantiago, Melbraei</pre>"
  );
});

export default app;
