import { db } from "../config/db";
import { deleteJob } from "../controllers/jobController";

const table = () => db("sl_courses");

export const Course = {
  addCourse: async (newCourse) => {
    return await table().insert(newCourse);
  },

  updateJobCourse: async (course_id, updatedCourse) => {
    return await table().where({ course_id }).update(updatedCourse);
  },

  deleteCourse: async (course_id) => {
    return await table().where({ course_id }).del();
  },
};

const bridgeTable = () => db("sl_company_job_courses");

export const JobCourse = {
  getAllJobCourses: async () => {
    return bridgeTable().innerJoin(
      "sl_courses",
      { "sl_courses.course_id": "sl_company_job_courses.course_id" }.innerJoin(
        "sl_company_jobs",
        { "sl_company_jobs.job_id": "sl_company_job_course.job_id" }
      )
    );
  },

  addJobCourse: async (newJobCourse) => {
    return bridgeTable().insert(newJobCourse);
  },

  deleteJobCourse: async (job_course_id) => {
    return bridgeTable().where({ job_course_id }).del();
  },
};
