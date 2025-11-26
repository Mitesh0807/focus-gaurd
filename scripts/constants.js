export const STORAGE_KEYS = {
  BLOCKED_SITES: 'blockedSites',
  SETTINGS: 'settings',
  STATS: 'stats',
  CATEGORIES: 'categories',
  SCHEDULES: 'schedules',
};

export const DEFAULT_SETTINGS = {
  workMode: false,
  focusMode: false,
  focusEndTime: null,
  focusDuration: 25,
  password: null,
  passwordEnabled: false,
  notifications: true,
  darkMode: false,
};

export const DEFAULT_STATS = {
  blocksToday: 0,
  totalBlocks: 0,
  lastResetDate: new Date().toDateString(),
  blockHistory: [],
};

export const MESSAGE_ACTIONS = {
  UPDATE_BLOCK_RULES: 'updateBlockRules',
  STOP_FOCUS_MODE: 'stopFocusMode',
  START_FOCUS_MODE: 'startFocusMode',
  PING: 'ping',
};

export const TIME = {
  SECOND: 1000,
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000,
  WEEK: 604800000,
};

export const ASSETS = {
  ICON_48: '../assets/icons/icon48.png',
};

export const CSS_CLASSES = {
  DARK_MODE: 'dark-mode',
  ACTIVE: 'active',
};

export const LIMITS = {
  MAX_BLOCK_HISTORY: 1000,
  MAX_DYNAMIC_RULES: 5000,
};
