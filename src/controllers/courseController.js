import { Course } from "../models/courseModel";
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date";

export const insertJobCourse = async (req, res) => {
  try {
    const { title, description, url, user_id } = req.body;

    if (!title || !description || !url) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, or course URL",
      });
    }

    const newCourse = {
      course_id: uuidv7(),
      title,
      description,
      url,
      created_at: now,
      created_by: user_id,
    };

    await Course.addCourse(newCourse);

    res
      .status(201)
      .json({ success: true, message: "Course added successfully" });
  } catch (err) {
    console.log("Error inserting job course", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
