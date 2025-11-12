import { db } from "../config/db.js";

const userAccounts = "sl_user_accounts";
const userAccountsTable = () => db("sl_user_accounts");

export const User = {
  addUser: async (userData) => {
    return await userAccountsTable().insert(userData);
  },
  getAllUsers: async () => {
    const users = await userAccountsTable()
      .select(
        "user_id AS userId",
        "user_email AS userEmail",
        "user_type AS userType",
        db.raw(`
          CONCAT(
            first_name, ' ',
            IF(middle_name IS NOT NULL AND middle_name != '', CONCAT(LEFT(middle_name, 1), '. '), ''),
            last_name
          ) AS fullName
        `),
        "is_verified AS isVerified",
        "is_active AS isActive",
        "sl_user_accounts.created_at AS createdAt"
      )
      .orderBy("fullName");

    // Add isSuspended field (temporarily set to false until database is migrated)
    return users.map(user => ({
      ...user,
      isSuspended: false // TODO: Update when suspension columns are added to database
    }));
  },

  updateUserRole: async (user_type, user_id) => {
    return await userAccountsTable().update({ user_type }).where({ user_id });
  },

  updateUserStatus: async (is_active, user_id) => {
    return await userAccountsTable().update({ is_active }).where({ user_id });
  },


  updatePersonalDetails: async (user_id, updatedData) => {
    const allowedFields = ['first_name', 'middle_name', 'last_name', 'extension_name', 'profile_pic', 'user_email'];

    const filteredData = {};

    allowedFields.forEach(field => {
      if (updatedData.hasOwnProperty(field)) {
        if (['middle_name', 'extension_name', 'profile_pic'].includes(field)) {
          filteredData[field] = updatedData[field] === '' ? null : updatedData[field];
        } else if (updatedData[field] !== undefined && updatedData[field] !== null) {
          filteredData[field] = updatedData[field];
        }
      }
    });

    if (Object.keys(filteredData).length === 0) {
      return 0;
    }

    return await userAccountsTable()
      .update(filteredData)
      .where({ user_id });
  },




  deleteUserAccount: async (user_id) => {
    return await userAccountsTable().where({ user_id }).del();
  },

  getUser: async (user_id) => {
    return await db('sl_user_accounts')
      .select('user_id', 'first_name', 'last_name', 'user_email', 'user_type', 'profile_pic')
      .where({ user_id: user_id })
      .first();
  },

  getUserByEmail: async (email) => {
    return await db(userAccounts)
      .where(`${userAccounts}.user_email`, email)
      .first();
  },

  updateUserKey: async (userId, generatedKey) => {
    return await db(userAccounts)
      .where({ user_id: userId })
      .update({ reset_key: generatedKey });
  },

  // updatePassword: async (userId, newPassword) => {
  //   return await db(userAccounts)
  //     .where({ user_id: userId })
  //     .update({ user_password: newPassword });
  // },

  isIdAvailable: async (user_id) => {
    const result = await db(userAccounts).where({ user_id }).first();
    return !result;
  },

  isEmailAvailable: async (user_email) => {
    const result = await db(userAccounts).where({ user_email }).first();
    return !result;
  }

};
