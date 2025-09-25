export const now = () => {
  const date = new Date();
  return date;
};

export const formatToMySQL = (date) => {
    return new Date(date).toISOString().slice(0, 19).replace("T", " ");
  };

// // Conversion of the datetime to fetch exact time to local
// export const localToUtc = (start, end) => {
  

//   const startDate = formatToMySQL(start);
//   const endDate = formatToMySQL(end);

//   return { startDate, endDate };
// };

// // Convert UTC datetime → Local (Philippines)
// export const UtcToLocal = (start, end) => {
//   const startDate = new Date(start).toLocaleString("en-PH", {
//     timeZone: "Asia/Manila",
//   });

//   const endDate = new Date(end).toLocaleString("en-PH", {
//     timeZone: "Asia/Manila",
//   });

//   return { startDate, endDate };
// };