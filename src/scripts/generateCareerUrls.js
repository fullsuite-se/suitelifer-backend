import axios from "axios";
import { toSlug } from "../utils/slugUrl.js";
import { now } from "../utils/date.js";

const generateCareerUrls = async () => {
  const today = now().toISOString().split("T")[0];

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
export default generateCareerUrls;
