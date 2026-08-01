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
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, ArrowLeft } from "lucide-react";
import { propertiesService } from "@/services/firestore/properties";
import { firebaseStorage } from "@/services/firebaseStorage";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { PROPERTY_CONFIG } from "@/config/constants";
import { sanitizeText } from "@/utils/sanitize";
import { validateTitle, validateDescription, validatePrice, validateFeatures } from "@/utils/validate";
import { getPropertyImageUrl } from "@/utils/imageUtils";
import { arrayToLines, linesToArray } from "@/utils/text";
import { buildExtendedPropertyFields, createEmptyAvailableUnits } from "@/utils/propertyFormUtils";
import AvailableUnitsBuilder from "@/components/admin/AvailableUnitsBuilder";
import type { AvailableUnitsSection } from "@/services/firestore/properties";
import { formatPostedDate } from "@/utils/dateUtils";
import { getPropertyAmenities } from "@/utils/propertyUtils";

const propertyTypeOptions = PROPERTY_CONFIG.propertyTypes;
const locationOptions = PROPERTY_CONFIG.locations;

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
    priceType: "exact" as "exact" | "from",
    priceDaily: "",
    priceMonthly: "",
    location: "",
    status: "",
    projectStage: "",
    amenities: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    featured: false,
    offplan: false,
    paymentPlanTitle: "Flexible Payment Plan",
    paymentPlanContent: "",
    paymentPlanCash: false,
    paymentPlanMortgage: false,
  });
  const [availableUnits, setAvailableUnits] = useState<AvailableUnitsSection>(createEmptyAvailableUnits());
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
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
        priceType: property.priceType || "exact",
        priceDaily: property.priceDaily?.toString() || "",
        priceMonthly: property.priceMonthly?.toString() || "",
        location: property.location || "",
        status: property.status || "",
        projectStage: property.projectStage || "",
        amenities: arrayToLines(getPropertyAmenities(property)),
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        size: property.size || "",
        featured: property.featured || false,
        offplan: property.offplan || false,
        paymentPlanTitle: property.paymentPlan?.title || "Flexible Payment Plan",
        paymentPlanContent: property.paymentPlan?.content || "",
        paymentPlanCash: property.paymentPlan?.paymentMethods?.includes('cash') ?? false,
        paymentPlanMortgage: property.paymentPlan?.paymentMethods?.includes('mortgage') ?? false,
      });
      setAvailableUnits(property.availableUnits ?? createEmptyAvailableUnits());
      setCreatedAt(property.createdAt ?? null);
      setImages(property.images || []);
      // Check if location is in the predefined list
      setUseCustomLocation(!PROPERTY_CONFIG.locations.includes(property.location as any || ""));
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
    if (formData.status !== 'for-rent' && !priceValidation.valid) {
      toast.error(priceValidation.error || 'Invalid price');
      return;
    }

    if (formData.status === 'for-rent' && !formData.priceDaily && !formData.priceMonthly) {
      toast.error('Please enter at least a Daily or Monthly price');
      return;
    }

    if (!formData.type || !formData.location || !formData.status) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const imageUrls = images.length > 0 ? images : [];
      const amenitiesArray = linesToArray(formData.amenities);

      const amenitiesValidation = validateFeatures(amenitiesArray);
      if (!amenitiesValidation.valid) {
        toast.error(amenitiesValidation.error || 'Invalid amenities');
        setSubmitting(false);
        return;
      }

      const withSizeUnit = (val: string) => {
        const size = val.trim();
        const lower = size.toLowerCase();
        const hasUnit = /sqm|sq\.?\s*m|sqft|sq\.?\s*ft|m²|ft²|acre/.test(lower);
        return hasUnit ? size : `${size} sqm`;
      };

      const priceDaily = formData.priceDaily ? Number(formData.priceDaily) : undefined;
      const priceMonthly = formData.priceMonthly ? Number(formData.priceMonthly) : undefined;

      // Determine main price for sorting/display
      let mainPrice = Number(formData.price);
      if (formData.status === 'for-rent') {
        if (priceMonthly) mainPrice = priceMonthly;
        else if (priceDaily) mainPrice = priceDaily * 30; // Approximation for sorting
      }

      const extendedFields = buildExtendedPropertyFields({
        description: formData.description,
        amenities: formData.amenities,
        priceType: formData.priceType,
        paymentPlanTitle: formData.paymentPlanTitle,
        paymentPlanContent: formData.paymentPlanContent,
        paymentPlanCash: formData.paymentPlanCash,
        paymentPlanMortgage: formData.paymentPlanMortgage,
        availableUnits,
      });

      const propertyData: any = {
        title: sanitizeText(formData.title),
        type: formData.type,
        price: mainPrice,
        location: sanitizeText(formData.location),
        status: formData.status,
        featured: formData.featured,
        offplan: formData.offplan,
        images: imageUrls,
        ...extendedFields,
      };

      // Clear optional sections when emptied
      if (
        !formData.paymentPlanContent.trim() &&
        !formData.paymentPlanCash &&
        !formData.paymentPlanMortgage
      ) {
        propertyData.paymentPlan = null;
      }
      if (!extendedFields.availableUnits) {
        propertyData.availableUnits = null;
      }

      // Only include optional fields if they have values
      if (priceDaily !== undefined) propertyData.priceDaily = priceDaily;
      if (priceMonthly !== undefined) propertyData.priceMonthly = priceMonthly;
      if (formData.projectStage) propertyData.projectStage = sanitizeText(formData.projectStage);
      if (formData.bedrooms) propertyData.bedrooms = Number(formData.bedrooms);
      if (formData.bathrooms) propertyData.bathrooms = Number(formData.bathrooms);
      if (formData.size) propertyData.size = sanitizeText(withSizeUnit(formData.size));

      await propertiesService.update(id, propertyData);


      toast.success(`Property updated successfully!`);
      navigate("/admin/properties");
    } catch (error: any) {
      console.error('Error updating property:', error);

      // Provide user-friendly error messages
      let errorMessage = "Failed to update property";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code) {
        if (error.code === 'permission-denied') {
          errorMessage = "Permission denied. Please check your authentication.";
        } else if (error.code === 'not-found') {
          errorMessage = "Property not found. It may have been deleted.";
        } else if (error.code === 'unavailable') {
          errorMessage = "Service temporarily unavailable. Please try again.";
        } else if (error.code === 'unauthenticated') {
          errorMessage = "You must be logged in to update properties.";
        }
      }

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
            {createdAt && (
              <p className="text-sm text-muted-foreground mt-1">
                Posted {formatPostedDate(createdAt)} · {createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
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

                {formData.status === 'for-rent' ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="priceDaily">Daily Price (KSh)</Label>
                      <Input
                        id="priceDaily"
                        name="priceDaily"
                        type="number"
                        value={formData.priceDaily}
                        onChange={handleChange}
                        placeholder="e.g. 5000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceMonthly">Monthly Price (KSh)</Label>
                      <Input
                        id="priceMonthly"
                        name="priceMonthly"
                        type="number"
                        value={formData.priceMonthly}
                        onChange={handleChange}
                        placeholder="e.g. 150000"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="priceType">Price Type</Label>
                      <Select
                        value={formData.priceType}
                        onValueChange={(value: "exact" | "from") =>
                          setFormData({ ...formData, priceType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exact">Exact Price</SelectItem>
                          <SelectItem value="from">From Price</SelectItem>
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
                        required={formData.status !== 'for-rent'}
                      />
                    </div>
                  </>
                )}

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
                  <Label htmlFor="projectStage">Project Stage</Label>
                  <Select
                    value={formData.projectStage}
                    onValueChange={(value) => setFormData({ ...formData, projectStage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ready">Ready</SelectItem>
                      <SelectItem value="Under Construction">Under Construction</SelectItem>
                      <SelectItem value="Offplan">Off-plan</SelectItem>
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

                <div className="flex items-center space-x-2 pt-6 md:col-span-2">
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
                  rows={8}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter each paragraph on a new line. Use blank lines to add spacing between paragraphs."
                  required
                  className="leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities & Features</Label>
                <Textarea
                  id="amenities"
                  name="amenities"
                  rows={6}
                  placeholder="One amenity per line"
                  value={formData.amenities}
                  onChange={handleChange}
                  className="leading-relaxed"
                />
              </div>

              <AvailableUnitsBuilder value={availableUnits} onChange={setAvailableUnits} />

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Payment Plan</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Optional. Select payment options and/or add plan details.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentPlanTitle">Section Title</Label>
                    <Input
                      id="paymentPlanTitle"
                      name="paymentPlanTitle"
                      value={formData.paymentPlanTitle}
                      onChange={handleChange}
                      placeholder="Flexible Payment Plan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Options</Label>
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center space-x-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={formData.paymentPlanCash}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, paymentPlanCash: Boolean(checked) })
                          }
                        />
                        <span>Cash</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={formData.paymentPlanMortgage}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, paymentPlanMortgage: Boolean(checked) })
                          }
                        />
                        <span>Mortgage</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentPlanContent">Content</Label>
                    <Textarea
                      id="paymentPlanContent"
                      name="paymentPlanContent"
                      rows={5}
                      value={formData.paymentPlanContent}
                      onChange={handleChange}
                      placeholder="Enter each paragraph on a new line..."
                      className="leading-relaxed"
                    />
                  </div>
                </CardContent>
              </Card>

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
                        <img src={getPropertyImageUrl(url, 'thumbnail')} alt={`Property ${index + 1}`} className="h-32 w-full rounded-lg object-cover" />
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

