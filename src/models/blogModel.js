import { db } from "../config/db.js";

const tableEmployee = "sl_employee_blogs";
const tableEmployeeImages = "sl_employee_blog_images";

const tableCompany = "sl_company_blogs";
const tableCompanyImages = "sl_company_blog_images";

export const Blogs = {
  getAllEmployeeBlogs: async () => {
    return await db(tableEmployee)
      .leftJoin(
        tableEmployeeImages,
        `${tableEmployee}.eblog_id`,
        `${tableEmployeeImages}.eblog_id`
      )
      .select(
        `${tableEmployee}.*`,
        db.raw(`JSON_ARRAYAGG(${tableEmployeeImages}.image_url) AS images`)
      )
      .groupBy(`${tableEmployee}.eblog_id`);
  },

  addEmployeeBlog: async (blog) => {
    return await db(tableEmployee).insert(blog);
  },

  getAllCompanyBlogTags: async () => {
    return await db
      .select("tag_id AS tagId", "tag_name AS tagName")
      .from("sl_tags");
  },

  getAllCompanyBlogs: async () => {
    return await db
      .select(
        "sl_company_blogs.cblog_id AS cblogId",
        "title",
        "description",
        "created_at AS createdAt",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        ),
        db.raw("MIN(sl_company_blog_images.image_url) AS imageUrl")
      )
      .from("sl_company_blogs")
      .innerJoin("hris_user_infos", {
        "sl_company_blogs.created_by": "hris_user_infos.user_id",
      })
      .leftJoin("sl_company_blog_images", {
        "sl_company_blogs.cblog_id": "sl_company_blog_images.cblog_id",
      })
      .groupBy(
        "sl_company_blogs.cblog_id",
        "title",
        "description",
        "created_at",
        "hris_user_infos.first_name",
        "hris_user_infos.middle_name",
        "hris_user_infos.last_name"
      )
      .orderBy("sl_company_blogs.created_at");
  },

  getFilteredCompanyBlogs: async (tag_id) => {
    return await db
      .select(
        "sl_company_blogs.cblog_id AS cblogId",
        "title",
        "description",
        "created_at AS createdAt",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        ),
        db.raw("MIN(sl_company_blog_images.image_url) AS imageUrl")
      )
      .from("sl_company_blogs")
      .innerJoin("hris_user_infos", {
        "sl_company_blogs.created_by": "hris_user_infos.user_id",
      })
      .leftJoin("sl_company_blog_images", {
        "sl_company_blogs.cblog_id": "sl_company_blog_images.cblog_id",
      })
      .innerJoin("sl_cblog_tags", {
        "sl_company_blogs.cblog_id": "sl_cblog_tags.cblog_id",
      })
      .innerJoin("sl_tags", { "sl_cblog_tags.tag_id": "sl_tags.tag_id" })
      .where("sl_cblog_tags.tag_id", tag_id)
      .groupBy(
        "sl_company_blogs.cblog_id",
        "title",
        "description",
        "created_at",
        "hris_user_infos.first_name",
        "hris_user_infos.middle_name",
        "hris_user_infos.last_name",
        "sl_cblog_tags.tag_id"
      )
      .orderBy("sl_company_blogs.created_at");
  },
};
