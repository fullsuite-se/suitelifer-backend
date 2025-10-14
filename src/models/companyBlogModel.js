import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const companyBlogTable = () => db("sl_company_blogs");
// To be implemented later on
const companyBlogImageTable = () => db("sl_company_blog_images");

export const CompanyBlog = {
    insertBlog: async (newBlog) => {
        return companyBlogTable().insert(newBlog);
    },

    getCompanyBlogs: async () => {
        const rows = await companyBlogTable()
            .select(
            "sl_company_blogs.blog_id AS blogId",
            "sl_company_blogs.title",
            "sl_company_blogs.article",
            "sl_company_blogs.section",
            "sl_company_blogs.created_at AS createdAt",
            "sl_company_blog_images.blog_image_url AS imageUrl"
            )
            .leftJoin(
            "sl_company_blog_images",
            "sl_company_blog_images.blog_id",
            "sl_company_blogs.blog_id"
            );

        return rows.map((row) => ({
                blogId: row.blogId,
                title: row.title,
                article: row.article,
                section: row.section,
                imageUrl: row.imageUrl,
                createdAt: row.createdAt,
        }));
        },

        getCompanyBlogById: async(blogId)  => {
            const rows = await companyBlogTable()
            .select(
                  "sl_company_blogs.blog_id AS blogId",
            "sl_company_blogs.title",
            "sl_company_blogs.article",
            "sl_company_blogs.section",
            "sl_company_blogs.created_at AS createdAt",
            "sl_company_blog_images.blog_image_url AS imageUrl"
            )
            .leftJoin(
            "sl_company_blog_images",
            "sl_company_blog_images.blog_id",
            "sl_company_blogs.blog_id"
            )
            .where("sl_company_blogs.blog_id", blogId)
            .first()

            if (!rows) return null;

             return { ...rows }

        },

    editBlog: async (blog_id, data) => {
        return await companyBlogTable().update(data).where({blog_id})
    },
    deleteBlog: async (blog_id) => {
        return await companyBlogTable().where({blog_id}).del()
    },
    
    // Insert into the blog image table 
    insertBlogImage: async(newBlogImage)  => {
        return await companyBlogImageTable().insert(newBlogImage)
    },
    editBlogImage: async (blog_id, imageUrl) => {
    // If image record exists → update, else insert
    const existing = await companyBlogImageTable().where({ blog_id }).first();
    if (existing) {
        return await companyBlogImageTable()
            .where({ blog_id })
            .update({ blog_image_url: imageUrl });
    } else {
        return await companyBlogImageTable().insert({
            blog_image_id: uuidv7(),
            blog_id,
            blog_image_url: imageUrl,
        });
    }
    },
};
