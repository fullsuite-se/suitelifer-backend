import cloudinary from "../utils/cloudinary.js";
import { Image } from "../models/imageModel.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "suitelifer/blogs" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadAndSaveImages = async (req, res) => {
  const { table, folder, id } = req.params;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `suitelifer/${folder}/${id}` },
          (error, result) =>
            error ? reject(error) : resolve(result.secure_url)
        );
        stream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    const eBlog = "sl_employee_blog_images";
    const cBlog = "sl_company_blog_images";
    const cNews = "sl_news_images";
    try {
      if (table === "eBlog") {
        await Image.addEmployeeBlogImages(id, imageUrls);
      } else if (table === "cNews") {
        await Image.addCompanyNewsImages(id, imageUrls);
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res
        .status(500)
        .json({ error: "Failed to save images in the database" });
    }

    res.status(200).json({
      success: true,
      message: "Upload successful!",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
