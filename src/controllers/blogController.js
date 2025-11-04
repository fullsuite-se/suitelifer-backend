import { Blogs } from "../models/blogModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";

export const addEmployeeBlog = async (req, res) => {
  const data = req.body;
  const userId =req.user.id;

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const blogs = await Blogs.getAllEmployeeBlogs(limit, offset);
    const total = await Blogs.countEmployeeBlogs();

    res.status(200).json({
      blogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.log("Unable to fetch Employee Blogs", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getEmployeeBlogsById = async (req, res) => {
  try {
    
    const { id } = req.params;

    const blog = await Blogs.getEmployeeBlogsById(id);
    res.status(200).json(blog);

  } catch (err) {
    console.log("Unable to fetch Employee Blogs", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEmployeeBlogsByUserId = async (req, res) => {
  try {
    
    const userId = req.user.id;

    const blog = await Blogs.getEmployeeBlogByUserId(userId);
    res.status(200).json(blog);

  } catch (err) {
    console.log("Unable to fetch Employee Blogs", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteEmployeeBlog = async (req, res) => {
  console.log("Unable to delete Employee Blog");
  const { eblogId } = req.params;

  console.log(eblogId)

  if (!eblogId) {
    return res.status(400).json({ error: "Missing blog ID" });
  }

  try {
    await Blogs.deleteEmployeeBlog(eblogId);
    res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully!" });
  } catch (err) {
    console.error("DELETE BLOG ERROR:", err);
    res.status(500).json({ error: "Failed to delete blog" });
  }
};

// Comment 

export const showBlogComments = async (req, res) => {
  try {
    const { id } = req.params

    const comments = await Blogs.getAllComments(id);

    return res.status(200).json(comments)
  } catch (err) {
    console.error(err)
    res.status(500).json({error: 'Failed to fetch comments'})
  }
}

export const addEblogComment = async(req,res) => {

  try {

    const { eblogId, comment } = req.body
    const userId = req.user?.id

    if (!eblogId || !comment) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const data = {
      comment_id: uuidv7(),
      comment: comment,
      content_id: eblogId,
      created_at: now(),
      created_by: userId,
    }

    await Blogs.addEblogComment(data)

    res.status(201).json({success: true, message: 'Comment added successfully!'})
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);
    res.status(500).json({ error: "Failed to add comment." });
  }

}


// Like

export const isBlogLiked = async (req, res) => {
  const { eblogId } = req.params;
  const userId = req.user.id;

  try {
    const existingLike = await Blogs.isExistingLike(eblogId, userId);
    res.status(200).json({ liked: !!existingLike });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to check like status" });
  }
};


export const likeEmployeeBlog = async (req, res) => {
  const { eblogId } = req.params;
  const userId = req.user.id;

  try {
    const existingLike = await Blogs.isExistingLike(eblogId, userId);

    if (existingLike) {
      await Blogs.deleteLike(existingLike.like_id);
      return res.status(200).json({ success: true, liked: false });
    } else {
      await Blogs.insertLike({
        like_id: uuidv7(),
        eblog_id: eblogId,
        user_id: userId,
        created_at: now(),
      });
      return res.status(201).json({ success: true, liked: true });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
