import { getStats, getSettings } from "../scripts/storage.js";
import { getRandomQuote } from "../scripts/utils.js";

const urlParams = new URLSearchParams(window.location.search);
const blockedSite = urlParams.get("site") || "this site";

const blockedSiteEl = document.getElementById("blockedSite");
const blocksToday = document.getElementById("blocksToday");
const totalBlocks = document.getElementById("totalBlocks");
const quoteText = document.getElementById("quoteText");
const goBackBtn = document.getElementById("goBackBtn");
const settingsBtn = document.getElementById("settingsBtn");
const blockReason = document.getElementById("blockReason");
const reasonText = document.getElementById("reasonText");

async function init() {
	blockedSiteEl.textContent = blockedSite;

	const stats = await getStats();
	blocksToday.textContent = stats.blocksToday || 0;
	totalBlocks.textContent = stats.totalBlocks || 0;

	quoteText.textContent = `"${getRandomQuote()}"`;

	const settings = await getSettings();
	if (settings.workMode) {
		blockReason.style.display = "block";
		reasonText.textContent = "Work Mode is active";
	} else if (settings.focusMode) {
		blockReason.style.display = "block";
		const remainingMinutes = Math.ceil(
			(settings.focusEndTime - Date.now()) / 60000,
		);
		reasonText.textContent = `Focus Mode active (${remainingMinutes} minutes remaining)`;
	} else {
		blockReason.style.display = "block";
		reasonText.textContent = "Manually blocked";
	}

	setupEventListeners();
}

function setupEventListeners() {
	goBackBtn.addEventListener("click", () => {
		window.history.back();
	});

	settingsBtn.addEventListener("click", () => {
		chrome.runtime.openOptionsPage();
	});
}

document.addEventListener("DOMContentLoaded", init);
