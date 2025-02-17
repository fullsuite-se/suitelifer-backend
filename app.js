import express from "express";
import dotenv from "dotenv";
import exampleRoutes from "./routes/exampleRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import verifyJWT from "./middlewares/verifyJWT.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use("/api", exampleRoutes);

// Example of a protected route
app.get("/api/protected", verifyJWT, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

export default app;
