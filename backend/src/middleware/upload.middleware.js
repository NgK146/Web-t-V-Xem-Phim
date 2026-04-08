import multer from 'multer';

// Keep files in memory — we'll push them to Cloudinary in the controller/route
const storage = multer.memoryStorage();

export const uploadSingle = (fieldName) => {
  return multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }).single(fieldName);
};
