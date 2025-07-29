import jwt from "jsonwebtoken";
import { Suitebite } from "../models/suitebiteModel.js";

const verifySuperAdmin = async (req, res, next) => {
  try {
    // Check for token in cookies first, then in Authorization header  
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access token required" 
      });
    }
    
    // Try both possible JWT secrets for backwards compatibility
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      // Fallback to JWT_SECRET if ACCESS_TOKEN_SECRET fails
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    }
    
    // Get user details from database using the correct user ID field
    const userId = decoded.id || decoded.user_id;
    
    const user = await Suitebite.getUserById(userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token - user not found" 
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        message: "Account is deactivated" 
      });
    }

    // Check if user is suspended
    if (user.is_suspended) {
      return res.status(403).json({ 
        success: false, 
        message: "Account is suspended" 
      });
    }

    // Check if user has SUPER ADMIN role
    // Handle both token role field and database user_type field
    const userRole = decoded.role || user.user_type || '';
    
    if (userRole !== "SUPER ADMIN" && userRole !== "SUPER_ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Super Admin access required" 
      });
    }
    
    // Add user info to request object
    req.user = {
      user_id: user.user_id,
      id: user.user_id, // For backwards compatibility
      first_name: user.first_name,
      last_name: user.last_name,
      user_email: user.user_email,
      email: user.user_email, // For backwards compatibility
      user_type: user.user_type,
      role: user.user_type, // For backwards compatibility
      is_active: user.is_active
    };

    next();
  } catch (error) {
    console.error("🔐 Super Admin verification error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export default verifySuperAdmin;
