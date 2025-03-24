import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Auth } from "../models/authModel.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await Auth.authenticate(email);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.user_password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const accessToken = jwt.sign(
    {
      email: user.user_email,
      id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" } // Change this to 1h for production
  );

  const refreshToken = jwt.sign(
    {
      email: user.user_email,
      id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" } // Change this to 30d for production
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  res.json({ accessToken });
};
export const logout = (req, res) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    expires: new Date(0), // Expire immediately
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    expires: new Date(0),
  });

  res.json({ message: "Logged out successfully", isLoggedOut: true });
};

export const userInfo = (req, res) => {
  res.json({ user: req.user });
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token provided" });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Invalid or expired refresh token" });
      }

      if (!decoded || !decoded.email || !decoded.id) {
        return res.status(401).json({ message: "Invalid refresh token data" });
      }

      const newAccessToken = jwt.sign(
        {
          email: decoded.email,
          id: decoded.id,
          first_name: decoded.first_name,
          last_name: decoded.last_name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      });

      res.json({ accessToken: newAccessToken });
    }
  );
};

export const getServices = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const services = await Auth.getServices(id);

    if (!services || services.length === 0) {
      return res
        .status(404)
        .json({ message: "No services found for this user" });
    }

    return res.status(200).json({ message: "Services retrieved", services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
