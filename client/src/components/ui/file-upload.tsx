import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, Video, Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { uploadFile, uploadMultipleFiles, validateImageFile, validateVideoFile, formatFileSize, type UploadedFile } from '@/lib/fileUpload';

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  accept?: 'image' | 'video' | 'both';
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({ 
  onUpload, 
  accept = 'image', 
  multiple = false, 
  maxFiles = 5,
  className,
  disabled = false 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const acceptTypes = {
    image: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    video: {
      'video/*': ['.mp4', '.mpeg', '.quicktime']
    },
    both: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'video/*': ['.mp4', '.mpeg', '.quicktime']
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || uploading) return;

    setUploading(true);
    try {
      // Validate files based on accept type
      const validFiles = acceptedFiles.filter(file => {
        if (accept === 'image') return validateImageFile(file);
        if (accept === 'video') return validateVideoFile(file);
        return validateImageFile(file) || validateVideoFile(file);
      });

      if (validFiles.length === 0) {
        alert('Please select valid files');
        setUploading(false);
        return;
      }

      // Limit files if maxFiles is set
      const filesToUpload = validFiles.slice(0, maxFiles);
      
      const results = multiple 
        ? await uploadMultipleFiles(filesToUpload)
        : [await uploadFile(filesToUpload[0])];

      setUploadedFiles(prev => [...prev, ...results]);
      onUpload(results);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [accept, multiple, maxFiles, disabled, uploading, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptTypes[accept],
    multiple,
    disabled: disabled || uploading,
    maxFiles: multiple ? maxFiles : 1
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-8 w-8" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8" />;
    return <Upload className="h-8 w-8" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950/20",
          isDragActive && "border-green-400 bg-green-50 dark:bg-green-950/20",
          disabled && "opacity-50 cursor-not-allowed",
          "border-gray-300 dark:border-gray-600"
        )}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {isDragActive 
                  ? `Drop ${accept === 'both' ? 'files' : accept + 's'} here`
                  : `Click to upload or drag and drop`
                }
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {accept === 'image' && 'PNG, JPG, JPEG, WEBP up to 10MB'}
                {accept === 'video' && 'MP4, MPEG up to 100MB'}
                {accept === 'both' && 'Images (PNG, JPG) or Videos (MP4)'}
              </p>
              {multiple && (
                <p className="text-xs text-gray-400">
                  Maximum {maxFiles} files
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex-shrink-0 text-green-500">
                  {getFileIcon(file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {file.type.startsWith('image/') && (
                  <div className="flex-shrink-0">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImagePreview({ src, alt, className }: ImagePreviewProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

interface VideoPreviewProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPreview({ src, poster, className }: VideoPreviewProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-black", className)}>
      <video
        src={src}
        poster={poster}
        controls
        className="w-full h-full"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}