import Fuse from 'fuse.js';
import channelsData from '../db/channels.json';

const SYNONYMS = {
  gear: 'equipment',
  stuff: 'equipment',
  supplies: 'equipment',
  material: 'equipment',
  kit: 'equipment',
  accessories: 'equipment',
};

// In-memory query cache: normalizedQuery -> { type: 'channels' | 'direct', channels?: string[], matchedPostIds?: string[] }
const queryCache = new Map();

/**
 * Normalizes query string: lowercases and replaces words using the synonym dictionary.
 */
export function normalizeQuery(query) {
  if (!query || typeof query !== 'string') return '';
  const words = query.trim().toLowerCase().split(/\s+/);
  const normalizedWords = words.map((w) => SYNONYMS[w] || w);
  return normalizedWords.join(' ');
}

// Prepare trigger index for Fuse search
const channelTriggersList = [];
for (const [channelName, details] of Object.entries(channelsData)) {
  for (const trigger of details.triggers || []) {
    // Also normalize the triggers to ensure symmetric matching
    const normalizedTrigger = normalizeQuery(trigger);
    channelTriggersList.push({
      channel: channelName,
      trigger: normalizedTrigger,
    });
  }
}

const channelFuse = new Fuse(channelTriggersList, {
  keys: ['trigger'],
  threshold: 0.35,
  includeScore: true,
});

/**
 * Searches posts using the 5-step pipeline:
 * 1. Normalize query with synonyms
 * 2. Match channels via trigger fuzzy match (Fuse threshold ~0.35)
 * 3. Fallback: fuzzy match against post title and itemName
 * 4. Cache resolution
 * 5. Return matched posts
 *
 * @param {string} query - Raw search query
 * @param {Array} posts - Array of post objects
 * @returns {Array} - Matching posts
 */
export function searchPosts(query, posts = []) {
  if (!query || !query.trim()) {
    return posts;
  }

  const rawTrimmed = query.trim();
  const normalized = normalizeQuery(rawTrimmed);

  // Check in-memory cache
  if (queryCache.has(normalized)) {
    const cached = queryCache.get(normalized);
    if (cached.type === 'channels' && cached.channels.length > 0) {
      return posts.filter((p) => cached.channels.includes(p.channel));
    }
    if (cached.type === 'direct') {
      const idSet = new Set(cached.matchedPostIds);
      return posts.filter((p) => idSet.has(p.id));
    }
  }

  // Step 2: Match channels against triggers
  const channelResults = channelFuse.search(normalized);
  const matchedChannels = Array.from(
    new Set(channelResults.map((res) => res.item.channel))
  );

  if (matchedChannels.length > 0) {
    // Cache matched channels
    queryCache.set(normalized, {
      type: 'channels',
      channels: matchedChannels,
    });
    return posts.filter((p) => matchedChannels.includes(p.channel));
  }

  // Step 3: Fallback - fuzzy match raw query directly against post title and itemName
  const postFuse = new Fuse(posts, {
    keys: ['title', 'itemName', 'description'],
    threshold: 0.4,
  });

  const fallbackResults = postFuse.search(rawTrimmed).map((res) => res.item);

  // Cache fallback result post IDs
  queryCache.set(normalized, {
    type: 'direct',
    matchedPostIds: fallbackResults.map((p) => p.id),
  });

  return fallbackResults;
}

export function clearSearchCache() {
  queryCache.clear();
}
