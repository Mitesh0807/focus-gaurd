import {
  getBlockedSites,
  getSettings,
  getCategories,
  getSchedules,
  incrementBlockCount,
} from '../scripts/storage.js';
import {
  urlMatchesPattern,
  extractDomain,
  isTimeInSchedule,
} from '../scripts/utils.js';
import {
  DEFAULT_SETTINGS,
  MESSAGE_ACTIONS,
  ASSETS,
  LIMITS,
} from '../scripts/constants.js';

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('FocusGuard installed/updated', details.reason);

  if (details.reason === 'install') {
    await initializeDefaults();
  }

  await updateBlockingRules();

  setupContextMenus();

  chrome.alarms.create('checkSchedules', { periodInMinutes: 1 });
});

async function initializeDefaults() {
  await chrome.storage.local.set({ settings: DEFAULT_SETTINGS });
  console.log('Default settings initialized');
}

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'blockThisSite',
      title: 'Block this site with FocusGuard',
      contexts: ['page', 'link'],
    });

    chrome.contextMenus.create({
      id: 'blockThisDomain',
      title: 'Block this domain with FocusGuard',
      contexts: ['page'],
    });
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let url = info.linkUrl || info.pageUrl || tab.url;

  if (!url) return;

  try {
    const urlObj = new URL(url);
    const domain = extractDomain(url);

    if (
      urlObj.protocol === 'chrome:' ||
      urlObj.protocol === 'chrome-extension:'
    ) {
      return;
    }

    if (
      info.menuItemId === 'blockThisSite' ||
      info.menuItemId === 'blockThisDomain'
    ) {
      const { addBlockedSite } = await import('../scripts/storage.js');
      await addBlockedSite(domain);

      await updateBlockingRules();

      chrome.notifications.create({
        type: 'basic',
        iconUrl: ASSETS.ICON_48,
        title: 'FocusGuard',
        message: `Blocked ${domain}`,
      });

      if (info.menuItemId === 'blockThisDomain' && tab.url === info.pageUrl) {
        chrome.tabs.remove(tab.id);
      }
    }
  } catch (error) {
    console.error('Error blocking site:', error);
  }
});

async function updateBlockingRules() {
  try {
    const blockedSites = await getBlockedSites();
    const settings = await getSettings();
    const categories = await getCategories();

    let urlsToBlock = [];

    urlsToBlock.push(
      ...blockedSites.filter((site) => site.enabled).map((site) => site.url)
    );

    if (settings.workMode) {
      Object.values(categories).forEach((category) => {
        urlsToBlock.push(...category.sites);
      });
    } else {
      Object.values(categories).forEach((category) => {
        if (category.enabled) {
          urlsToBlock.push(...category.sites);
        }
      });
    }

    if (
      settings.focusMode &&
      settings.focusEndTime &&
      Date.now() < settings.focusEndTime
    ) {
      //  Block all sites during focus mode
    }

    const domainsToBlock = [
      ...new Set(urlsToBlock.map((url) => extractDomain(url))),
    ];

    console.log(
      'FocusGuard: Blocking',
      domainsToBlock.length,
      'domains:',
      domainsToBlock
    );

    const allRules = [];
    let ruleId = 1;

    domainsToBlock.forEach((domain) => {
      const blockPageUrl =
        chrome.runtime.getURL('pages/blocked.html') +
        '?site=' +
        encodeURIComponent(domain);

      allRules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: blockPageUrl },
        },
        condition: {
          requestDomains: [domain],
          resourceTypes: ['main_frame'],
        },
      });
    });

    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map((rule) => rule.id);

    console.log('FocusGuard: Removing', existingRuleIds.length, 'old rules');
    console.log('FocusGuard: Adding', allRules.length, 'new rules');
    console.log(
      'FocusGuard: Sample rule:',
      JSON.stringify(allRules[0], null, 2)
    );

    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: allRules.slice(0, LIMITS.MAX_DYNAMIC_RULES),
      });

      const updatedRules = await chrome.declarativeNetRequest.getDynamicRules();
      console.log(
        `FocusGuard: ✅ Successfully updated! ${updatedRules.length} rules now active`
      );

      updateBadge(urlsToBlock.length);
    } catch (updateError) {
      console.error('FocusGuard: ❌ FAILED to update dynamic rules!');
      console.error('Error:', updateError);
      console.error('Error message:', updateError.message);
      console.error('Number of rules attempted:', allRules.length);
      console.error(
        'First rule that failed:',
        JSON.stringify(allRules[0], null, 2)
      );

      updateBadge(0);

      throw updateError;
    }
  } catch (error) {
    console.error('FocusGuard ERROR in updateBlockingRules:', error);
    console.error('Error details:', error.message, error.stack);
  }
}

function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.action === MESSAGE_ACTIONS.PING) {
      sendResponse({ status: 'alive', timestamp: Date.now() });
      return;
    }

    if (message.action === MESSAGE_ACTIONS.UPDATE_BLOCK_RULES) {
      try {
        await updateBlockingRules();
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error in updateBlockRules message handler:', error);
        sendResponse({ success: false, error: error.message });
      }
      return;
    }

    if (message.action === MESSAGE_ACTIONS.STOP_FOCUS_MODE) {
      await stopFocusMode();
      sendResponse({ success: true });
      return;
    }

    if (message.action === MESSAGE_ACTIONS.START_FOCUS_MODE) {
      await startFocusMode(message.duration);
      sendResponse({ success: true });
    }
  })();

  return true;
});

async function startFocusMode(duration = 25) {
  const { updateSettings } = await import('../scripts/storage.js');

  const endTime = Date.now() + duration * 60 * 1000;

  await updateSettings({
    focusMode: true,
    focusEndTime: endTime,
    focusDuration: duration,
  });

  chrome.alarms.create('endFocusMode', { when: endTime });

  await updateBlockingRules();

  chrome.notifications.create({
    type: 'basic',
    iconUrl: ASSETS.ICON_48,
    title: 'Focus Mode Started',
    message: `Focus session: ${duration} minutes`,
  });

  console.log('Focus mode started:', duration, 'minutes');
}

async function stopFocusMode() {
  const { updateSettings } = await import('../scripts/storage.js');

  await updateSettings({
    focusMode: false,
    focusEndTime: null,
  });

  chrome.alarms.clear('endFocusMode');

  await updateBlockingRules();

  console.log('Focus mode stopped');
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'endFocusMode') {
    await stopFocusMode();

    chrome.notifications.create({
      type: 'basic',
      iconUrl: ASSETS.ICON_48,
      title: 'Focus Session Complete!',
      message: 'Great job! Time for a break.',
    });
  }

  if (alarm.name === 'checkSchedules') {
    await checkSchedules();
  }
});

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

  const settings = await getSettings();
  if (settings.scheduleActive !== shouldBlockBySchedule) {
    await updateSettings({ scheduleActive: shouldBlockBySchedule });
    await updateBlockingRules();
  }
}

chrome.runtime.onStartup.addListener(async () => {
  console.log('FocusGuard started');
  await updateBlockingRules();
});

export { updateBlockingRules, startFocusMode, stopFocusMode };
