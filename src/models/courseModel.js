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
        db.raw(`
          CONCAT(
            first_name, ' ',
            IF(middle_name IS NOT NULL AND middle_name != '', CONCAT(LEFT(middle_name, 1), '. '), ''),
            last_name
          ) AS createdBy
        `)
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
