# 🔧 FocusGuard Debugging Guide

## Issue: Sites Not Blocking

If Instagram, X (Twitter), or other sites aren't being blocked, follow these steps:

## Step 1: Reload the Extension ⚡

**CRITICAL: Do this first!**

1. Open Chrome and go to `chrome://extensions`
2. Find "FocusGuard" in the list
3. Click the **circular reload icon** ↻
4. You should see the extension reload

## Step 2: Open the Debug Panel 🔍

1. Click the FocusGuard icon in your toolbar
2. At the bottom, click **🔧 Debug**
3. A new tab will open with the debug panel

## Step 3: Check What the Debug Panel Shows

### A. Check "Active Dynamic Rules"

**Expected**: You should see a number greater than 0

**If you see "0 rules"**:
- This means blocking is NOT working
- Rules aren't being created
- Continue to Step 4

**If you see rules**:
- Great! Rules are being created
- Scroll through the JSON to verify your sites are there
- Look for entries like `"urlFilter": "||instagram.com"`

### B. Check "Blocked Sites from Storage"

**Expected**: You should see your manually added sites (instagram.com, x.com, etc.)

**If empty**:
- Sites aren't being saved to storage
- Try adding them again from the popup

### C. Check "Categories Status"

**Expected**: If you enabled "Social Media", you should see `"enabled": true`

**If all show false**:
- Categories aren't being saved
- Try toggling them again in Settings

### D. Check "Permissions Check"

**Expected**: Should show `"✅ All permissions granted"`

**If permissions are missing**:
- The extension doesn't have required permissions
- You may need to reinstall the extension

## Step 4: Try the "Fix & Reload Blocking" Button

1. In the debug panel, click **"Fix & Reload Blocking"**
2. Wait 2 seconds
3. Check "Active Dynamic Rules" count
4. Should now show rules (e.g., "6 rules now active")

## Step 5: Test Blocking

### Method 1: Quick Test
1. In debug panel, click **"Test Block Instagram"**
2. This adds instagram.com and updates rules
3. Open new tab: `https://instagram.com`
4. **Expected**: You should see the FocusGuard block page

### Method 2: Manual Test
1. Open FocusGuard popup
2. Type `instagram.com` in the input
3. Click "Add"
4. Open new tab: `https://instagram.com`
5. **Expected**: Block page appears

## Step 6: Check Browser Console for Errors

### Check Background Script Console:
1. Go to `chrome://extensions`
2. Find FocusGuard
3. Click "service worker" (blue link)
4. Check for errors in red
5. Look for messages starting with "FocusGuard:"

**Expected messages:**
```
FocusGuard: Blocking 1 sites: ["instagram.com"]
FocusGuard: Created rules for instagram.com
FocusGuard: Removing 0 old rules
FocusGuard: Adding 2 new rules
FocusGuard: Successfully updated! 2 rules now active
```

**If you see errors:**
- Copy the error message
- This indicates what's wrong with the blocking

## Common Issues & Solutions

### Issue 1: "0 rules active" even after adding sites

**Solution**:
1. Open Debug panel
2. Click "Clear All Rules"
3. Click "Fix & Reload Blocking"
4. Check rule count again

### Issue 2: Sites in storage but no rules created

**Possible causes**:
- Background script not running
- Error in rule creation
- Permission issue

**Solution**:
1. Check background script console (see Step 6)
2. Look for errors in red
3. Try reloading extension completely

### Issue 3: Rules exist but sites still load

**Possible causes**:
- URL pattern not matching
- Redirect URL invalid
- Browser cache

**Solution**:
1. Clear browser cache
2. Try in Incognito mode (make sure extension works in incognito)
3. Check the exact URL pattern in debug panel

### Issue 4: Background script shows "service worker (inactive)"

**This is normal!**
- Service workers go inactive when not needed
- They wake up when needed
- Click "service worker" link to activate it

## Testing Checklist ✅

Use this checklist to verify everything works:

- [ ] Extension loaded without errors
- [ ] Debug panel opens successfully
- [ ] Can add sites via popup
- [ ] Sites appear in storage (debug panel)
- [ ] Rules are created (count > 0)
- [ ] instagram.com is blocked
- [ ] x.com is blocked
- [ ] Social Media category toggle works
- [ ] Block page appears when visiting blocked site
- [ ] Dark mode works
- [ ] Work Mode toggle works

## Advanced Debugging

### View Actual Rule Structure

In debug panel, look at the JSON for rules. Each rule should look like:

```json
{
  "id": 1,
  "priority": 1,
  "action": {
    "type": "redirect",
    "redirect": {
      "url": "chrome-extension://[ID]/pages/blocked.html?site=instagram.com"
    }
  },
  "condition": {
    "urlFilter": "||instagram.com",
    "resourceTypes": ["main_frame"]
  }
}
```

### Test Individual Components

**Test storage:**
```javascript
// In popup console (right-click popup → Inspect)
chrome.storage.local.get(null, (data) => console.log(data));
```

**Test messaging:**
```javascript
// In popup console
chrome.runtime.sendMessage({ action: 'ping' }, (response) => console.log(response));
```

## Still Not Working?

If after all these steps it's still not working:

1. **Check browser version**: Chrome 90+ required
2. **Try in new profile**: Create new Chrome profile and install there
3. **Check for conflicts**: Disable other blocking extensions
4. **Reinstall extension**: Remove completely and reload
5. **Check manifest.json**: Ensure all files are present

## Report the Issue

If you need to report the issue, include:

1. Chrome version (`chrome://version`)
2. Screenshot of debug panel
3. Background script console errors
4. Steps you tried from this guide

## Quick Fix Commands

Copy-paste these in the background script console:

```javascript
// Force reload all rules
chrome.runtime.sendMessage({ action: 'updateBlockRules' });

// Check active rules
chrome.declarativeNetRequest.getDynamicRules().then(rules => {
  console.log(`Active rules: ${rules.length}`);
  console.log(rules);
});

// Clear all rules
chrome.declarativeNetRequest.getDynamicRules().then(rules => {
  const ids = rules.map(r => r.id);
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ids
  });
});
```

---

**Remember**: Always reload the extension after making changes!
