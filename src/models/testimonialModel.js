import { db } from "../config/db.js";

const table = () => db("sl_testimonials");

export const Testimonial = {
  getAllTestimonials: async () => {
    return await db
      .select(
        "testimonial_id as testimonialId",
        "employee_image_url as employeeImageUrl",
        "employee_name as employeeName",
        "position",
        "testimony",
        "is_shown as isShown",
        "sl_testimonials.created_at as createdAt",
        db.raw(
          "CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy"
        )
      )
      .from("sl_testimonials")
      .innerJoin("sl_user_accounts", {
        "sl_testimonials.created_by": "sl_user_accounts.user_id",
      }).orderBy("sl_testimonials.created_at", "desc");
  },

  insertTestimonial: async (newTestimonial) => {
    return await table().insert(newTestimonial);
  },
};
