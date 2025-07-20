import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  Clock, 
  DollarSign, 
  Check, 
  X,
  UserCheck,
  Mail,
  Settings,
  Image,
  Video,
  User,
  LogOut,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Play,
  Star,
  Album,
  Save,
  AlertCircle,
  Shield,
  Database,
  FileText,
  ImagePlus,
  Eye
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MembershipRequest, Celebrity, Album as AlbumType, Video as VideoType, SlideshowImage, Profile } from "@shared/schema";
import { EnhancedAlbumManagement } from "./EnhancedAlbumManagement";
import { EnhancedVideoManagement } from "./EnhancedVideoManagement";
import { AlbumManagement } from "./AlbumManagement";
import { uploadFile, validateImageFile, UploadedFile } from "@/lib/fileUpload";

export function AdminPanel() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isProfileManagementOpen, setIsProfileManagementOpen] = useState(false);
  const [isAlbumManagementOpen, setIsAlbumManagementOpen] = useState(false);
  const [isEnhancedAlbumManagementOpen, setIsEnhancedAlbumManagementOpen] = useState(false);
  const [isEnhancedVideoManagementOpen, setIsEnhancedVideoManagementOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploadedImage, setUploadedImage] = useState<UploadedFile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data queries
  const { data: membershipRequests = [], isLoading: requestsLoading } = useQuery<(MembershipRequest & { user: any })[]>({
    queryKey: ["/api/membership/requests"],
  });

  const { data: celebrities = [], isLoading: celebritiesLoading } = useQuery<Celebrity[]>({
    queryKey: ["/api/celebrities"],
  });

  const { data: albums = [], isLoading: albumsLoading } = useQuery<AlbumType[]>({
    queryKey: ["/api/albums"],
  });

  const { data: videos = [], isLoading: videosLoading } = useQuery<VideoType[]>({
    queryKey: ["/api/videos"],
  });

  const { data: slideshowImages = [], isLoading: slideshowLoading } = useQuery<SlideshowImage[]>({
    queryKey: ["/api/slideshow"],
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/membership/requests/${id}/status`, { status });
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/membership/requests"] });
      toast({
        title: "Success",
        description: `Membership request ${status} successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Generic CRUD mutations
  const createMutation = useMutation({
    mutationFn: async ({ endpoint, data }: { endpoint: string; data: any }) => {
      return apiRequest("POST", endpoint, data);
    },
    onSuccess: (_, { endpoint }) => {
      queryClient.invalidateQueries({ queryKey: [endpoint.replace("/admin", "")] });
      setIsAddDialogOpen(false);
      setFormData({});
      toast({
        title: "Success",
        description: "Item created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ endpoint, id, data }: { endpoint: string; id: number; data: any }) => {
      return apiRequest("PATCH", `${endpoint}/${id}`, data);
    },
    onSuccess: (_, { endpoint }) => {
      queryClient.invalidateQueries({ queryKey: [endpoint.replace("/admin", "")] });
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      setFormData({});
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ endpoint, id }: { endpoint: string; id: number }) => {
      return apiRequest("DELETE", `${endpoint}/${id}`);
    },
    onSuccess: (_, { endpoint }) => {
      queryClient.invalidateQueries({ queryKey: [endpoint.replace("/admin", "")] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleCreate = (endpoint: string, data: any) => {
    createMutation.mutate({ endpoint, data });
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData(item);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (endpoint: string, id: number, data: any) => {
    updateMutation.mutate({ endpoint, id, data });
  };

  const handleDelete = (endpoint: string, id: number) => {
    deleteMutation.mutate({ endpoint, id });
  };

  const resetForm = () => {
    setFormData({});
    setSelectedItem(null);
    setUploadedImage(null);
    setImagePreview(null);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  // Image upload handlers
  const handleImageUpload = async (file: File) => {
    if (!validateImageFile(file)) {
      toast({
        title: "Invalid file",
        description: "Please upload a valid image file (JPG, JPEG, PNG, WEBP) under 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const uploadedFile = await uploadFile(file);
      setUploadedImage(uploadedFile);
      setImagePreview(uploadedFile.preview || uploadedFile.url);
      setFormData({ ...formData, imageUrl: uploadedFile.url });
      
      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Stats calculations
  const pendingRequests = membershipRequests.filter(req => req.status === "pending");
  const approvedRequests = membershipRequests.filter(req => req.status === "approved");
  const totalRevenue = membershipRequests
    .filter(req => req.status === "approved")
    .reduce((sum, req) => sum + parseFloat(req.price), 0);

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-64 bg-card/30 backdrop-blur-sm border-r border-green-500/20 shadow-lg"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-primary mb-8 neon-text">Admin Panel</h2>
            
            <nav className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("dashboard")}
                className={`admin-nav-item w-full ${
                  activeTab === "dashboard" ? "active" : ""
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Dashboard
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("requests")}
                className={`admin-nav-item w-full ${
                  activeTab === "requests" ? "active" : ""
                }`}
              >
                <Mail className="w-5 h-5 mr-3" />
                Requests
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingRequests.length}
                  </Badge>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("slideshow")}
                className={`admin-nav-item w-full ${
                  activeTab === "slideshow" ? "active" : ""
                }`}
              >
                <Image className="w-5 h-5 mr-3" />
                Slideshow
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("profiles")}
                className={`admin-nav-item w-full ${
                  activeTab === "profiles" ? "active" : ""
                }`}
              >
                <Users className="w-5 h-5 mr-3" />
                Profiles
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("celebrities")}
                className={`admin-nav-item w-full ${
                  activeTab === "celebrities" ? "active" : ""
                }`}
              >
                <User className="w-5 h-5 mr-3" />
                Celebrities
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("albums")}
                className={`admin-nav-item w-full ${
                  activeTab === "albums" ? "active" : ""
                }`}
              >
                <Album className="w-5 h-5 mr-3" />
                Albums
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("videos")}
                className={`admin-nav-item w-full ${
                  activeTab === "videos" ? "active" : ""
                }`}
              >
                <Video className="w-5 h-5 mr-3" />
                Videos
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab("settings")}
                className={`admin-nav-item w-full ${
                  activeTab === "settings" ? "active" : ""
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </motion.button>
            </nav>
          </div>
          
          <div className="absolute bottom-0 w-64 p-6">
            <div className="text-sm text-muted-foreground mb-4">
              Logged in as: {user?.firstName} {user?.lastName}
            </div>
            <Button
              onClick={logout}
              variant="destructive"
              className="w-full admin-button-danger"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === "dashboard" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="stats-card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold text-foreground">
                          {membershipRequests.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Users className="text-primary h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="stats-card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Members</p>
                        <p className="text-2xl font-bold text-foreground">
                          {approvedRequests.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <UserCheck className="text-green-400 h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="stats-card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Requests</p>
                        <p className="text-2xl font-bold text-foreground">
                          {pendingRequests.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <Clock className="text-yellow-400 h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="stats-card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold text-foreground">
                          ${totalRevenue.toFixed(2)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-blue-400 h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Additional Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="stats-card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Content</p>
                        <p className="text-2xl font-bold text-foreground">
                          {celebrities.length + albums.length + videos.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Star className="text-purple-400 h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="stats-card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Celebrities</p>
                        <p className="text-2xl font-bold text-foreground">
                          {celebrities.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        <User className="text-pink-400 h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="stats-card"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Albums & Videos</p>
                        <p className="text-2xl font-bold text-foreground">
                          {albums.length + videos.length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Play className="text-cyan-400 h-6 w-6" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "requests" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-foreground mb-8">Membership Requests</h1>
                
                <Card className="glow-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Pending Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {requestsLoading ? (
                      <div className="text-center py-8">Loading requests...</div>
                    ) : pendingRequests.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No pending requests
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-green-500/20">
                              <th className="text-left p-4 text-foreground">User</th>
                              <th className="text-left p-4 text-foreground">Plan</th>
                              <th className="text-left p-4 text-foreground">Amount</th>
                              <th className="text-left p-4 text-foreground">Date</th>
                              <th className="text-left p-4 text-foreground">Payment Method</th>
                              <th className="text-left p-4 text-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingRequests.map((request) => (
                              <motion.tr 
                                key={request.id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-green-500/10 hover:bg-green-500/5"
                              >
                                <td className="p-4">
                                  <div>
                                    <div className="font-medium text-foreground">
                                      {request.user?.firstName} {request.user?.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {request.user?.email}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline" className="border-green-500/50">
                                    {request.plan.replace("-", " ")}
                                  </Badge>
                                </td>
                                <td className="p-4 text-foreground">${request.price}</td>
                                <td className="p-4">
                                  <div className="flex items-center text-muted-foreground">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                                    {request.paymentMethod}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateStatus(request.id, "approved")}
                                      className="admin-button"
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateStatus(request.id, "rejected")}
                                      className="admin-button-danger"
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Slideshow Management */}
            {activeTab === "slideshow" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-foreground">Slideshow Management</h1>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="admin-button">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Image
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-green-500/20 max-w-md sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Add Slideshow Image</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Image Upload Section */}
                        <div className="space-y-4">
                          <Label className="text-foreground font-medium">Upload Image</Label>
                          
                          {/* File Upload Area */}
                          <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                              isDragging 
                                ? "border-green-500 bg-green-500/10" 
                                : "border-gray-300 hover:border-green-400 hover:bg-green-400/5"
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={triggerFileInput}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                            
                            {imagePreview ? (
                              <div className="space-y-4">
                                <div className="relative">
                                  <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                  <div className="absolute top-2 right-2">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setImagePreview(null);
                                        setUploadedImage(null);
                                        setFormData({...formData, imageUrl: ""});
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <ImagePlus className="w-12 h-12 mx-auto text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Drop your image here or click to browse
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Supports JPG, JPEG, PNG, WEBP (Max 10MB)
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-foreground">Title</Label>
                            <Input
                              className="cyber-input"
                              placeholder="Image title"
                              value={formData.title || ""}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label className="text-foreground">Subtitle</Label>
                            <Input
                              className="cyber-input"
                              placeholder="Image subtitle"
                              value={formData.subtitle || ""}
                              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label className="text-foreground">Display Order</Label>
                            <Input
                              className="cyber-input"
                              type="number"
                              placeholder="1"
                              value={formData.order || ""}
                              onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" onClick={resetForm}>Cancel</Button>
                          <Button 
                            className="admin-button"
                            onClick={() => handleCreate("/api/admin/slideshow", formData)}
                            disabled={!imagePreview || !formData.title}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Add Image
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {slideshowImages.map((image) => (
                    <motion.div
                      key={image.id}
                      whileHover={{ scale: 1.02 }}
                      className="glow-card"
                    >
                      <img 
                        src={image.imageUrl} 
                        alt={image.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-lg font-semibold text-foreground mb-2">{image.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{image.subtitle}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="border-green-500/50">
                          Order: {image.order}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(image)}
                            className="border-green-500/50 hover:bg-green-500/20"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete("/api/admin/slideshow", image.id)}
                            className="admin-button-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Celebrity Management */}
            {activeTab === "celebrities" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-foreground">Celebrity Management</h1>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="admin-button">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Celebrity
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-green-500/20">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Add Celebrity</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-foreground">Name</Label>
                          <Input
                            className="cyber-input"
                            placeholder="Celebrity name"
                            value={formData.name || ""}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Profession</Label>
                          <Input
                            className="cyber-input"
                            placeholder="Model, Actor, etc."
                            value={formData.profession || ""}
                            onChange={(e) => setFormData({...formData, profession: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Image URL</Label>
                          <Input
                            className="cyber-input"
                            placeholder="https://example.com/image.jpg"
                            value={formData.imageUrl || ""}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Description</Label>
                          <Textarea
                            className="cyber-input"
                            placeholder="Brief description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Price ($)</Label>
                          <Input
                            className="cyber-input"
                            type="number"
                            placeholder="25.00"
                            value={formData.price || ""}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.isFree || false}
                            onCheckedChange={(checked) => setFormData({...formData, isFree: checked})}
                          />
                          <Label className="text-foreground">Free Content</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={resetForm}>Cancel</Button>
                          <Button 
                            className="admin-button"
                            onClick={() => handleCreate("/api/admin/celebrities", formData)}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Add Celebrity
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {celebrities.map((celebrity) => (
                    <motion.div
                      key={celebrity.id}
                      whileHover={{ scale: 1.02 }}
                      className="glow-card"
                    >
                      <img 
                        src={celebrity.imageUrl} 
                        alt={celebrity.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-lg font-semibold text-foreground mb-2">{celebrity.name}</h3>
                      <p className="text-primary text-sm mb-2">{celebrity.profession}</p>
                      <p className="text-muted-foreground text-sm mb-4">{celebrity.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          {celebrity.isFree ? (
                            <Badge className="bg-green-500/20 text-green-300">Free</Badge>
                          ) : (
                            <Badge variant="outline" className="border-green-500/50">
                              ${celebrity.price}
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(celebrity)}
                            className="border-green-500/50 hover:bg-green-500/20"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete("/api/admin/celebrities", celebrity.id)}
                            className="admin-button-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Albums Management */}
            {activeTab === "albums" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-foreground">Album Management</h1>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setIsEnhancedAlbumManagementOpen(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Enhanced Album Manager
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="admin-button">
                          <Plus className="w-4 h-4 mr-2" />
                          Quick Add Album
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-green-500/20">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Add Album</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-foreground">Title</Label>
                          <Input
                            className="cyber-input"
                            placeholder="Album title"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Description</Label>
                          <Textarea
                            className="cyber-input"
                            placeholder="Album description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Cover Image URL</Label>
                          <Input
                            className="cyber-input"
                            placeholder="https://example.com/cover.jpg"
                            value={formData.imageUrl || ""}
                            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Price ($)</Label>
                          <Input
                            className="cyber-input"
                            type="number"
                            placeholder="15.00"
                            value={formData.price || ""}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Image Count</Label>
                          <Input
                            className="cyber-input"
                            type="number"
                            placeholder="25"
                            value={formData.imageCount || ""}
                            onChange={(e) => setFormData({...formData, imageCount: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.isFeatured || false}
                            onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})}
                          />
                          <Label className="text-foreground">Featured Album</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={resetForm}>Cancel</Button>
                          <Button 
                            className="admin-button"
                            onClick={() => handleCreate("/api/admin/albums", formData)}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Add Album
                          </Button>
                        </div>
                      </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albums.map((album) => (
                    <motion.div
                      key={album.id}
                      whileHover={{ scale: 1.02 }}
                      className="glow-card"
                    >
                      <img 
                        src={album.thumbnailUrl} 
                        alt={album.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-lg font-semibold text-foreground mb-2">{album.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{album.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="border-green-500/50">
                            ${album.price}
                          </Badge>
                          <Badge variant="outline" className="border-blue-500/50">
                            {album.imageCount} images
                          </Badge>
                          {album.isFeatured && (
                            <Badge className="bg-yellow-500/20 text-yellow-300">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div></div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(album)}
                            className="border-green-500/50 hover:bg-green-500/20"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete("/api/admin/albums", album.id)}
                            className="admin-button-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Videos Management */}
            {activeTab === "videos" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-foreground">Video Management</h1>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setIsEnhancedVideoManagementOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Enhanced Video Manager
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="admin-button">
                          <Plus className="w-4 h-4 mr-2" />
                          Quick Add Video
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-green-500/20">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Add Video</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-foreground">Title</Label>
                          <Input
                            className="cyber-input"
                            placeholder="Video title"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Description</Label>
                          <Textarea
                            className="cyber-input"
                            placeholder="Video description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Thumbnail URL</Label>
                          <Input
                            className="cyber-input"
                            placeholder="https://example.com/thumbnail.jpg"
                            value={formData.thumbnailUrl || ""}
                            onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Video URL</Label>
                          <Input
                            className="cyber-input"
                            placeholder="https://example.com/video.mp4"
                            value={formData.videoUrl || ""}
                            onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Price ($)</Label>
                          <Input
                            className="cyber-input"
                            type="number"
                            placeholder="30.00"
                            value={formData.price || ""}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Duration</Label>
                          <Input
                            className="cyber-input"
                            placeholder="15:30"
                            value={formData.duration || ""}
                            onChange={(e) => setFormData({...formData, duration: e.target.value})}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.isFeatured || false}
                            onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})}
                          />
                          <Label className="text-foreground">Featured Video</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={resetForm}>Cancel</Button>
                          <Button 
                            className="admin-button"
                            onClick={() => handleCreate("/api/admin/videos", formData)}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Add Video
                          </Button>
                        </div>
                      </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <motion.div
                      key={video.id}
                      whileHover={{ scale: 1.02 }}
                      className="glow-card"
                    >
                      <div className="relative">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-3">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{video.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{video.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="border-green-500/50">
                            ${video.price}
                          </Badge>
                          <Badge variant="outline" className="border-blue-500/50">
                            {video.duration}
                          </Badge>
                          {video.isFeatured && (
                            <Badge className="bg-yellow-500/20 text-yellow-300">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div></div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(video)}
                            className="border-green-500/50 hover:bg-green-500/20"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete("/api/admin/videos", video.id)}
                            className="admin-button-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Profile Management */}
            {activeTab === "profiles" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="admin-button">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-green-500/20 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Add Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-foreground">Name</Label>
                            <Input
                              className="cyber-input"
                              placeholder="Profile name"
                              value={formData.name || ""}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label className="text-foreground">Age</Label>
                            <Input
                              className="cyber-input"
                              type="number"
                              placeholder="25"
                              value={formData.age || ""}
                              onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || undefined})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-foreground">Country</Label>
                            <Input
                              className="cyber-input"
                              placeholder="Country"
                              value={formData.country || ""}
                              onChange={(e) => setFormData({...formData, country: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label className="text-foreground">Profession</Label>
                            <Input
                              className="cyber-input"
                              placeholder="Profession"
                              value={formData.profession || ""}
                              onChange={(e) => setFormData({...formData, profession: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-foreground">Description</Label>
                          <Textarea
                            className="cyber-input"
                            placeholder="Profile description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Thumbnail URL</Label>
                          <Input
                            className="cyber-input"
                            placeholder="https://example.com/image.jpg"
                            value={formData.thumbnailUrl || ""}
                            onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={resetForm}>Cancel</Button>
                          <Button 
                            className="admin-button"
                            onClick={() => handleCreate("/api/profiles", formData)}
                            disabled={!formData.name || !formData.description}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Add Profile
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map((profile) => (
                    <motion.div
                      key={profile.id}
                      whileHover={{ scale: 1.02 }}
                      className="glow-card"
                    >
                      <img 
                        src={profile.thumbnailUrl} 
                        alt={profile.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-lg font-semibold text-foreground mb-2">{profile.name}</h3>
                      <p className="text-muted-foreground text-sm mb-2">Age: {profile.age} • {profile.country}</p>
                      <p className="text-muted-foreground text-sm mb-2">{profile.profession}</p>
                      <p className="text-muted-foreground text-sm mb-4">{profile.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="border-green-500/50">
                          Profile
                        </Badge>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(profile)}
                            className="border-green-500/50 hover:bg-green-500/20"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete("/api/profiles", profile.id)}
                            className="admin-button-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Settings Management */}
            {activeTab === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Membership Pricing */}
                  <Card className="glow-card">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Membership Pricing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-foreground">3-Day Plan (BDT)</Label>
                        <Input
                          className="cyber-input"
                          type="number"
                          placeholder="500"
                          defaultValue="500"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">3-Day Plan (USD)</Label>
                        <Input
                          className="cyber-input"
                          type="number"
                          placeholder="5.99"
                          defaultValue="5.99"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">15-Day Plan (BDT)</Label>
                        <Input
                          className="cyber-input"
                          type="number"
                          placeholder="1500"
                          defaultValue="1500"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">15-Day Plan (USD)</Label>
                        <Input
                          className="cyber-input"
                          type="number"
                          placeholder="15.99"
                          defaultValue="15.99"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">30-Day Plan (BDT)</Label>
                        <Input
                          className="cyber-input"
                          type="number"
                          placeholder="2500"
                          defaultValue="2500"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">30-Day Plan (USD)</Label>
                        <Input
                          className="cyber-input"
                          type="number"
                          placeholder="25.99"
                          defaultValue="25.99"
                        />
                      </div>
                      <Button className="admin-button w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Update Pricing
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Theme Settings */}
                  <Card className="glow-card">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Theme Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-foreground">Primary Color</Label>
                        <Select defaultValue="green">
                          <SelectTrigger className="cyber-input">
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green">Emerald Green</SelectItem>
                            <SelectItem value="blue">Electric Blue</SelectItem>
                            <SelectItem value="purple">Cyber Purple</SelectItem>
                            <SelectItem value="orange">Neon Orange</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-foreground">Slideshow Timing (seconds)</Label>
                        <Input
                          className="cyber-input"
                          type="number"
                          placeholder="5"
                          defaultValue="5"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <Label className="text-foreground">Enable Glow Effects</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <Label className="text-foreground">Enable Animations</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch />
                        <Label className="text-foreground">Maintenance Mode</Label>
                      </div>
                      <Button className="admin-button w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Update Theme
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Security Settings */}
                  <Card className="glow-card">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-foreground">Current Password</Label>
                        <Input
                          className="cyber-input"
                          type="password"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">New Password</Label>
                        <Input
                          className="cyber-input"
                          type="password"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Confirm New Password</Label>
                        <Input
                          className="cyber-input"
                          type="password"
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button className="admin-button w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </CardContent>
                  </Card>

                  {/* System Info */}
                  <Card className="glow-card">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        System Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Version:</span>
                        <span className="text-foreground">1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Database:</span>
                        <span className="text-green-400">Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage:</span>
                        <span className="text-green-400">Healthy</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Backup:</span>
                        <span className="text-foreground">2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uptime:</span>
                        <span className="text-foreground">24 hours</span>
                      </div>
                      <Button className="admin-button w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Backup System
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-green-500/20">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit {selectedItem?.name || selectedItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Dynamic form fields based on selected item type */}
            {selectedItem && (
              <>
                {/* Common fields */}
                {selectedItem.name && (
                  <div>
                    <Label className="text-foreground">Name</Label>
                    <Input
                      className="cyber-input"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                )}
                {selectedItem.title && (
                  <div>
                    <Label className="text-foreground">Title</Label>
                    <Input
                      className="cyber-input"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                )}
                {selectedItem.description && (
                  <div>
                    <Label className="text-foreground">Description</Label>
                    <Textarea
                      className="cyber-input"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                )}
                {selectedItem.imageUrl && (
                  <div>
                    <Label className="text-foreground">Image URL</Label>
                    <Input
                      className="cyber-input"
                      value={formData.imageUrl || ""}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    />
                  </div>
                )}
                {selectedItem.price && (
                  <div>
                    <Label className="text-foreground">Price ($)</Label>
                    <Input
                      className="cyber-input"
                      type="number"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                )}
                {selectedItem.profession && (
                  <div>
                    <Label className="text-foreground">Profession</Label>
                    <Input
                      className="cyber-input"
                      value={formData.profession || ""}
                      onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    />
                  </div>
                )}
                {selectedItem.hasOwnProperty('isFree') && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isFree || false}
                      onCheckedChange={(checked) => setFormData({...formData, isFree: checked})}
                    />
                    <Label className="text-foreground">Free Content</Label>
                  </div>
                )}
                {selectedItem.hasOwnProperty('isFeatured') && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isFeatured || false}
                      onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})}
                    />
                    <Label className="text-foreground">Featured</Label>
                  </div>
                )}
                {selectedItem.thumbnailUrl && (
                  <div>
                    <Label className="text-foreground">Thumbnail URL</Label>
                    <Input
                      className="cyber-input"
                      value={formData.thumbnailUrl || ""}
                      onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                    />
                  </div>
                )}
                {selectedItem.videoUrl && (
                  <div>
                    <Label className="text-foreground">Video URL</Label>
                    <Input
                      className="cyber-input"
                      value={formData.videoUrl || ""}
                      onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    />
                  </div>
                )}
                {selectedItem.duration && (
                  <div>
                    <Label className="text-foreground">Duration</Label>
                    <Input
                      className="cyber-input"
                      value={formData.duration || ""}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                )}
                {selectedItem.imageCount && (
                  <div>
                    <Label className="text-foreground">Image Count</Label>
                    <Input
                      className="cyber-input"
                      type="number"
                      value={formData.imageCount || ""}
                      onChange={(e) => setFormData({...formData, imageCount: parseInt(e.target.value)})}
                    />
                  </div>
                )}
                {selectedItem.subtitle && (
                  <div>
                    <Label className="text-foreground">Subtitle</Label>
                    <Input
                      className="cyber-input"
                      value={formData.subtitle || ""}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    />
                  </div>
                )}
                {selectedItem.order && (
                  <div>
                    <Label className="text-foreground">Order</Label>
                    <Input
                      className="cyber-input"
                      type="number"
                      value={formData.order || ""}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    />
                  </div>
                )}
              </>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button 
                className="admin-button"
                onClick={() => {
                  let endpoint = "";
                  if (selectedItem?.profession) endpoint = "/api/admin/celebrities";
                  else if (selectedItem?.imageCount) endpoint = "/api/admin/albums";
                  else if (selectedItem?.videoUrl) endpoint = "/api/admin/videos";
                  else if (selectedItem?.imageUrl) endpoint = "/api/admin/slideshow";
                  
                  handleUpdate(endpoint, selectedItem.id, formData);
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Album Management Dialog */}
      <EnhancedAlbumManagement 
        isOpen={isEnhancedAlbumManagementOpen} 
        onOpenChange={setIsEnhancedAlbumManagementOpen} 
      />

      {/* Enhanced Video Management Dialog */}
      <EnhancedVideoManagement 
        isOpen={isEnhancedVideoManagementOpen} 
        onOpenChange={setIsEnhancedVideoManagementOpen} 
      />
    </div>
  );
}
