// Storage keys
const STORAGE_KEYS = {
  BLOCKED_SITES: 'blockedSites',
  SETTINGS: 'settings',
  STATS: 'stats',
  CATEGORIES: 'categories',
  SCHEDULES: 'schedules'
};

// Default settings
const DEFAULT_SETTINGS = {
  workMode: false,
  focusMode: false,
  focusEndTime: null,
  focusDuration: 25, // minutes
  password: null,
  passwordEnabled: false,
  notifications: true,
  darkMode: false
};

// Default stats
const DEFAULT_STATS = {
  blocksToday: 0,
  totalBlocks: 0,
  lastResetDate: new Date().toDateString(),
  blockHistory: []
};

// Get blocked sites
export async function getBlockedSites() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.BLOCKED_SITES);
  return result[STORAGE_KEYS.BLOCKED_SITES] || [];
}

// Add blocked site
export async function addBlockedSite(url) {
  const sites = await getBlockedSites();

  // Check if already blocked
  if (sites.some(site => site.url === url)) {
    throw new Error('This site is already blocked');
  }

  const newSite = {
    url,
    addedAt: Date.now(),
    enabled: true
  };

  sites.push(newSite);
  await chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_SITES]: sites });

  return newSite;
}

// Remove blocked site
export async function removeBlockedSite(url) {
  const sites = await getBlockedSites();
  const filtered = sites.filter(site => site.url !== url);
  await chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_SITES]: filtered });
}

// Clear all blocked sites
export async function clearAllBlockedSites() {
  await chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_SITES]: [] });
}

// Get settings
export async function getSettings() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] || {}) };
}

// Update settings
export async function updateSettings(newSettings) {
  const currentSettings = await getSettings();
  const updated = { ...currentSettings, ...newSettings };
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
  return updated;
}

// Get stats
export async function getStats() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.STATS);
  const stats = { ...DEFAULT_STATS, ...(result[STORAGE_KEYS.STATS] || {}) };

  // Reset daily stats if it's a new day
  const today = new Date().toDateString();
  if (stats.lastResetDate !== today) {
    stats.blocksToday = 0;
    stats.lastResetDate = today;
    await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: stats });
  }

  return stats;
}

// Increment block count
export async function incrementBlockCount(url) {
  const stats = await getStats();

  stats.blocksToday++;
  stats.totalBlocks++;
  stats.blockHistory.push({
    url,
    timestamp: Date.now()
  });

  // Keep only last 1000 blocks in history
  if (stats.blockHistory.length > 1000) {
    stats.blockHistory = stats.blockHistory.slice(-1000);
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: stats });
  return stats;
}

// Get categories
export async function getCategories() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CATEGORIES);
  return result[STORAGE_KEYS.CATEGORIES] || getDefaultCategories();
}

// Get default categories
function getDefaultCategories() {
  return {
    socialMedia: {
      name: 'Social Media',
      enabled: false,
      sites: [
        'facebook.com',
        'instagram.com',
        'twitter.com',
        'x.com',
        'tiktok.com',
        'snapchat.com',
        'linkedin.com',
        'pinterest.com',
        'reddit.com',
        'tumblr.com'
      ]
    },
    entertainment: {
      name: 'Video & Entertainment',
      enabled: false,
      sites: [
        'youtube.com',
        'netflix.com',
        'hulu.com',
        'disneyplus.com',
        'twitch.tv',
        'vimeo.com'
      ]
    },
    news: {
      name: 'News & Media',
      enabled: false,
      sites: [
        'cnn.com',
        'bbc.com',
        'foxnews.com',
        'nytimes.com',
        'washingtonpost.com',
        'theguardian.com'
      ]
    },
    gaming: {
      name: 'Gaming',
      enabled: false,
      sites: [
        'steam.com',
        'epicgames.com',
        'twitch.tv',
        'ign.com',
        'gamespot.com',
        'roblox.com'
      ]
    },
    shopping: {
      name: 'Shopping',
      enabled: false,
      sites: [
        'amazon.com',
        'ebay.com',
        'walmart.com',
        'target.com',
        'etsy.com'
      ]
    }
  };
}

// Update category
export async function updateCategory(categoryId, updates) {
  const categories = await getCategories();
  categories[categoryId] = { ...categories[categoryId], ...updates };
  await chrome.storage.local.set({ [STORAGE_KEYS.CATEGORIES]: categories });
  return categories;
}

// Get schedules
export async function getSchedules() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SCHEDULES);
  return result[STORAGE_KEYS.SCHEDULES] || [];
}

// Add schedule
export async function addSchedule(schedule) {
  const schedules = await getSchedules();
  const newSchedule = {
    id: Date.now(),
    ...schedule,
    enabled: true
  };
  schedules.push(newSchedule);
  await chrome.storage.local.set({ [STORAGE_KEYS.SCHEDULES]: schedules });
  return newSchedule;
}

// Remove schedule
export async function removeSchedule(scheduleId) {
  const schedules = await getSchedules();
  const filtered = schedules.filter(s => s.id !== scheduleId);
  await chrome.storage.local.set({ [STORAGE_KEYS.SCHEDULES]: filtered });
}
