/**
 * Robust YouTube ID extractor supporting:
 * - youtube.com/watch?v=XYZ
 * - youtu.be/XYZ
 * - youtube.com/embed/XYZ
 * - youtube.com/live/XYZ
 * - Raw 11-char ID
 */
export function extractYoutubeId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|live\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regex);
  return match ? match[1] : trimmed;
}
