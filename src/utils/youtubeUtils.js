/**
 * YouTube URL parsing and video info utilities
 */

export function extractVideoId(url) {
  if (!url) return null;

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  return null;
}

export function extractPlaylistId(url) {
  if (!url) return null;
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function isPlaylistUrl(url) {
  return !!extractPlaylistId(url);
}

export async function fetchVideoInfo(videoId) {
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await res.json();
    return {
      id: videoId,
      title: data.title || `Video ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      addedAt: Date.now()
    };
  } catch {
    return {
      id: videoId,
      title: `Video ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      addedAt: Date.now()
    };
  }
}

/**
 * Helper: fetch YouTube HTML via our serverless proxy (Vercel) or corsproxy.io (local dev)
 * Validates the response actually contains YouTube data before accepting it.
 */
async function fetchYouTubeHTML(type, param) {
  // Try our own serverless proxy first (works on Vercel)
  try {
    const proxyUrl = type === 'search'
      ? `/api/youtube-proxy?type=search&q=${encodeURIComponent(param)}`
      : `/api/youtube-proxy?type=playlist&id=${encodeURIComponent(param)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const html = await res.text();
      // Validate it's actually YouTube HTML, not the SPA fallback (Vite dev server returns index.html for unknown routes)
      if (html.includes('ytInitialData')) return html;
    }
  } catch { /* fall through to corsproxy */ }

  // Fallback to corsproxy.io (works for local dev)
  const ytUrl = type === 'search'
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(param)}`
    : `https://www.youtube.com/playlist?list=${encodeURIComponent(param)}`;
  const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(ytUrl)}`);
  if (!res.ok) throw new Error(`Failed to fetch YouTube ${type} page`);
  return res.text();
}

export async function fetchPlaylistVideos(playlistId) {
  try {
    const html = await fetchYouTubeHTML('playlist', playlistId);

    const jsonMatch = html.match(/var ytInitialData = ({.*});<\/script>/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error('ytInitialData not found in HTML');
    }

    const data = JSON.parse(jsonMatch[1]);

    const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs;
    if (!tabs) throw new Error('Tabs data missing');

    const playlistTab = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents[0]?.playlistVideoListRenderer;
    if (!playlistTab || !playlistTab.contents) throw new Error('Playlist contents not found');

    const videos = [];

    for (const item of playlistTab.contents) {
      const videoData = item.playlistVideoRenderer;
      if (!videoData) continue;

      const videoId = videoData.videoId;
      const title = videoData.title?.runs?.[0]?.text || `Video ${videoId}`;

      if (!videoId || videoData.isPlayable === false || title === '[Private video]' || title === '[Deleted video]') {
        continue;
      }

      videos.push({
        id: videoId,
        title: title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        addedAt: Date.now()
      });
    }

    if (videos.length === 0) {
      return { error: 'Playlist is empty, private, or could not be parsed.' };
    }

    return { videos };
  } catch (error) {
    console.error('Playlist parse error:', error);
    return { error: 'Could not fetch playlist. Make sure the playlist is public/unlisted.' };
  }
}

export function getThumbnailUrl(videoId, quality = 'mqdefault') {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export async function searchYouTube(query) {
  try {
    const html = await fetchYouTubeHTML('search', query);

    const jsonMatch = html.match(/var ytInitialData = ({.*});<\/script>/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error('ytInitialData not found in search HTML');
    }

    const data = JSON.parse(jsonMatch[1]);

    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    if (!contents) throw new Error('Search contents not found');

    const itemSection = contents.find(c => c.itemSectionRenderer)?.itemSectionRenderer?.contents;
    if (!itemSection) throw new Error('Video results not found');

    for (const item of itemSection) {
      const video = item.videoRenderer;
      if (video && video.videoId) {
        return {
          id: video.videoId,
          title: video.title?.runs?.[0]?.text || `Video ${video.videoId}`,
          thumbnail: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
          addedAt: Date.now()
        };
      }
    }

    return { error: 'No videos found for that search query.' };
  } catch (error) {
    console.error('Search error:', error);
    return { error: 'Failed to search YouTube. Try pasting a direct link instead.' };
  }
}
