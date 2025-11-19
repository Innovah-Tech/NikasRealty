import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, ArrowLeft } from "lucide-react";
import { propertiesService } from "@/services/firestore/properties";
import { firebaseStorage } from "@/services/firebaseStorage";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

const propertyTypeOptions = [
  "Apartment",
  "Mansion",
  "Maisonette",
  "Townhouse",
  "Bungalow",
  "Duplex",
  "Triplex",
];

const locationOptions = [
  "Langata",
  "Ruiru",
  "Kikuyu",
  "Kilimani",
  "Kileleshwa",
  "Syokimau",
  "Kabete",
  "Muthaiga",
  "Riverside",
  "Kiambu Road",
  "Ngong",
];

const AdminEditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    price: "",
    location: "",
    status: "",
    features: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      if (!id) {
        toast.error("Property ID is missing");
        navigate("/admin/properties");
        return;
      }
      const property = await propertiesService.getById(id);
      if (!property) {
        toast.error("Property not found");
        navigate("/admin/properties");
        return;
      }
      setFormData({
        title: property.title || "",
        description: property.description || "",
        type: property.type || "",
        price: property.price?.toString() || "",
        location: property.location || "",
        status: property.status || "",
        features: property.features?.join(", ") || "",
      });
      setImages(property.images || []);
      // Check if location is in the predefined list
      setUseCustomLocation(!locationOptions.includes(property.location || ""));
    } catch (error) {
      toast.error("Failed to fetch property");
      console.error(error);
      navigate("/admin/properties");
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

    setUploading(true);
    try {
      const urls = await firebaseStorage.uploadFiles(
        Array.from(files),
        `properties/${Date.now()}`
      );
      
      if (import.meta.env.DEV) {
        console.log('Images uploaded:', urls);
      }
      
      setImages((prev) => [...prev, ...urls]);
      toast.success(`Successfully uploaded ${urls.length} image${urls.length > 1 ? 's' : ''}`);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to upload images";
      toast.error(errorMessage);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      toast.error("Property ID is missing");
      return;
    }
    setSubmitting(true);

    try {
      const imageUrls = images.length > 0 ? images : [];
      
      if (import.meta.env.DEV) {
        console.log('Updating property with images:', imageUrls);
      }

      await propertiesService.update(id, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: Number(formData.price),
        location: formData.location,
        status: formData.status,
        features: formData.features
          ? formData.features.split(",").map((f) => f.trim()).filter(Boolean)
          : [],
        images: imageUrls,
      });

      toast.success(`Property "${formData.title}" updated successfully!`);
      navigate("/admin/properties");
    } catch (error: any) {
      console.error('Error updating property:', error);
      const errorMessage = error?.message || "Failed to update property";
      toast.error(errorMessage);
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
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/properties")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Property</h1>
            <p className="text-muted-foreground">Update property details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Property Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (KSh)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={
                      useCustomLocation
                        ? "custom"
                        : formData.location || ""
                    }
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setUseCustomLocation(true);
                        setFormData((prev) => ({ ...prev, location: "" }));
                      } else {
                        setUseCustomLocation(false);
                        setFormData((prev) => ({ ...prev, location: value }));
                      }
                    }}
                    required={!useCustomLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Other (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                  {useCustomLocation && (
                    <Input
                      id="customLocation"
                      placeholder="Enter location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      required
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="for-sale">For Sale</SelectItem>
                      <SelectItem value="for-rent">For Rent</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Input
                    id="features"
                    name="features"
                    placeholder="e.g., Pool, Garden, Parking"
                    value={formData.features}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-4">
                <Label>Property Images</Label>
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-6">
                  <label htmlFor="images" className="cursor-pointer text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Click to upload images</p>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-3">
                    {images.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Property ${index + 1}`} className="h-32 w-full rounded-lg object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/properties")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || uploading} className="flex-1">
                  {submitting ? "Updating Property..." : "Update Property"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminEditProperty;

