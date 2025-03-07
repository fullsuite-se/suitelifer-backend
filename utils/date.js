export const now = () => {
  const date = new Date(isoString);
  date.setHours(date.getHours() + 8);

  return date;
};
