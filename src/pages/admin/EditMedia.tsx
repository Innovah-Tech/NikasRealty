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
import { useNavigate, useParams } from 'react-router-dom';
import { mediaService } from '@/services/firestore/media';
import { propertiesService, type Property } from '@/services/firestore/properties';
import { sanitizeText } from '@/utils/sanitize';
import { validateTitle, validateMessage } from '@/utils/validate';
import { extractYouTubeVideoId, formatMediaCategory, getYouTubeThumbnail, isValidYouTubeUrl } from '@/utils/youtubeUtils';

const AdminEditMedia = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    propertyId: '',
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [media, props] = await Promise.all([
          mediaService.getById(id!),
          propertiesService.getAll(),
        ]);

        if (!media) {
          toast.error('Video not found');
          navigate('/admin/media');
          return;
        }

        setProperties(props || []);
        setFormData({
          title: media.title || '',
          description: media.description || '',
          youtubeUrl: media.youtubeUrl || '',
          propertyId: media.propertyId || '',
          status: media.status || 'draft',
        });
      } catch (error) {
        toast.error('Failed to load video');
        console.error(error);
        navigate('/admin/media');
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id, navigate]);

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);
  const previewVideoId = extractYouTubeVideoId(formData.youtubeUrl);

  const handlePropertyChange = (propertyId: string) => {
    setFormData((prev) => ({ ...prev, propertyId }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

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
      await mediaService.update(id, {
        title: sanitizeText(formData.title),
        description: formData.description.trim() ? sanitizeText(formData.description) : '',
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

      toast.success('Video updated successfully');
      navigate('/admin/media');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update video';
      toast.error(message);
      console.error(error);
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
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/media')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit Property Video</h1>
            <p className="text-muted-foreground">Update YouTube video details</p>
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
                <Select value={formData.propertyId} onValueChange={handlePropertyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
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
                  <p className="font-medium text-foreground">Linked property</p>
                  <p>{selectedProperty.title}</p>
                  <p>{selectedProperty.location} · {selectedProperty.bedrooms ?? '-'} bed</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/media')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gradient-gold text-secondary">
              {submitting ? 'Saving...' : 'Update Video'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminEditMedia;
