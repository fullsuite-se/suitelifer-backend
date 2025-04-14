export const youtubeLinkToEmbed = (url) => {
  console.log(url);

  if (url.includes("watch?v=")) {
    return url.replace("watch?v=", "embed/");
  } else {
    return url.split("?")[0].replace("youtu.be/", "youtube.com/embed/");
  }
};
