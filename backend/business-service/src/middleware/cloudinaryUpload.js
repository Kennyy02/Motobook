import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ✅ VALIDATE CLOUDINARY CONFIG ON STARTUP
const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ MISSING CLOUDINARY ENVIRONMENT VARIABLES:");
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error("\n⚠️  File uploads will FAIL until these are set!");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ LOG CONFIG STATUS (without exposing secrets)
console.log("📸 Cloudinary Configuration:");
console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || "NOT SET"}`);
console.log(
  `   API Key: ${process.env.CLOUDINARY_API_KEY ? "✅ SET" : "❌ NOT SET"}`
);
console.log(
  `   API Secret: ${
    process.env.CLOUDINARY_API_SECRET ? "✅ SET" : "❌ NOT SET"
  }`
);

// Multer memory storage
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper to upload buffer to Cloudinary using DataURI
const uploadToCloudinary = (buffer, folder = "motobook") => {
  return new Promise((resolve, reject) => {
    // ✅ CHECK CONFIG BEFORE ATTEMPTING UPLOAD
    if (!process.env.CLOUDINARY_API_KEY) {
      return reject(
        new Error(
          "Cloudinary API key not configured. Please set CLOUDINARY_API_KEY environment variable."
        )
      );
    }

    // Convert buffer to base64 DataURI
    const dataUri = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    cloudinary.uploader.upload(
      dataUri,
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary upload error:", error);
          return reject(error);
        }
        console.log("✅ Cloudinary upload success:", result.secure_url);
        resolve(result);
      }
    );
  });
};

// Export middleware that works with your routes
export const upload = {
  single: (fieldName) => [
    uploadMemory.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file || !req.file.buffer) {
          console.log("⚠️  No file uploaded");
          return next();
        }

        console.log(`📤 Uploading ${fieldName} to Cloudinary...`);

        // Choose folder by field name
        const folder =
          fieldName === "logo" ? "motobook/logos" : "motobook/products";

        const result = await uploadToCloudinary(req.file.buffer, folder);

        // Put cloudinary URL into req.file.path (controller expects this)
        req.file.path = result.secure_url;
        req.file.public_id = result.public_id;

        console.log("✅ Upload successful:", result.secure_url);
        return next();
      } catch (err) {
        console.error("❌ Cloudinary upload error:", err.message);
        return res.status(500).json({
          message: "Image upload failed",
          error: err.message,
          hint: "Check if Cloudinary credentials are properly configured in environment variables",
        });
      }
    },
  ],
};

export default upload;
