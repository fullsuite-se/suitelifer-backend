import { db } from "../config/db.js";

const table = () => db("sl_testimonials");

export const Testimonial = {
  getShownTestimonials: async () => {
    return await db
      .select(
        "testimonial_id as testimonialId",
        "employee_name as employeeName",
        "position",
        "testimony",
        "employee_image_url as employeeImageUrl"
      )
      .from("sl_testimonials")
      .where({ is_shown: 1 });
  },

  getAllTestimonials: async () => {
    return await db
      .select(
        "testimonial_id as testimonialId",
        "employee_name as employeeName",
        "position",
        "testimony",
        "is_shown as isShown",
        "employee_image_url as employeeImageUrl",
        "sl_testimonials.created_at as createdAt",
        db.raw(
          "CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy"
        )
      )
      .from("sl_testimonials")
      .innerJoin("sl_user_accounts", {
        "sl_testimonials.created_by": "sl_user_accounts.user_id",
      });
  },

  insertTestimonial: async (newTestimonial) => {
    return await table().insert(newTestimonial);
  },

  editTestimonial: async (testimonial_id, updates) => {
    return await table().update(updates).where({ testimonial_id });
  },

  deleteTestimonial: async (testimonial_id) => {
    return await table().where({ testimonial_id }).del();
  },
};
