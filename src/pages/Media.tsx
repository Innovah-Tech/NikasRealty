import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaVideoCard from '@/components/MediaVideoCard';
import { mediaService, type PropertyMedia } from '@/services/firestore/media';

const MediaPage = () => {
  const [videos, setVideos] = useState<PropertyMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const data = await mediaService.getPublished();
        setVideos(data || []);
      } catch (err) {
        console.error('Failed to fetch media:', err);
        setError('Unable to load property videos right now. Please try again shortly.');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-background py-20 pt-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-16 text-center">
            <h1 className="mb-3 text-5xl font-bold text-foreground">Property Media</h1>
            <div className="mx-auto mb-3 h-1 w-24 gradient-gold" />
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Watch video tours of our featured properties and explore homes across Kenya with Nikas Realty.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16 text-muted-foreground">Loading videos...</div>
          ) : error ? (
            <div className="py-16 text-center text-muted-foreground">{error}</div>
          ) : videos.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="mb-2">No property videos available yet.</p>
              <p className="text-sm">Check back soon for new video tours.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <MediaVideoCard key={video.id} media={video} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default MediaPage;
