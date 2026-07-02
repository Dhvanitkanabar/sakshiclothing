import Upload from '../models/Upload.model.js';

class UploadRepository {
  async saveUploadData(data) {
    const upload = new Upload(data);
    return await upload.save();
  }

  async getUploadByPublicId(publicId) {
    return await Upload.findOne({ publicId });
  }

  async deleteUploadByPublicId(publicId) {
    return await Upload.findOneAndDelete({ publicId });
  }
}

export default new UploadRepository();
