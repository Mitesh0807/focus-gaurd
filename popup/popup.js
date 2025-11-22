// Import utilities
import { getBlockedSites, addBlockedSite, removeBlockedSite, clearAllBlockedSites, getSettings, updateSettings, getStats } from '../scripts/storage.js';
import { normalizeUrl, isValidUrl } from '../scripts/utils.js';

// DOM Elements
const websiteInput = document.getElementById('websiteInput');
const addBtn = document.getElementById('addBtn');
const blockCurrentBtn = document.getElementById('blockCurrentBtn');
const blockedList = document.getElementById('blockedList');
const blockedCount = document.getElementById('blockedCount');
const clearAllBtn = document.getElementById('clearAllBtn');
const workModeBtn = document.getElementById('workModeBtn');
const focusModeBtn = document.getElementById('focusModeBtn');
const settingsBtn = document.getElementById('settingsBtn');
const statsBtn = document.getElementById('statsBtn');
const blocksToday = document.getElementById('blocksToday');

// Initialize popup
async function init() {
  await loadBlockedSites();
  await loadStats();
  await loadSettings();
  setupEventListeners();
}

// Load blocked sites
async function loadBlockedSites() {
  const sites = await getBlockedSites();
  renderBlockedSites(sites);
}

// Render blocked sites
function renderBlockedSites(sites) {
  blockedCount.textContent = sites.length;

  if (sites.length === 0) {
    blockedList.innerHTML = '<p class="empty-state">No sites blocked yet. Add one above!</p>';
    return;
  }

  blockedList.innerHTML = sites.map(site => `
    <div class="site-item" data-url="${site.url}">
      <span class="site-url" title="${site.url}">${site.url}</span>
      <button class="remove-btn" data-url="${site.url}">Remove</button>
    </div>
  `).join('');

  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', handleRemoveSite);
  });
}

// Load stats
async function loadStats() {
  const stats = await getStats();
  blocksToday.textContent = `${stats.blocksToday || 0} blocks today`;
}

// Load settings
async function loadSettings() {
  const settings = await getSettings();

  // Apply dark mode
  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // Update work mode button state
  if (settings.workMode) {
    workModeBtn.classList.add('active');
    workModeBtn.innerHTML = '<span class="icon">✓</span> Work Mode ON';
  }

  // Update focus mode button state
  if (settings.focusMode) {
    focusModeBtn.classList.add('active');
    focusModeBtn.innerHTML = '<span class="icon">⏱️</span> Focus Active';
  }
}

// Setup event listeners
function setupEventListeners() {
  addBtn.addEventListener('click', handleAddSite);
  websiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddSite();
  });
  blockCurrentBtn.addEventListener('click', handleBlockCurrentSite);
  clearAllBtn.addEventListener('click', handleClearAll);
  workModeBtn.addEventListener('click', handleToggleWorkMode);
  focusModeBtn.addEventListener('click', handleToggleFocusMode);
  settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
  statsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
  document.getElementById('debugBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/debug.html') });
  });
}

// Handle add site
async function handleAddSite() {
  const input = websiteInput.value.trim();

  if (!input) {
    showNotification('Please enter a website URL', 'error');
    return;
  }

  if (!isValidUrl(input)) {
    showNotification('Please enter a valid URL', 'error');
    return;
  }

  const url = normalizeUrl(input);

  try {
    await addBlockedSite(url);
    websiteInput.value = '';
    await loadBlockedSites();
    showNotification('Site blocked successfully!', 'success');

    // Notify background script to update rules
    chrome.runtime.sendMessage({ action: 'updateBlockRules' });
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Handle block current site
async function handleBlockCurrentSite() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
      showNotification('Cannot block this page', 'error');
      return;
    }

    const url = new URL(tab.url);

    // Don't block chrome:// or extension pages
    if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:') {
      showNotification('Cannot block browser pages', 'error');
      return;
    }

    const domain = url.hostname;
    await addBlockedSite(domain);
    await loadBlockedSites();
    showNotification(`Blocked ${domain}`, 'success');

    // Notify background script to update rules
    chrome.runtime.sendMessage({ action: 'updateBlockRules' });

    // Close the tab
    chrome.tabs.remove(tab.id);
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Handle remove site
async function handleRemoveSite(e) {
  const url = e.target.dataset.url;

  try {
    await removeBlockedSite(url);
    await loadBlockedSites();
    showNotification('Site unblocked', 'success');

    // Notify background script to update rules
    chrome.runtime.sendMessage({ action: 'updateBlockRules' });
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Handle clear all
async function handleClearAll() {
  if (!confirm('Are you sure you want to remove all blocked sites?')) {
    return;
  }

  try {
    await clearAllBlockedSites();
    await loadBlockedSites();
    showNotification('All sites unblocked', 'success');

    // Notify background script to update rules
    chrome.runtime.sendMessage({ action: 'updateBlockRules' });
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Handle toggle work mode
async function handleToggleWorkMode() {
  const settings = await getSettings();
  const newWorkMode = !settings.workMode;

  await updateSettings({ workMode: newWorkMode });

  if (newWorkMode) {
    workModeBtn.classList.add('active');
    workModeBtn.innerHTML = '<span class="icon">✓</span> Work Mode ON';
    showNotification('Work Mode enabled', 'success');
  } else {
    workModeBtn.classList.remove('active');
    workModeBtn.innerHTML = '<span class="icon">💼</span> Work Mode';
    showNotification('Work Mode disabled', 'success');
  }

  // Notify background script
  chrome.runtime.sendMessage({ action: 'updateBlockRules' });
}

// Handle toggle focus mode
async function handleToggleFocusMode() {
  const settings = await getSettings();

  if (settings.focusMode) {
    // Stop focus mode
    await updateSettings({ focusMode: false, focusEndTime: null });
    focusModeBtn.classList.remove('active');
    focusModeBtn.innerHTML = '<span class="icon">⏱️</span> Focus Mode';
    showNotification('Focus Mode stopped', 'success');

    // Notify background script
    chrome.runtime.sendMessage({ action: 'stopFocusMode' });
  } else {
    // Start focus mode - open options page to configure
    chrome.runtime.openOptionsPage();
  }
}

// Show notification
function showNotification(message, type = 'info') {
  // Simple alert for now - can be enhanced with custom UI
  if (type === 'error') {
    console.error(message);
  }
  // Could add a toast notification system here
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
