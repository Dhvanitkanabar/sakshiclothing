import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, AlertCircle, RefreshCw, Star } from 'lucide-react';
import axios from 'axios';

interface ImageUploadProps {
  folder: string;
  maxFiles?: number;
  maxSize?: number; // In bytes, default 10MB
  onUploadSuccess: (urls: { secureUrl: string; thumbnailUrl: string; publicId: string }[]) => void;
  onImageDelete?: (publicId: string) => void;
  onSetPrimary?: (publicId: string) => void;
  existingImages?: { secureUrl: string; thumbnailUrl: string; publicId: string }[];
  primaryImageId?: string;
}

interface UploadProgress {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  publicId?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  folder,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  onUploadSuccess,
  onImageDelete,
  onSetPrimary,
  existingImages = [],
  primaryImageId,
}) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      // Handle rejections
      if (fileRejections.length > 0) {
        alert('Some files were rejected. Ensure they are images and under 10MB.');
      }

      // Check max files limit
      if (existingImages.length + uploads.length + acceptedFiles.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} images.`);
        return;
      }

      const newUploads = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      newUploads.forEach((uploadItem) => {
        uploadFile(uploadItem);
      });
    },
    [existingImages.length, uploads.length, maxFiles, folder]
  );

  const uploadFile = async (uploadItem: UploadProgress) => {
    const formData = new FormData();
    formData.append('image', uploadItem.file);
    formData.append('folder', folder);

    try {
      const response = await axios.post('/api/v1/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploads((prev) =>
            prev.map((item) =>
              item.id === uploadItem.id ? { ...item, progress: percentCompleted } : item
            )
          );
        },
      });

      const { secureUrl, thumbnailUrl, publicId } = response.data.data;

      setUploads((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? { ...item, status: 'success', url: secureUrl, thumbnailUrl, publicId, progress: 100 }
            : item
        )
      );

      // Call parent
      onUploadSuccess([{ secureUrl, thumbnailUrl, publicId }]);
    } catch (error: any) {
      setUploads((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? { ...item, status: 'error', errorMessage: error.response?.data?.message || 'Upload failed' }
            : item
        )
      );
    }
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((item) => item.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize,
    maxFiles,
  });

  return (
    <div className="w-full space-y-4">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50/10' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 text-center">
          <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG or WEBP (max. 10MB) - Up to {maxFiles} images
        </p>
      </div>

      {/* Existing Images Gallery */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
          {existingImages.map((img) => (
            <div key={img.publicId} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img src={img.thumbnailUrl || img.secureUrl} alt="Upload" className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => onSetPrimary && onSetPrimary(img.publicId)}
                    className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    title="Set as primary"
                  >
                    <Star size={16} fill={primaryImageId === img.publicId ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onImageDelete && onImageDelete(img.publicId)}
                    className="p-1 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                    title="Delete image"
                  >
                    <X size={16} />
                  </button>
                </div>
                {primaryImageId === img.publicId && (
                  <span className="text-xs font-semibold text-white bg-blue-500 px-2 py-1 rounded w-fit">Primary</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploading Status List */}
      {uploads.length > 0 && (
        <div className="space-y-3 mt-4">
          {uploads.map((upload) => (
            <div key={upload.id} className="flex items-center gap-4 bg-gray-50/5 p-3 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium truncate max-w-[200px]">{upload.file.name}</span>
                  {upload.status === 'uploading' && <span className="text-blue-500">{upload.progress}%</span>}
                  {upload.status === 'success' && <span className="text-green-500">Success</span>}
                  {upload.status === 'error' && <span className="text-red-500">Failed</span>}
                </div>
                {upload.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${upload.progress}%` }} />
                  </div>
                )}
                {upload.status === 'error' && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> {upload.errorMessage}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {upload.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => uploadFile(upload)}
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded"
                    title="Retry"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeUpload(upload.id)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded"
                  title="Remove"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
