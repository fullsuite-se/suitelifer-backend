import jwt from "jsonwebtoken";
import { Suitebite } from "../models/suitebiteModel.js";

const verifySuperAdmin = async (req, res, next) => {
  console.log('🔐 verifySuperAdmin middleware called');
  
  try {
    // Check for token in cookies first, then in Authorization header  
    let token = req.cookies?.accessToken;
    
    console.log('🔐 Token from cookies:', !!token);
    
    if (!token) {
      const authHeader = req.headers.authorization;
      console.log('🔐 Auth header:', authHeader);
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('🔐 Token from header:', !!token);
      }
    }
    
    if (!token) {
      console.log('🔐 No token found');
      return res.status(401).json({ 
        success: false, 
        message: "Access token required" 
      });
    }

    console.log('🔐 Token found, verifying...');
    
    // Try both possible JWT secrets for backwards compatibility
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log('🔐 Token verified with ACCESS_TOKEN_SECRET');
    } catch (err) {
      console.log('🔐 ACCESS_TOKEN_SECRET failed, trying JWT_SECRET');
      // Fallback to JWT_SECRET if ACCESS_TOKEN_SECRET fails
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🔐 Token verified with JWT_SECRET');
    }
    
    console.log('🔐 Decoded token:', { id: decoded.id, role: decoded.role });
    
    // Get user details from database using the correct user ID field
    const userId = decoded.id || decoded.user_id;
    console.log('🔐 Looking up user with ID:', userId);
    
    const user = await Suitebite.getUserById(userId);
    
    if (!user) {
      console.log('🔐 User not found in database');
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token - user not found" 
      });
    }

    console.log('🔐 User found:', { user_id: user.user_id, user_type: user.user_type, is_active: user.is_active });

    // Check if user is active
    if (!user.is_active) {
      console.log('🔐 User is deactivated');
      return res.status(403).json({ 
        success: false, 
        message: "Account is deactivated" 
      });
    }

    // Check if user is suspended
    if (user.is_suspended) {
      console.log('🔐 User is suspended');
      return res.status(403).json({ 
        success: false, 
        message: "Account is suspended" 
      });
    }

    // Check if user has SUPER ADMIN role
    // Handle both token role field and database user_type field
    const userRole = decoded.role || user.user_type || '';
    
    console.log('verifySuperAdmin debug:', {
      decodedRole: decoded.role,
      userType: user.user_type,
      userRole: userRole,
      isSuperAdmin: userRole === "SUPER ADMIN" || userRole === "SUPER_ADMIN"
    });
    
    if (userRole !== "SUPER ADMIN" && userRole !== "SUPER_ADMIN") {
      console.log('🔐 User is not super admin. Role:', userRole);
      return res.status(403).json({ 
        success: false, 
        message: "Super Admin access required" 
      });
    }

    console.log('🔐 Super admin access granted');
    
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
