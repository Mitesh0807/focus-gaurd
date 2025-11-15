# FocusGuard Browser Extension - Complete Feature Documentation

## Overview

FocusGuard is a comprehensive browser extension for Chrome, Firefox, Edge, and Safari that blocks distracting websites, enforces focus time, and tracks productivity metrics directly in your web browser.

---

## Core Blocking Features

### 1. Manual Website Blocking

**How It Works:**

- Add websites by typing the URL in the extension popup
- Block entire domains (facebook.com blocks all of Facebook)
- Block specific pages (facebook.com/marketplace blocks only marketplace)
- Block subdomains (messenger.facebook.com)
- Block URL patterns using wildcards (\*.facebook.com blocks all FB subdomains)

**Blocking Methods:**

- Type URL directly in extension popup
- Right-click on any page → "Block this site"
- Click extension icon while on a page → "Block current site"
- Import bulk list from text file or CSV
- Copy-paste multiple URLs at once

**URL Matching Options:**

- Exact match: www.example.com
- Domain match: example.com (blocks www, m, app subdomains)
- Subdomain wildcard: \*.example.com
- Path blocking: example.com/path/\*
- Parameter blocking: example.com?param=value

**Advanced URL Blocking:**

- Block specific ports: example.com:8080
- Block HTTP vs HTTPS separately
- Block by IP address: 192.168.1.1
- RegEx patterns (Premium): `^https?://.*\.reddit\.com/r/(?!productivity).*$`

### 2. Category-Based Blocking

**Pre-defined Categories:**

**Adult Content:**

- 1000+ adult websites pre-loaded
- Automatic detection of adult keywords in URLs
- Blocks image/video adult content sites
- Blocks adult streaming platforms
- Dating sites with adult content

**Social Media:**

- Facebook, Instagram, Twitter/X, TikTok, Snapchat
- LinkedIn, Pinterest, Reddit, Tumblr
- Discord, WhatsApp Web, Telegram Web
- YouTube (can be separate)
- Alternative social networks

**Video & Entertainment:**

- YouTube, Netflix, Hulu, Disney+, HBO Max
- Twitch, Vimeo, Dailymotion
- Streaming services
- Video sharing platforms

**News & Media:**

- CNN, BBC, Fox News, MSNBC
- New York Times, Washington Post, Guardian
- Local news sites (configurable by region)
- News aggregators (Reddit, Feedly)
- Sports news sites

**Gaming:**

- Steam, Epic Games, GOG
- Browser games (Miniclip, Kongregate, Armor Games)
- Gaming news (IGN, GameSpot, Kotaku)
- Game wikis and forums
- Roblox, Minecraft websites

**Shopping & E-commerce:**

- Amazon, eBay, Walmart, Target, Etsy
- Fashion sites (Zara, H&M, ASOS)
- Deal sites (Slickdeals, RetailMeNot)
- Marketplace sites
- Auction sites

**Messaging & Communication:**

- WhatsApp Web, Telegram Web, Facebook Messenger
- Discord, Slack (can whitelist work channels)
- Email providers (Gmail, Outlook) - optional
- Video chat (Zoom, Teams) - optional

**Music & Audio:**

- Spotify, Apple Music, YouTube Music
- SoundCloud, Bandcamp
- Podcast platforms
- Radio streaming

**Sports:**

- ESPN, Bleacher Report, Sports Illustrated
- Team-specific sites
- Fantasy sports platforms
- Sports streaming

**Cryptocurrency:**

- Exchanges (Coinbase, Binance, Kraken)
- Crypto news sites
- Trading platforms
- Crypto forums

**One-Click Category Activation:**

- Toggle entire category on/off
- View all sites in category before blocking
- Add custom sites to existing categories
- Create custom categories

### 3. Keyword Blocking

**Functionality:**

- Block any webpage containing specific keywords in URL
- Block search results with keywords
- Block page titles containing keywords
- Case-insensitive matching
- Whole word or partial matching options

**Examples:**

- Keyword "game" blocks: games.com, gaming.ign.com, facebook.com/games
- Keyword "celebrity" blocks gossip sites
- Keyword "reddit" blocks all Reddit URLs

**Advanced Keyword Features:**

- Multi-word phrases: "watch free movies"
- Boolean operators: "news AND politics"
- Negative keywords: "recipe -ads"
- Keyword lists import/export
- Priority keywords (block first)

**Keyword Scanning:**

- URL scanning (instant)
- Page title scanning (loads page first)
- Meta description scanning (Premium)
- Page content scanning (Premium, slower)

### 4. Block List Management

**Organization Features:**

- Search through blocked sites
- Sort alphabetically, by date added, by category
- Filter by category tags
- Group sites into custom lists
- Color-code sites by priority/type
- Add notes to each blocked site

**Bulk Operations:**

- Select multiple sites to delete
- Export selected sites
- Move sites between lists
- Copy sites to different profile
- Bulk edit time limits

**Import/Export:**

- Export to CSV, JSON, or TXT
- Import from file (validates URLs)
- Share block lists with others
- Backup/restore functionality
- Sync with Google/Firefox account

### 5. Whitelist (Allow List)

**Regular Whitelist:**

- Specific sites you want to allow
- Override category blocks for specific sites
- Temporary whitelist (expires after X hours)
- Whitelist specific pages on blocked domain

**Whitelist Mode (Premium):**

- Block EVERYTHING except whitelist
- Useful for extreme focus or parental control
- Work whitelist: Only work-related sites allowed
- Study whitelist: Only educational sites
- Quick toggle between normal and whitelist mode

**Smart Whitelist:**

- Auto-whitelist work domains (company.com)
- Auto-whitelist educational domains (.edu)
- Time-based whitelist (allow LinkedIn during work hours)
- Location-based whitelist (allow shopping at home only)

---

## Scheduling & Time Management

### 6. Schedule Blocking

**Basic Scheduling (Free):**

- Set specific hours to block sites
- Daily recurring schedule
- Enable/disable schedules easily

**Advanced Scheduling (Premium):**

**Day-Specific Schedules:**

- Different schedules for each day of the week
- Monday-Friday work schedule
- Weekend different rules
- Custom schedule for each day

**Multiple Time Blocks Per Day:**

- Morning block: 6 AM - 9 AM
- Work hours: 9 AM - 5 PM
- Evening block: 8 PM - 10 PM
- Overlap handling (most restrictive wins)

**Schedule Templates:**

- Work Schedule: Block social media 9-5 weekdays
- Study Schedule: Block entertainment 6-10 PM daily
- Sleep Schedule: Block everything 11 PM - 7 AM
- Weekend Freedom: Unblock everything Sat-Sun

**Schedule Exceptions:**

- Holidays: Disable work blocks
- Special dates: Birthday, vacation days
- One-time exceptions: "Allow today only"
- Recurring exceptions: "Always allow on Fridays after 3 PM"

**Schedule Combinations:**

- Different block lists for different schedules
- Social media blocked 9-5, shopping blocked 5-9
- Granular control over what's blocked when

### 7. Focus Mode (Pomodoro Timer)

**Timer Options:**

- Preset times: 15, 25, 30, 45, 60 minutes
- Custom timer length
- Break timer after focus session
- Long break after X sessions

**During Focus Mode:**

- Block all distracting sites automatically
- Can't disable until timer ends
- Visual countdown in extension icon
- Desktop notification when focus starts
- Sound alert when session completes

**Focus Sessions:**

- Track consecutive sessions
- Daily focus goals (e.g., 4 sessions per day)
- Weekly focus statistics
- Best focus streak tracking
- Focus calendar view

**Break Functionality:**

- Auto-start break after focus session
- Unblock sites during break
- Break reminder notifications
- Option to skip break and start new session
- Structured breaks (walk, stretch, drink water reminders)

**Focus Customization:**

- Select which sites to block during focus
- Whitelist work sites during focus
- Focus mode block page message
- Ambient sound player during focus (Premium)
- Disable notifications during focus

### 8. Time Limits (Usage Caps)

**Daily Time Limits:**

- Set maximum minutes per day for each site
- Example: 30 minutes of YouTube daily
- Visual timer shows remaining time
- Warning at 5 minutes remaining
- Site auto-blocks when limit reached

**Time Tracking:**

- Real-time tracking of time spent on each site
- Pause timer when inactive (no scrolling/clicking)
- Accurate tracking of active usage
- Time resets at midnight

**Time Budget Management:**

- Weekly time budgets (e.g., 3 hours YouTube per week)
- Rollover unused time (Premium)
- Borrow from tomorrow's allowance (Premium)
- Time bank system

**Time Limit Features:**

- Different limits for weekdays vs weekends
- Longer limits during scheduled breaks
- Zero limits during work hours
- Custom reset time (not just midnight)

---

## Password & Security Features

### 9. Password Protection

**Master Password:**

- Set one password for all protection features
- Required to access settings
- Required to unblock sites
- Required to disable extension

**Password Requirements:**

- Minimum 6 characters
- Optional: require numbers, symbols
- Password strength indicator
- Password hints (not shown for 5 minutes)

**Protected Actions:**

- Change settings
- Remove blocked sites
- Disable schedules
- Uninstall extension
- Access analytics
- Import/export data
- Change password itself

**Password Bypass Prevention:**

- Time delay before password prompt (5-30 seconds)
- Limited attempts (3) before lockout
- Lockout duration (10-60 minutes)
- Account notification when password entered
- Can't uninstall during lockout

**Emergency Access:**

- Email recovery code
- Security questions
- Send code to trusted contact
- 24-hour emergency disable request

### 10. Uninstall Protection

**Protection Levels:**

- Require password to uninstall
- Require password + email confirmation
- Require password + waiting period (24 hours)
- Require password + trusted contact approval

**Reinstall Detection:**

- Detects if extension was uninstalled
- Automatically reinstalls settings from cloud backup
- Notifies accountability partner
- Logs uninstall attempt with timestamp

**Tamper Protection:**

- Detect if extension files are modified
- Detect if running in developer mode
- Warning when other extensions try to interfere
- Block access to chrome://extensions page (Premium)

---

## Block Pages & Redirects

### 11. Custom Block Pages

**Default Block Page Shows:**

- "This site is blocked" message
- Which site was blocked
- Reason for block (schedule, category, manual)
- Time until unblocked (if scheduled)
- Motivational quote (random)

**Customization Options (Premium):**

**Custom Messages:**

- Personal motivational message
- Different messages per site/category
- Time-based messages (morning vs evening)
- Countdown to goal

**Custom Images:**

- Upload personal image (family, goals, quotes)
- Choose from image library
- Random rotation of images
- Full-screen background image

**Block Page Elements:**

- Display productivity statistics
- Show today's progress
- Display focus streak
- Show time saved today
- Quote of the day
- To-do list integration
- Progress bar to goal

**Interactive Elements:**

- "I'm feeling weak" button (adds 5 min delay)
- "Break the habit" motivational exercise
- Quick breathing exercise
- Productivity tips
- Goal reminder

### 12. Redirect Rules

**Simple Redirect:**

- Redirect blocked site to different URL
- Example: Facebook → Productivity blog
- Twitter → Email inbox
- YouTube → Educational video platform

**Smart Redirects (Premium):**

- Redirect to motivational page
- Redirect to task list
- Redirect to work dashboard
- Redirect to time tracking tool
- Redirect to meditation site

**Conditional Redirects:**

- Redirect only during work hours
- Redirect social media to business profile
- Redirect based on which site was blocked
- Random redirect from whitelist

**Redirect Chain Prevention:**

- Detect redirect loops
- Block redirect destination if also blocked
- Maximum redirect depth
- Redirect history logging

---

## Analytics & Insights

### 13. Productivity Dashboard

**Real-Time Stats:**

- Sites blocked today
- Time saved today (estimated)
- Current focus streak
- Sites visited vs blocked ratio

**Weekly Overview:**

- Total blocks this week
- Most blocked site
- Best day of the week
- Worst day of the week
- Week-over-week improvement

**Monthly Reports:**

- Total time saved
- Most productive hours
- Least productive hours
- Category breakdown
- Trend analysis

### 14. Detailed Analytics (Premium)

**Block Statistics:**

- Total lifetime blocks
- Blocks per hour heatmap
- Blocks by day of week
- Blocks by category
- Block attempt patterns

**Time Analysis:**

- Time spent on productive vs unproductive sites
- Average session length per site
- Peak browsing hours
- Procrastination patterns
- Focus time vs break time

**Behavioral Insights:**

- Which sites you try to visit most
- Times you're most distracted
- Triggers for distraction
- Success rate of focus sessions
- Habit formation progress

**Visual Reports:**

- Line graphs of blocks over time
- Pie charts of category distribution
- Bar charts comparing days/weeks
- Heatmap of browsing activity
- Productivity score trend

**Export Reports:**

- PDF report generation
- CSV data export
- Email weekly/monthly reports
- Share reports with accountability partner

### 15. Streak Tracking

**Types of Streaks:**

- Days without breaking a block
- Consecutive successful focus sessions
- Days meeting daily time limit goals
- Days following schedule perfectly

**Streak Features:**

- Current streak counter
- Longest streak record
- Streak broken notification
- Streak recovery (1 mistake forgiven per week)
- Streak milestones (7, 30, 100, 365 days)

---

## Browser Integration Features

### 16. Extension Popup Interface

**Quick Access Popup:**

- Click extension icon for instant menu
- Toggle Work Mode on/off
- Start Focus Mode timer
- View today's statistics
- Quick add current site to blocklist
- See list of recently blocked sites

**Popup Customization:**

- Compact or expanded view
- Show/hide specific widgets
- Rearrange popup elements
- Choose stats to display
- Dark mode toggle

### 17. Context Menu Integration

**Right-Click Menu Options:**

- Block this site
- Block this domain
- Add to whitelist
- Block for 1 hour
- Block until (specific time)
- Block this page only
- Snooze block for 15 minutes

**Link Context Menu:**

- Block link domain before clicking
- Check if link is blocked
- Add link domain to whitelist

### 18. Browser Badge

**Extension Icon Badge Shows:**

- Number of sites currently blocked
- Active focus timer countdown
- "Work Mode" indicator
- Number of blocks today
- Warning icon if protection disabled

**Badge Customization:**

- Choose what to display
- Badge color options
- Badge size
- Show/hide badge
- Animated badge for milestones

### 19. Keyboard Shortcuts

**Global Shortcuts:**

- `Ctrl+Shift+B`: Open BlockSite popup
- `Ctrl+Shift+F`: Start Focus Mode
- `Ctrl+Shift+W`: Toggle Work Mode
- `Ctrl+Shift+A`: Add current site to blocklist
- `Ctrl+Shift+D`: Disable blocking for 5 minutes

**Customizable Shortcuts:**

- Reassign any keyboard combination
- Create shortcuts for specific actions
- Import/export shortcut configurations

### 20. Tab Management

**Auto-Close Blocked Tabs:**

- Instantly close tabs of blocked sites
- Show block page instead of closing (option)
- Close all tabs of a domain when one is blocked

**Tab Warnings:**

- Warning before opening blocked site
- "Are you sure?" confirmation
- Must wait 5 seconds to proceed

**Tab Limiting:**

- Limit number of tabs for specific sites
- Example: Max 2 YouTube tabs at once
- Prevent tab hoarding

### 21. New Tab Page Integration

**Block Site on New Tab:**

- Customize new tab page
- Show productivity stats
- Display motivation quote
- Show today's goals
- Quick access to whitelist

**Prevent Distracting New Tabs:**

- Block specific new tab pages
- Redirect new tabs to productive page
- Disable sponsored content on new tab

### 22. Bookmark & History Management

**Bookmark Blocking:**

- Block access to bookmarks of blocked sites
- Hide bookmarks of blocked sites
- Delete bookmarks when blocking site
- Warn before bookmarking blocked sites

**History Clearing:**

- Auto-delete history of blocked sites
- Clear history when site is blocked
- Prevent searching blocked sites in history
- Privacy mode for blocked site visits

---

## Advanced Blocking Features

### 23. Work Mode

**One-Click Distraction Block:**

- Enables preset block list instantly
- Typically blocks: social media, news, entertainment, shopping
- Shows "Work Mode Active" banner
- Extension icon changes color

**Work Mode Features:**

- Quick toggle on/off
- Scheduled auto-activation
- Can't disable during work hours (optional)
- Customizable block list for work mode

### 24. Nuclear Option (Extreme Block)

**Maximum Protection Mode:**

- Blocks ALL sites except small whitelist
- Cannot be disabled for set duration
- Requires password + email confirmation + wait time to disable
- Emergency use only

**Nuclear Mode Settings:**

- Minimum duration: 1 hour
- Maximum duration: 7 days
- Must pre-define whitelist (max 10 sites)
- Sends activation confirmation email
- Accountability partner notified

### 25. Content Filtering (Premium)

**YouTube Specific:**

- Block specific channels
- Block videos by title keywords
- Block recommended videos section
- Block comments section
- Block autoplay
- Block trending page
- Time limit per video
- Block YouTube Shorts

**Social Media Filtering:**

- Block Facebook News Feed (keep Messenger)
- Block Instagram Explore page
- Block Twitter trending section
- Block Reddit specific subreddits
- Block TikTok For You page

**Website Element Blocking:**

- Block infinite scroll
- Block "recommended" sections
- Block comment sections
- Block sidebar ads
- Block popups

### 26. Smart Blocking (AI-Powered) (Premium)

**Content Analysis:**

- Scans page content for distracting topics
- Blocks pages with keywords (even if URL is different)
- Detects NSFW content automatically
- Learns your distraction patterns

**Behavioral Learning:**

- Tracks which sites lead to wasted time
- Suggests sites to block based on usage
- Predicts when you'll get distracted
- Recommends optimal break times

---

## Sync & Backup Features

### 27. Cloud Sync (Premium)

**What Syncs:**

- Block lists
- Whitelist
- Schedules
- Password settings
- Custom block pages
- Analytics data
- Extension settings

**Sync Options:**

- Automatic sync every 5 minutes
- Manual sync button
- Sync on settings change
- Sync on browser close
- Conflict resolution (newest wins)

**Sync Across:**

- Chrome on multiple computers
- Firefox on multiple computers
- Different browsers (Chrome + Firefox)
- Work and personal computers

### 28. Backup & Restore

**Manual Backup:**

- Export all settings to file
- Encrypted backup file
- Password-protected export
- Include/exclude analytics data

**Auto-Backup:**

- Daily automatic backups
- Keep last 30 backups
- Cloud storage integration
- Email backup file weekly

**Restore:**

- Restore from backup file
- Restore specific settings only
- Merge with current settings
- Preview before restore

---

## Privacy & Security

### 29. Privacy Settings

**Data Collection:**

- None (fully local mode)
- Anonymous analytics only
- Full analytics with account
- Opt-out anytime

**Local Storage:**

- All data stored locally
- No server communication required
- Encrypted local database
- Clear all data option

**Privacy Features:**

- No tracking cookies
- No third-party scripts
- Open source code available
- Regular security audits

### 30. Incognito/Private Mode

**Incognito Blocking:**

- Block sites in incognito mode
- Separate rules for incognito
- Prevent using incognito to bypass blocks
- Detect incognito window opening

**Options:**

- Block all incognito browsing
- Allow incognito but enforce same blocks
- Disable extension in incognito (default)
- Log incognito usage

---

## Notifications & Alerts

### 31. Browser Notifications

**Notification Types:**

- Site blocked notification
- Schedule activated
- Focus session completed
- Time limit warning (5 min left)
- Goal achieved
- Streak milestone
- Break reminder

**Notification Settings:**

- Enable/disable each type
- Notification sound options
- Duration before auto-dismiss
- Do Not Disturb mode
- Quiet hours (no notifications)

### 32. Email Notifications (Premium)

**Email Alerts:**

- Daily summary report
- Weekly detailed report
- Password change alert
- Settings modification alert
- Uninstall attempt alert
- Goal achievement celebration
- Send reports to accountability partner

---

## Accountability Features

### 33. Accountability Partner (Premium)

**How It Works:**

- Add partner's email address
- Partner receives activity reports
- Partner notified when you try to bypass
- Partner can lock/unlock settings remotely

**Partner Permissions:**

- View-only access
- Can't change your settings
- Receives weekly reports
- Notified of uninstall attempts
- Gets alerted to password resets

### 34. Screenshot Logging (Premium)

**Auto-Screenshot:**

- Takes screenshot when blocked site accessed
- Emails screenshot to accountability partner
- Stores screenshots for review
- Timestamps all screenshots

**Privacy:**

- Can exclude sensitive sites
- Blur personal info
- Require permission before each screenshot
- Delete screenshots after 30 days

---

## Multi-Profile Support

### 35. User Profiles (Premium)

**Multiple Profiles:**

- Work profile with work blocks
- Personal profile with different rules
- Study profile for students
- Parental control profile

**Quick Profile Switching:**

- Switch profiles from popup
- Auto-switch based on time
- Auto-switch based on location
- Different passwords per profile

**Profile Features:**

- Separate block lists
- Separate schedules
- Separate analytics
- Separate sync

---

## Miscellaneous Features

### 36. Safe Search Enforcement

**Force Safe Search:**

- Google Safe Search ON
- Bing Safe Search ON
- YouTube Restricted Mode ON
- DuckDuckGo Safe Search ON

**Options:**

- Can't disable safe search
- Hide safe search settings
- Force across all browsers

### 37. Import Popular Lists

**Pre-made Block Lists:**

- Top 100 Time-Wasting Sites
- Social Media Mega List
- Adult Content Comprehensive List
- News Sites List
- Gaming Sites List
- Shopping Sites List

**Community Lists:**

- Import lists shared by users
- Download curated lists
- Subscribe to auto-updating lists

### 38. Browser Automation Prevention

**Blocks:**

- Selenium automation
- Puppeteer scripts
- Browser automation tools trying to disable extension
- Developer mode bypasses

### 39. Gamification

**Achievement Badges:**

- First block
- 7-day streak
- 100 sites blocked
- 1000 hours saved
- Perfect month
- 1-year streak

**Leaderboards (Optional):**

- Compare with friends
- Global rankings
- Category leaders
- Most improved

### 40. Emergency Features

**Panic Button:**

- Block all sites immediately
- Only whitelist accessible
- Lasts 1-24 hours
- Requires password to deactivate

**Quick Disable (with penalty):**

- Temporarily disable (5-60 min)
- Must wait before disabling
- Logs all disable attempts
- Notifies accountability partner

---

## Compatibility & Performance

### Supported Browsers:

- Chrome (Version 90+)
- Firefox (Version 85+)
- Edge (Version 90+)
- Safari (Version 14+)
- Opera (Version 75+)
- Brave Browser

### Performance:

- Instant page blocking (<1ms)
- Minimal CPU usage (<0.5%)
- Low memory footprint (20-40MB)
- No browsing slowdown
- Works offline
- Fast extension popup load

### Technical:

- Manifest V3 compliant
- Uses declarativeNetRequest API
- Background service worker
- Encrypted local storage
- IndexedDB for analytics

---

## Settings & Preferences

### General Settings:

- Dark mode / Light mode / Auto
- Language selection (20+ languages)
- Notification preferences
- Keyboard shortcut customization
- Default block page theme
- Extension badge display
- Startup behavior

### Privacy Settings:

- Data collection level
- Analytics opt-in/out
- Clear all data
- Export all data
- Account deletion

### Advanced Settings:

- RegEx blocking enable
- Developer mode warnings
- Whitelist behavior
- Block delay (0-10 seconds)
- Bypass attempts logging
- Performance mode

---

This is the complete, detailed documentation of everything BlockSite does specifically in the browser extension context. Every feature is explained with how it works and what options are available.
