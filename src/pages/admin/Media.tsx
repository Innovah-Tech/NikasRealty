import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Video, Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { mediaService, type PropertyMedia } from '@/services/firestore/media';
import { getYouTubeThumbnail } from '@/utils/youtubeUtils';

const AdminMedia = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PropertyMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, [statusFilter]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await mediaService.getAll({
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setItems(data);
    } catch (error) {
      toast.error('Failed to fetch media');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchMedia();

  const handleDelete = async (id: string) => {
    try {
      await mediaService.delete(id);
      toast.success('Video deleted successfully');
      fetchMedia();
    } catch (error) {
      toast.error('Failed to delete video');
      console.error(error);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleToggleStatus = async (item: PropertyMedia) => {
    try {
      const newStatus = item.status === 'published' ? 'draft' : 'published';
      await mediaService.update(item.id!, { status: newStatus });
      toast.success(`Video ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      fetchMedia();
    } catch (error) {
      toast.error('Failed to update video status');
      console.error(error);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.propertyTitle?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Property Media</h1>
            <p className="text-muted-foreground">Manage YouTube property videos</p>
          </div>
          <Button onClick={() => navigate('/admin/add-media')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Video
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="min-w-[200px] flex-1">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search videos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 rounded-t-lg bg-muted" />
                <CardHeader>
                  <div className="h-4 w-3/4 rounded bg-muted" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No videos found</h3>
              <p className="mb-4 text-muted-foreground">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first property video from YouTube'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button onClick={() => navigate('/admin/add-media')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Video
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-40 bg-muted">
                  <img
                    src={getYouTubeThumbnail(item.youtubeVideoId)}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-lg">{item.title}</CardTitle>
                    <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    Property: {item.propertyTitle}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => item.id && navigate(`/admin/edit-media/${item.id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleStatus(item)}>
                      {item.status === 'published' ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!item.id) return;
                        setItemToDelete(item.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the property video.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AdminMedia;
