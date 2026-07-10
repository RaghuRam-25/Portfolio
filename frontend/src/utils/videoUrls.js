export const toEmbeddableVideoUrl = (url) => {
  if (!url) return '';

  const rawUrl = String(url).trim();
  if (!rawUrl) return '';

  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (hostname === 'youtu.be') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0];
      return videoId ? buildYouTubeEmbedUrl(videoId, parsed.searchParams) : rawUrl;
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com' || hostname === 'music.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) return rawUrl;

      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const videoId = parsed.searchParams.get('v')
        || (pathParts[0] === 'shorts' ? pathParts[1] : '')
        || (pathParts[0] === 'live' ? pathParts[1] : '');

      return videoId ? buildYouTubeEmbedUrl(videoId, parsed.searchParams) : rawUrl;
    }
  } catch {
    return rawUrl;
  }

  return rawUrl;
};

const buildYouTubeEmbedUrl = (videoId, sourceParams) => {
  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  const start = sourceParams.get('start') || parseYouTubeTime(sourceParams.get('t'));
  const playlist = sourceParams.get('list');

  if (start) embedUrl.searchParams.set('start', start);
  if (playlist) embedUrl.searchParams.set('list', playlist);

  return embedUrl.toString();
};

const parseYouTubeTime = (time) => {
  if (!time) return '';
  if (/^\d+$/.test(time)) return time;

  const match = time.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match) return '';

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds ? String(totalSeconds) : '';
};
