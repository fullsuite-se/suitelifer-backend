import { db } from "../config/db.js";

const table = () => db("sl_courses");

export const Course = {
  addCourse: async (newCourse) => {
    return await table().insert(newCourse);
  },

  updateCourse: async (course_id, updatedCourse) => {
    return await table().where({ course_id }).update(updatedCourse);
  },

  deleteCourse: async (course_id) => {
    return await table().where({ course_id }).del();
  },

  getAllCourses: async () => {
    return table()
      .join(
        "hris_user_accounts",
        "hris_user_accounts.user_id",
        "=",
        "sl_courses.created_by"
      )
      .join(
        "hris_user_infos",
        "hris_user_infos.user_id",
        "=",
        "sl_courses.created_by"
      )
      .select(
        "sl_courses.course_id",
        "sl_courses.title",
        "sl_courses.description",
        "sl_courses.url",
        "sl_courses.created_at",
        "sl_courses.created_by",
        "hris_user_infos.first_name",
        "hris_user_infos.last_name"
      );
  },
};
