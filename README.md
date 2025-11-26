# FocusGuard Browser Extension

A browser extension for Chrome, Firefox, and Edge that blocks distracting websites.

## Features

- **Manual Website Blocking**: Block any website by URL.
- **Category-Based Blocking**: Pre-defined categories like Social Media, News, etc.
- **Work Mode**: Toggle to activate category-based blocking.
- **Focus Mode (Pomodoro)**: Timed focus sessions.
- **Schedule Blocking**: Block sites during specific times and days.

## Installation

### Chrome/Edge

1.  Download the code.
2.  Create the necessary icons in `assets/icons/`.
3.  Go to `chrome://extensions` (or `edge://extensions`).
4.  Enable "Developer mode".
5.  Click "Load unpacked" and select the project folder.

### Firefox

1.  Go to `about:debugging#/runtime/this-firefox`.
2.  Click "Load Temporary Add-on".
3.  Select the `manifest.json` file.

## Quick Start

1.  **Block a Site**:
    - Use the popup to add a site URL.
    - Click "Block Current Site" from the popup.
    - Right-click on a page and select "Block this site".
2.  **Use Categories**:
    - Go to Settings -> Categories.
    - Toggle on the categories you want to block.
3.  **Start a Focus Session**:
    - Click "Focus Mode" in the popup.
    - Select a duration and start.
4.  **Create a Schedule**:
    - Go to Settings -> Schedules.
    - Add a new schedule with your desired times and days.

## Project Structure

- `manifest.json`: Extension configuration.
- `popup/`: Popup UI and logic.
- `background/`: Background scripts for blocking.
- `pages/`: Block page and settings page.
- `scripts/`: Shared scripts.
- `assets/`: Icons and other assets.
