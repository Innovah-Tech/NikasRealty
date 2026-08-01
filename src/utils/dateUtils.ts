/**
 * Format a date as a human-readable relative string for "Posted" labels.
 */
export const formatPostedDate = (date: Date): string => {
  const now = new Date();
  const target = date instanceof Date ? date : new Date(date);

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays >= 2 && diffDays <= 6) return `${diffDays} days ago`;
  if (diffDays >= 7 && diffDays <= 13) return '1 week ago';
  if (diffDays >= 14 && diffDays <= 20) return '2 weeks ago';
  if (diffDays >= 21 && diffDays <= 27) return '3 weeks ago';

  return target.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** Format for card labels, e.g. "Published Aug 1, 2026" */
export const formatPublishedLabel = (date?: Date | string): string | null => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `Published ${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
};
