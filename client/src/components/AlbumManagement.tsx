import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
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
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Album, InsertAlbum, AlbumImage, InsertAlbumImage, Profile } from "@shared/schema";
import { UploadedFile, priceCategories, getPriceLabelFromCategory } from "@/lib/fileUpload";

interface AlbumManagementProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlbumManagement({ isOpen, onOpenChange }: AlbumManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertAlbum>>({});
  const [thumbnailFiles, setThumbnailFiles] = useState<UploadedFile[]>([]);
  const [albumImages, setAlbumImages] = useState<UploadedFile[]>([]);

  // Fetch albums
  const { data: albums = [], isLoading } = useQuery<Album[]>({
    queryKey: ["/api/albums"],
    enabled: isOpen,
  });

  // Fetch profiles for linking
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
    enabled: isOpen,
  });

  // Fetch album images
  const { data: currentAlbumImages = [] } = useQuery<AlbumImage[]>({
    queryKey: ["/api/albums", selectedAlbum?.id, "images"],
    enabled: selectedAlbum !== null,
  });

  // Create album mutation
  const createAlbumMutation = useMutation({
    mutationFn: (data: InsertAlbum) => apiRequest("/api/albums", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Album created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
      setIsAddDialogOpen(false);
      resetForm();
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
      setIsEditDialogOpen(false);
      resetForm();
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
    mutationFn: (id: number) => apiRequest(`/api/albums/${id}`, {
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
    mutationFn: (data: InsertAlbumImage) => 
      apiRequest(`/api/albums/${data.albumId}/images`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Album image added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/albums", selectedAlbum?.id, "images"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add album image",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({});
    setThumbnailFiles([]);
    setAlbumImages([]);
    setSelectedAlbum(null);
  };

  const handleThumbnailUpload = (files: UploadedFile[]) => {
    setThumbnailFiles(files);
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, thumbnailUrl: files[0].url }));
    }
  };

  const handleAlbumImagesUpload = (files: UploadedFile[]) => {
    setAlbumImages(prev => [...prev, ...files]);
  };

  const handleRemoveAlbumImage = (index: number) => {
    setAlbumImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.thumbnailUrl || !formData.priceCategory) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload a thumbnail",
        variant: "destructive",
      });
      return;
    }

    const albumData: InsertAlbum = {
      title: formData.title,
      description: formData.description,
      thumbnailUrl: formData.thumbnailUrl,
      price: (priceCategories.find(c => c.value === formData.priceCategory)?.price || 0).toString(),
      priceCategory: formData.priceCategory,
      imageCount: albumImages.length,
      isFeatured: formData.isFeatured || false,
      profileId: formData.profileId || null,
    };

    if (selectedAlbum) {
      updateAlbumMutation.mutate({ id: selectedAlbum.id, data: albumData });
    } else {
      createAlbumMutation.mutate(albumData);
    }
  };

  const handleSaveAlbumImages = async () => {
    if (!selectedAlbum) return;

    for (let i = 0; i < albumImages.length; i++) {
      const image = albumImages[i];
      const imageData: InsertAlbumImage = {
        albumId: selectedAlbum.id,
        imageUrl: image.url,
        description: `Image ${i + 1}`,
        order: i + 1,
      };
      
      await addAlbumImageMutation.mutateAsync(imageData);
    }

    setAlbumImages([]);
    setIsContentDialogOpen(false);
  };

  const handleEdit = (album: Album) => {
    setSelectedAlbum(album);
    setFormData(album);
    setThumbnailFiles([{
      url: album.thumbnailUrl,
      fileName: "thumbnail",
      fileSize: 0,
      fileType: "image/jpeg"
    }]);
    setIsEditDialogOpen(true);
  };

  const handleAddContent = (album: Album) => {
    setSelectedAlbum(album);
    setAlbumImages([]);
    setIsContentDialogOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlbumIcon className="w-5 h-5" />
            Album Management
          </CardTitle>
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Album
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading albums...</div>
        ) : albums.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No albums found. Create your first album to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map((album) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img 
                      src={album.thumbnailUrl} 
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{album.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{album.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {getPriceLabelFromCategory(album.priceCategory)}
                        </Badge>
                        <Badge variant="secondary">
                          {album.imageCount} images
                        </Badge>
                        {album.isFeatured && (
                          <Badge variant="default">Featured</Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(album)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddContent(album)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Content
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAlbumMutation.mutate(album.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Album Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Album</DialogTitle>
              <DialogDescription>
                Create a new album with thumbnail upload and pricing options.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Album Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter album title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceCategory">Price Category *</Label>
                  <Select value={formData.priceCategory || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, priceCategory: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select price category" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Album Thumbnail *</Label>
                <FileUpload
                  accept="image"
                  onUpload={handleThumbnailUpload}
                  maxFiles={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the album content"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile">Link to Profile (Optional)</Label>
                  <Select value={formData.profileId?.toString() || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, profileId: value ? parseInt(value) : null }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No profile</SelectItem>
                      {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id.toString()}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="featured"
                    checked={formData.isFeatured || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                  <Label htmlFor="featured">Featured Album</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={createAlbumMutation.isPending}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createAlbumMutation.isPending ? "Creating..." : "Create Album"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Album Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Album</DialogTitle>
              <DialogDescription>
                Update album information and thumbnail.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Album Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter album title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priceCategory">Price Category *</Label>
                  <Select value={formData.priceCategory || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, priceCategory: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select price category" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Album Thumbnail *</Label>
                <FileUpload
                  accept="image"
                  onUpload={handleThumbnailUpload}
                  maxFiles={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the album content"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-profile">Link to Profile (Optional)</Label>
                  <Select value={formData.profileId?.toString() || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, profileId: value ? parseInt(value) : null }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No profile</SelectItem>
                      {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id.toString()}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="edit-featured"
                    checked={formData.isFeatured || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                  <Label htmlFor="edit-featured">Featured Album</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={updateAlbumMutation.isPending}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateAlbumMutation.isPending ? "Updating..." : "Update Album"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Content Dialog */}
        <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Album Content</DialogTitle>
              <DialogDescription>
                Upload multiple images to this album. Each image can have a description.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Album Images (Upload up to 6 images)</Label>
                <FileUpload
                  accept="image"
                  multiple
                  onUpload={handleAlbumImagesUpload}
                  maxFiles={6}
                />
              </div>

              {/* Show current album images */}
              {currentAlbumImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Album Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentAlbumImages.map((image, index) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="aspect-square bg-muted">
                          <img 
                            src={image.imageUrl} 
                            alt={image.description || `Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-2">
                          <p className="text-xs text-muted-foreground">
                            {image.description || `Image ${index + 1}`}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveAlbumImages}
                  disabled={albumImages.length === 0 || addAlbumImageMutation.isPending}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {addAlbumImageMutation.isPending ? "Uploading..." : `Upload ${albumImages.length} Images`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsContentDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default AlbumManagement;