import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Treat placeholder values (like 'your-api-key') as not configured
const looksConfigured = (val) => typeof val === 'string' && val.length > 0 && !val.toLowerCase().includes('your');

let client = null;

if (looksConfigured(CLOUDINARY_CLOUD_NAME) && looksConfigured(CLOUDINARY_API_KEY) && looksConfigured(CLOUDINARY_API_SECRET)) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  client = cloudinary;
} else {
  console.warn('Cloudinary not fully configured. Set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env to enable uploads.');
  client = {
    uploader: {
      upload_stream: () => {
        throw new Error('Cloudinary not configured. Cannot upload files.');
      },
      destroy: async () => {
        throw new Error('Cloudinary not configured. Cannot delete files.');
      },
    },
  };
}

export default client;
