import express from "express";
import exampleRoutes from "./routes/exampleRoutes.js";

import cors from "cors";
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const app = express();

app.use(express.json());
app.use("/", exampleRoutes);

export default app;
