import { CompanyBlog } from "../models/companyBlogModel.js"
import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";

// Get Blogs
export const getBlogs = async(req, res) => {
    try {
        const data = await CompanyBlog.getCompanyBlogs()
        res.status(200).json({status: true, data})
    } catch (error) {
        res.status(500).json({status: false, error: 'Internal Server Error!'})
    }
}

// Add Blog
export const addBlog = async(req, res) => {
    
    try {
        const { title, article, section, imageUrl } = req.body

        if(!title || !article){
            return res.status(400).json({status: false, message: 'Missing field!: title | article '})
        }
        const blogId = uuidv7()
       
        const newBlog = {
              blog_id : blogId,
              title: title,
              article: article,
              section: section,
              created_at: now()
        }

        await CompanyBlog.insertBlog(newBlog)

         if (imageUrl) {
            const newImage = {
                blog_image_id: uuidv7(),
                blog_id: blogId,
                blog_image_url: imageUrl,
            };
            await CompanyBlog.insertBlogImage(newImage);
        }


        res.status(201).json({success: true, message: 'New Blog Added Successfully!' })
    } catch (error) {
        console.error(error)
        res.status(500).json({status: false, message: 'Internal Server Error!'})
    }
}

// Edit Blog
export const editBlog = async(req, res) => {
    try {
        const { blogId, title, section, imageUrl, article } = req.body

        if(!blogId || !title || !article){
            return res.status(400).json({status: false, message: 'Missing field!: blog_id| title | article'})
        }

        const updatedBlog = {
            title: title, 
            article: article,
            section: section,
            updated_at: now()
        }

        await CompanyBlog.editBlog(blogId,updatedBlog)

        if (imageUrl !== null) {
            await CompanyBlog.editBlogImage(blogId, imageUrl);
        }
        
        res.status(200).json({status: true, message: 'Blog Updated Successfully!'})

    } catch (error) {
        console.error(error)
        res.status(500).json({status: false, message: 'Internal Server Error!'})
    }
}

// Delete Blog
export const deleteBlog = async(req, res) => {
    
    try {
        const { blogId } = req.params
        console.log('backend',blogId)
        if(!blogId){
            return res.status(400).json(
                { success: false, message: "Missing required field: blog_id" }
            );
        }
            await CompanyBlog.deleteBlog(blogId);
        
            res.status(200).json(
                { succes: true, message: "Event Deleted Successfully" }
            );

    } catch (error) {
         console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}