import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  Eye,
  MoreVertical,
  UserPlus,
  Filter,
  Search
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MembershipRequest, Celebrity, Album as AlbumType, Video as VideoType, SlideshowImage, Profile } from "@shared/schema";
import { uploadFile, validateImageFile, UploadedFile } from "@/lib/fileUpload";
import { format } from "date-fns";
import { AlbumImageModal } from "./AlbumImageModal";

export function RestructuredAdminPanel() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddProfileOpen, setIsAddProfileOpen] = useState(false);
  const [isAddAlbumOpen, setIsAddAlbumOpen] = useState(false);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isAddSlideshowOpen, setIsAddSlideshowOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [isAllRequestsOpen, setIsAllRequestsOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [isAlbumImageModalOpen, setIsAlbumImageModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploadedImage, setUploadedImage] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data queries
  const { data: membershipRequests = [], isLoading: requestsLoading } = useQuery<(MembershipRequest & { user: any })[]>({
    queryKey: ["/api/membership/requests"],
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
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

  // Calculate dashboard statistics
  const dailyStats = {
    totalProfiles: profiles.length,
    totalVideos: videos.length,
    totalAlbums: albums.length,
    totalPictures: albums.reduce((sum, album) => sum + (album.imageCount || 0), 0)
  };

  // Active membership requests (approved ones that haven't expired)
  const activeMembershipRequests = membershipRequests.filter(req => 
    req.status === 'approved' && req.approvedAt && 
    new Date(req.approvedAt.getTime() + (parseInt(req.plan) * 24 * 60 * 60 * 1000)) > new Date()
  );

  // Pending membership requests
  const pendingMembershipRequests = membershipRequests.filter(req => req.status === 'pending');

  // File upload handler
  const handleFileUpload = async (file: File) => {
    try {
      if (!validateImageFile(file)) {
        toast({
          title: "Invalid file",
          description: "Please select a valid image file (JPG, PNG, GIF)",
          variant: "destructive",
        });
        return;
      }

      const uploaded = await uploadFile(file);
      setUploadedImage(uploaded);
      setFormData((prev: any) => ({
        ...prev,
        imageUrl: uploaded.url
      }));
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Render functions (declared before usage)
  const renderSlideshowSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Slideshow Management</h2>
        <Button onClick={() => setIsAddSlideshowOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Slideshow Image
        </Button>
      </div>

      <Card className="bg-[#0B1120]/60 border-emerald-500/30 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Slideshow Images</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slideshowImages.map((image) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <img src={image.imageUrl} alt={image.title} className="w-16 h-16 object-cover rounded" />
                  </TableCell>
                  <TableCell>{image.title}</TableCell>
                  <TableCell>{image.subtitle}</TableCell>
                  <TableCell>{image.order}</TableCell>
                  <TableCell>
                    <Badge variant={image.isActive ? 'default' : 'secondary'}>
                      {image.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => deleteMutation.mutate({ endpoint: '/api/admin/slideshow', id: image.id })}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Profile Management</h2>
        <Button onClick={() => setIsAddProfileOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Profile
        </Button>
      </div>

      <Card className="bg-[#0B1120]/60 border-emerald-500/30 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">All Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Profile Name</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Content Stats</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => {
                const profileAlbums = albums.filter(album => album.profileId === profile.id);
                const profileVideos = videos.filter(video => video.profileId === profile.id);
                const totalPictures = profileAlbums.reduce((sum, album) => sum + (album.imageCount || 0), 0);

                return (
                  <TableRow key={profile.id}>
                    <TableCell>{format(new Date(profile.createdAt!), 'yyyy-MM-dd')}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <img src={profile.imageUrl} alt={profile.name} className="w-8 h-8 rounded-full object-cover" />
                      {profile.name}
                    </TableCell>
                    <TableCell>{profile.dateOfBirth}</TableCell>
                    <TableCell>{profile.nationality}</TableCell>
                    <TableCell>{profile.gender}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {profileAlbums.length} Albums, {profileVideos.length} Videos, {totalPictures} Pictures
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewProfile(profile)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProfile(profile)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteProfile(profile.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderContentManagementSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Content Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddAlbumOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <ImagePlus className="w-4 h-4 mr-2" />
            Add Picture Album
          </Button>
          <Button onClick={() => setIsAddVideoOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        </div>
      </div>

      {/* Albums Section */}
      <Card className="bg-[#0B1120]/60 border-emerald-500/30 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Albums</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Album Name</TableHead>
                <TableHead>Under Profile</TableHead>
                <TableHead>Picture Quantity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {albums.map((album) => {
                const profile = profiles.find(p => p.id === album.profileId);
                return (
                  <TableRow key={album.id}>
                    <TableCell className="flex items-center gap-2">
                      <img src={album.thumbnailUrl} alt={album.title} className="w-12 h-12 object-cover rounded" />
                      {album.title}
                    </TableCell>
                    <TableCell>{profile?.name || 'No Profile'}</TableCell>
                    <TableCell>{album.imageCount || 0}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                            setSelectedAlbum(album);
                            setIsAlbumImageModalOpen(true);
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Open Album
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate({ endpoint: '/api/admin/albums', id: album.id })}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Album
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Videos Section */}
      <Card className="bg-[#0B1120]/60 border-emerald-500/30 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video Title</TableHead>
                <TableHead>Profile Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => {
                const profile = profiles.find(p => p.id === video.profileId);
                return (
                  <TableRow key={video.id}>
                    <TableCell className="flex items-center gap-2">
                      <img src={video.thumbnailUrl} alt={video.title} className="w-12 h-12 object-cover rounded" />
                      {video.title}
                    </TableCell>
                    <TableCell>{profile?.name || 'No Profile'}</TableCell>
                    <TableCell>{video.duration || 'N/A'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Play className="w-4 h-4 mr-2" />
                            Open Video
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate({ endpoint: '/api/admin/videos', id: video.id })}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Video
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Admin Credentials</Label>
              <Button variant="outline">Update</Button>
            </div>
            <div className="flex items-center justify-between">
              <Label>Pricing Configuration</Label>
              <Button variant="outline">Update</Button>
            </div>
            <div className="flex items-center justify-between">
              <Label>System Maintenance</Label>
              <Button variant="outline">Manage</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
  });

  // Profile creation mutation
  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/profiles", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setIsAddProfileOpen(false);
      setFormData({});
      setUploadedImage(null);
      toast({ title: "Success", description: "Profile created successfully" });
    },
  });

  // Album creation mutation
  const createAlbumMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/albums", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
      setIsAddAlbumOpen(false);
      setFormData({});
      toast({ title: "Success", description: "Album created successfully" });
    },
  });

  // Video creation mutation
  const createVideoMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/videos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      setIsAddVideoOpen(false);
      setFormData({});
      toast({ title: "Success", description: "Video created successfully" });
    },
  });

  // Slideshow creation mutation
  const createSlideshowMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/slideshow", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slideshow"] });
      setIsAddSlideshowOpen(false);
      setFormData({});
      setUploadedImage(null);
      toast({ title: "Success", description: "Slideshow image created successfully" });
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/admin/profiles/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setIsEditProfileOpen(false);
      setEditingProfile(null);
      setFormData({});
      setUploadedImage(null);
      toast({ title: "Success", description: "Profile updated successfully" });
    },
  });

  // Delete mutations
  const deleteMutation = useMutation({
    mutationFn: async ({ endpoint, id }: { endpoint: string; id: number }) => {
      return apiRequest("DELETE", `${endpoint}/${id}`);
    },
    onSuccess: (_, { endpoint }) => {
      const queryKey = endpoint.replace("/admin", "");
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      toast({ title: "Success", description: "Item deleted successfully" });
    },
  });

  // Action handlers
  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      profession: profile.profession,
      dateOfBirth: profile.dateOfBirth,
      nationality: profile.nationality,
      gender: profile.gender,
      description: profile.description,
      imageUrl: profile.imageUrl
    });
    setIsEditProfileOpen(true);
  };

  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsViewProfileOpen(true);
  };

  const handleDeleteProfile = (profileId: number) => {
    if (confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
      deleteMutation.mutate({ endpoint: '/api/admin/profiles', id: profileId });
    }
  };



  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex gap-2">
          <Badge variant="outline">Admin: {user?.firstName}</Badge>
          <Button onClick={logout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Daily Statistics Table */}
      <Card className="bg-[#0B1120]/60 border-emerald-500/30 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Daily Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Total Profiles</TableHead>
                <TableHead>Total Videos</TableHead>
                <TableHead>Total Albums</TableHead>
                <TableHead>Total Pictures</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{format(new Date(), 'yyyy-MM-dd')}</TableCell>
                <TableCell>{dailyStats.totalProfiles}</TableCell>
                <TableCell>{dailyStats.totalVideos}</TableCell>
                <TableCell>{dailyStats.totalAlbums}</TableCell>
                <TableCell>{dailyStats.totalPictures}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0B1120]/60 border-emerald-500/30 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">{profiles.length}</p>
                <p className="text-sm text-gray-300">Total Profiles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0B1120]/60 border-emerald-500/30 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Video className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{videos.length}</p>
                <p className="text-sm text-gray-300">Total Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Album className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{albums.length}</p>
                <p className="text-sm text-gray-600">Total Albums</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <UserCheck className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{activeMembershipRequests.length}</p>
                <p className="text-sm text-gray-600">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRequestSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Request Management</h2>
        <Button onClick={() => setIsAllRequestsOpen(true)} variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          All Requests
        </Button>
      </div>

      {/* Active Membership Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Memberships</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Viewer Name</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Package Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeMembershipRequests.map((request) => {
                const approvedDate = request.approvedAt ? new Date(request.approvedAt) : new Date();
                const expiryDate = new Date(approvedDate.getTime() + (parseInt(request.plan) * 24 * 60 * 60 * 1000));
                const remainingDays = Math.max(0, Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                
                return (
                  <TableRow key={request.id}>
                    <TableCell>{format(approvedDate, 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{request.user?.firstName} {request.user?.lastName}</TableCell>
                    <TableCell>{request.user?.contactNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {request.plan} days ({remainingDays} remaining)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View User Info
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* All Requests Dialog */}
      <Dialog open={isAllRequestsOpen} onOpenChange={setIsAllRequestsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>All Membership Requests</DialogTitle>
            <DialogDescription>Review and manage all membership requests</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membershipRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{format(new Date(request.createdAt!), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>{request.user?.firstName} {request.user?.lastName}</TableCell>
                    <TableCell>{request.user?.contactNumber}</TableCell>
                    <TableCell>{request.plan} days</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          request.status === 'approved' ? 'default' : 
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'approved' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatusMutation.mutate({ id: request.id, status: 'rejected' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0B1120] to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Secret Web - Admin Panel</h1>
          <p className="text-emerald-400">Comprehensive content management system</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-[#0B1120]/80 border border-emerald-500/30 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300 hover:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300 hover:text-white">Requests</TabsTrigger>
            <TabsTrigger value="slideshow" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300 hover:text-white">Slideshow</TabsTrigger>
            <TabsTrigger value="profiles" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300 hover:text-white">Profiles</TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300 hover:text-white">Content</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-300 hover:text-white">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            {renderRequestSection()}
          </TabsContent>

          <TabsContent value="slideshow" className="space-y-6">
            {renderSlideshowSection()}
          </TabsContent>

          <TabsContent value="profiles" className="space-y-6">
            {renderProfileSection()}
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {renderContentManagementSection()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {renderSettingsSection()}
          </TabsContent>
        </Tabs>

        {/* Add Profile Dialog */}
        <Dialog open={isAddProfileOpen} onOpenChange={setIsAddProfileOpen}>
          <DialogContent className="max-w-2xl bg-[#0B1120]/95 border-emerald-500/30 backdrop-blur-md text-white">
            <DialogHeader>
              <DialogTitle>Add New Profile</DialogTitle>
              <DialogDescription>Create a new profile to organize content</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Profile Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter profile name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender || ''} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="nationality">Country</Label>
                <Input
                  id="nationality"
                  value={formData.nationality || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, nationality: e.target.value }))}
                  placeholder="Enter country"
                />
              </div>

              <div>
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={formData.profession || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, profession: e.target.value }))}
                  placeholder="Enter profession"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                />
              </div>

              <div>
                <Label>Profile Picture</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Profile Picture
                  </Button>
                  {uploadedImage && (
                    <div className="mt-2">
                      <img
                        src={uploadedImage.url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddProfileOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createProfileMutation.mutate(formData)}
                  disabled={createProfileMutation.isPending || !formData.name}
                >
                  {createProfileMutation.isPending ? 'Creating...' : 'Create Profile'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Slideshow Image Dialog */}
        <Dialog open={isAddSlideshowOpen} onOpenChange={setIsAddSlideshowOpen}>
          <DialogContent className="max-w-2xl bg-[#0B1120]/95 border-emerald-500/30 backdrop-blur-md text-white">
            <DialogHeader>
              <DialogTitle>Add Slideshow Image</DialogTitle>
              <DialogDescription>Add a new image to the slideshow</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                />
              </div>
              
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Enter subtitle"
                />
              </div>

              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, order: parseInt(e.target.value) }))}
                  placeholder="Enter display order"
                />
              </div>

              <div>
                <Label>Slideshow Image</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  {uploadedImage && (
                    <div className="mt-2">
                      <img
                        src={uploadedImage.url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddSlideshowOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createSlideshowMutation.mutate(formData)}
                  disabled={createSlideshowMutation.isPending || !formData.title || !formData.imageUrl}
                >
                  {createSlideshowMutation.isPending ? 'Creating...' : 'Add Image'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent className="max-w-2xl bg-[#0B1120]/95 border-emerald-500/30 backdrop-blur-md text-white">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update profile information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Profile Name</Label>
                <Input
                  id="editName"
                  value={formData.name || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter profile name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editDateOfBirth">Date of Birth</Label>
                  <Input
                    id="editDateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="editGender">Gender</Label>
                  <Select value={formData.gender || ''} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="editNationality">Country</Label>
                <Input
                  id="editNationality"
                  value={formData.nationality || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, nationality: e.target.value }))}
                  placeholder="Enter country"
                />
              </div>

              <div>
                <Label htmlFor="editProfession">Profession</Label>
                <Input
                  id="editProfession"
                  value={formData.profession || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, profession: e.target.value }))}
                  placeholder="Enter profession"
                />
              </div>

              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                />
              </div>

              <div>
                <Label>Profile Picture</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Picture
                  </Button>
                  {(uploadedImage || formData.imageUrl) && (
                    <div className="mt-2">
                      <img
                        src={uploadedImage?.url || formData.imageUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateProfileMutation.mutate({ ...formData, id: editingProfile?.id })}
                  disabled={updateProfileMutation.isPending || !formData.name}
                >
                  {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Profile Dialog */}
        <Dialog open={isViewProfileOpen} onOpenChange={setIsViewProfileOpen}>
          <DialogContent className="max-w-4xl bg-[#0B1120]/95 border-emerald-500/30 backdrop-blur-md text-white">
            <DialogHeader>
              <DialogTitle>Profile Details</DialogTitle>
              <DialogDescription>View profile information and content</DialogDescription>
            </DialogHeader>
            {selectedProfile && (
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <img
                    src={selectedProfile.imageUrl}
                    alt={selectedProfile.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-bold">{selectedProfile.name}</h3>
                    <p className="text-muted-foreground">{selectedProfile.profession}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>DOB:</strong> {selectedProfile.dateOfBirth}</div>
                      <div><strong>Gender:</strong> {selectedProfile.gender}</div>
                      <div><strong>Country:</strong> {selectedProfile.nationality}</div>
                      <div><strong>Added:</strong> {selectedProfile.createdAt ? format(new Date(selectedProfile.createdAt), 'yyyy-MM-dd') : 'N/A'}</div>
                    </div>
                    {selectedProfile.description && (
                      <div>
                        <strong>Description:</strong>
                        <p className="mt-1 text-sm text-muted-foreground">{selectedProfile.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Content Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-[#0B1120]/40 border-emerald-500/20 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {albums.filter(album => album.profileId === selectedProfile.id).length}
                      </div>
                      <div className="text-sm text-gray-300">Albums</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#0B1120]/40 border-emerald-500/20 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {videos.filter(video => video.profileId === selectedProfile.id).length}
                      </div>
                      <div className="text-sm text-gray-300">Videos</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#0B1120]/40 border-emerald-500/20 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-400">
                        {albums.filter(album => album.profileId === selectedProfile.id).reduce((sum, album) => sum + (album.imageCount || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-300">Pictures</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setIsViewProfileOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Album Dialog */}
        <Dialog open={isAddAlbumOpen} onOpenChange={setIsAddAlbumOpen}>
          <DialogContent className="max-w-2xl bg-[#0B1120]/95 border-emerald-500/30 backdrop-blur-md text-white">
            <DialogHeader>
              <DialogTitle>Add Picture Album</DialogTitle>
              <DialogDescription>Create a new album under a profile</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="albumTitle">Album Title</Label>
                <Input
                  id="albumTitle"
                  value={formData.title || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter album title"
                />
              </div>

              <div>
                <Label htmlFor="albumProfile">Select Profile</Label>
                <Select value={formData.profileId?.toString() || ''} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, profileId: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="albumDescription">Description</Label>
                <Textarea
                  id="albumDescription"
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter album description"
                />
              </div>

              <div>
                <Label htmlFor="albumPrice">Price Category</Label>
                <Select value={formData.priceCategory || ''} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, priceCategory: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="bdt_150">BDT 150</SelectItem>
                    <SelectItem value="bdt_250">BDT 250</SelectItem>
                    <SelectItem value="bdt_500">BDT 500</SelectItem>
                    <SelectItem value="usd_2">USD 2</SelectItem>
                    <SelectItem value="usd_3">USD 3</SelectItem>
                    <SelectItem value="usd_5">USD 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Album Thumbnail</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Thumbnail
                  </Button>
                  {uploadedImage && (
                    <div className="mt-2">
                      <img
                        src={uploadedImage.url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddAlbumOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createAlbumMutation.mutate({
                    ...formData,
                    thumbnailUrl: formData.imageUrl,
                    price: formData.priceCategory === 'free' ? '0' : 
                           formData.priceCategory === 'bdt_150' ? '150' :
                           formData.priceCategory === 'bdt_250' ? '250' :
                           formData.priceCategory === 'bdt_500' ? '500' :
                           formData.priceCategory === 'usd_2' ? '2' :
                           formData.priceCategory === 'usd_3' ? '3' : '5'
                  })}
                  disabled={createAlbumMutation.isPending || !formData.title || !formData.profileId}
                >
                  {createAlbumMutation.isPending ? 'Creating...' : 'Create Album'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Video Dialog */}
        <Dialog open={isAddVideoOpen} onOpenChange={setIsAddVideoOpen}>
          <DialogContent className="max-w-2xl bg-[#0B1120]/95 border-emerald-500/30 backdrop-blur-md text-white">
            <DialogHeader>
              <DialogTitle>Add Video</DialogTitle>
              <DialogDescription>Add a new video under a profile</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="videoTitle">Video Title</Label>
                <Input
                  id="videoTitle"
                  value={formData.title || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter video title"
                />
              </div>

              <div>
                <Label htmlFor="videoProfile">Select Profile</Label>
                <Select value={formData.profileId?.toString() || ''} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, profileId: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="videoDescription">Description</Label>
                <Textarea
                  id="videoDescription"
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter video description"
                />
              </div>

              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="Enter video URL"
                />
              </div>

              <div>
                <Label htmlFor="videoDuration">Duration</Label>
                <Input
                  id="videoDuration"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 5:30"
                />
              </div>

              <div>
                <Label htmlFor="videoPrice">Price Category</Label>
                <Select value={formData.priceCategory || ''} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, priceCategory: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="bdt_150">BDT 150</SelectItem>
                    <SelectItem value="bdt_250">BDT 250</SelectItem>
                    <SelectItem value="bdt_500">BDT 500</SelectItem>
                    <SelectItem value="usd_2">USD 2</SelectItem>
                    <SelectItem value="usd_3">USD 3</SelectItem>
                    <SelectItem value="usd_5">USD 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Video Thumbnail</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Thumbnail
                  </Button>
                  {uploadedImage && (
                    <div className="mt-2">
                      <img
                        src={uploadedImage.url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddVideoOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createVideoMutation.mutate({
                    ...formData,
                    thumbnailUrl: formData.imageUrl,
                    price: formData.priceCategory === 'free' ? '0' : 
                           formData.priceCategory === 'bdt_150' ? '150' :
                           formData.priceCategory === 'bdt_250' ? '250' :
                           formData.priceCategory === 'bdt_500' ? '500' :
                           formData.priceCategory === 'usd_2' ? '2' :
                           formData.priceCategory === 'usd_3' ? '3' : '5'
                  })}
                  disabled={createVideoMutation.isPending || !formData.title || !formData.profileId || !formData.videoUrl}
                >
                  {createVideoMutation.isPending ? 'Creating...' : 'Add Video'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Album Image Management Modal */}
        <AlbumImageModal
          isOpen={isAlbumImageModalOpen}
          onClose={() => setIsAlbumImageModalOpen(false)}
          album={selectedAlbum}
        />
      </div>
    </div>
  );
}