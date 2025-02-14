import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware to verify JWT
const verifyJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).send("Token is required");
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

// Login route
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;
  if (username === "user" && password === "password") {
    const token = jwt.sign({ username, role }, SECRET_KEY, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });
    return res.json({ message: "Logged in successfully" });
  }
  return res.status(401).send("Invalid credentials");
});

// Protected route
// TODO: Test
app.get("/protected", verifyJWT, (req, res) => {
  return res.json({ message: "This is a protected route", user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
