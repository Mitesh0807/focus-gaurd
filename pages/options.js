// Import utilities
import { getSettings, updateSettings, getCategories, updateCategory, getSchedules, addSchedule, removeSchedule, getStats, getBlockedSites, addBlockedSite, removeBlockedSite, clearAllBlockedSites } from '../scripts/storage.js';
import { formatDate, formatTime, normalizeUrl, isValidUrl } from '../scripts/utils.js';

// State
let selectedDuration = 25;
let focusTimer = null;
let focusTimeRemaining = 0;

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setupTabs();
  await loadSettings();
  await loadBlockedSites();
  await loadCategories();
  await loadSchedules();
  await loadStats();
  setupEventListeners();
  updateFocusTimer();
}

// Setup tab navigation
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked tab
      tab.classList.add('active');

      // Show corresponding content
      const tabId = tab.dataset.tab + '-tab';
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Load settings
async function loadSettings() {
  const settings = await getSettings();

  // Dark mode
  document.getElementById('darkMode').checked = settings.darkMode || false;

  // Apply dark mode immediately
  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // Notifications
  document.getElementById('notifications').checked = settings.notifications !== false;

  // Password
  document.getElementById('passwordEnabled').checked = settings.passwordEnabled || false;
  if (settings.passwordEnabled) {
    document.getElementById('passwordSection').style.display = 'block';
  }
}

// Load blocked sites
async function loadBlockedSites() {
  const sites = await getBlockedSites();
  const sitesList = document.getElementById('sitesList');
  const sitesCount = document.getElementById('sitesCount');

  sitesCount.textContent = sites.length;

  if (sites.length === 0) {
    sitesList.innerHTML = '<p class="empty-state">No sites blocked yet</p>';
    return;
  }

  sitesList.innerHTML = sites.map(site => {
    const isPath = site.url.includes('/');
    const type = isPath ? 'Path' : 'Domain';
    const addedDate = formatDate(site.addedAt);

    return `
      <div class="site-item-large" data-url="${site.url}">
        <div class="site-info">
          <div class="site-url-large">${site.url}</div>
          <span class="site-type">${type}</span>
          <div class="site-added">Added ${addedDate}</div>
        </div>
        <div class="site-actions">
          <button class="btn-icon btn-remove" data-url="${site.url}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  // Add event listeners to remove buttons
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', handleRemoveSiteOptions);
  });
}

// Handle add site from options page
async function handleAddSiteOptions() {
  const input = document.getElementById('siteInputOptions');
  const url = input.value.trim();

  if (!url) {
    alert('Please enter a website URL or path');
    return;
  }

  if (!isValidUrl(url)) {
    alert('Please enter a valid URL');
    return;
  }

  const normalized = normalizeUrl(url);

  try {
    await addBlockedSite(normalized);
    input.value = '';
    await loadBlockedSites();

    // Notify background script
    chrome.runtime.sendMessage({ action: 'updateBlockRules' });
  } catch (error) {
    alert(error.message);
  }
}

// Handle remove site from options page
async function handleRemoveSiteOptions(e) {
  const url = e.target.dataset.url;

  if (confirm(`Remove "${url}" from blocked list?`)) {
    try {
      await removeBlockedSite(url);
      await loadBlockedSites();

      // Notify background script
      chrome.runtime.sendMessage({ action: 'updateBlockRules' });
    } catch (error) {
      alert(error.message);
    }
  }
}

// Handle clear all sites
async function handleClearAllSites() {
  if (confirm('Are you sure you want to remove ALL blocked sites? This cannot be undone.')) {
    try {
      await clearAllBlockedSites();
      await loadBlockedSites();

      // Notify background script
      chrome.runtime.sendMessage({ action: 'updateBlockRules' });
    } catch (error) {
      alert(error.message);
    }
  }
}

// Load categories
async function loadCategories() {
  const categories = await getCategories();
  const categoriesList = document.getElementById('categoriesList');

  categoriesList.innerHTML = Object.entries(categories).map(([id, category]) => `
    <div class="category-item">
      <div class="category-header">
        <h4>${category.name}</h4>
        <label class="toggle">
          <input type="checkbox" class="category-toggle" data-category="${id}" ${category.enabled ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="category-sites">
        ${category.sites.slice(0, 10).join(', ')}${category.sites.length > 10 ? ` +${category.sites.length - 10} more` : ''}
      </div>
    </div>
  `).join('');

  // Add event listeners
  document.querySelectorAll('.category-toggle').forEach(toggle => {
    toggle.addEventListener('change', handleCategoryToggle);
  });
}

// Handle category toggle
async function handleCategoryToggle(e) {
  const categoryId = e.target.dataset.category;
  const enabled = e.target.checked;

  await updateCategory(categoryId, { enabled });

  // Notify background script
  chrome.runtime.sendMessage({ action: 'updateBlockRules' });
}

// Load schedules
async function loadSchedules() {
  const schedules = await getSchedules();
  const schedulesList = document.getElementById('schedulesList');

  if (schedules.length === 0) {
    schedulesList.innerHTML = '<p class="empty-state">No schedules created yet</p>';
    return;
  }

  schedulesList.innerHTML = schedules.map(schedule => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNames = schedule.days.map(d => days[d]).join(', ');

    return `
      <div class="schedule-item">
        <div class="schedule-info">
          <h4>${schedule.name}</h4>
          <div class="schedule-details">
            ${schedule.startTime} - ${schedule.endTime} | ${dayNames}
          </div>
        </div>
        <div class="schedule-actions">
          <label class="toggle">
            <input type="checkbox" class="schedule-toggle" data-schedule="${schedule.id}" ${schedule.enabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
          <button class="btn btn-danger" onclick="deleteSchedule(${schedule.id})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// Delete schedule (make it global for onclick)
window.deleteSchedule = async function(scheduleId) {
  if (confirm('Are you sure you want to delete this schedule?')) {
    await removeSchedule(scheduleId);
    await loadSchedules();
    chrome.runtime.sendMessage({ action: 'updateBlockRules' });
  }
};

// Load stats
async function loadStats() {
  const stats = await getStats();

  // Update stats tab
  document.getElementById('statBlocksToday').textContent = stats.blocksToday || 0;
  document.getElementById('statTotalBlocks').textContent = stats.totalBlocks || 0;

  // Estimate time saved (assume 10 min per block)
  const minutesSaved = (stats.totalBlocks || 0) * 10;
  const hoursSaved = Math.floor(minutesSaved / 60);
  document.getElementById('statTimeSaved').textContent = hoursSaved + 'h';

  // Recent blocks
  const recentBlocksList = document.getElementById('recentBlocksList');
  if (!stats.blockHistory || stats.blockHistory.length === 0) {
    recentBlocksList.innerHTML = '<p class="empty-state">No blocks recorded yet</p>';
  } else {
    const recent = stats.blockHistory.slice(-20).reverse();
    recentBlocksList.innerHTML = recent.map(block => `
      <div class="recent-item">
        <span class="recent-url">${block.url}</span>
        <span class="recent-time">${formatDate(block.timestamp)}</span>
      </div>
    `).join('');
  }

  // Focus mode stats
  document.getElementById('sessionsToday').textContent = stats.focusSessionsToday || 0;
  document.getElementById('totalSessions').textContent = stats.totalFocusSessions || 0;
  document.getElementById('currentStreak').textContent = stats.focusStreak || 0;
}

// Setup event listeners
function setupEventListeners() {
  // General settings
  document.getElementById('darkMode').addEventListener('change', handleDarkModeToggle);
  document.getElementById('notifications').addEventListener('change', handleNotificationsToggle);
  document.getElementById('passwordEnabled').addEventListener('change', handlePasswordToggle);
  document.getElementById('setPasswordBtn').addEventListener('click', handleSetPassword);

  // Data management
  document.getElementById('exportBtn').addEventListener('click', handleExport);
  document.getElementById('importBtn').addEventListener('click', handleImport);
  document.getElementById('clearDataBtn').addEventListener('click', handleClearData);

  // Blocked sites
  document.getElementById('addSiteBtn').addEventListener('click', handleAddSiteOptions);
  document.getElementById('siteInputOptions').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddSiteOptions();
  });
  document.getElementById('clearAllSitesBtn').addEventListener('click', handleClearAllSites);

  // Schedules
  document.getElementById('addScheduleBtn').addEventListener('click', showScheduleModal);
  document.getElementById('cancelScheduleBtn').addEventListener('click', hideScheduleModal);
  document.getElementById('saveScheduleBtn').addEventListener('click', handleSaveSchedule);

  // Focus mode
  document.getElementById('startFocusBtn').addEventListener('click', handleStartFocus);
  document.getElementById('stopFocusBtn').addEventListener('click', handleStopFocus);

  document.querySelectorAll('.duration-btn').forEach(btn => {
    btn.addEventListener('click', handleDurationSelect);
  });
}

// Handle dark mode toggle
async function handleDarkModeToggle(e) {
  const isDark = e.target.checked;
  await updateSettings({ darkMode: isDark });

  // Apply dark mode immediately
  if (isDark) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// Handle notifications toggle
async function handleNotificationsToggle(e) {
  await updateSettings({ notifications: e.target.checked });
}

// Handle password toggle
function handlePasswordToggle(e) {
  const passwordSection = document.getElementById('passwordSection');
  passwordSection.style.display = e.target.checked ? 'block' : 'none';
}

// Handle set password
async function handleSetPassword() {
  const password = document.getElementById('passwordInput').value;

  if (!password || password.length < 4) {
    alert('Password must be at least 4 characters long');
    return;
  }

  await updateSettings({
    password: password,
    passwordEnabled: true
  });

  alert('Password set successfully!');
  document.getElementById('passwordInput').value = '';
}

// Handle export
async function handleExport() {
  const data = await chrome.storage.local.get(null);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `focusguard-backup-${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

// Handle import
function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();

    try {
      const data = JSON.parse(text);
      await chrome.storage.local.set(data);
      alert('Settings imported successfully! Please reload the extension.');
      location.reload();
    } catch (error) {
      alert('Failed to import settings: ' + error.message);
    }
  };

  input.click();
}

// Handle clear data
async function handleClearData() {
  if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
    await chrome.storage.local.clear();
    alert('All data cleared. The extension will now reset.');
    location.reload();
  }
}

// Schedule modal
function showScheduleModal() {
  document.getElementById('scheduleModal').style.display = 'flex';
}

function hideScheduleModal() {
  document.getElementById('scheduleModal').style.display = 'none';
}

// Handle save schedule
async function handleSaveSchedule() {
  const name = document.getElementById('scheduleName').value;
  const startTime = document.getElementById('scheduleStart').value;
  const endTime = document.getElementById('scheduleEnd').value;

  const dayCheckboxes = document.querySelectorAll('.days-selector input:checked');
  const days = Array.from(dayCheckboxes).map(cb => parseInt(cb.value));

  if (!name || !startTime || !endTime || days.length === 0) {
    alert('Please fill in all fields');
    return;
  }

  await addSchedule({
    name,
    startTime,
    endTime,
    days
  });

  hideScheduleModal();
  await loadSchedules();
  chrome.runtime.sendMessage({ action: 'updateBlockRules' });

  // Clear form
  document.getElementById('scheduleName').value = '';
}

// Handle duration select
function handleDurationSelect(e) {
  selectedDuration = parseInt(e.target.dataset.duration);

  document.querySelectorAll('.duration-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  e.target.classList.add('active');
  updateTimerDisplay(selectedDuration);
}

// Update timer display
function updateTimerDisplay(minutes) {
  const mins = Math.floor(minutes);
  const secs = Math.floor((minutes % 1) * 60);
  document.getElementById('timerDisplay').textContent =
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Handle start focus
async function handleStartFocus() {
  await chrome.runtime.sendMessage({
    action: 'startFocusMode',
    duration: selectedDuration
  });

  document.getElementById('startFocusBtn').style.display = 'none';
  document.getElementById('stopFocusBtn').style.display = 'block';

  startFocusTimer();
}

// Handle stop focus
async function handleStopFocus() {
  await chrome.runtime.sendMessage({ action: 'stopFocusMode' });

  document.getElementById('startFocusBtn').style.display = 'block';
  document.getElementById('stopFocusBtn').style.display = 'none';

  stopFocusTimer();
  updateTimerDisplay(selectedDuration);
}

// Start focus timer
function startFocusTimer() {
  focusTimeRemaining = selectedDuration * 60; // Convert to seconds

  focusTimer = setInterval(() => {
    focusTimeRemaining--;

    if (focusTimeRemaining <= 0) {
      stopFocusTimer();
      handleStopFocus();
      return;
    }

    updateTimerDisplay(focusTimeRemaining / 60);
  }, 1000);
}

// Stop focus timer
function stopFocusTimer() {
  if (focusTimer) {
    clearInterval(focusTimer);
    focusTimer = null;
  }
}

// Update focus timer on load
async function updateFocusTimer() {
  const settings = await getSettings();

  if (settings.focusMode && settings.focusEndTime) {
    const remaining = settings.focusEndTime - Date.now();

    if (remaining > 0) {
      document.getElementById('startFocusBtn').style.display = 'none';
      document.getElementById('stopFocusBtn').style.display = 'block';

      focusTimeRemaining = Math.floor(remaining / 1000);
      startFocusTimer();
    }
  }
}
