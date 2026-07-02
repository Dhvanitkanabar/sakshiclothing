import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Base Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder dynamically based on request or default to misc
    const folder = req.body.folder ? `sakshi-clothing/${req.body.folder}` : 'sakshi-clothing/misc';
    
    // Cloudinary format conversions
    let format = 'webp'; // Default format
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') format = 'jpg';
    if (file.mimetype === 'image/png') format = 'png';

    return {
      folder: folder,
      format: format,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      // Add optional transformations if needed:
      // transformation: [{ width: 1000, crop: 'limit' }]
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG and WEBP are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

export default upload;
