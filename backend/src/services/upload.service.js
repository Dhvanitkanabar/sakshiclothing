import uploadRepository from '../repositories/upload.repository.js';
import fs from 'fs/promises';
import path from 'path';

class UploadService {
  async processUpload(file, userId, folderName, req = null) {
    // Normalize path to use forward slashes for URLs
    const normalizedPath = file.path.replace(/\\/g, '/');

    let baseUrl = process.env.API_URL;
    if (!baseUrl && req) {
      const host = req.headers['x-forwarded-host'] || req.get('host') || '';
      const proto = req.headers['x-forwarded-proto'] || (host.includes('onrender.com') ? 'https' : req.protocol);
      if (host) {
        baseUrl = `${proto}://${host}`;
      }
    }

    if (!baseUrl) {
      baseUrl = process.env.NODE_ENV === 'production' || process.env.RENDER
        ? 'https://sakshi-clothing-backend.onrender.com'
        : 'http://localhost:5000';
    }

    // Always enforce HTTPS if in production or on render
    if (baseUrl.includes('onrender.com') || baseUrl.includes('sakshiclothing.store')) {
      baseUrl = baseUrl.replace(/^http:\/\//, 'https://');
    }

    // Read file buffer for permanent database persistence (protects against cloud container disk wipe)
    let buffer = null;
    const pathCandidates = [
      file.path,
      path.resolve(file.path),
      path.join(process.cwd(), file.path),
      path.join(process.cwd(), 'uploads', file.filename),
      path.join(process.cwd(), 'backend/uploads', file.filename),
    ];

    for (const candidate of pathCandidates) {
      try {
        buffer = await fs.readFile(candidate);
        if (buffer && buffer.length > 0) {
          console.log(`[Upload Service] Successfully read buffer (${buffer.length} bytes) from: ${candidate}`);
          break;
        }
      } catch {}
    }

    if (!buffer) {
      console.warn('[Upload Service] Warning: Could not read file buffer from any candidate path');
    }

    const secureUrl = `${baseUrl}/${normalizedPath}`;

    const uploadData = {
      publicId: file.filename, 
      secureUrl: secureUrl,
      thumbnailUrl: secureUrl,
      data: buffer,
      contentType: file.mimetype || 'image/jpeg',
      width: 0,
      height: 0,
      format: file.mimetype.split('/')[1] || 'jpeg',
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
