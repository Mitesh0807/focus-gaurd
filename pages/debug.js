import {
	getBlockedSites,
	getSettings,
	getCategories,
	addBlockedSite,
} from "../scripts/storage.js";
import { MESSAGE_ACTIONS } from "../scripts/constants.js";

async function loadDebugInfo() {
	await checkPermissions();
	await loadActiveRules();
	await loadBlockedSites();
	await loadCategories();
	await loadSettings();
	checkExtensionStatus();
}

async function checkPermissions() {
	const output = document.getElementById("permissionsOutput");
	const permissions = await chrome.permissions.getAll();

	const required = {
		permissions: [
			"storage",
			"declarativeNetRequest",
			"declarativeNetRequestFeedback",
			"tabs",
			"alarms",
			"notifications",
			"contextMenus",
		],
		origins: ["<all_urls>"],
	};

	const hasAllPermissions = required.permissions.every((p) =>
		permissions.permissions.includes(p),
	);
	const hasAllOrigins = required.origins.every((o) =>
		permissions.origins.includes(o),
	);

	output.textContent = JSON.stringify(
		{
			granted: permissions,
			required: required,
			hasAllPermissions,
			hasAllOrigins,
			status:
				hasAllPermissions && hasAllOrigins
					? "✅ All permissions granted"
					: "❌ Missing permissions",
		},
		null,
		2,
	);
}

async function loadActiveRules() {
	const output = document.getElementById("rulesOutput");
	const count = document.getElementById("ruleCount");

	try {
		const rules = await chrome.declarativeNetRequest.getDynamicRules();
		count.textContent = rules.length;

		if (rules.length === 0) {
			output.textContent =
				"! No active rules found!\n\nThis means blocking is NOT working.";
			return;
		}

		output.textContent = JSON.stringify(rules, null, 2);
	} catch (error) {
		output.textContent = "❌ Error: " + error.message;
		count.textContent = "ERROR";
	}
}

async function loadBlockedSites() {
	const output = document.getElementById("sitesOutput");
	const count = document.getElementById("siteCount");

	try {
		const sites = await getBlockedSites();
		count.textContent = sites.length;
		output.textContent = JSON.stringify(sites, null, 2);
	} catch (error) {
		output.textContent = "❌ Error: " + error.message;
		count.textContent = "ERROR";
	}
}

async function loadCategories() {
	const output = document.getElementById("categoriesOutput");

	try {
		const categories = await getCategories();
		const summary = Object.entries(categories).map(([id, cat]) => ({
			id,
			name: cat.name,
			enabled: cat.enabled,
			siteCount: cat.sites.length,
			sites: cat.sites.slice(0, 5),
		}));
		output.textContent = JSON.stringify(summary, null, 2);
	} catch (error) {
		output.textContent = "❌ Error: " + error.message;
	}
}

async function loadSettings() {
	const output = document.getElementById("settingsOutput");

	try {
		const settings = await getSettings();
		output.textContent = JSON.stringify(settings, null, 2);
	} catch (error) {
		output.textContent = "❌ Error: " + error.message;
	}
}

function checkExtensionStatus() {
	const status = document.getElementById("status");
	const messages = [];

	chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.PING }, (response) => {
		if (chrome.runtime.lastError) {
			messages.push(
				`<div class="status error">❌ Background script not responding: ${chrome.runtime.lastError.message}</div>`,
			);
		} else {
			messages.push(
				`<div class="status success">✅ Background script is running</div>`,
			);
		}
		status.innerHTML = messages.join("");
	});
}

async function testBlockInstagram() {
	const status = document.getElementById("status");

	try {
		status.innerHTML =
			'<div class="status info">Adding instagram.com to blocklist...</div>';
		await addBlockedSite("instagram.com");

		status.innerHTML +=
			'<div class="status info">Updating blocking rules...</div>';
		const response = await chrome.runtime.sendMessage({
			action: MESSAGE_ACTIONS.UPDATE_BLOCK_RULES,
		});

		status.innerHTML +=
			'<div class="status success">✅ Instagram added and rules updated!</div>';

		setTimeout(loadDebugInfo, 500);
	} catch (error) {
		status.innerHTML += `<div class="status error">❌ Error: ${error.message}</div>`;
	}
}

async function clearAllRules() {
	const status = document.getElementById("status");

	try {
		const rules = await chrome.declarativeNetRequest.getDynamicRules();
		const ruleIds = rules.map((r) => r.id);

		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: ruleIds,
		});

		status.innerHTML = '<div class="status success">✅ All rules cleared</div>';
		setTimeout(loadDebugInfo, 500);
	} catch (error) {
		status.innerHTML = `<div class="status error">❌ Error: ${error.message}</div>`;
	}
}

async function fixBlocking() {
	const status = document.getElementById("status");

	try {
		status.innerHTML =
			'<div class="status info">Reloading blocking rules...</div>';

		const response = await Promise.race([
			chrome.runtime.sendMessage({
				action: MESSAGE_ACTIONS.UPDATE_BLOCK_RULES,
			}),
			new Promise((_, reject) =>
				setTimeout(
					() => reject(new Error("Timeout: Background script not responding")),
					5000,
				),
			),
		]);

		if (response && response.success) {
			status.innerHTML +=
				'<div class="status success">✅ Blocking rules reloaded!</div>';
		} else if (response && response.error) {
			status.innerHTML += `<div class="status error">❌ Error: ${response.error}</div>`;
		} else {
			status.innerHTML +=
				'<div class="status info">! Response received but unclear status</div>';
		}

		setTimeout(loadDebugInfo, 1000);
	} catch (error) {
		status.innerHTML += `<div class="status error">❌ Error: ${error.message}</div>`;
		if (error.message.includes("Timeout")) {
			status.innerHTML +=
				'<div class="status error">💡 Background script may be crashed. Go to chrome:></div>';
		}
	}
}

document.getElementById("refreshBtn").addEventListener("click", loadDebugInfo);
document
	.getElementById("testBlockBtn")
	.addEventListener("click", testBlockInstagram);
document
	.getElementById("clearRulesBtn")
	.addEventListener("click", clearAllRules);
document
	.getElementById("fixBlockingBtn")
	.addEventListener("click", fixBlocking);

document.addEventListener("DOMContentLoaded", loadDebugInfo);
