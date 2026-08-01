import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { mediaService, type PropertyMedia } from '@/services/firestore/media';
import { getYouTubeEmbedUrl } from '@/utils/youtubeUtils';

const MediaWatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [media, setMedia] = useState<PropertyMedia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchMedia = async () => {
      try {
        const data = await mediaService.getById(id);
        setMedia(data);
      } catch (error) {
        console.error('Failed to load video:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto flex justify-center px-4 py-32 lg:px-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center lg:px-8">
          <h1 className="mb-4 text-2xl font-semibold">Video not found</h1>
          <Button variant="outline" onClick={() => navigate('/media')}>
            Back to Media
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 pb-16 pt-28 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/media')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Media
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#1b7a4e] text-[#1b7a4e]"
            onClick={() => navigate(`/properties/${media.propertyId}`)}
          >
            View Property
          </Button>
        </div>

        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{media.title}</h1>
            {media.description?.trim() && (
              <p className="mt-2 text-muted-foreground">{media.description}</p>
            )}
          </div>

          <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-lg">
            <iframe
              src={getYouTubeEmbedUrl(media.youtubeVideoId, true)}
              title={media.title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 rounded-full bg-[#1b7a4e] text-white hover:bg-[#156041]"
              onClick={() => navigate(`/properties/${media.propertyId}`)}
            >
              View Property Details
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => navigate('/media')}
            >
              Browse More Videos
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MediaWatchPage;
