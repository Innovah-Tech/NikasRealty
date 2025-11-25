import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, ArrowLeft } from "lucide-react";
import { blogsService } from "@/services/firestore/blogs";
import { firebaseStorage } from "@/services/firebaseStorage";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { sanitizeText, sanitizeRichText } from "@/utils/sanitize";
import { validateTitle, validateMessage } from "@/utils/validate";

const AdminEditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    image: "",
    author: "Admin",
    status: "draft" as "draft" | "published",
  });

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const blog = await blogsService.getById(id!);
      setFormData({
        title: blog.title || "",
        summary: blog.summary || "",
        content: blog.content || "",
        image: blog.image || "",
        author: blog.author || "Admin",
        status: blog.status || "draft",
      });
    } catch (error) {
      toast.error("Failed to fetch blog post");
      console.error(error);
      navigate("/admin/blogs");
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
        `blogs/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      );
      setFormData({ ...formData, image: url });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to upload image";
      toast.error(errorMessage);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const titleValidation = validateTitle(formData.title);
    if (!titleValidation.valid) {
      toast.error(titleValidation.error || 'Invalid title');
      return;
    }
    
    const summaryValidation = validateMessage(formData.summary, 'Summary');
    if (!summaryValidation.valid) {
      toast.error(summaryValidation.error || 'Invalid summary');
      return;
    }
    
    const contentValidation = validateMessage(formData.content, 'Content');
    if (!contentValidation.valid) {
      toast.error(contentValidation.error || 'Invalid content');
      return;
    }
    
    setSubmitting(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        title: sanitizeText(formData.title),
        summary: sanitizeText(formData.summary),
        content: sanitizeRichText(formData.content), // Allow some HTML for blog content
        image: formData.image,
        author: sanitizeText(formData.author),
        status: formData.status,
      };
      
      await blogsService.update(id!, sanitizedData);
      const statusMessage = formData.status === "published" 
        ? "Blog post updated and published! It will appear on the public blog page immediately."
        : "Blog post updated successfully.";
      toast.success(statusMessage);
      navigate("/admin/blogs");
    } catch (error: any) {
      console.error("Error updating blog:", error);
      toast.error("Failed to update blog post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-96 animate-pulse rounded bg-muted" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/blogs")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Blog Post</h1>
            <p className="text-muted-foreground">Update blog post details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter blog title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary *</Label>
                    <Textarea
                      id="summary"
                      name="summary"
                      value={formData.summary}
                      onChange={handleChange}
                      required
                      placeholder="Brief summary of the blog post"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Full blog post content"
                      rows={12}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "draft" | "published") => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {formData.status === "published" 
                        ? "This blog will appear on the public blog page immediately" 
                        : "Draft blogs are not visible on the public blog page"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      placeholder="Author name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Blog Image</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          id="image"
                          name="image"
                          value={formData.image}
                          onChange={handleChange}
                          placeholder="Image URL or upload a file"
                          className="flex-1"
                        />
                        <label>
                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer"
                            disabled={uploading}
                            asChild
                          >
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              {uploading ? "Uploading..." : "Upload"}
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                      {formData.image && (
                        <div className="relative">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="h-48 w-full rounded-lg object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setFormData({ ...formData, image: "" })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/blogs")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? "Updating..." : "Update Blog Post"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminEditBlog;

