import { Course } from "../models/courseModel.js";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.getAllCourses();

    res.status(200).json({ success: true, courses });
  } catch (e) {
    console.log("Error Fetching Job Courses", e);
    res.status(500).json({
      success: false,
      messsage: "Internal Server Error.",
    });
  }
};

export const insertCourse = async (req, res) => {
  try {
    const { title, description, url, userId } = req.body;

    if (!title || !description || !url) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, or course URL",
      });
    }

    const course_id = uuidv7();

    const newCourse = {
      course_id,
      title,
      description,
      url,
      created_at: now(),
      created_by: userId,
    };

    await Course.addCourse(newCourse);

    res.status(201).json({ success: true, message: "Course added successfully" });
  } catch (err) {
    console.log("Error inserting job course", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseId, title, description, url } = req.body;

    const updatedCourse = {
      title,
      description,
      url
    };

    await Course.updateCourse(courseId, updatedCourse);
    res.status(200).json({
      success: true,
      message: "Course updated successfully.",
    });
  } catch (error) {
    console.log("Error Updating Course.");
    console.log(error);
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing: job_course_id",
      });
    }

    const deletedCourse = await Course.deleteCourse(courseId);

    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found or already deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    console.log("Error Deleting Job Course.", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
