// Simple, reliable blocking implementation
// This version removes all complexity and just focuses on blocking

console.log('FocusGuard: Background script loading...');

// Listen for extension install/update
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('FocusGuard: Installed/Updated', details.reason);

  // Initialize defaults
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      blockedSites: [],
      settings: {
        workMode: false,
        focusMode: false,
        notifications: true,
        darkMode: false
      },
      categories: getDefaultCategories(),
      stats: {
        blocksToday: 0,
        totalBlocks: 0,
        lastResetDate: new Date().toDateString()
      }
    });
    console.log('FocusGuard: Defaults initialized');
  }

  // Update rules on install/update
  await updateBlockingRules();
  console.log('FocusGuard: Initial rules update complete');
});

// Listen for extension startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('FocusGuard: Browser started, updating rules');
  await updateBlockingRules();
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('FocusGuard: Message received:', message.action);

  if (message.action === 'ping') {
    sendResponse({ status: 'alive', timestamp: Date.now() });
    return true;
  }

  if (message.action === 'updateBlockRules') {
    updateBlockingRules()
      .then(() => {
        console.log('FocusGuard: Rules updated successfully');
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('FocusGuard: Error updating rules:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async
  }

  return false;
});

// Main blocking function
async function updateBlockingRules() {
  try {
    console.log('FocusGuard: updateBlockingRules() started');

    // Get data from storage
    const data = await chrome.storage.local.get(['blockedSites', 'settings', 'categories']);
    const blockedSites = data.blockedSites || [];
    const settings = data.settings || {};
    const categories = data.categories || {};

    console.log('FocusGuard: Blocked sites:', blockedSites.length);
    console.log('FocusGuard: Settings:', settings);

    // Collect URLs to block
    let urlsToBlock = [];

    // Add manually blocked sites
    urlsToBlock.push(...blockedSites.filter(s => s.enabled !== false).map(s => s.url));

    // Add enabled categories
    Object.values(categories).forEach(cat => {
      if (cat.enabled) {
        console.log('FocusGuard: Adding category:', cat.name);
        urlsToBlock.push(...cat.sites);
      }
    });

    // Remove duplicates
    urlsToBlock = [...new Set(urlsToBlock)];

    console.log('FocusGuard: Total URLs to block:', urlsToBlock.length);
    console.log('FocusGuard: URLs:', urlsToBlock);

    // If no URLs, clear rules and return
    if (urlsToBlock.length === 0) {
      const existing = await chrome.declarativeNetRequest.getDynamicRules();
      if (existing.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: existing.map(r => r.id)
        });
      }
      console.log('FocusGuard: No sites to block, cleared all rules');
      updateBadge(0);
      return;
    }

    // Create rules
    const rules = [];
    let ruleId = 1;

    for (const url of urlsToBlock) {
      const blockPageUrl = chrome.runtime.getURL('pages/blocked.html') + '?site=' + encodeURIComponent(url);

      // Rule for exact domain
      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: blockPageUrl }
        },
        condition: {
          urlFilter: `*://${url}/*`,
          resourceTypes: ['main_frame']
        }
      });

      // Rule for www
      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: blockPageUrl }
        },
        condition: {
          urlFilter: `*://www.${url}/*`,
          resourceTypes: ['main_frame']
        }
      });

      // Rule for subdomains
      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: blockPageUrl }
        },
        condition: {
          urlFilter: `*://*.${url}/*`,
          resourceTypes: ['main_frame']
        }
      });
    }

    console.log('FocusGuard: Created', rules.length, 'rules');
    console.log('FocusGuard: First rule:', rules[0]);

    // Get existing rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log('FocusGuard: Existing rules:', existingRules.length);

    // Update rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRules.map(r => r.id),
      addRules: rules
    });

    // Verify
    const finalRules = await chrome.declarativeNetRequest.getDynamicRules();
    console.log('FocusGuard: ✅ SUCCESS! Active rules:', finalRules.length);

    // Update badge
    updateBadge(urlsToBlock.length);

  } catch (error) {
    console.error('FocusGuard: ❌ ERROR in updateBlockingRules');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Update badge
function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Get default categories
function getDefaultCategories() {
  return {
    socialMedia: {
      name: 'Social Media',
      enabled: false,
      sites: ['facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com', 'snapchat.com', 'linkedin.com', 'pinterest.com', 'reddit.com', 'tumblr.com']
    },
    entertainment: {
      name: 'Video & Entertainment',
      enabled: false,
      sites: ['youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com', 'twitch.tv', 'vimeo.com']
    },
    news: {
      name: 'News & Media',
      enabled: false,
      sites: ['cnn.com', 'bbc.com', 'foxnews.com', 'nytimes.com', 'washingtonpost.com', 'theguardian.com']
    },
    gaming: {
      name: 'Gaming',
      enabled: false,
      sites: ['steam.com', 'epicgames.com', 'twitch.tv', 'ign.com', 'gamespot.com', 'roblox.com']
    },
    shopping: {
      name: 'Shopping',
      enabled: false,
      sites: ['amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'etsy.com']
    }
  };
}

console.log('FocusGuard: Background script loaded successfully');
