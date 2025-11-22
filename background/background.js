// Import utilities
import { getBlockedSites, getSettings, getCategories, getSchedules, incrementBlockCount } from '../scripts/storage.js';
import { urlMatchesPattern, extractDomain, isTimeInSchedule } from '../scripts/utils.js';

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('FocusGuard installed/updated', details.reason);

  // Initialize default settings on first install
  if (details.reason === 'install') {
    await initializeDefaults();
  }

  // Update blocking rules
  await updateBlockingRules();

  // Setup context menus
  setupContextMenus();

  // Setup alarms for scheduled checks
  chrome.alarms.create('checkSchedules', { periodInMinutes: 1 });
});

// Initialize default settings
async function initializeDefaults() {
  const defaultSettings = {
    workMode: false,
    focusMode: false,
    focusEndTime: null,
    focusDuration: 25,
    password: null,
    passwordEnabled: false,
    notifications: true,
    darkMode: false
  };

  await chrome.storage.local.set({ settings: defaultSettings });
  console.log('Default settings initialized');
}

// Setup context menus
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'blockThisSite',
      title: 'Block this site with FocusGuard',
      contexts: ['page', 'link']
    });

    chrome.contextMenus.create({
      id: 'blockThisDomain',
      title: 'Block this domain with FocusGuard',
      contexts: ['page']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let url = info.linkUrl || info.pageUrl || tab.url;

  if (!url) return;

  try {
    const urlObj = new URL(url);
    const domain = extractDomain(url);

    if (urlObj.protocol === 'chrome:' || urlObj.protocol === 'chrome-extension:') {
      return;
    }

    if (info.menuItemId === 'blockThisSite' || info.menuItemId === 'blockThisDomain') {
      // Add to blocked sites
      const { addBlockedSite } = await import('../scripts/storage.js');
      await addBlockedSite(domain);

      // Update rules
      await updateBlockingRules();

      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../assets/icons/icon48.png',
        title: 'FocusGuard',
        message: `Blocked ${domain}`
      });

      // Close tab if it's the current site
      if (info.menuItemId === 'blockThisDomain' && tab.url === info.pageUrl) {
        chrome.tabs.remove(tab.id);
      }
    }
  } catch (error) {
    console.error('Error blocking site:', error);
  }
});

// Update blocking rules
async function updateBlockingRules() {
  try {
    // Get all blocked sites
    const blockedSites = await getBlockedSites();
    const settings = await getSettings();
    const categories = await getCategories();

    // Collect all URLs to block
    let urlsToBlock = [];

    // Add manually blocked sites
    urlsToBlock.push(...blockedSites.filter(site => site.enabled).map(site => site.url));

    // Add category sites if enabled (independently or via work mode)
    Object.values(categories).forEach(category => {
      if (category.enabled) {
        urlsToBlock.push(...category.sites);
      }
    });

    // Work mode enables all categories
    if (settings.workMode) {
      Object.values(categories).forEach(category => {
        urlsToBlock.push(...category.sites);
      });
    }

    // Add focus mode blocking if active
    if (settings.focusMode && settings.focusEndTime && Date.now() < settings.focusEndTime) {
      // Focus mode is active - this could block additional sites
      // For now, it uses the same block list
    }

    // Remove duplicates
    urlsToBlock = [...new Set(urlsToBlock)];

    console.log('FocusGuard: Blocking', urlsToBlock.length, 'sites:', urlsToBlock);

    // Create declarativeNetRequest rules
    const allRules = [];
    let ruleId = 1;

    urlsToBlock.forEach(url => {
      const blockPageUrl = chrome.runtime.getURL('pages/blocked.html') + '?site=' + encodeURIComponent(url);

      // Create multiple rules for different URL patterns
      // Using standard wildcard patterns that are guaranteed to work

      // Rule 1: Exact domain with http/https
      allRules.push({
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

      // Rule 2: www subdomain
      allRules.push({
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

      // Rule 3: All other subdomains (mobile, m, etc)
      allRules.push({
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

      console.log(`FocusGuard: Created 3 rules for ${url}`);
    });

    // Update dynamic rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);

    console.log('FocusGuard: Removing', existingRuleIds.length, 'old rules');
    console.log('FocusGuard: Adding', allRules.length, 'new rules');
    console.log('FocusGuard: Sample rule:', JSON.stringify(allRules[0], null, 2));

    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: allRules.slice(0, 5000) // Max 5000 rules
      });

      const updatedRules = await chrome.declarativeNetRequest.getDynamicRules();
      console.log(`FocusGuard: ✅ Successfully updated! ${updatedRules.length} rules now active`);

      // Update badge
      updateBadge(urlsToBlock.length);
    } catch (updateError) {
      console.error('FocusGuard: ❌ FAILED to update dynamic rules!');
      console.error('Error:', updateError);
      console.error('Error message:', updateError.message);
      console.error('Number of rules attempted:', allRules.length);
      console.error('First rule that failed:', JSON.stringify(allRules[0], null, 2));

      // Try to update badge anyway
      updateBadge(0);

      throw updateError; // Re-throw so caller knows it failed
    }
  } catch (error) {
    console.error('FocusGuard ERROR in updateBlockingRules:', error);
    console.error('Error details:', error.message, error.stack);
  }
}

// Update extension badge
function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') {
    sendResponse({ status: 'alive', timestamp: Date.now() });
    return true;
  }

  if (message.action === 'updateBlockRules') {
    updateBlockingRules().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      console.error('Error in updateBlockRules message handler:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep channel open for async response
  }

  if (message.action === 'stopFocusMode') {
    stopFocusMode().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === 'startFocusMode') {
    startFocusMode(message.duration).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Start focus mode
async function startFocusMode(duration = 25) {
  const { updateSettings } = await import('../scripts/storage.js');

  const endTime = Date.now() + (duration * 60 * 1000);

  await updateSettings({
    focusMode: true,
    focusEndTime: endTime,
    focusDuration: duration
  });

  // Set alarm to end focus mode
  chrome.alarms.create('endFocusMode', { when: endTime });

  // Update rules
  await updateBlockingRules();

  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../assets/icons/icon48.png',
    title: 'Focus Mode Started',
    message: `Focus session: ${duration} minutes`
  });

  console.log('Focus mode started:', duration, 'minutes');
}

// Stop focus mode
async function stopFocusMode() {
  const { updateSettings } = await import('../scripts/storage.js');

  await updateSettings({
    focusMode: false,
    focusEndTime: null
  });

  // Clear alarm
  chrome.alarms.clear('endFocusMode');

  // Update rules
  await updateBlockingRules();

  console.log('Focus mode stopped');
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'endFocusMode') {
    await stopFocusMode();

    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../assets/icons/icon48.png',
      title: 'Focus Session Complete!',
      message: 'Great job! Time for a break.'
    });
  }

  if (alarm.name === 'checkSchedules') {
    await checkSchedules();
  }
});

// Check if schedules should activate
async function checkSchedules() {
  const schedules = await getSchedules();
  const { updateSettings } = await import('../scripts/storage.js');

  let shouldBlockBySchedule = false;

  for (const schedule of schedules) {
    if (schedule.enabled && isTimeInSchedule(schedule)) {
      shouldBlockBySchedule = true;
      break;
    }
  }

  // Update settings if schedule status changed
  const settings = await getSettings();
  if (settings.scheduleActive !== shouldBlockBySchedule) {
    await updateSettings({ scheduleActive: shouldBlockBySchedule });
    await updateBlockingRules();
  }
}

// Track blocked sites (when user tries to visit)
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only track main frame navigations
  if (details.frameId !== 0) return;

  const url = details.url;

  // Skip chrome:// and extension pages
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }

  // Check if URL is blocked
  const blockedSites = await getBlockedSites();
  const domain = extractDomain(url);

  const isBlocked = blockedSites.some(site => urlMatchesPattern(url, site.url));

  if (isBlocked) {
    // Increment block count
    await incrementBlockCount(domain);
  }
});

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('FocusGuard started');
  await updateBlockingRules();
});

// Export for testing
export { updateBlockingRules, startFocusMode, stopFocusMode };
