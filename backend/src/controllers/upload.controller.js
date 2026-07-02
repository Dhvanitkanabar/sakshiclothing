import uploadService from '../services/upload.service.js';

class UploadController {
  async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const folderName = req.body.folder || 'misc';
      const uploadRecord = await uploadService.processUpload(req.file, req.user._id, folderName);

      res.status(201).json({
        success: true,
        data: uploadRecord,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }

      const folderName = req.body.folder || 'misc';
      
      const uploadPromises = req.files.map(file => 
        uploadService.processUpload(file, req.user._id, folderName)
      );
      
      const uploadRecords = await Promise.all(uploadPromises);

      res.status(201).json({
        success: true,
        data: uploadRecords,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteUpload(req, res) {
    try {
      const { publicId } = req.params;
      
      if (!publicId) {
        return res.status(400).json({ success: false, message: 'publicId is required' });
      }

      // We need to pass the full publicId (e.g. sakshi-clothing/products/abc123)
      // Since it might contain slashes, we usually encode it or pass it in body. 
      // But let's assume it's passed as a parameter and might be URL encoded.
      const decodedPublicId = decodeURIComponent(publicId);

      await uploadService.deleteUpload(decodedPublicId);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new UploadController();
