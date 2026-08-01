/** Extract a YouTube video ID from common URL formats. */
export const extractYouTubeVideoId = (url: string): string | null => {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

export const getYouTubeThumbnail = (videoId: string): string =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

export const getYouTubeEmbedUrl = (videoId: string, autoplay = false): string =>
  `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;

export const isValidYouTubeUrl = (url: string): boolean =>
  extractYouTubeVideoId(url) !== null;

export const formatMediaCategory = (propertyType?: string): string => {
  if (!propertyType?.trim()) return 'PROPERTY VIDEOS';
  return `${propertyType.trim().toUpperCase()} VIDEOS`;
};
