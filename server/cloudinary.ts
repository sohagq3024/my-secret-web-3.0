import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dnewpzaeg',
  api_key: '146297986481179',
  api_secret: 'qDceCrqP_N0wjmyfryaKTWO7xks'
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  resource_type: string;
}

export const uploadToCloudinary = async (
  file: { buffer: Buffer; originalname: string; mimetype: string },
  folder: string = 'my-secret-web'
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result as CloudinaryUploadResult);
        } else {
          reject(new Error('Upload failed'));
        }
      }
    ).end(file.buffer);
  });
};

export const uploadMultipleToCloudinary = async (
  files: { buffer: Buffer; originalname: string; mimetype: string }[],
  folder: string = 'my-secret-web'
): Promise<CloudinaryUploadResult[]> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;