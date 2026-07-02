import mongoose, { Schema } from 'mongoose';

const uploadSchema = new Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    format: {
      type: String,
    },
    bytes: {
      type: Number,
    },
    folder: {
      type: String,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

uploadSchema.index({ folder: 1 });
uploadSchema.index({ uploadedBy: 1 });
uploadSchema.index({ createdAt: -1 });

const Upload = mongoose.model('Upload', uploadSchema);
export default Upload;
