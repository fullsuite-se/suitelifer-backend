import { db } from "../config/db.js";

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

    editBlog: async (blog_id, data) => {
        return await companyBlogTable().update(data).where({blog_id})
    },
    deleteBlog: async (blog_id) => {
        return await companyBlogTable().where({blog_id}).del()
    },
    
    // Insert into the blog image table 
    insertBlogImage: async(newBlogImage)  => {
        return await companyBlogImageTable().insert(newBlogImage)
    }
};
