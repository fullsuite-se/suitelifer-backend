import express from "express";
import exampleRoutes from "./routes/exampleRoutes.js";

const app = express();

app.use(express.json());
app.use("/", exampleRoutes);

export default app;
