// import { db } from "../config/db.js";

import { db } from "../config/db.js";

const userAccountTable = "hris_user_accounts";
const userInfos = "hris_user_infos";

export const Auth = {
  authenticate: async (email) => {
    return await db.transaction(async (trx) => {
      return await trx(userAccountTable)
        .select(
          `${userAccountTable}.user_email`,
          `${userAccountTable}.user_id`,
          `${userAccountTable}.user_password`,
          `${userAccountTable}.user_key`
        )
        .innerJoin(
          userInfos,
          `${userAccountTable}.user_id`,
          `${userInfos}.user_id`
        )
        .where(`${userAccountTable}.user_email`, email)
        .first();
    });
  },

  getServices: async (id) => {
    return await db("hris_user_access_permissions")
      .select("service_features.feature_name")
      .innerJoin(
        "service_features",
        "hris_user_access_permissions.service_feature_id",
        "service_features.service_feature_id"
      )
      .where("hris_user_access_permissions.user_id", id);
  },
};
