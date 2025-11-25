import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, ArrowLeft } from "lucide-react";
import { teamService } from "@/services/firestore/team";
import { firebaseStorage } from "@/services/firebaseStorage";
import { toast } from "sonner";

const AdminEditTeamMember = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [photo, setPhoto] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchTeamMember();
    }
  }, [id]);

  const fetchTeamMember = async () => {
    try {
      const member = await teamService.getById(id!);
      if (member) {
        setFormData({
          name: member.name || "",
          role: member.role || "",
          email: member.email || "",
          phone: member.phone || "",
          bio: member.bio || "",
        });
        setPhoto(member.photo || "");
      } else {
        toast.error("Team member not found");
        navigate("/admin/team");
      }
    } catch (error) {
      toast.error("Failed to fetch team member");
      console.error(error);
      navigate("/admin/team");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const url = await firebaseStorage.uploadFile(
        file,
        `team/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      );
      setPhoto(url);
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to upload photo";
      toast.error(errorMessage);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setPhoto("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.role.trim()) {
      toast.error("Please fill in at least name and role");
      return;
    }

    setSubmitting(true);

    try {
      await teamService.update(id!, {
        name: formData.name.trim(),
        role: formData.role.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        photo: photo || undefined,
      });
      
      toast.success("Team member updated successfully");
      navigate("/admin/team");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update team member";
      toast.error(errorMessage);
      console.error("Error updating team member:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/team")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Team Member</h1>
            <p className="text-muted-foreground">Update team member information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Member Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role/Title *</Label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="Estate Agent"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief description of the team member..."
                />
              </div>

              <div className="space-y-2">
                <Label>Photo</Label>
                {photo ? (
                  <div className="relative inline-block">
                    <img
                      src={photo}
                      alt="Team member photo"
                      className="w-32 h-32 object-cover rounded-full border-4 border-primary"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={handleRemovePhoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-6">
                    <label htmlFor="photo" className="cursor-pointer text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Click to upload photo</p>
                      <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}
                {uploading && (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting || uploading}>
                  {submitting ? "Updating..." : "Update Team Member"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/admin/team")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminEditTeamMember;

