const { v7: uuidv7 } = require('uuid');

// Sample user data (first 10 users as example)
const users = [
  { email: "", firstName: "Matt Wilfred", middleName: "Cabunoc", lastName: "Salvador", profilePic: "https://avatars.slack-edge.com/2024-08-30/7658944753940_cdfb7fca8d8f57e26c58_192.png" },
  { email: "marco@fullsuite.ph", firstName: "Marco", middleName: "Eliseo", lastName: "Antero", profilePic: null },
  { email: "jhex@fullsuite", firstName: "Jhexer", middleName: "Tiongson", lastName: "Chun", profilePic: "jhex.png" },
  { email: "jullen@fullsuite.ph", firstName: "Jullen", middleName: "Uy", lastName: "Montenegro", profilePic: "https://avatars.slack-edge.com/2023-06-23/5458017501255_80540e972718e3d69e73_192.jpg" },
  { email: "marla@fullsuite.ph", firstName: "Marla Zita", middleName: "Cendana", lastName: "San Pedro", profilePic: "https://avatars.slack-edge.com/2023-05-15/5255557832534_e33e3fedaaa5555172b5_192.jpg" },
  { email: "frederick@fullsuite.ph", firstName: "Frederick", middleName: "Dela Cruz", lastName: "Ulatan", profilePic: null },
  { email: "hailie@fullsuite.ph", firstName: "Hailie Joy", middleName: "Tolentino", lastName: "Bejerano", profilePic: "https://avatars.slack-edge.com/2023-09-14/5903647438065_a0ebc2d6a81eb7cd80fb_192.jpg" },
  { email: "pherrie@fullsuite.ph", firstName: "Pherrie James", middleName: "Tabilla", lastName: "Bacolod", profilePic: null },
  { email: "maggie@fullsuite.ph", firstName: "Maggie", middleName: "Bargo", lastName: "Po", profilePic: "https://avatars.slack-edge.com/2024-07-04/7387107555169_6842212f73a3d1e2c384_192.png" },
  { email: "angeline@getfullsuite.com", firstName: "Angeline ", middleName: "Hipol", lastName: "Crepa", profilePic: "https://ca.slack-edge.com/TKUG58KSM-U06AJG5C30B-0eab485eb874-192" }
];

console.log('-- INSERT statements for sl_user_accounts table');
console.log('-- Generated with proper UUIDs and data types\n');

users.forEach((user, index) => {
  const userId = uuidv7();
  const email = user.email || `user${index + 1}@fullsuite.ph`;
  const profilePic = user.profilePic ? `'${user.profilePic}'` : 'NULL';
  const middleName = user.middleName ? `'${user.middleName}'` : 'NULL';
  
  console.log(`INSERT INTO sl_user_accounts (user_id, user_email, user_password, user_type, first_name, middle_name, last_name, profile_pic, is_verified, is_active, created_at) VALUES (`);
  console.log(`  '${userId}',`);
  console.log(`  '${email}',`);
  console.log(`  '',`);
  console.log(`  'EMPLOYEE',`);
  console.log(`  '${user.firstName}',`);
  console.log(`  ${middleName},`);
  console.log(`  '${user.lastName}',`);
  console.log(`  ${profilePic},`);
  console.log(`  1,`);
  console.log(`  1,`);
  console.log(`  '2025-07-31 08:33:36'`);
  console.log(`);\n`);
});

console.log('-- Total users to insert:', users.length); 