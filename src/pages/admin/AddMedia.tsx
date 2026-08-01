import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { mediaService } from '@/services/firestore/media';
import { propertiesService, type Property } from '@/services/firestore/properties';
import { sanitizeText } from '@/utils/sanitize';
import { validateTitle, validateMessage } from '@/utils/validate';
import { extractYouTubeVideoId, formatMediaCategory, getYouTubeThumbnail, isValidYouTubeUrl } from '@/utils/youtubeUtils';

const AdminAddMedia = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    propertyId: '',
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await propertiesService.getAll();
        setProperties(data || []);
      } catch (error) {
        toast.error('Failed to load properties');
        console.error(error);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchProperties();
  }, []);

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);
  const previewVideoId = extractYouTubeVideoId(formData.youtubeUrl);

  const handlePropertyChange = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    setFormData((prev) => ({
      ...prev,
      propertyId,
      title: prev.title || (property ? `${property.title} Video Tour` : prev.title),
      description:
        prev.description ||
        (property?.description
          ? `Watch this Nikas Realty video tour for ${property.title} in ${property.location}.`
          : prev.description),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.propertyId) {
      toast.error('Please select a property');
      return;
    }

    if (!isValidYouTubeUrl(formData.youtubeUrl)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    const titleValidation = validateTitle(formData.title);
    if (!titleValidation.valid) {
      toast.error(titleValidation.error || 'Invalid title');
      return;
    }

    if (formData.description.trim()) {
      const descValidation = validateMessage(formData.description, 'Description');
      if (!descValidation.valid) {
        toast.error(descValidation.error || 'Invalid description');
        return;
      }
    }

    const property = properties.find((p) => p.id === formData.propertyId);
    if (!property?.id) {
      toast.error('Selected property not found');
      return;
    }

    setSubmitting(true);
    try {
      await mediaService.create({
        title: sanitizeText(formData.title),
        description: formData.description.trim() ? sanitizeText(formData.description) : undefined,
        youtubeUrl: formData.youtubeUrl.trim(),
        propertyId: property.id,
        propertyTitle: property.title,
        propertyPrice: property.price,
        propertyLocation: property.location,
        propertyBedrooms: property.bedrooms,
        propertyType: property.type,
        category: formatMediaCategory(property.type),
        status: formData.status,
      });

      toast.success(
        formData.status === 'published'
          ? 'Video published! It will appear on the Media page.'
          : 'Video saved as draft. Publish it to show on the Media page.'
      );
      navigate('/admin/media');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create video';
      toast.error(message);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/media')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add Property Video</h1>
            <p className="text-muted-foreground">Link a YouTube video to a property listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyId">Property *</Label>
                <Select
                  value={formData.propertyId}
                  onValueChange={handlePropertyChange}
                  disabled={loadingProperties}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProperties ? 'Loading properties...' : 'Select a property'} />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id!}>
                        {property.title} — {property.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">YouTube URL *</Label>
                <Input
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Paste the full YouTube link for the property video tour.
                </p>
              </div>

              {previewVideoId && (
                <div className="overflow-hidden rounded-lg border border-border">
                  <img
                    src={getYouTubeThumbnail(previewVideoId)}
                    alt="YouTube preview"
                    className="aspect-video w-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Affordable 3 Bedroom Apartment for Sale in Kileleshwa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description shown on the media card..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'draft' | 'published') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedProperty && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Linked property preview</p>
                  <p>{selectedProperty.title}</p>
                  <p>{selectedProperty.location} · {selectedProperty.bedrooms ?? '-'} bed · {selectedProperty.type}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/media')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gradient-gold text-secondary">
              {submitting ? 'Saving...' : 'Save Video'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminAddMedia;
