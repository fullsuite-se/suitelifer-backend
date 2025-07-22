import jwt from "jsonwebtoken";

const verifyAdmin = (req, res, next) => {
  // Check for token in cookies first, then in Authorization header
  let token = req.cookies?.accessToken;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (!token) {
    return res.status(403).json({ message: "Access Denied" });
  }

  try {
    // Try both possible JWT secrets for backwards compatibility
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      // Fallback to JWT_SECRET if ACCESS_TOKEN_SECRET fails
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    }

    // Check if user has ADMIN or SUPER ADMIN role
    // Handle both "role" field (from login token) and check for ADMIN/SUPER ADMIN values
    const userRole = decoded.role || decoded.user_type || '';
    
    if (userRole !== "ADMIN" && userRole !== "SUPER ADMIN") {
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

export default verifyAdmin;
