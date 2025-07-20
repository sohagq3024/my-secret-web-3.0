import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUpload, ImagePreview } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Album as AlbumIcon, 
  Image as ImageIcon,
  Save,
  Eye,
  Upload,
  X,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Album, InsertAlbum, AlbumImage, InsertAlbumImage, Profile } from "@shared/schema";
import { priceCategories, getPriceLabelFromCategory, type UploadedFile } from "@/lib/fileUpload";

interface EnhancedAlbumManagementProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedAlbumManagement({ isOpen, onOpenChange }: EnhancedAlbumManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<InsertAlbum>>({
    title: "",
    description: "",
    thumbnailUrl: "",
    price: "0",
    priceCategory: "free",
    imageCount: 0,
    isFeatured: false,
    profileId: undefined
  });
  
  const [thumbnailFile, setThumbnailFile] = useState<UploadedFile | null>(null);
  const [albumImages, setAlbumImages] = useState<Array<UploadedFile & { description?: string }>>([]);

  // Fetch albums
  const { data: albums = [], isLoading } = useQuery<Album[]>({
    queryKey: ["/api/albums"],
    enabled: isOpen,
  });

  // Fetch profiles
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
    enabled: isOpen,
  });

  // Fetch album images for selected album
  const { data: currentAlbumImages = [] } = useQuery<AlbumImage[]>({
    queryKey: ["/api/albums", selectedAlbum?.id, "images"],
    enabled: selectedAlbum !== null,
  });

  // Create album mutation
  const createAlbumMutation = useMutation({
    mutationFn: async (data: InsertAlbum) => {
      return apiRequest("/api/albums", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (newAlbum: Album) => {
      toast({
        title: "Success",
        description: "Album created successfully",
      });
      
      // Add images if any
      if (albumImages.length > 0) {
        addImagesToAlbum(newAlbum.id);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create album",
        variant: "destructive",
      });
    },
  });

  // Update album mutation
  const updateAlbumMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertAlbum> }) =>
      apiRequest(`/api/albums/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Album updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
      resetForm();
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update album",
        variant: "destructive",
      });
    },
  });

  // Delete album mutation
  const deleteAlbumMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/albums/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Album deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete album",
        variant: "destructive",
      });
    },
  });

  // Add album image mutation
  const addAlbumImageMutation = useMutation({
    mutationFn: ({ albumId, imageData }: { albumId: number; imageData: InsertAlbumImage }) =>
      apiRequest(`/api/albums/${albumId}/images`, {
        method: "POST",
        body: JSON.stringify(imageData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
    },
  });

  const addImagesToAlbum = async (albumId: number) => {
    for (let i = 0; i < albumImages.length; i++) {
      const image = albumImages[i];
      const imageData: InsertAlbumImage = {
        albumId,
        imageUrl: image.url,
        description: image.description || "",
        order: i + 1,
      };
      
      try {
        await addAlbumImageMutation.mutateAsync({ albumId, imageData });
      } catch (error) {
        console.error("Failed to add image:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      thumbnailUrl: "",
      price: "0",
      priceCategory: "free",
      imageCount: 0,
      isFeatured: false,
      profileId: undefined
    });
    setThumbnailFile(null);
    setAlbumImages([]);
    setSelectedAlbum(null);
  };

  const handleThumbnailUpload = (files: UploadedFile[]) => {
    if (files.length > 0) {
      const file = files[0];
      setThumbnailFile(file);
      setFormData(prev => ({
        ...prev,
        thumbnailUrl: file.url
      }));
    }
  };

  const handleAlbumImagesUpload = (files: UploadedFile[]) => {
    const newImages = files.map(file => ({
      ...file,
      description: ""
    }));
    setAlbumImages(prev => [...prev, ...newImages]);
    setFormData(prev => ({
      ...prev,
      imageCount: albumImages.length + newImages.length
    }));
  };

  const removeAlbumImage = (imageId: string) => {
    setAlbumImages(prev => prev.filter(img => img.id !== imageId));
    setFormData(prev => ({
      ...prev,
      imageCount: albumImages.filter(img => img.id !== imageId).length
    }));
  };

  const updateImageDescription = (imageId: string, description: string) => {
    setAlbumImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, description } : img
    ));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !thumbnailFile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload a thumbnail",
        variant: "destructive",
      });
      return;
    }

    const albumData: InsertAlbum = {
      title: formData.title!,
      description: formData.description!,
      thumbnailUrl: thumbnailFile.url,
      price: priceCategories.find(p => p.value === formData.priceCategory)?.price.toString() || "0",
      priceCategory: formData.priceCategory!,
      imageCount: albumImages.length,
      isFeatured: formData.isFeatured || false,
      profileId: formData.profileId,
    };

    if (selectedAlbum) {
      updateAlbumMutation.mutate({ id: selectedAlbum.id, data: albumData });
    } else {
      createAlbumMutation.mutate(albumData);
    }
  };

  const openEditDialog = (album: Album) => {
    setSelectedAlbum(album);
    setFormData({
      title: album.title,
      description: album.description,
      thumbnailUrl: album.thumbnailUrl,
      price: album.price,
      priceCategory: album.priceCategory,
      imageCount: album.imageCount,
      isFeatured: album.isFeatured,
      profileId: album.profileId || undefined
    });
    setThumbnailFile({ 
      id: 'existing', 
      name: 'thumbnail', 
      type: 'image/jpeg', 
      size: 0, 
      url: album.thumbnailUrl 
    });
    setIsEditDialogOpen(true);
  };

  const openContentDialog = (album: Album) => {
    setSelectedAlbum(album);
    setIsContentDialogOpen(true);
  };

  const openPreviewDialog = (album: Album) => {
    setSelectedAlbum(album);
    setIsPreviewDialogOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-green-400 text-xl">
            Enhanced Album Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Album
            </Button>
          </div>

          {/* Albums Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {albums.map((album) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-gray-800 border-gray-700 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <ImagePreview
                          src={album.thumbnailUrl}
                          alt={album.title}
                          className="w-full h-32"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className={
                            album.priceCategory === 'free' 
                              ? 'bg-green-600' 
                              : 'bg-yellow-600'
                          }>
                            {getPriceLabelFromCategory(album.priceCategory)}
                          </Badge>
                        </div>
                        {album.isFeatured && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-purple-600">Featured</Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-green-400 truncate">
                          {album.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {album.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          {album.imageCount} images
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(album)}
                            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openContentDialog(album)}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Content
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPreviewDialog(album)}
                            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteAlbumMutation.mutate(album.id)}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Add/Edit Album Dialog */}
        <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-green-400">
                {selectedAlbum ? 'Edit Album' : 'Create New Album'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-green-400">Album Title *</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter album title"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-green-400">Description *</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter album description"
                    className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-green-400">Price Category</Label>
                  <Select
                    value={formData.priceCategory}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priceCategory: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select price category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {priceCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-green-400">Link to Profile</Label>
                  <Select
                    value={formData.profileId?.toString() || ""}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      profileId: value ? parseInt(value) : undefined 
                    }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select profile (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id.toString()}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isFeatured || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                  <Label className="text-green-400">Featured Album</Label>
                </div>
              </div>

              {/* Right Column - File Uploads */}
              <div className="space-y-6">
                <div>
                  <Label className="text-green-400 mb-3 block">Thumbnail Upload *</Label>
                  <FileUpload
                    onUpload={handleThumbnailUpload}
                    accept="image"
                    multiple={false}
                    className="border-green-600"
                  />
                  {thumbnailFile && (
                    <div className="mt-3">
                      <ImagePreview
                        src={thumbnailFile.url}
                        alt="Thumbnail preview"
                        className="w-full h-32"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-green-400 mb-3 block">Album Images (Max 6)</Label>
                  <FileUpload
                    onUpload={handleAlbumImagesUpload}
                    accept="image"
                    multiple={true}
                    maxFiles={6}
                    className="border-blue-600"
                  />
                  
                  {albumImages.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <Label className="text-blue-400">Uploaded Images ({albumImages.length})</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {albumImages.map((image) => (
                          <div key={image.id} className="space-y-2">
                            <div className="relative">
                              <ImagePreview
                                src={image.url}
                                alt={image.name}
                                className="w-full h-20"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeAlbumImage(image.id)}
                                className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-600 hover:bg-red-700"
                              >
                                <X className="h-3 w-3 text-white" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Image description"
                              value={image.description || ""}
                              onChange={(e) => updateImageDescription(image.id, e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
                className="border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createAlbumMutation.isPending || updateAlbumMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {selectedAlbum ? 'Update Album' : 'Create Album'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Content Management Dialog */}
        <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-green-400">
                Manage Album Content: {selectedAlbum?.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {currentAlbumImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currentAlbumImages
                    .sort((a, b) => a.order - b.order)
                    .map((image) => (
                      <Card key={image.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-3">
                          <ImagePreview
                            src={image.imageUrl}
                            alt={image.description || `Image ${image.order}`}
                            className="w-full h-32 mb-2"
                          />
                          <p className="text-xs text-gray-400 truncate">
                            {image.description || `Image ${image.order}`}
                          </p>
                          <div className="flex gap-1 mt-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs text-red-400">
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No images in this album yet.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-green-400">
                Album Preview: {selectedAlbum?.title}
              </DialogTitle>
            </DialogHeader>

            {selectedAlbum && (
              <div className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-1/3">
                        <ImagePreview
                          src={selectedAlbum.thumbnailUrl}
                          alt={selectedAlbum.title}
                          className="w-full h-48"
                        />
                      </div>
                      <div className="w-2/3 space-y-3">
                        <h2 className="text-2xl font-bold text-green-400">
                          {selectedAlbum.title}
                        </h2>
                        <p className="text-gray-300">
                          {selectedAlbum.description}
                        </p>
                        <div className="flex gap-2">
                          <Badge className={
                            selectedAlbum.priceCategory === 'free' 
                              ? 'bg-green-600' 
                              : 'bg-yellow-600'
                          }>
                            {getPriceLabelFromCategory(selectedAlbum.priceCategory)}
                          </Badge>
                          {selectedAlbum.isFeatured && (
                            <Badge className="bg-purple-600">Featured</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {selectedAlbum.imageCount} images
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {currentAlbumImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentAlbumImages
                      .sort((a, b) => a.order - b.order)
                      .map((image) => (
                        <Card key={image.id} className="bg-gray-800 border-gray-700">
                          <CardContent className="p-2">
                            <ImagePreview
                              src={image.imageUrl}
                              alt={image.description || `Image ${image.order}`}
                              className="w-full h-32"
                            />
                            {image.description && (
                              <p className="text-xs text-gray-400 mt-2 truncate">
                                {image.description}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

export default EnhancedAlbumManagement;