import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import generateCareerUrls from "./generateCareerUrls.js";
import generateNewsletterUrls from "./generateNewsletterUrls.js";

const generateSitemap = async () => {
  const currentPath = fileURLToPath(import.meta.url);
  const currentDirectory = path.dirname(currentPath);

  const sitemapPath = path.join(
    currentDirectory,
    "../../",
    "public",
    "sitemap.xml"
  );

  try {
    const careers = await generateCareerUrls();
    const newsletters = await generateNewsletterUrls();

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
      ${newsletters}
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
