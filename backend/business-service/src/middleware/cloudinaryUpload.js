import multer from "multer";
import cloudinary from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage so we can upload buffer to Cloudinary
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (adjust if needed)
});

// Helper to upload buffer to Cloudinary and return result
const streamUpload = (buffer, folder = "motobook") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// We'll export an object with single(fieldName) that returns [multerMiddleware, uploadToCloudinaryMiddleware]
export const upload = {
  single: (fieldName) => [
    uploadMemory.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file || !req.file.buffer) return next();

        // optionally choose folder by fieldname
        const folder = fieldName === "logo" ? "logos" : "products";

        const result = await streamUpload(req.file.buffer, folder);
        // put cloudinary secure_url into req.file.path to match controller expectations
        req.file.path = result.secure_url;
        req.file.public_id = result.public_id;
        return next();
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return next(err);
      }
    },
  ],
};

export default upload;
