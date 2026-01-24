import { getResourcesForSector, searchResources } from "./curatedResources.js";

// In-memory cache to reduce redundant operations
const resourceCache = new Map();

// Cache key generator
function getCacheKey(query, sector, maxResults) {
  return `${sector}:${query}:${maxResults}`;
}

// Helpers to validate and normalize YouTube links
function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch" && u.searchParams.get("v")) return u.searchParams.get("v");
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id || null;
    }
    return null;
  } catch {
    return null;
  }
}
function normalizeYouTubeUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function searchYouTubeVideos(query, sector = "healthcare", maxResults = 10) {
  console.log(`\n🎓 searchCuratedResources called:`);
  console.log(`   Query: "${query}"`);
  console.log(`   Sector: ${sector}`);
  console.log(`   Source: CURATED DATABASE (verified educational content)`);
  
  // Check cache first
  const cacheKey = getCacheKey(query, sector, maxResults);
  if (resourceCache.has(cacheKey)) {
    console.log(`📦 Cache hit: "${query}"`);
    return resourceCache.get(cacheKey);
  }

  try {
    // Search curated database
    let results = searchResources(sector, query);
    
    // If no search results, get all resources for the sector
    if (!results || results.length === 0) {
      console.log(`   ℹ️  No search matches, returning all sector resources`);
      results = getResourcesForSector(sector);
    }
    
    // Keep only entries with a valid, direct YouTube video URL
    const before = (results || []).length;
    results = (results || []).filter(r => {
      if (!r || typeof r.url !== "string" || !r.url.startsWith("http")) return false;
      const vid = extractYouTubeId(r.url);
      return Boolean(vid);
    });
    const after = results.length;
    if (after < before) console.log(`   ⛏️  Filtered out ${before - after} non-video links`);

    // Limit results
    results = results.slice(0, maxResults);
    
    // Format results with normalized direct watch URLs and thumbnails
    const formattedResults = results.map(r => {
      const videoId = extractYouTubeId(r.url);
      const url = normalizeYouTubeUrl(videoId);
      return {
        id: videoId,
        title: r.title,
        channel: r.channel,
        description: r.description,
        thumbnail: r.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        url,
        type: r.type || "video",
        duration: r.duration || "N/A",
        publishedAt: new Date().toISOString(),
        source: "curated_database"
      };
    });
    
    console.log(`✅ Found ${formattedResults.length} curated resources`);
    
    // Cache the results
    resourceCache.set(cacheKey, formattedResults);
    return formattedResults;
    
  } catch (e) {
    console.error("❌ Error in searchCuratedResources:", e.message);
    // Fallback to sector resources
    const fallback = getResourcesForSector(sector).slice(0, maxResults);
    resourceCache.set(cacheKey, fallback);
    return fallback;
  }
}
