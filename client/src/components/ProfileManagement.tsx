import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  User, 
  Calendar, 
  Globe, 
  UserCheck,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Profile, InsertProfile } from "@shared/schema";
import { UploadedFile } from "@/lib/fileUpload";

interface ProfileManagementProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileManagement({ isOpen, onOpenChange }: ProfileManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertProfile>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Fetch profiles
  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
    enabled: isOpen,
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data: InsertProfile) => apiRequest("/api/profiles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertProfile> }) => 
      apiRequest(`/api/profiles/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/profiles/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({});
    setUploadedFiles([]);
    setSelectedProfile(null);
  };

  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, imageUrl: files[0].url }));
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setFormData(prev => ({ ...prev, imageUrl: "" }));
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.profession || !formData.imageUrl) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload a profile image",
        variant: "destructive",
      });
      return;
    }

    const profileData: InsertProfile = {
      name: formData.name,
      profession: formData.profession,
      imageUrl: formData.imageUrl,
      description: formData.description || "",
      dateOfBirth: formData.dateOfBirth || "",
      gender: formData.gender || "",
      nationality: formData.nationality || "",
      isFree: formData.isFree || false,
      price: formData.price || "0",
    };

    if (selectedProfile) {
      updateProfileMutation.mutate({ id: selectedProfile.id, data: profileData });
    } else {
      createProfileMutation.mutate(profileData);
    }
  };

  const handleEdit = (profile: Profile) => {
    setSelectedProfile(profile);
    setFormData(profile);
    setUploadedFiles([{
      url: profile.imageUrl,
      fileName: "profile-image",
      fileSize: 0,
      fileType: "image/jpeg"
    }]);
    setIsEditDialogOpen(true);
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
            <User className="w-5 h-5" />
            Profile Management
          </CardTitle>
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No profiles found. Create your first profile to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img 
                      src={profile.imageUrl} 
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.profession}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {profile.isFree ? (
                          <Badge variant="secondary">Free</Badge>
                        ) : (
                          <Badge variant="outline">${profile.price}</Badge>
                        )}
                        {profile.gender && (
                          <Badge variant="outline">{profile.gender}</Badge>
                        )}
                        {profile.nationality && (
                          <Badge variant="outline">{profile.nationality}</Badge>
                        )}
                      </div>
                      
                      {profile.description && (
                        <p className="text-sm line-clamp-2">{profile.description}</p>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(profile)}
                          className="flex-1"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProfileMutation.mutate(profile.id)}
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Profile Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Profile</DialogTitle>
              <DialogDescription>
                Create a new profile with photo upload and detailed information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession *</Label>
                  <Input
                    id="profession"
                    value={formData.profession || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                    placeholder="e.g., Model, Actress, Influencer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Image *</Label>
                <FileUpload
                  accept="image"
                  onUpload={handleFileUpload}
                  maxFiles={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description about the profile"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                    placeholder="e.g., American, British"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={formData.isFree || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                  />
                  <Label htmlFor="isFree">Free Access</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={createProfileMutation.isPending}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
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

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update profile information and photo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-profession">Profession *</Label>
                  <Input
                    id="edit-profession"
                    value={formData.profession || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                    placeholder="e.g., Model, Actress, Influencer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Image *</Label>
                <FileUpload
                  accept="image"
                  onUpload={handleFileUpload}
                  maxFiles={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description about the profile"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                  <Input
                    id="edit-dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={formData.gender || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-nationality">Nationality</Label>
                  <Input
                    id="edit-nationality"
                    value={formData.nationality || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                    placeholder="e.g., American, British"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (USD)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="edit-isFree"
                    checked={formData.isFree || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                  />
                  <Label htmlFor="edit-isFree">Free Access</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
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
      </CardContent>
    </Card>
  );
}

export default ProfileManagement;