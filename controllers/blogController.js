import { Blogs } from "../models/blogModel.js";

export const getAllBlogs = async (req, res) => {
  try {
    const events = await Blogs.getAllBlogs();
    res.status(200).json(events);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
