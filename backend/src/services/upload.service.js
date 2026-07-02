import uploadRepository from '../repositories/upload.repository.js';
import cloudinary from '../config/cloudinary.js';

class UploadService {
  async processUpload(file, userId, folderName) {
    // Determine responsive thumbnail url via cloudinary transformations
    // Replace /upload/ with /upload/w_300,h_300,c_fill,q_auto,f_auto/ for a thumbnail
    const thumbnailUrl = file.path.replace('/upload/', '/upload/w_300,h_300,c_fill,q_auto,f_auto/');
    
    // Replace base url to ensure general optimizations
    const optimizedUrl = file.path.replace('/upload/', '/upload/q_auto,f_auto/');

    const uploadData = {
      publicId: file.filename, // Multer-storage-cloudinary uses filename for public_id
      secureUrl: optimizedUrl,
      thumbnailUrl: thumbnailUrl,
      width: file.width || 0,
      height: file.height || 0,
      format: file.format || file.mimetype.split('/')[1],
      bytes: file.size,
      folder: folderName || 'sakshi-clothing/misc',
      uploadedBy: userId,
    };

    return await uploadRepository.saveUploadData(uploadData);
  }

  async deleteUpload(publicId) {
    const upload = await uploadRepository.getUploadByPublicId(publicId);
    if (!upload) {
      throw new Error('Image not found in database');
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete from DB
    await uploadRepository.deleteUploadByPublicId(publicId);
    
    return true;
  }
}

export default new UploadService();
