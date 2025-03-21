import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const tableEmployee = "sl_employee_blogs";
const tableEmployeeImages = "sl_employee_blog_images";

const tableCompany = "sl_company_blogs";
const tableCompanyImages = "sl_company_blog_images";

const cBlogTags = "sl_cblog_tags";

export const Blogs = {
  // Employee
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

  // Company
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
      .orderBy("sl_company_blogs.created_at", "desc");
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
      .orderBy("sl_company_blogs.created_at", "desc");
  },

  getCompanyBlogById: async (cblog_id) => {
    return await db
      .select(
        "sl_company_blogs.cblog_id AS cblogId",
        "title",
        "description",
        "created_at AS createdAt",
        db.raw(
          "CONCAT(hris_user_infos.first_name, ' ', LEFT(hris_user_infos.middle_name, 1), '. ', hris_user_infos.last_name) AS createdBy"
        ),
        db.raw(
          "IFNULL(JSON_ARRAYAGG(sl_company_blog_images.image_url), JSON_ARRAY()) AS images"
        )
      )
      .from("sl_company_blogs")
      .innerJoin("hris_user_infos", {
        "sl_company_blogs.created_by": "hris_user_infos.user_id",
      })
      .leftJoin("sl_company_blog_images", {
        "sl_company_blogs.cblog_id": "sl_company_blog_images.cblog_id",
      })
      .where("sl_company_blogs.cblog_id", cblog_id)
      .groupBy(
        "sl_company_blogs.cblog_id",
        "title",
        "description",
        "created_at",
        "hris_user_infos.first_name",
        "hris_user_infos.middle_name",
        "hris_user_infos.last_name"
      )
      .first();
  },

  addCompanyBlog: async (data) => {
    const cblog_id = uuidv7();

    await db(tableCompany).insert({
      cblog_id,
      title: data.title,
      description: data.description,
      created_at: db.fn.now(),
      created_by: data.userId,
      updated_by: data.userId,
      updated_at: db.fn.now(),
    });

    const tags = data.tags.map((tag) => ({
      cblog_id: cblog_id,
      tag_id: tag.tag_id,
    }));

    await db(cBlogTags).insert(tags);

    return cblog_id;
  },
};
