# Visual Testing Guide - AI Troubleshooting

## What You Should See: Step-by-Step Visual Guide

---

## 1️⃣ Search Bar - Troubleshooting Detection

### When you search for issues:

**✅ CORRECT:**
```
┌─────────────────────────────────────────┐
│ 🔍 "I can't access my workspace"       │
│                                [Search] │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│ ⚠️ Troubleshooting mode detected        │
│                                         │
│ This looks like a troubleshooting       │
│ query. Click "Get AI Help" for          │
│ automated issue resolution.             │
│                                         │
│            [🔧 Get AI Help]             │
└─────────────────────────────────────────┘
```

**❌ INCORRECT:**
- No orange banner appears
- No "Get AI Help" button
- Search results show but no hint

---

## 2️⃣ AI Troubleshooting Modal - Initial State

### When modal opens:

**✅ CORRECT:**
```
┌──────────────────────────────────────────────────┐
│ 🔧 AI Troubleshooting                      [✕]  │
│ Automatically diagnose and fix issues            │
├──────────────────────────────────────────────────┤
│                                                  │
│ 🏷️ developer      (or admin with shield icon)   │
│                                                  │
│ Describe your issue:                            │
│ ┌──────────────────────────────────────────┐   │
│ │ I can't access my workspace              │   │
│ │                                          │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│       [✨ Diagnose Issue]                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Visual Checks:**
- ✅ Header gradient: Red-orange background
- ✅ Wrench icon in header
- ✅ User role badge visible
- ✅ Query textarea with placeholder
- ✅ Gradient button (red to orange)

**❌ INCORRECT:**
- Modal doesn't open
- No role badge
- Query field is blank
- Button is wrong color

---

## 3️⃣ Diagnosis Display - Non-Admin User

### After clicking "Diagnose Issue" as Developer:

**✅ CORRECT:**
```
┌──────────────────────────────────────────────────┐
│ ⚠️ ACCESS DENIED                   🔴 high       │
├──────────────────────────────────────────────────┤
│                                                  │
│ You may not have the required permissions       │
│ to access this resource. This could be due      │
│ to your role or workspace membership.           │
│                                                  │
│ ✅ Auto-fixable    🛡️ Requires Admin            │
│                                                  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Recommended Actions                              │
├──────────────────────────────────────────────────┤
│ 1️⃣ Check your workspace membership              │
│ 2️⃣ Verify your user role (current: developer)   │
│ 3️⃣ Contact an admin to grant access             │
│ 4️⃣ Request to be added to the workspace         │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ ⚠️ Admin Access Required                         │
├──────────────────────────────────────────────────┤
│ You don't have admin privileges to fix this     │
│ issue. Please contact your workspace            │
│ administrator or project manager for             │
│ assistance.                                      │
└──────────────────────────────────────────────────┘
```

**Visual Checks:**
- ✅ Issue type in uppercase
- ✅ Severity badge (high = orange #EA580C)
- ✅ Two badges: "Auto-fixable" + "Requires Admin"
- ✅ Numbered action list
- ✅ Yellow warning box at bottom
- ✅ NO "Confirm & Fix" button

**❌ INCORRECT:**
- "Confirm & Fix" button appears
- Wrong severity color
- Missing badges
- No warning box

---

## 4️⃣ Diagnosis Display - Admin User

### Same issue, but logged in as Admin:

**✅ CORRECT:**
```
┌──────────────────────────────────────────────────┐
│ 🛡️ admin                                         │
│ You have admin privileges                        │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ ⚠️ ACCESS DENIED                   🔴 high       │
├──────────────────────────────────────────────────┤
│ [Same description as above]                      │
│                                                  │
│ ✅ Auto-fixable    🛡️ Requires Admin            │
└──────────────────────────────────────────────────┘

[Recommended Actions - same as above]

┌──────────────────────────────────────────────────┐
│ 🛡️ Admin Confirmation Required                   │
├──────────────────────────────────────────────────┤
│ This fix will make system-wide changes. As an   │
│ admin, you can approve and execute this fix.    │
│                                                  │
│         [🛡️ Confirm & Fix]                      │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Visual Checks:**
- ✅ Shield icon with admin badge at top
- ✅ Red background on admin warning box
- ✅ "Confirm & Fix" button IS visible
- ✅ Button has shield icon
- ✅ Red button background (#DC2626)

**❌ INCORRECT:**
- No admin badge
- No "Confirm & Fix" button
- Button is wrong color
- Shows "Admin Access Required" instead

---

## 5️⃣ Fix Applied - Success State

### After clicking "Confirm & Fix":

**✅ CORRECT:**
```
┌──────────────────────────────────────────────────┐
│ ✅ Fix Applied                                   │
├──────────────────────────────────────────────────┤
│ ✅ Access granted! You have been added to the   │
│ workspace as a developer.                        │
│                                                  │
│ Details:                                         │
│ {                                                │
│   "role": "developer",                           │
│   "workspaceId": "workspace-123"                 │
│ }                                                │
└──────────────────────────────────────────────────┘

Toast notification (top-right):
┌────────────────────────┐
│ ✅ Issue fixed!        │
│ Access granted! You... │
└────────────────────────┘
```

**Visual Checks:**
- ✅ Green checkmark icon
- ✅ Green border on card
- ✅ Success message
- ✅ JSON details visible
- ✅ Toast appears in top-right
- ✅ Toast has green checkmark

**❌ INCORRECT:**
- Red X icon
- Error message
- No toast
- Empty details

---

## 6️⃣ Missing Data Issue (Auto-Fix)

### This happens immediately without admin approval:

**✅ CORRECT:**
```
┌──────────────────────────────────────────────────┐
│ ⚠️ MISSING DATA                  🟡 medium       │
├──────────────────────────────────────────────────┤
│ Data may be missing due to sync issues,          │
│ filters, or accidental deletion.                 │
│                                                  │
│ ✅ Auto-fixable                                  │
│                                                  │
└──────────────────────────────────────────────────┘

[Recommended Actions list]

┌──────────────────────────────────────────────────┐
│ ✅ Fix Applied                                   │
├──────────────────────────────────────────────────┤
│ ✅ Data check complete. Found 25 stories and    │
│ 8 epics. Try refreshing the page or clearing    │
│ filters.                                         │
└──────────────────────────────────────────────────┘
```

**Visual Checks:**
- ✅ Severity: "medium" (gold #FCA311)
- ✅ Only "Auto-fixable" badge (NO "Requires Admin")
- ✅ Fix result appears immediately
- ✅ No confirmation button needed
- ✅ Story/epic count shown

**❌ INCORRECT:**
- "Requires Admin" badge appears
- No auto-fix result
- Shows "Confirm & Fix" button

---

## 7️⃣ Authentication Issue

### Self-service instructions:

**✅ CORRECT:**
```
┌──────────────────────────────────────────────────┐
│ ⚠️ AUTHENTICATION ISSUE         🔴 critical      │
├──────────────────────────────────────────────────┤
│ There may be an issue with your authentication  │
│ session or credentials.                          │
│                                                  │
│ ✅ Auto-fixable                                  │
└──────────────────────────────────────────────────┘

[Recommended Actions]

┌──────────────────────────────────────────────────┐
│ ⚠️ Action Required                               │
├──────────────────────────────────────────────────┤
│ Authentication issues require you to log out    │
│ and log back in. If the problem persists,       │
│ please reset your password.                      │
│                                                  │
│ Actions:                                         │
│ • Log out from the system                        │
│ • Clear browser cache and cookies               │
│ • Log back in with your credentials             │
│ • If still failing, use password reset          │
└──────────────────────────────────────────────────┘
```

**Visual Checks:**
- ✅ Severity: "critical" (red #DC2626)
- ✅ Yellow/orange warning box
- ✅ Instructions provided (not actual fix)
- ✅ Bullet points for actions

---

## 8️⃣ Severity Color Reference

### Visual color guide:

**Critical (Red #DC2626):**
```
┌─────────────────────┐
│ ⚠️ Issue  🔴critical│
└─────────────────────┘
```
- Border: Solid red
- Icon: Red alert circle
- Badge: Red background

**High (Orange #EA580C):**
```
┌─────────────────────┐
│ ⚠️ Issue  🟠 high   │
└─────────────────────┘
```
- Border: Solid orange
- Icon: Orange triangle
- Badge: Orange background

**Medium (Gold #FCA311):**
```
┌─────────────────────┐
│ ⚠️ Issue  🟡 medium │
└─────────────────────┘
```
- Border: Solid gold
- Icon: Gold info circle
- Badge: Gold background

**Low (Green #10B981):**
```
┌─────────────────────┐
│ ⚠️ Issue  🟢 low    │
└─────────────────────┘
```
- Border: Solid green
- Icon: Green checkmark
- Badge: Green background

---

## 9️⃣ Loading States

### When processing:

**Diagnose Loading:**
```
┌──────────────────────────────────────┐
│ [⟳ Analyzing...]                     │
└──────────────────────────────────────┘
```

**Fix Loading:**
```
┌──────────────────────────────────────┐
│ [⟳ Applying Fix...]                  │
└──────────────────────────────────────┘
```

**Visual Checks:**
- ✅ Spinner icon rotating
- ✅ Button disabled (greyed out)
- ✅ Loading text visible
- ✅ Can't click while loading

---

## 🔟 Toast Notifications

### Various toast messages:

**Success:**
```
┌────────────────────────────┐
│ ✅ Issue fixed!            │
│ Access granted! You...     │
└────────────────────────────┘
```
- Green checkmark
- Green border/background
- Top-right corner

**Warning:**
```
┌────────────────────────────┐
│ ⚠️ Admin access required   │
│ Contact your workspace...  │
└────────────────────────────┘
```
- Warning triangle
- Yellow/orange border
- Top-right corner

**Info:**
```
┌────────────────────────────┐
│ 🔧 Troubleshooting mode... │
│ Click "Get AI Help" to...  │
└────────────────────────────┘
```
- Info icon
- Blue border
- Top-right corner

**Error:**
```
┌────────────────────────────┐
│ ❌ Search failed           │
│ Please try again.          │
└────────────────────────────┘
```
- X icon
- Red border
- Top-right corner

---

## Browser Console Logs

### What to look for in DevTools:

**Successful Flow:**
```
🔧 AI Troubleshooting Request: { query: "I can't access my workspace", workspaceId: "workspace-123" }
📋 Issue Diagnosis: { issueType: "access_denied", severity: "high", requiresAdmin: true, autoFixable: true }
🔧 Attempting auto-fix for: access_denied
✅ Fix applied successfully
```

**Pattern Matching Fallback:**
```
⚠️ OpenAI diagnosis failed, using pattern matching: Error: quota exceeded
📋 Issue Diagnosis: { issueType: "access_denied", ... }
```

**Error:**
```
❌ AI Troubleshooting error: Failed to process request
```

---

## Common Visual Issues & Fixes

### Issue: Modal doesn't match brand colors
**Check:**
- Primary buttons should be #14213D (dark blue)
- Icons should be #FCA311 (orange/gold)
- Text should be #000000 (black)
- Backgrounds #E5E5E5 or #FFFFFF

### Issue: Badges not showing
**Check:**
- "Auto-fixable" badge (green border)
- "Requires Admin" badge (red border)
- Severity badge (colored based on level)

### Issue: Wrong icon appears
**Check:**
- Wrench icon in header
- Shield icon for admin
- Alert icons for severity
- Checkmark for success

### Issue: Animation doesn't work
**Check:**
- Modal should slide in from center
- Opacity fade on backdrop
- Smooth transitions on hover

---

## Screenshot Checklist

When testing, take screenshots of:

1. ✅ Search with troubleshooting hint
2. ✅ Modal initial state (developer)
3. ✅ Modal initial state (admin)
4. ✅ Diagnosis card (access denied)
5. ✅ Admin warning (non-admin user)
6. ✅ Admin confirmation (admin user)
7. ✅ Fix applied success
8. ✅ Missing data diagnosis
9. ✅ Auth issue diagnosis
10. ✅ Config error diagnosis
11. ✅ Toast notifications (all types)
12. ✅ Loading states
13. ✅ Mobile responsive view
14. ✅ Console logs

Compare screenshots with this guide to verify correctness.

---

## Quick Visual Test

**Open modal → Look for:**
1. ✅ Wrench icon top-left
2. ✅ "AI Troubleshooting" title
3. ✅ Role badge below title
4. ✅ Query textarea
5. ✅ Gradient button (red-orange)
6. ✅ Close X top-right

**After diagnosis → Look for:**
1. ✅ Issue type card with colored border
2. ✅ Severity badge (correct color)
3. ✅ Capability badges (auto-fixable, requires admin)
4. ✅ Recommended actions list
5. ✅ Warning/confirmation card (if needed)
6. ✅ Fix button (if admin and required)

**After fix → Look for:**
1. ✅ Success card (green)
2. ✅ Success message
3. ✅ Details JSON
4. ✅ Toast notification

**All correct = ✅ PASS**

---

## Mobile View

### On small screens (< 768px):

**Modal should:**
- ✅ Take full width with padding
- ✅ Scroll vertically if content overflows
- ✅ Buttons remain tappable (min 44px)
- ✅ Text remains readable
- ✅ No horizontal scroll

**Touch targets:**
- ✅ Close button: 44x44px minimum
- ✅ Action buttons: 44px height minimum
- ✅ Query textarea: Easy to tap

---

This visual guide helps you quickly identify if the UI is rendering correctly during testing!
