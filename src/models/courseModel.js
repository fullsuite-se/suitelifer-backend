import { db } from "../config/db.js";

const table = () => db("sl_courses");

export const Course = {
  getAllCourses: async () => {
    return await db
      .select(
        "course_id AS courseId",
        "title",
        "description",
        "url",
        "sl_courses.created_at AS createdAt",
        db.raw(
          "CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy"
        )
      )
      .from("sl_courses")
      .join("sl_user_accounts", {
        "sl_courses.created_by": "sl_user_accounts.user_id",
      });
  },

  addCourse: async (newCourse) => {
    return await table().insert(newCourse);
  },

  updateCourse: async (course_id, updatedCourse) => {
    return await table().where({ course_id }).update(updatedCourse);
  },

  deleteCourse: async (course_id) => {
    return await table().where({ course_id }).del();
  },
};
