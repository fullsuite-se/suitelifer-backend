import axios from "axios";
import { toSlug } from "../utils/slugUrl.js";
import { now } from "../utils/date.js";

const generateNewsletterUrls = async () => {
  const today = now().toISOString().split("T")[0];

  let urls = [
    `<url>
<loc>https://www.suitelifer.com/newsletter</loc>
<lastmod>${today}</lastmod>
<changefreq>weekly</changefreq>
<priority>0.8</priority>
</url>`,
  ];

  const response = await axios.get(
    `https://api.suitelifer.com/api/issues/current`
  );

  const current = response.data.currentIssue;

  const newslettersRes = await axios.get(
    `${process.env.SUITELIFER_API_BASE_URL}/api/newsletter?issueId=${current.issueId}`
  );

  const newsletters = newslettersRes.data.newsletters;

  newsletters.forEach((newsletter) => {
    const url = `<url>
<loc>https://www.suitelifer.com/newsletter/${toSlug(newsletter.title)}?id=${
      newsletter.newsletterId
    }</loc>
<lastmod>${today}</lastmod>
<changefreq>monthly</changefreq>
<priority>0.8</priority>
</url>`;
    urls.push(url);
  });

  return urls.join("");
};
export default generateNewsletterUrls;
