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

export const editEmployeeBlog = async (req, res) => {
  const { eblog_id, is_shown } = req.body;

  if (!eblog_id) {
    return res.status(400).json({ error: "Missing blog ID" });
  }

  try {
    await Blogs.editEmployeeBlog(eblog_id, is_shown);
    res.status(200).json({
      success: true,
      message: "Blog visibility updated successfully!",
    });
  } catch (err) {
    console.error("EDIT BLOG ERROR:", err);
    res.status(500).json({ error: "Failed to update blog visibility" });
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

export const deleteEmployeeBlog = async (req, res) => {
  console.log("Incoming delete payload:", req.body);
  const { eblog_id } = req.body;

  if (!eblog_id) {
    return res.status(400).json({ error: "Missing blog ID" });
  }

  try {
    await Blogs.deleteEmployeeBlog(eblog_id);
    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully!" });
  } catch (err) {
    console.error("DELETE BLOG ERROR:", err);
    res.status(500).json({ error: "Failed to delete blog" });
  }
};
