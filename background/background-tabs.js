console.log('FocusGuard: Tabs-based blocker loading...');

let blockedUrls = [];

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('FocusGuard: Installed/Updated', details.reason);

  if (details.reason === 'install') {
    await chrome.storage.local.set({
      blockedSites: [],
      settings: {
        workMode: false,
        focusMode: false,
        notifications: true,
        darkMode: false,
      },
      categories: getDefaultCategories(),
      stats: {
        blocksToday: 0,
        totalBlocks: 0,
        lastResetDate: new Date().toDateString(),
      },
    });
  }

  await updateBlockList();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading' && changeInfo.url) {
    checkAndBlockTab(tabId, changeInfo.url);
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.pendingUrl) {
    checkAndBlockTab(tab.id, tab.pendingUrl);
  }
});

function checkAndBlockTab(tabId, url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');
    const pathname = urlObj.pathname;

    for (const blockedPattern of blockedUrls) {
      let isBlocked = false;
      let matchedPattern = blockedPattern;

      if (blockedPattern.includes('/')) {
        const patternHost = blockedPattern.split('/')[0];
        const patternPath = '/' + blockedPattern.split('/').slice(1).join('/');

        if (hostname === patternHost || hostname.endsWith('.' + patternHost)) {
          if (patternPath === '/*' || pathname.startsWith(patternPath)) {
            isBlocked = true;
          }
        }
      } else {
        if (
          hostname === blockedPattern ||
          hostname.endsWith('.' + blockedPattern)
        ) {
          isBlocked = true;
        }
      }

      if (isBlocked) {
        chrome.tabs.update(tabId, {
          url:
            chrome.runtime.getURL('pages/blocked.html') +
            '?site=' +
            encodeURIComponent(matchedPattern),
        });

        incrementStats(matchedPattern);
        return;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateBlockList() {
  const data = await chrome.storage.local.get([
    'blockedSites',
    'settings',
    'categories',
  ]);
  const sites = data.blockedSites || [];
  const categories = data.categories || {};

  let urls = sites.filter((s) => s.enabled !== false).map((s) => s.url);

  Object.values(categories).forEach((cat) => {
    if (cat.enabled) {
      urls.push(...cat.sites);
    }
  });

  blockedUrls = [...new Set(urls)];
  console.log(
    'FocusGuard: Blocking',
    blockedUrls.length,
    'sites:',
    blockedUrls
  );

  updateBadge(blockedUrls.length);
}

async function incrementStats(url) {
  const data = await chrome.storage.local.get(['stats']);
  const stats = data.stats || {
    blocksToday: 0,
    totalBlocks: 0,
    lastResetDate: new Date().toDateString(),
    blockHistory: [],
  };

  const today = new Date().toDateString();
  if (stats.lastResetDate !== today) {
    stats.blocksToday = 0;
    stats.lastResetDate = today;
  }

  stats.blocksToday++;
  stats.totalBlocks++;
  stats.blockHistory = stats.blockHistory || [];
  stats.blockHistory.push({ url, timestamp: Date.now() });

  if (stats.blockHistory.length > 1000) {
    stats.blockHistory = stats.blockHistory.slice(-1000);
  }

  await chrome.storage.local.set({ stats });
}

function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

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
        'tumblr.com',
      ],
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
        'vimeo.com',
      ],
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
        'theguardian.com',
      ],
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
        'roblox.com',
      ],
    },
    shopping: {
      name: 'Shopping',
      enabled: false,
      sites: [
        'amazon.com',
        'ebay.com',
        'walmart.com',
        'target.com',
        'etsy.com',
      ],
    },
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('FocusGuard: Message received:', message.action);

  if (message.action === 'ping') {
    sendResponse({ status: 'alive', timestamp: Date.now() });
    return true;
  }

  if (message.action === 'updateBlockRules') {
    updateBlockList()
      .then(() => {
        console.log('FocusGuard: Block list updated');
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('FocusGuard: Error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.blockedSites || changes.categories || changes.settings) {
      console.log('FocusGuard: Storage changed, updating block list...');
      updateBlockList();
    }
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('FocusGuard: Browser started, updating block list');
  await updateBlockList();
});

updateBlockList();

console.log('FocusGuard: Tabs-based blocker loaded successfully');
