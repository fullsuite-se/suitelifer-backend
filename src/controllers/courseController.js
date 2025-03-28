import { Course } from "../models/courseModel.js";
import { JobCourse } from "../models/courseModel.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

export const insertCourse = async (req, res) => {
  try {
    const { title, description, url, userId} = req.body;

    if (!title || !description || !url) {
      res.status(400).json({
        success: false,
        message:
          "Missing required fields: title, description, or course URL",
      });
    }

    const course_id = uuidv7();

    const newCourse = {
      course_id,
      title,
      description,
      url
    };
    
    await Course.addCourse(newCourse);
    
    res
      .status(201)
      .json({ success: true, courseId: course_id });
    
  } catch (err) {
    console.log("Error inserting job course", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getJobCourses = async (req, res) => {
  try {
    const courses = await JobCourse.getAllJobCourses();

    res.status(200).json({ success: true, data: courses });
  } catch (e) {
    console.log("Error inserting Job Course", e);
    res.status(500).json({
      success: false,
      messsage: "Internal Server Error.",
    });
  }
};

export const addJobCourse = async (req, res) => {
  try {
    const {courseId, relatedJobs, userId} = req.body;
    
    for (let i = 0; i < relatedJobs.length; i++) {
      const newJobCourse = {
        job_course_id: uuidv7(),
        course_id: courseId,
        job_id: relatedJobs[i],
        created_at: now(),
        created_by: userId,
      }
      await JobCourse.addJobCourse(newJobCourse);
    }

    res
      .status(201)
      .json({
        success: true,
        message:
          "Job course added successfully to sl_company_job_courses table.",
      });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
