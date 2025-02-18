import jwt from "jsonwebtoken";

const users = [
  { username: "admin", password: "password", role: "admin" },
  { username: "employee", password: "password", role: "employee" },
];

export const login = (req, res) => {
  const { username, password, role } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password && u.role === role
  );
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = jwt.sign(
    { username: user.username, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" } // Change this to 1h for production
  );

  const refreshToken = jwt.sign(
    { username: user.username, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" } // Change this to 30d for production
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false, // Change this to true if using HTTPS
    sameSite: "Strict",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // Change this to true if using HTTPS
    sameSite: "Strict",
  });

  res.json({ accessToken });
};

export const logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

export const userInfo = (req, res) => {
  const user = req.user;
  res.json({ user: user });
};

export const refreshToken = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    if (!user || !user.username) {
      return res.status(403).json({ message: "Invalid refresh token data" });
    }

    const newAccessToken = jwt.sign(
      { username: user.username, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" } // Change this to 1h for production
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false, // Change this to true if using HTTPS
      sameSite: "Strict",
    });

    res.json({ accessToken: newAccessToken });
  });
};
