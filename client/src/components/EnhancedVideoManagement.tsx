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
import { FileUpload, ImagePreview, VideoPreview } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Video as VideoIcon, 
  Play,
  Save,
  Eye,
  Clock,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Video, InsertVideo, Profile } from "@shared/schema";
import { priceCategories, getPriceLabelFromCategory, type UploadedFile } from "@/lib/fileUpload";

interface EnhancedVideoManagementProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedVideoManagement({ isOpen, onOpenChange }: EnhancedVideoManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<InsertVideo>>({
    title: "",
    description: "",
    thumbnailUrl: "",
    videoUrl: "",
    price: "0",
    priceCategory: "free",
    duration: "",
    isFeatured: false,
    profileId: undefined
  });
  
  const [thumbnailFile, setThumbnailFile] = useState<UploadedFile | null>(null);
  const [videoFile, setVideoFile] = useState<UploadedFile | null>(null);

  // Fetch videos
  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    enabled: isOpen,
  });

  // Fetch profiles
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
    enabled: isOpen,
  });

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: async (data: InsertVideo) => {
      return apiRequest("/api/videos", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create video",
        variant: "destructive",
      });
    },
  });

  // Update video mutation
  const updateVideoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertVideo> }) =>
      apiRequest(`/api/videos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      resetForm();
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      });
    },
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/videos/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      thumbnailUrl: "",
      videoUrl: "",
      price: "0",
      priceCategory: "free",
      duration: "",
      isFeatured: false,
      profileId: undefined
    });
    setThumbnailFile(null);
    setVideoFile(null);
    setSelectedVideo(null);
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

  const handleVideoUpload = (files: UploadedFile[]) => {
    if (files.length > 0) {
      const file = files[0];
      setVideoFile(file);
      setFormData(prev => ({
        ...prev,
        videoUrl: file.url
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !thumbnailFile || !videoFile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload both thumbnail and video",
        variant: "destructive",
      });
      return;
    }

    const videoData: InsertVideo = {
      title: formData.title!,
      description: formData.description!,
      thumbnailUrl: thumbnailFile.url,
      videoUrl: videoFile.url,
      price: priceCategories.find(p => p.value === formData.priceCategory)?.price.toString() || "0",
      priceCategory: formData.priceCategory!,
      duration: formData.duration || "",
      isFeatured: formData.isFeatured || false,
      profileId: formData.profileId,
    };

    if (selectedVideo) {
      updateVideoMutation.mutate({ id: selectedVideo.id, data: videoData });
    } else {
      createVideoMutation.mutate(videoData);
    }
  };

  const openEditDialog = (video: Video) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      price: video.price,
      priceCategory: video.priceCategory,
      duration: video.duration || "",
      isFeatured: video.isFeatured,
      profileId: video.profileId || undefined
    });
    setThumbnailFile({ 
      id: 'existing', 
      name: 'thumbnail', 
      type: 'image/jpeg', 
      size: 0, 
      url: video.thumbnailUrl 
    });
    setVideoFile({ 
      id: 'existing', 
      name: 'video', 
      type: 'video/mp4', 
      size: 0, 
      url: video.videoUrl 
    });
    setIsEditDialogOpen(true);
  };

  const openPreviewDialog = (video: Video) => {
    setSelectedVideo(video);
    setIsPreviewDialogOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-green-400 text-xl">
            Enhanced Video Management
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
              Create New Video
            </Button>
          </div>

          {/* Videos Grid */}
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
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-gray-800 border-gray-700 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <ImagePreview
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-32"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className={
                            video.priceCategory === 'free' 
                              ? 'bg-green-600' 
                              : 'bg-yellow-600'
                          }>
                            {getPriceLabelFromCategory(video.priceCategory)}
                          </Badge>
                        </div>
                        {video.isFeatured && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-purple-600">Featured</Badge>
                          </div>
                        )}
                        {video.duration && (
                          <div className="absolute bottom-2 left-2">
                            <Badge className="bg-black/60 text-white">
                              {video.duration}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-green-400 truncate">
                          {video.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {video.description}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(video)}
                            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPreviewDialog(video)}
                            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteVideoMutation.mutate(video.id)}
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

        {/* Add/Edit Video Dialog */}
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
                {selectedVideo ? 'Edit Video' : 'Create New Video'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label className="text-green-400">Video Title *</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter video title"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-green-400">Description *</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter video description"
                    className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-green-400">Duration</Label>
                  <Input
                    value={formData.duration || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 5:30, 10 min"
                    className="bg-gray-800 border-gray-700 text-white"
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
                  <Label className="text-green-400">Featured Video</Label>
                </div>
              </div>

              {/* Right Column - File Uploads */}
              <div className="space-y-6">
                <div>
                  <Label className="text-green-400 mb-3 block">Video Upload * (MP4)</Label>
                  <FileUpload
                    onUpload={handleVideoUpload}
                    accept="video"
                    multiple={false}
                    className="border-blue-600"
                  />
                  {videoFile && (
                    <div className="mt-3">
                      <VideoPreview
                        src={videoFile.url}
                        poster={thumbnailFile?.url}
                        className="w-full h-48"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-green-400 mb-3 block">Thumbnail Upload * (Image)</Label>
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
                disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {selectedVideo ? 'Update Video' : 'Create Video'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-green-400">
                Video Preview: {selectedVideo?.title}
              </DialogTitle>
            </DialogHeader>

            {selectedVideo && (
              <div className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-0">
                    <VideoPreview
                      src={selectedVideo.videoUrl}
                      poster={selectedVideo.thumbnailUrl}
                      className="w-full h-64"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-green-400">
                        {selectedVideo.title}
                      </h2>
                      
                      <div className="flex gap-3">
                        <Badge className={
                          selectedVideo.priceCategory === 'free' 
                            ? 'bg-green-600' 
                            : 'bg-yellow-600'
                        }>
                          {getPriceLabelFromCategory(selectedVideo.priceCategory)}
                        </Badge>
                        {selectedVideo.isFeatured && (
                          <Badge className="bg-purple-600">Featured</Badge>
                        )}
                        {selectedVideo.duration && (
                          <Badge variant="outline" className="border-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            {selectedVideo.duration}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-300 leading-relaxed">
                        {selectedVideo.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

export default EnhancedVideoManagement;