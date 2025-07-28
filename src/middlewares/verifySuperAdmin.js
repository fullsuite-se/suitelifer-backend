import jwt from "jsonwebtoken";

const verifySuperAdmin = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (decoded.role !== "SUPER ADMIN") {
      return res
        .status(403)
        .json({ message: "Access Denied: Admins/Super Admin only" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid Token" });
  }
};

export default verifySuperAdmin;
