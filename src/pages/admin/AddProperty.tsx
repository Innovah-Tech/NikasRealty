import { useState } from "react";
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
import { Upload, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { propertiesService } from "@/services/firestore/properties";
import { firebaseStorage } from "@/services/firebaseStorage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PROPERTY_CONFIG } from "@/config/constants";
import { sanitizeText, sanitizeArray } from "@/utils/sanitize";
import { validateTitle, validateDescription, validatePrice, validateFeatures } from "@/utils/validate";

const propertyTypeOptions = PROPERTY_CONFIG.propertyTypes;
const locationOptions = PROPERTY_CONFIG.locations;

const AdminAddProperty = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    price: "",
    location: "",
    status: "",
    features: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    featured: false,
    offplan: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const navigate = useNavigate();

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
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const titleValidation = validateTitle(formData.title);
    if (!titleValidation.valid) {
      toast.error(titleValidation.error || 'Invalid title');
      return;
    }
    
    const descriptionValidation = validateDescription(formData.description);
    if (!descriptionValidation.valid) {
      toast.error(descriptionValidation.error || 'Invalid description');
      return;
    }
    
    const priceValidation = validatePrice(formData.price);
    if (!priceValidation.valid) {
      toast.error(priceValidation.error || 'Invalid price');
      return;
    }
    
    if (!formData.type || !formData.location || !formData.status) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);

    try {
      // Sanitize and prepare data
      const imageUrls = images.length > 0 ? images : [];
      const featuresArray = formData.features
        ? formData.features.split(",").map((f) => f.trim()).filter(Boolean)
        : [];
      
      const featuresValidation = validateFeatures(featuresArray);
      if (!featuresValidation.valid) {
        toast.error(featuresValidation.error || 'Invalid features');
        setSubmitting(false);
        return;
      }
      
      const sanitizedFeatures = sanitizeArray(featuresArray);

      const result = await propertiesService.create({
        title: sanitizeText(formData.title),
        description: sanitizeText(formData.description),
        type: formData.type,
        price: Number(formData.price),
        location: sanitizeText(formData.location),
        status: formData.status,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        size: formData.size ? sanitizeText(formData.size) : undefined,
        featured: formData.featured,
        offplan: formData.offplan,
        features: sanitizedFeatures,
        images: imageUrls,
      });

      toast.success(`Property "${sanitizeText(formData.title)}" added successfully with ${imageUrls.length} image${imageUrls.length !== 1 ? 's' : ''}!`);
      navigate("/admin/properties");
    } catch (error: any) {
      console.error('Error creating property:', error);
      toast.error("Failed to add property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Property</h1>
          <p className="text-muted-foreground">Fill in the details to list a new property</p>
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
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="e.g., 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size (sqm)</Label>
                  <Input
                    id="size"
                    name="size"
                    type="text"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="e.g., 150 sqm or 2,650 - 3,750 sqft"
                  />
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

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked === true })}
                  />
                  <Label htmlFor="featured" className="cursor-pointer font-normal">
                    Mark as Featured Property
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="offplan"
                    checked={formData.offplan}
                    onCheckedChange={(checked) => setFormData({ ...formData, offplan: checked === true })}
                  />
                  <Label htmlFor="offplan" className="cursor-pointer font-normal">
                    Mark as Off-plan Property
                  </Label>
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
                  {submitting ? "Adding Property..." : "Add Property"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminAddProperty;

