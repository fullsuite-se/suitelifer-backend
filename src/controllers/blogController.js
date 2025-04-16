import { Blogs } from "../models/blogModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";

export const addEmployeeBlog = async (req, res) => {
  const data = req.body;
  // TODO: DELETE THIS USER ID ON THE DATABASE WHEN IN PRODUCTION
  const userId = "0dbde766-f898-11ef-a725-0af0d960a833";

  const blog = {
    eblog_id: uuidv7(),
    title: data.title,
    description: data.description,
    is_shown: data.is_shown ?? true, 
    created_at: now(),
    created_by: userId,
    updated_by: userId,
  };

  console.dir(blog, { depth: null });

  try {
    await Blogs.addEmployeeBlog(blog);
    res.status(200).json({
      success: true,
      message: "Blog added successfully!",
      eblog_id: blog.eblog_id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getAllEmployeeBlogs = async (req, res) => {
    try {
      const blogs = await Blogs.getAllEmployeeBlogs();
      res.status(200).json(blogs);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
