import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { compactDecrypt, importPKCS8 } from "jose";
import { Auth } from "../models/authModel.js";
import axios from "axios";


export const addUser = async (req, res) => {
  try {
    const { userEmail,
      //  userPassword,
      userType, firstName, lastName, middleName, profilePic, isVerified, isActive } = req.body;

    if (!userEmail || !userType || !firstName || !lastName
      // || !userPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newUser = {
      user_email: userEmail,
      user_type: userType,
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName,
      // user_password: userPassword,
    };

    await User.addUser(newUser);

    res.status(201).json({ success: true, message: "User added successfully" });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    console.log("Unable to fetch Users", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error - Unable to fetch users",
      error: err.message
    });
  }
};

export const updateUserType = async (req, res) => {
  try {
    const { userType, accountId } = req.body;

    if (!userType || !accountId) {
      return res.status(400).json({
        success: false,
        message: "Missing Required Fields: user type or user id",
      });
    }

    await User.updateUserRole(userType, accountId);

    return res
      .status(200)
      .json({ success: true, message: "User Type Updated Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { isActive, accountId } = req.body;

    if (!accountId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required field: user id" });
    }

    await User.updateUserStatus(isActive, accountId);

    res
      .status(200)
      .json({ success: true, message: "User Status Updated Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: account id",
      });
    }

    await User.deleteUserAccount(accountId);

    res
      .status(200)
      .json({ success: true, message: "User Account Deleted Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const updatePersonalDetails = async (req, res) => {
  const { user_id, updatedData } = req.body;

  try {
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: user_id",
      });
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update",
      });
    }

    // 1️⃣ Update the user's personal details
    const result = await User.updatePersonalDetails(user_id, updatedData);

    if (result === 0) {
      return res.status(200).json({
        success: true,
        message: "No valid fields updated (nothing changed)",
      });
    }

    // 2️⃣ Fetch the latest user info from DB
    const updatedUser = await User.getUser(user_id);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found after update",
      });
    }

    // 3️⃣ Generate a new access token with updated details
    const newAccessToken = jwt.sign(
      {
        email: updatedUser.user_email,
        role: updatedUser.user_type,
        id: updatedUser.user_id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        profile_pic: updatedUser.profile_pic,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // 4️⃣ Set new access token in cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // 5️⃣ Respond with success and new token
    res.status(200).json({
      success: true,
      message: "Personal details updated successfully",
      accessToken: newAccessToken,
      updatedUser,
    });
  } catch (error) {
    console.error("Update personal details error:", error);

    if (error.code === "ER_NO_REFERENCED_ROW") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (error.code === "ER_DATA_TOO_LONG") {
      return res.status(400).json({
        success: false,
        message: "Data too long for one or more fields",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// export const updateUserPassword = async (req, res) => {
//   const { newPassword, payloadEncrypted } = req.body;

//   if (!newPassword || !payloadEncrypted) {
//     return res
//       .status(400)
//       .json({ isSuccess: false, message: "Invalid request" });
//   }

//   try {
//     const privateKeyPEM = process.env.JWE_PRIVATE_KEY;
//     const privateKey = await importPKCS8(privateKeyPEM, "RSA-OAEP");

//     const { plaintext } = await compactDecrypt(payloadEncrypted, privateKey);
//     const payload = JSON.parse(new TextDecoder().decode(plaintext));

//     // Checking if yung token is still valid
//     if (Date.now() / 1000 > payload.exp) {
//       return res.status(400).json({
//         isSuccess: false,
//         message: "Verification code has expired. Please request a new one.",
//       });
//     }

//     const user = await Auth.getVerificationCodeById(payload.id);

//     const isMatch = await bcrypt.compare(payload.code, user.verification_code);

//     if (!isMatch) {
//       return res
//         .status(400)
//         .json({ isSuccess: false, message: "Invalid verification code" });
//     }

//     // Hash the new password and update the user
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     //change pw too in hris
//     await axios.patch(
//       `${process.env.HRIS_VITE_API_BASE_URL}/api/auth/change-password-hris`
//       , { user_id: user.user_id, new_password: hashedPassword });

//     await User.updatePassword(user.user_id, hashedPassword);

//     await Auth.deleteVerificationCodesById(user.user_id);
//     // Invalidate the reset token/s
//     res
//       .status(200)
//       .json({ isSuccess: true, message: "Password updated successfully" });
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       console.error("Token has expired:", error.name);
//       return res.status(400).json({
//         isSuccess: false,
//         message:
//           "Your password reset link has expired. Please request a new one.",
//       });
//     }

//     console.error("Other error:", error.name);
//     return res
//       .status(400)
//       .json({ isSuccess: false, message: "Invalid request" });
//   }
// };

async function searchUsers(req, res) {
  const query = (req.query.q || '').toLowerCase();
  const users = await db.query(
    `SELECT user_id, CONCAT(first_name, ' ', last_name) AS name, email, avatar
     FROM sl_user_accounts
     WHERE LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(email) LIKE ?
     LIMIT 10`,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );
  res.json({ success: true, data: users });
}

export { searchUsers };
