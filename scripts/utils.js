import { TIME } from './constants.js';

export function normalizeUrl(input) {
  let url = input.trim().toLowerCase();

  url = url.replace(/^https?:\/\//, '');

  url = url.replace(/^www\./, '');

  const hasPath =
    url.includes('/') && url.split('/').length > 1 && url.split('/')[1] !== '';
  if (!hasPath) {
    url = url.replace(/\/$/, '');
  } else {
    url = url.replace(/\/$/, '');
  }

  return url;
}

export function isValidUrl(input) {
  const domainRegex =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  const domainWithPathRegex =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](\/[^\s]*)?$/i;
  const urlRegex =
    /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/i;

  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');

  return (
    domainRegex.test(normalized) ||
    domainWithPathRegex.test(normalized) ||
    urlRegex.test(input)
  );
}

export function urlMatchesPattern(url, pattern) {
  const normalizedUrl = normalizeUrl(url);
  const normalizedPattern = normalizeUrl(pattern);

  const urlDomain = extractDomain(url);
  const patternDomain = extractDomain(pattern);

  if (urlDomain === patternDomain || urlDomain.endsWith('.' + patternDomain)) {
    const urlPath = normalizedUrl.substring(urlDomain.length);
    const patternPath = normalizedPattern.substring(patternDomain.length);
    return urlPath.startsWith(patternPath);
  }

  return false;
}

export function extractDomain(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    let domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return domain.split('/')[0];
  }
}

export function isDomainOnly(url) {
  const normalized = normalizeUrl(url);
  return !normalized.includes('/');
}

export function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < TIME.MINUTE) {
    return 'just now';
  }

  if (diff < TIME.HOUR) {
    const minutes = Math.floor(diff / TIME.MINUTE);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  if (diff < TIME.DAY) {
    const hours = Math.floor(diff / TIME.HOUR);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  if (diff < TIME.WEEK) {
    const days = Math.floor(diff / TIME.DAY);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString();
}

export function getRandomQuote() {
  const quotes = [
    'Stay focused! Your goals are worth it.',
    "You're doing great! Keep up the focus.",
    'Distraction is the enemy of achievement.',
    'Focus on what matters most.',
    'Your future self will thank you.',
    'One focused hour is worth two distracted ones.',
    'Success is the sum of small efforts, repeated.',
    'Stay committed to your goals.',
    'Discipline is choosing what you want most over what you want now.',
    'Focus: Follow One Course Until Successful.',
  ];

  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function isTimeInSchedule(schedule) {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  if (!schedule.days.includes(currentDay)) {
    return false;
  }

  const [startHour, startMin] = schedule.startTime.split(':').map(Number);
  const [endHour, endMin] = schedule.endTime.split(':').map(Number);

  const startTimeMinutes = startHour * 60 + startMin;
  const endTimeMinutes = endHour * 60 + endMin;

  if (endTimeMinutes > startTimeMinutes) {
    return currentTime >= startTimeMinutes && currentTime <= endTimeMinutes;
  } else {
    return currentTime >= startTimeMinutes || currentTime <= endTimeMinutes;
  }
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
