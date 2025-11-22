// Normalize URL to a consistent format
export function normalizeUrl(input) {
  let url = input.trim().toLowerCase();

  // Remove protocol if present
  url = url.replace(/^https?:\/\//, '');

  // Remove www. prefix
  url = url.replace(/^www\./, '');

  // Remove trailing slash only if there's no path
  const hasPath = url.includes('/') && url.split('/').length > 1 && url.split('/')[1] !== '';
  if (!hasPath) {
    url = url.replace(/\/$/, '');
  } else {
    // For paths, just remove trailing slash
    url = url.replace(/\/$/, '');
  }

  return url;
}

// Validate URL
export function isValidUrl(input) {
  // Simple validation - check if it looks like a domain or domain/path
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  const domainWithPathRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](\/[^\s]*)?$/i;
  const urlRegex = /^https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/i;

  const normalized = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');

  return domainRegex.test(normalized) || domainWithPathRegex.test(normalized) || urlRegex.test(input);
}

// Check if URL matches a blocked pattern
export function urlMatchesPattern(url, pattern) {
  // Normalize both URLs
  const normalizedUrl = normalizeUrl(url);
  const normalizedPattern = normalizeUrl(pattern);

  // Exact match
  if (normalizedUrl === normalizedPattern) {
    return true;
  }

  // Domain match (including subdomains)
  if (normalizedUrl.endsWith(normalizedPattern) || normalizedUrl.endsWith('.' + normalizedPattern)) {
    return true;
  }

  // Pattern starts with the URL (for path matching)
  if (normalizedUrl.startsWith(normalizedPattern + '/')) {
    return true;
  }

  return false;
}

// Extract domain from URL
export function extractDomain(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    // If URL parsing fails, try to extract domain manually
    let domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return domain.split('/')[0];
  }
}

// Format time (minutes to readable format)
export function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Format date
export function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than a minute
  if (diff < 60000) {
    return 'just now';
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // Format as date
  return date.toLocaleDateString();
}

// Generate random motivational quote
export function getRandomQuote() {
  const quotes = [
    "Stay focused! Your goals are worth it.",
    "You're doing great! Keep up the focus.",
    "Distraction is the enemy of achievement.",
    "Focus on what matters most.",
    "Your future self will thank you.",
    "One focused hour is worth two distracted ones.",
    "Success is the sum of small efforts, repeated.",
    "Stay committed to your goals.",
    "Discipline is choosing what you want most over what you want now.",
    "Focus: Follow One Course Until Successful."
  ];

  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Check if current time is in schedule
export function isTimeInSchedule(schedule) {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

  // Check if schedule applies to current day
  if (!schedule.days.includes(currentDay)) {
    return false;
  }

  // Parse start and end times
  const [startHour, startMin] = schedule.startTime.split(':').map(Number);
  const [endHour, endMin] = schedule.endTime.split(':').map(Number);

  const startTimeMinutes = startHour * 60 + startMin;
  const endTimeMinutes = endHour * 60 + endMin;

  // Check if current time is within schedule
  if (endTimeMinutes > startTimeMinutes) {
    // Normal case (doesn't cross midnight)
    return currentTime >= startTimeMinutes && currentTime <= endTimeMinutes;
  } else {
    // Crosses midnight
    return currentTime >= startTimeMinutes || currentTime <= endTimeMinutes;
  }
}

// Debounce function
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
