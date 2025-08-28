// File upload utilities for handling images and videos

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  preview?: string;
}

// Price categories for content
export const priceCategories = [
  { value: 'free', label: 'Free', price: 0 },
  { value: 'bdt_150', label: 'BDT 150', price: 150 },
  { value: 'bdt_250', label: 'BDT 250', price: 250 },
  { value: 'bdt_500', label: 'BDT 500', price: 500 },
  { value: 'usd_2', label: 'USD $2', price: 2 },
  { value: 'usd_3', label: 'USD $3', price: 3 },
  { value: 'usd_5', label: 'USD $5', price: 5 },
];

export function getPriceLabelFromCategory(category: string): string {
  const found = priceCategories.find(c => c.value === category);
  return found ? found.label : 'Free';
}

export function getPriceFromCategory(category: string): number {
  const found = priceCategories.find(c => c.value === category);
  return found ? found.price : 0;
}

export const uploadFile = async (file: File): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/single', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return await response.json();
};

export const uploadMultipleFiles = async (files: FileList | File[]): Promise<UploadedFile[]> => {
  const formData = new FormData();
  const fileArray = Array.from(files);
  
  fileArray.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await fetch('/api/upload/multiple', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return await response.json();
};

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const validateVideoFile = (file: File): boolean => {
  const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const getFileTypeIcon = (type: string): string => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎥';
  return '📁';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};