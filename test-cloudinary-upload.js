import cloudinary from "./src/utils/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

// Test Cloudinary configuration
console.log('Testing Cloudinary configuration...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    console.log('\nTesting Cloudinary connection...');
    
    // Test basic API call
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    
    // Test upload capabilities (optional)
    console.log('\nCloudinary is properly configured and ready for uploads!');
    
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    console.log('\nPlease check your Cloudinary credentials in your .env file:');
    console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('CLOUDINARY_API_KEY=your_api_key');
    console.log('CLOUDINARY_API_SECRET=your_api_secret');
  }
}

testCloudinaryConnection(); 