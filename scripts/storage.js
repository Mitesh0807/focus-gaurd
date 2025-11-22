import {
	STORAGE_KEYS,
	DEFAULT_SETTINGS,
	DEFAULT_STATS,
	LIMITS,
} from "./constants.js";

export async function getBlockedSites() {
	const result = await chrome.storage.local.get(STORAGE_KEYS.BLOCKED_SITES);
	return result[STORAGE_KEYS.BLOCKED_SITES] || [];
}

export async function addBlockedSite(url) {
	const sites = await getBlockedSites();

	if (sites.some((site) => site.url === url)) {
		throw new Error("This site is already blocked");
	}

	const newSite = {
		url,
		addedAt: Date.now(),
		enabled: true,
	};

	sites.push(newSite);
	await chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_SITES]: sites });

	return newSite;
}

export async function removeBlockedSite(url) {
	const sites = await getBlockedSites();
	const filtered = sites.filter((site) => site.url !== url);
	await chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_SITES]: filtered });
}

export async function clearAllBlockedSites() {
	await chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_SITES]: [] });
}

export async function getSettings() {
	const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
	return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] || {}) };
}

export async function updateSettings(newSettings) {
	const currentSettings = await getSettings();
	const updated = { ...currentSettings, ...newSettings };
	await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
	return updated;
}

export async function getStats() {
	const result = await chrome.storage.local.get(STORAGE_KEYS.STATS);
	const stats = { ...DEFAULT_STATS, ...(result[STORAGE_KEYS.STATS] || {}) };

	const today = new Date().toDateString();
	if (stats.lastResetDate !== today) {
		stats.blocksToday = 0;
		stats.lastResetDate = today;
		await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: stats });
	}

	return stats;
}

export async function incrementBlockCount(url) {
	const stats = await getStats();

	stats.blocksToday++;
	stats.totalBlocks++;
	stats.blockHistory.push({
		url,
		timestamp: Date.now(),
	});

	if (stats.blockHistory.length > LIMITS.MAX_BLOCK_HISTORY) {
		stats.blockHistory = stats.blockHistory.slice(-LIMITS.MAX_BLOCK_HISTORY);
	}

	await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: stats });
	return stats;
}

export async function getCategories() {
	const result = await chrome.storage.local.get(STORAGE_KEYS.CATEGORIES);
	return result[STORAGE_KEYS.CATEGORIES] || getDefaultCategories();
}

function getDefaultCategories() {
	return {
		socialMedia: {
			name: "Social Media",
			enabled: false,
			sites: [
				"facebook.com",
				"instagram.com",
				"twitter.com",
				"x.com",
				"tiktok.com",
				"snapchat.com",
				"linkedin.com",
				"pinterest.com",
				"reddit.com",
				"tumblr.com",
			],
		},
		entertainment: {
			name: "Video & Entertainment",
			enabled: false,
			sites: [
				"youtube.com",
				"netflix.com",
				"hulu.com",
				"disneyplus.com",
				"twitch.tv",
				"vimeo.com",
			],
		},
		news: {
			name: "News & Media",
			enabled: false,
			sites: [
				"cnn.com",
				"bbc.com",
				"foxnews.com",
				"nytimes.com",
				"washingtonpost.com",
				"theguardian.com",
			],
		},
		gaming: {
			name: "Gaming",
			enabled: false,
			sites: [
				"steam.com",
				"epicgames.com",
				"twitch.tv",
				"ign.com",
				"gamespot.com",
				"roblox.com",
			],
		},
		shopping: {
			name: "Shopping",
			enabled: false,
			sites: [
				"amazon.com",
				"ebay.com",
				"walmart.com",
				"target.com",
				"etsy.com",
			],
		},
	};
}

export async function updateCategory(categoryId, updates) {
	const categories = await getCategories();
	categories[categoryId] = { ...categories[categoryId], ...updates };
	await chrome.storage.local.set({ [STORAGE_KEYS.CATEGORIES]: categories });
	return categories;
}

export async function getSchedules() {
	const result = await chrome.storage.local.get(STORAGE_KEYS.SCHEDULES);
	return result[STORAGE_KEYS.SCHEDULES] || [];
}

export async function addSchedule(schedule) {
	const schedules = await getSchedules();
	const newSchedule = {
		id: Date.now(),
		...schedule,
		enabled: true,
	};
	schedules.push(newSchedule);
	await chrome.storage.local.set({ [STORAGE_KEYS.SCHEDULES]: schedules });
	return newSchedule;
}

export async function removeSchedule(scheduleId) {
	const schedules = await getSchedules();
	const filtered = schedules.filter((s) => s.id !== scheduleId);
	await chrome.storage.local.set({ [STORAGE_KEYS.SCHEDULES]: filtered });
}
