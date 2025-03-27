import { db } from "../config/db.js";

export const Testimonial = {
  getAllTestimonials: async () => {
    return await db
      .select(
        "testimonial_id AS testimonialId",
        "employee_image_url AS employeeImageUrl",
        "employee_name AS employeeName",
        "position",
        "testimony",
        "is_shown as isShown",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        )
      )
      .from("sl_testimonials")
      .innerJoin("hris_user_infos", {
        "sl_testimonials.created_by": "hris_user_infos.user_id",
      });
  },
};
