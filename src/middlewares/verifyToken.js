import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // Check for token in cookies first, then in Authorization header
  let token = req.cookies?.accessToken;
  
  // if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  // }

  // if (!token) {
  //   return res.status(403).json({ message: "Access Denied" });
  // }

  try {
    // Try both possible JWT secrets for backwards compatibility
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      // Fallback to JWT_SECRET if ACCESS_TOKEN_SECRET fails
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid Token" });
  }
};

export default verifyToken;
