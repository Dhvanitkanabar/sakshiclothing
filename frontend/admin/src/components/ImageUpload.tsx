import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, AlertCircle, RefreshCw, Star, CheckCircle, Image as ImageIcon } from 'lucide-react';
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const response = await axios.post(`${API_URL}/uploads/image`, formData, {
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
    <div className="w-full space-y-6">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`relative group border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-black bg-gray-50 scale-[0.99]' 
            : 'border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-black'}`}>
          <UploadCloud className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-gray-900 font-medium text-center">
          <span className="font-bold underline underline-offset-4 cursor-pointer">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-2 font-medium">
          JPG, PNG or WEBP (Max 10MB)
        </p>
      </div>

      {/* Existing Images Gallery */}
      {existingImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon size={14} /> Uploaded Images
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {existingImages.map((img) => (
              <div key={img.publicId} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md transition-all">
                <img src={img.thumbnailUrl || img.secureUrl} alt="Upload" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-between items-start">
                    <button
                      type="button"
                      onClick={() => onSetPrimary && onSetPrimary(img.publicId)}
                      className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${primaryImageId === img.publicId ? 'bg-black text-white' : 'bg-white/20 hover:bg-white text-white hover:text-black'}`}
                      title="Set as primary"
                    >
                      <Star size={14} strokeWidth={2} fill={primaryImageId === img.publicId ? "currentColor" : "none"} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onImageDelete && onImageDelete(img.publicId)}
                      className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500 text-white transition-colors"
                      title="Delete image"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </div>
                  {primaryImageId === img.publicId && (
                    <span className="text-[10px] font-black tracking-wider uppercase text-white bg-black/80 backdrop-blur-md px-2 py-1 rounded-full w-fit">Primary</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploading Status List */}
      {uploads.length > 0 && (
        <div className="space-y-2 mt-4">
          {uploads.map((upload) => (
            <div key={upload.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="text-gray-700 truncate max-w-[200px]">{upload.file.name}</span>
                  {upload.status === 'uploading' && <span className="text-black">{upload.progress}%</span>}
                  {upload.status === 'success' && <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Success</span>}
                  {upload.status === 'error' && <span className="text-red-500 flex items-center gap-1"><AlertCircle size={12} /> Failed</span>}
                </div>
                {upload.status === 'uploading' && (
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-black h-full transition-all duration-300" style={{ width: `${upload.progress}%` }} />
                  </div>
                )}
                {upload.status === 'error' && (
                  <p className="text-[10px] text-red-500 mt-1 font-medium bg-red-50 p-1.5 rounded-md inline-block">
                    {upload.errorMessage}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {upload.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => uploadFile(upload)}
                    className="p-1.5 text-gray-400 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Retry"
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeUpload(upload.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <X size={14} />
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
