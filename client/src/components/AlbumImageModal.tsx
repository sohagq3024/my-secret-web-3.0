import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Trash2, 
  Plus, 
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Album, AlbumImage, InsertAlbumImage } from "@shared/schema";
import { uploadFile, validateImageFile, UploadedFile } from "@/lib/fileUpload";

interface AlbumImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album | null;
}

export function AlbumImageModal({ isOpen, onClose, album }: AlbumImageModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch album images
  const { data: albumImages = [], isLoading } = useQuery<AlbumImage[]>({
    queryKey: ["/api/albums", album?.id, "images"],
    enabled: !!album?.id && isOpen,
  });

  // Delete album image mutation
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) =>
      fetch(`/api/albums/images/${imageId}`, {
        method: "DELETE",
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete image');
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/albums", album?.id, "images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  // Add album image mutation
  const addImageMutation = useMutation({
    mutationFn: (imageData: InsertAlbumImage) =>
      fetch(`/api/albums/${album?.id}/images`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageData),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to add image');
        return res.json();
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/albums", album?.id, "images"] });
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
    },
    onError: (error) => {
      console.error('Add image error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to add image to album",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (files: FileList) => {
    if (!album || files.length === 0) return;
    
    setIsUploading(true);
    const successfulUploads: UploadedFile[] = [];
    let totalFiles = files.length;
    let validFiles = 0;
    let uploadErrors = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type and size
        if (!validateImageFile(file)) {
          uploadErrors++;
          toast({
            title: "Invalid File",
            description: `${file.name} - Please upload a valid image file (JPG, JPEG, PNG, WEBP) under 10MB.`,
            variant: "destructive",
          });
          continue;
        }

        validFiles++;

        try {
          // Upload file using the existing upload system
          const uploadedFile = await uploadFile(file);
          successfulUploads.push(uploadedFile);

          // Create album image entry
          const imageData: InsertAlbumImage = {
            albumId: album.id,
            imageUrl: uploadedFile.url,
            description: `Image ${albumImages.length + successfulUploads.length}`,
            order: albumImages.length + successfulUploads.length,
          };

          await addImageMutation.mutateAsync(imageData);
        } catch (error) {
          uploadErrors++;
          console.error('Upload error for file:', file.name, error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
          });
        }
      }

      // Update uploaded files state
      setUploadedFiles(prev => [...prev, ...successfulUploads]);

      // Show success message
      if (successfulUploads.length > 0) {
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${successfulUploads.length} image${successfulUploads.length > 1 ? 's' : ''} to the album.`,
        });
      }

      // Show summary if there were issues
      if (uploadErrors > 0) {
        toast({
          title: "Upload Summary",
          description: `${successfulUploads.length} successful, ${uploadErrors} failed out of ${totalFiles} files.`,
          variant: uploadErrors === totalFiles ? "destructive" : "default",
        });
      }

    } catch (error) {
      console.error('General upload error:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (imageId: number) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImageMutation.mutate(imageId);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  if (!album) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#0B1120]/95 border-emerald-500/30 backdrop-blur-md text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-green-400 flex items-center gap-3">
            <ImageIcon className="w-6 h-6" />
            Manage Album: {album.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div 
            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
              isDragging 
                ? 'bg-green-800/40 border-green-400 border-dashed' 
                : 'bg-green-900/20 border-green-500/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div>
              <h3 className="text-lg font-semibold text-green-300">Add New Images</h3>
              <p className="text-sm text-green-300/70">
                {isDragging 
                  ? "Drop your images here..." 
                  : "Upload multiple images or drag & drop"
                }
              </p>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                data-testid="file-input-album-images"
              />
              <Button
                onClick={handleUploadClick}
                disabled={isUploading}
                className={`bg-green-600 hover:bg-green-700 text-white transition-all ${
                  isDragging ? 'scale-105' : ''
                }`}
                data-testid="button-upload-images"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isUploading ? "Uploading..." : "Upload Images"}
              </Button>
            </div>
          </div>

          {/* Album Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <img 
              src={album.thumbnailUrl} 
              alt={album.title}
              className="w-16 h-16 object-cover rounded-lg border border-gray-600"
            />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-300">{album.title}</h4>
              <p className="text-sm text-gray-400">{album.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-green-400 border-green-500">
                  {albumImages.length} Images
                </Badge>
                <Badge variant="outline" className="text-blue-400 border-blue-500">
                  ${album.price}
                </Badge>
              </div>
            </div>
          </div>

          {/* Images Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-300">
                Album Images ({albumImages.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-800/50 rounded-lg animate-pulse border border-gray-700"
                  />
                ))}
              </div>
            ) : albumImages.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-12 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No Images Yet</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Upload your first images to get started
                  </p>
                  <Button 
                    onClick={handleUploadClick} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Images
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence>
                  {albumImages
                    .sort((a, b) => a.order - b.order)
                    .map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="group relative"
                      >
                        <Card className="overflow-hidden bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all duration-200">
                          <CardContent className="p-0">
                            <div className="relative aspect-square">
                              <img
                                src={image.imageUrl}
                                alt={image.description || `Image ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              
                              {/* Overlay with delete button */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteImage(image.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  data-testid={`button-delete-image-${image.id}`}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>

                              {/* Image number badge */}
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-gray-900/80 text-white text-xs">
                                  #{index + 1}
                                </Badge>
                              </div>
                            </div>

                            {/* Image description */}
                            {image.description && (
                              <div className="p-3">
                                <p className="text-xs text-gray-400 truncate">
                                  {image.description}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Total: {albumImages.length} images
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-400 hover:bg-gray-700"
                data-testid="button-close-modal"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}