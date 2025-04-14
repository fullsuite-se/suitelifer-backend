import cloudinary from "../utils/cloudinary.js";
import { Image } from "../models/imageModel.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { folder } = req.params;
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `suitelifer/${folder}` },
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

    try {
      const tableMap = {
        eBlog: Image.addEmployeeBlogImages,
        cBlog: Image.addCompanyBlogImages,
        cNews: Image.addCompanyNewsImages,
      };
      const saveImagesToDb = tableMap[table];

      if (!saveImagesToDb) {
        return res.status(400).json({ error: "Invalid table name" });
      }

      await saveImagesToDb(id, imageUrls);
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
