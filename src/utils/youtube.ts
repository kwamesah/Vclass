/**
 * YouTube Utility Functions for Salem Montessori VClass
 * Handles parsing, validation, and embed URL generation for in-system playback
 */

export function getYouTubeVideoId(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Handle standard watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
  // Shortened URLs: https://youtu.be/VIDEO_ID
  // Embed URLs: https://www.youtube.com/embed/VIDEO_ID
  // Shorts URLs: https://www.youtube.com/shorts/VIDEO_ID
  // Mobile URLs: https://m.youtube.com/watch?v=VIDEO_ID
  // Standard format regex capturing 11-char alphanumeric ID
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i,
    /^([\w-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function isValidYouTubeUrl(url: string | undefined | null): boolean {
  return getYouTubeVideoId(url) !== null;
}

export function getYouTubeEmbedUrl(url: string | undefined | null, autoplay = false): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    origin: window.location.origin,
    autoplay: autoplay ? '1' : '0',
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeThumbnailUrl(url: string | undefined | null, quality: 'default' | 'hq' | 'maxres' = 'hq'): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function extractYouTubeUrlsFromText(text: string | undefined | null): string[] {
  if (!text) return [];
  const regex = /(https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)[\w-]{11}[^\s<>"']*)/gi;
  const matches = text.match(regex);
  if (!matches) return [];
  return Array.from(new Set(matches.map((u) => u.replace(/[.,;:)\]]+$/, ''))));
}
