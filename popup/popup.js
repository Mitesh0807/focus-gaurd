import {
	getBlockedSites,
	addBlockedSite,
	removeBlockedSite,
	clearAllBlockedSites,
	getSettings,
	updateSettings,
	getStats,
} from "../scripts/storage.js";
import { normalizeUrl, isValidUrl } from "../scripts/utils.js";
import { MESSAGE_ACTIONS, CSS_CLASSES } from "../scripts/constants.js";

const websiteInput = document.getElementById("websiteInput");
const addBtn = document.getElementById("addBtn");
const blockCurrentBtn = document.getElementById("blockCurrentBtn");
const blockedList = document.getElementById("blockedList");
const blockedCount = document.getElementById("blockedCount");
const clearAllBtn = document.getElementById("clearAllBtn");
const workModeBtn = document.getElementById("workModeBtn");
const focusModeBtn = document.getElementById("focusModeBtn");
const settingsBtn = document.getElementById("settingsBtn");
const statsBtn = document.getElementById("statsBtn");
const blocksToday = document.getElementById("blocksToday");

async function init() {
	await loadBlockedSites();
	await loadStats();
	await loadSettings();
	setupEventListeners();
}

async function loadBlockedSites() {
	const sites = await getBlockedSites();
	renderBlockedSites(sites);
}

function renderBlockedSites(sites) {
	blockedCount.textContent = sites.length;

	if (sites.length === 0) {
		blockedList.innerHTML =
			'<p class="empty-state">No sites blocked yet. Add one above!</p>';
		return;
	}

	blockedList.innerHTML = sites
		.map(
			(site) => `
    <div class="site-item" data-url="${site.url}">
      <span class="site-url" title="${site.url}">${site.url}</span>
      <button class="remove-btn" data-url="${site.url}">Remove</button>
    </div>
  `,
		)
		.join("");

	document.querySelectorAll(".remove-btn").forEach((btn) => {
		btn.addEventListener("click", handleRemoveSite);
	});
}

async function loadStats() {
	const stats = await getStats();
	blocksToday.textContent = `${stats.blocksToday || 0} blocks today`;
}

async function loadSettings() {
	const settings = await getSettings();

	if (settings.darkMode) {
		document.body.classList.add(CSS_CLASSES.DARK_MODE);
	} else {
		document.body.classList.remove(CSS_CLASSES.DARK_MODE);
	}

	if (settings.workMode) {
		workModeBtn.classList.add(CSS_CLASSES.ACTIVE);
		workModeBtn.innerHTML = '<span class="icon">✓</span> Work Mode ON';
	}

	if (settings.focusMode) {
		focusModeBtn.classList.add(CSS_CLASSES.ACTIVE);
		focusModeBtn.innerHTML = '<span class="icon">⏱</span> Focus Active';
	}
}

function setupEventListeners() {
	addBtn.addEventListener("click", handleAddSite);
	websiteInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") handleAddSite();
	});
	blockCurrentBtn.addEventListener("click", handleBlockCurrentSite);
	clearAllBtn.addEventListener("click", handleClearAll);
	workModeBtn.addEventListener("click", handleToggleWorkMode);
	focusModeBtn.addEventListener("click", handleToggleFocusMode);
	settingsBtn.addEventListener("click", () => chrome.runtime.openOptionsPage());
	statsBtn.addEventListener("click", () => chrome.runtime.openOptionsPage());
	document.getElementById("debugBtn").addEventListener("click", () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("pages/debug.html") });
	});
}

async function handleAddSite() {
	const input = websiteInput.value.trim();

	if (!input) {
		showNotification("Please enter a website URL", "error");
		return;
	}

	if (!isValidUrl(input)) {
		showNotification("Please enter a valid URL", "error");
		return;
	}

	const url = normalizeUrl(input);

	try {
		await addBlockedSite(url);
		websiteInput.value = "";
		await loadBlockedSites();
		showNotification("Site blocked successfully!", "success");

		chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.UPDATE_BLOCK_RULES });
	} catch (error) {
		showNotification(error.message, "error");
	}
}

async function handleBlockCurrentSite() {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab || !tab.url) {
			showNotification("Cannot block this page", "error");
			return;
		}

		const url = new URL(tab.url);

		if (url.protocol === "chrome:" || url.protocol === "chrome-extension:") {
			showNotification("Cannot block browser pages", "error");
			return;
		}

		const domain = url.hostname;
		await addBlockedSite(domain);
		await loadBlockedSites();
		showNotification(`Blocked ${domain}`, "success");

		chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.UPDATE_BLOCK_RULES });

		chrome.tabs.remove(tab.id);
	} catch (error) {
		showNotification(error.message, "error");
	}
}

async function handleRemoveSite(e) {
	const url = e.target.dataset.url;

	try {
		await removeBlockedSite(url);
		await loadBlockedSites();
		showNotification("Site unblocked", "success");

		chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.UPDATE_BLOCK_RULES });
	} catch (error) {
		showNotification(error.message, "error");
	}
}

async function handleClearAll() {
	if (!confirm("Are you sure you want to remove all blocked sites?")) {
		return;
	}

	try {
		await clearAllBlockedSites();
		await loadBlockedSites();
		showNotification("All sites unblocked", "success");

		chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.UPDATE_BLOCK_RULES });
	} catch (error) {
		showNotification(error.message, "error");
	}
}

async function handleToggleWorkMode() {
	const settings = await getSettings();
	const newWorkMode = !settings.workMode;

	await updateSettings({ workMode: newWorkMode });

	if (newWorkMode) {
		workModeBtn.classList.add(CSS_CLASSES.ACTIVE);
		workModeBtn.innerHTML = '<span class="icon">✓</span> Work Mode ON';
	} else {
		workModeBtn.classList.remove(CSS_CLASSES.ACTIVE);
		workModeBtn.innerHTML = '<span class="icon">💼</span> Work Mode';
	}

	chrome.runtime.sendMessage({ action: "updateBlockRules" });
}

async function handleToggleFocusMode() {
	const settings = await getSettings();

	if (settings.focusMode) {
		await updateSettings({ focusMode: false, focusEndTime: null });
		focusModeBtn.classList.remove(CSS_CLASSES.ACTIVE);
		focusModeBtn.innerHTML = '<span class="icon">⏱</span> Focus Mode';
		showNotification("Focus Mode stopped", "success");

		chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.STOP_FOCUS_MODE });
	} else {
		chrome.runtime.openOptionsPage();
	}
}

function showNotification(message, type = "info") {
	if (type === "error") {
		console.error(message);
	}
}

document.addEventListener("DOMContentLoaded", init);
