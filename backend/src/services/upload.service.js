import uploadRepository from '../repositories/upload.repository.js';
import fs from 'fs/promises';
import path from 'path';

class UploadService {
  async processUpload(file, userId, folderName) {
    // For local storage, the file is saved in 'uploads/'
    // We construct a public URL to serve it via express.static
    
    // Normalize path to use forward slashes for URLs
    const normalizedPath = file.path.replace(/\\/g, '/');
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    const secureUrl = `${baseUrl}/${normalizedPath}`;

    const uploadData = {
      publicId: file.filename, 
      secureUrl: secureUrl,
      thumbnailUrl: secureUrl, // Local storage doesn't auto-generate thumbnails, use original
      width: 0,
      height: 0,
      format: file.mimetype.split('/')[1],
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

    // Delete local file
    try {
      const filePath = path.join(process.cwd(), 'uploads', publicId);
      await fs.unlink(filePath);
    } catch (err) {
      console.error(`Failed to delete local file: ${err.message}`);
      // Continue to delete from DB even if file is missing
    }

    // Delete from DB
    await uploadRepository.deleteUploadByPublicId(publicId);
    
    return true;
  }
}

export default new UploadService();
