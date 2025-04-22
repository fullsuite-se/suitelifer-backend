import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { toSlug } from "../utils/slugUrl.js";

const generateCareerUrls = async () => {
  const today = new Date().toISOString().split("T")[0];

  let urls = [
    `<url>
<loc>https://www.suitelifer.com/careers</loc>
<lastmod>${today}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>`,
  ];

  const response = await axios.get(
    `${process.env.ATS_API_BASE_URL}/jobs/shown`
  );
  const jobs = response.data.data;

  jobs.forEach((job) => {
    const url = `<url>
<loc>https://www.suitelifer.com/careers/${toSlug(job.jobTitle)}?id=${
      job.jobId
    }</loc>
<lastmod>${today}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>`;
    urls.push(url);
  });
  return urls.join("");
};

const generateNewsletterUrls = async () => {
  const today = new Date().toISOString().split("T")[0];

  let urls = [
    `<url>
<loc>https://www.suitelifer.com/newsletter</loc>
<lastmod>${today}</lastmod>
<changefreq>weekly</changefreq>
<priority>0.8</priority>
</url>`,
  ];

  return urls.join("");
};

const generateSitemap = async () => {
  const currentPath = fileURLToPath(import.meta.url);
  const currentDirectory = path.dirname(currentPath);

  const sitemapPath = path.join(
    currentDirectory,
    "../../",
    "public",
    "sitemap.xml"
  );
  // const newsletterPath = path.join(
  //   currentDirectory,
  //   "../../",
  //   "public",
  //   "newsletter.xml"
  // );
  // const careersPath = path.join(
  //   currentDirectory,
  //   "../../",
  //   "public",
  //   "careers.xml"
  // );

  try {
    // const sitemap = await fs.readFile(sitemapPath, { encoding: "utf8" });
    // const newsletter = await fs.readFile(newsletterPath, { encoding: "utf8" });
    // const careers = await fs.readFile(careersPath, { encoding: "utf8" });
    // const urlsetIndex = sitemap.indexOf("</urlset>");

    const careers = await generateCareerUrls();
    const newsletters = await generateNewsletterUrls();
    console.log(careers);
    // console.log(newsletters);

    const newSitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://www.suitelifer.com/</loc>
        <lastmod>2025-04-21</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>https://www.suitelifer.com/about-us</loc>
        <lastmod>2025-04-21</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>https://www.suitelifer.com/podcast</loc>
        <lastmod>2025-04-21</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>https://www.suitelifer.com/contact</loc>
        <lastmod>2025-04-21</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.8</priority>
      </url>
      ${careers}
    </urlset>`;

    try {
      await fs.writeFile(sitemapPath, newSitemap);
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
  }
};

export default generateSitemap;
