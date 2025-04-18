import { db } from "../config/db.js";

const table = () => db("sl_certifications");

export const Certification = {
  getAllCertifications: async () => {
    return await db
      .select(
        "cert_id AS certId",
        "cert_img_url AS certImageUrl",
        "sl_certifications.created_at AS createdAt",
        db.raw(
          "CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy"
        )
      )
      .from("sl_certifications")
      .innerJoin("sl_user_accounts", {
        "sl_certifications.created_by": "sl_user_accounts.user_id",
      });
  },

  addCertification: async (newCert) => {
    return await table().insert(newCert);
  },

  updateCertification: async (cert_id, cert_img_url) => {
    return await table().where({ cert_id }).update({ cert_img_url});
  },

  deleteCertification: async (cert_id) => {
    return await table().where({ cert_id }).del();
  },
};
