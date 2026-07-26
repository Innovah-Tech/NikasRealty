/** Strip leading list markers from a line of text. */
const stripListMarker = (line: string): string =>
  line.replace(/^[-•*]\s*/, '').trim();

/**
 * Split stored property description into display lines (sentences/bullets),
 * matching how amenities & features are shown as a list.
 */
export const descriptionToLines = (description: string): string[] => {
  const trimmed = description?.trim();
  if (!trimmed) return [];

  const byNewline = trimmed
    .split(/\r?\n/)
    .map(stripListMarker)
    .filter(Boolean);

  if (byNewline.length > 1) {
    return byNewline;
  }

  const byComma = trimmed.split(',').map(stripListMarker).filter(Boolean);
  if (byComma.length > 1) {
    return byComma;
  }

  const single = byComma[0] ?? trimmed;
  if (single.includes('. ') || single.includes('! ') || single.includes('? ')) {
    return single
      .split(/(?<=[.!?])\s+/)
      .map(stripListMarker)
      .filter(Boolean);
  }

  return [single];
};
