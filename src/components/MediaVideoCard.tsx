import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { PropertyMedia } from '@/services/firestore/media';
import { getYouTubeThumbnail, formatMediaCategory } from '@/utils/youtubeUtils';

interface MediaVideoCardProps {
  media: PropertyMedia;
}

const formatPrice = (price?: number | string): string => {
  if (price === undefined || price === null || price === '') return '';
  if (typeof price === 'number') {
    return `KSH ${price.toLocaleString()}`;
  }
  const numeric = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  if (!Number.isNaN(numeric) && numeric > 0) {
    return `KSH ${numeric.toLocaleString()}`;
  }
  return String(price).toUpperCase().includes('KSH') ? String(price) : `KSH ${price}`;
};

const formatPublishedDate = (date?: Date | string): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `Published ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

const MediaVideoCard = ({ media }: MediaVideoCardProps) => {
  const navigate = useNavigate();
  const thumbnail = getYouTubeThumbnail(media.youtubeVideoId);
  const category = media.category || formatMediaCategory(media.propertyType);
  const bedroomLabel = media.propertyBedrooms
    ? `${media.propertyBedrooms} - BEDROOM`
    : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={thumbnail}
          alt={media.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        {/* Price overlay */}
        {media.propertyPrice !== undefined && media.propertyPrice !== '' && (
          <div className="absolute left-3 top-3">
            <span
              className="text-lg font-extrabold tracking-wide text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-xl"
              style={{ WebkitTextStroke: '0.5px rgba(0,0,0,0.35)' }}
            >
              {formatPrice(media.propertyPrice)}
            </span>
          </div>
        )}

        {/* Play button */}
        <button
          type="button"
          onClick={() => media.id && navigate(`/media/${media.id}`)}
          className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/20"
          aria-label={`Watch ${media.title}`}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1b7a4e] shadow-lg transition-transform hover:scale-105">
            <Play className="ml-1 h-7 w-7 fill-white text-white" />
          </span>
        </button>

        {/* Bottom badges */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
          {bedroomLabel && (
            <span className="rounded-md bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-xs">
              {bedroomLabel}
            </span>
          )}
          {media.propertyLocation && (
            <span className="w-fit rounded-md bg-black/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-xs">
              {media.propertyLocation.split(',')[0].trim().toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#1b7a4e]">
          {category}
        </p>

        <h3 className="text-base font-bold leading-snug text-foreground sm:text-lg">
          {media.title}
        </h3>

        {(media.publishedAt || media.createdAt) && (
          <p className="text-sm font-medium text-foreground">
            {formatPublishedDate(media.publishedAt || media.createdAt)}
          </p>
        )}

        {media.description?.trim() && (
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {media.description}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            className="flex-1 rounded-full bg-[#1b7a4e] text-white hover:bg-[#156041]"
            onClick={() => media.id && navigate(`/media/${media.id}`)}
          >
            Watch Video
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-full border-[#1b7a4e] text-[#1b7a4e] hover:bg-[#1b7a4e]/5"
            onClick={() => navigate(`/properties/${media.propertyId}`)}
          >
            View Property
          </Button>
        </div>
      </div>
    </article>
  );
};

export default MediaVideoCard;
