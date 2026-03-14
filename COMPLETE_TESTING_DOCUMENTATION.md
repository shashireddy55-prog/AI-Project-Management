# Projify AI - Complete Testing Documentation
## AI Troubleshooting System Validation Guide

**Version:** 1.0  
**Date:** March 10, 2026  
**Application:** Projify AI (formerly FlowForge)  
**Feature:** AI-Powered Troubleshooting System

---

# Table of Contents

1. [Quick Start Testing (5 Minutes)](#quick-start-testing)
2. [Test Data Setup Guide](#test-data-setup-guide)
3. [Detailed Testing Scenarios (15 Tests)](#detailed-testing-scenarios)
4. [Testing Checklist (Printable)](#testing-checklist)
5. [Visual Testing Guide](#visual-testing-guide)
6. [Technical Implementation Reference](#technical-implementation-reference)
7. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

# Quick Start Testing

## 5-Minute Quick Setup

**Goal:** Get testing environment ready in 5 minutes

### Step 1: Verify Environment (1 minute)
```bash
# Check that all required environment variables are set
✓ SUPABASE_URL
✓ SUPABASE_ANON_KEY
✓ SUPABASE_SERVICE_ROLE_KEY
✓ OPENAI_API_KEY
✓ JWT_SECRET
```

### Step 2: Create Test Users (2 minutes)
```
Navigate to: /signup

User 1 - Admin:
- Email: admin@projify.test
- Password: TestAdmin123!
- Name: Admin User
- Account Type: Business

User 2 - Developer:
- Email: developer@projify.test
- Password: TestDev123!
- Name: Developer User
- Account Type: Personal

User 3 - QA:
- Email: qa@projify.test
- Password: TestQA123!
- Name: QA Tester
- Account Type: Personal
```

### Step 3: Create Test Workspace (1 minute)
1. Login as admin user
2. Use ZCPC: "Create a mobile banking application project"
3. Verify workspace created with key (e.g., "MOB")

### Step 4: Run Quick Test (1 minute)
```javascript
// Paste in browser console:
fetch('https://[YOUR-PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/health')
  .then(r => r.json())
  .then(data => {
    console.log('Server:', data.status === 'ok' ? '✅' : '❌');
    console.log('OpenAI:', data.env.hasOpenAiKey ? '✅' : '❌');
  });
```

**✅ You're ready to test!**

---

# Test Data Setup Guide

## Detailed Setup Instructions

### Option A: Using Signup Flow (Recommended)

#### Create Admin User
1. Navigate to `/signup`
2. Fill in:
   - Name: `Admin User`
   - Email: `admin@projify.test`
   - Password: `TestAdmin123!`
   - Account Type: `Business`
   - Subdomain: `projify-test-admin`
3. Click "Sign Up"
4. Verify email confirmation (auto-confirmed)
5. Login to dashboard

#### Create Developer User
1. Navigate to `/signup`
2. Fill in:
   - Name: `Developer User`
   - Email: `developer@projify.test`
   - Password: `TestDev123!`
   - Account Type: `Personal`
3. Click "Sign Up"
4. Login to dashboard

#### Create QA User
1. Navigate to `/signup`
2. Fill in:
   - Name: `QA Tester`
   - Email: `qa@projify.test`
   - Password: `TestQA123!`
   - Account Type: `Personal`
3. Click "Sign Up"
4. Login to dashboard

### Option B: Using Backend API (Faster)

Open browser console and run:

```javascript
const PROJECT_ID = 'YOUR-PROJECT-ID'; // Replace with your Supabase project ID

// Create Admin User
await fetch(`https://${PROJECT_ID}.supabase.co/functions/v1/make-server-3acdc7c6/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@projify.test',
    password: 'TestAdmin123!',
    name: 'Admin User',
    accountType: 'business',
    subdomain: 'projify-test-admin'
  })
}).then(r => r.json()).then(data => console.log('Admin created:', data));

// Create Developer User
await fetch(`https://${PROJECT_ID}.supabase.co/functions/v1/make-server-3acdc7c6/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'developer@projify.test',
    password: 'TestDev123!',
    name: 'Developer User',
    accountType: 'personal'
  })
}).then(r => r.json()).then(data => console.log('Developer created:', data));

// Create QA User
await fetch(`https://${PROJECT_ID}.supabase.co/functions/v1/make-server-3acdc7c6/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'qa@projify.test',
    password: 'TestQA123!',
    name: 'QA Tester',
    accountType: 'personal'
  })
}).then(r => r.json()).then(data => console.log('QA created:', data));
```

### Create Test Workspace

#### Using ZCPC (AI-Powered):
1. Login as admin user
2. Click "Create New Workspace" or use AI command bar
3. Type: `"Create a mobile banking application project"`
4. AI will generate:
   - Workspace name: "Mobile Banking App"
   - Workspace key: "MOB" (auto-generated)
   - Complete project structure

#### Manual Creation (Fallback):
1. Navigate to workspace creation
2. Fill in:
   - Name: `Test Banking App`
   - Key: `TBA`
   - Type: `Software Development`
   - Description: `Test workspace for troubleshooting validation`

### Add Users to Workspace

1. Login as admin
2. Open workspace settings
3. Navigate to "Team" tab
4. Invite users:
   - `developer@projify.test` as `developer`
   - `qa@projify.test` as `qa`

### Create Sample Data

#### Epics:
1. "User Authentication System" (In Progress)
2. "Account Dashboard" (To Do)
3. "Transaction Processing" (In Progress)

#### Stories (Minimum 10):
```
TBA-1: Implement login screen (Epic 1, Developer)
TBA-2: Add biometric authentication (Epic 1, Developer)
TBA-3: Create password reset flow (Epic 1, QA)
TBA-4: Design account overview UI (Epic 2, Developer)
TBA-5: Implement balance display (Epic 2, Developer)
TBA-6: Add transaction history (Epic 2, QA)
TBA-7: Process payment requests (Epic 3, Developer)
TBA-8: Validate transaction limits (Epic 3, QA)
TBA-9: Send transaction receipts (Epic 3, Developer)
TBA-10: Handle failed transactions (Epic 3, QA)
```

### Backend Verification

#### Health Check:
```javascript
fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/health')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Server Status:', data.status);
    console.log('✅ OpenAI:', data.env.hasOpenAiKey ? 'Connected' : 'Missing');
    console.log('✅ Supabase:', data.env.hasSupabaseUrl ? 'Connected' : 'Missing');
  });
```

**Expected Output:**
```json
{
  "status": "ok",
  "version": "7.0-INLINE-ZCPC-FIXED",
  "env": {
    "hasSupabaseUrl": true,
    "hasServiceRoleKey": true,
    "hasAnonKey": true,
    "hasOpenAiKey": true,
    "hasJwtSecret": true
  }
}
```

#### Test AI Search:
```javascript
const token = localStorage.getItem('sb-access-token');

fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: 'I need help with access issues'
  })
}).then(r => r.json()).then(console.log);
```

#### Test Troubleshooting Endpoint:
```javascript
const token = localStorage.getItem('sb-access-token');

fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-troubleshoot', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    query: 'I cannot access my workspace',
    workspaceId: 'workspace-123' // Use actual workspace ID
  })
}).then(r => r.json()).then(console.log);
```

---

# Detailed Testing Scenarios

## Test Scenario 1: Access Issue (Non-Admin User)

### Objective
Verify that non-admin users see the correct warning and cannot fix access issues.

### Prerequisites
- Developer user created and logged in
- Test workspace exists
- Developer is NOT a member of a specific workspace

### Steps

1. **Login as Developer**
   - Navigate to login page
   - Enter `developer@projify.test` / `TestDev123!`
   - ✅ Verify successful login
   - ✅ Dashboard loads

2. **Trigger Access Issue**
   - Click on the search bar (top navigation)
   - Type: `"I can't access my workspace"`
   - Press Enter

3. **Verify Search Detection**
   - ✅ Search results modal should open
   - ✅ Orange troubleshooting hint banner should appear with:
     - Alert icon (orange #FCA311)
     - Message: "Troubleshooting mode detected"
     - "Get AI Help" button (gradient red-orange)

4. **Open Troubleshooting Modal**
   - Click "Get AI Help" button
   - ✅ AI Troubleshooting modal opens
   - ✅ Modal header shows wrench icon
   - ✅ Title: "AI Troubleshooting"
   - ✅ User role badge shows "developer" (not admin, no shield)

5. **Analyze Issue**
   - ✅ Query field pre-populated with: "I can't access my workspace"
   - Click "Diagnose Issue" button
   - ✅ Button shows loading spinner: "Analyzing..."
   - ✅ Button is disabled during processing
   - Wait for AI response (1-3 seconds)

6. **Verify Diagnosis**
   - ✅ Issue card appears with:
     - Issue Type: "ACCESS DENIED" (uppercase)
     - Severity: "high" (orange badge #EA580C)
     - Description explaining permission issue
     - "Auto-fixable" badge (green border)
     - "Requires Admin" badge (red border, shield icon)
   - ✅ Recommended actions list shows numbered steps:
     1. Check your workspace membership
     2. Verify your user role
     3. Contact an admin
     4. Request to be added

7. **Verify Permission Block**
   - ✅ Yellow warning card appears below diagnosis:
     - Shield icon
     - "Admin Access Required" heading
     - Message: "You don't have admin privileges to fix this issue..."
   - ✅ NO "Confirm & Fix" button visible
   - ✅ Toast notification appears: "Admin access required to fix this issue"

8. **Test Console Output**
   - Open browser DevTools → Console
   - ✅ Should see:
     ```
     🔧 AI Troubleshooting Request: { query: "I can't access my workspace" }
     📋 Issue Diagnosis: { issueType: "access_denied", requiresAdmin: true }
     ```

### Expected Result
✅ **PASS**: Non-admin user sees diagnosis but cannot execute fix

### Common Issues
- Modal doesn't open → Check if AITroubleshootingModal is imported
- No warning card → Check userRole state
- "Confirm & Fix" button appears → Check isAdmin logic

---

## Test Scenario 2: Access Issue (Admin User)

### Objective
Verify that admin users can diagnose and fix access issues.

### Prerequisites
- Admin user created and logged in
- Test workspace exists
- Admin needs to grant access

### Steps

1. **Login as Admin**
   - Logout from developer account
   - Login with `admin@projify.test` / `TestAdmin123!`
   - ✅ Verify successful login
   - ✅ Admin badge visible (if implemented in UI)

2. **Trigger Troubleshooting**
   - Open search bar
   - Type: `"permission denied when accessing workspace"`
   - Press Enter
   - ✅ Search results open

3. **Verify Detection**
   - ✅ Troubleshooting hint banner appears (orange)
   - ✅ "Get AI Help" button visible
   - Click "Get AI Help"

4. **Check Admin Badge**
   - ✅ Modal opens
   - ✅ User role badge shows "admin" with shield icon (#FCA311)
   - ✅ Text below badge: "You have admin privileges"
   - ✅ Badge background matches brand color

5. **Diagnose Issue**
   - Query: "permission denied when accessing workspace"
   - Click "Diagnose Issue"
   - ✅ Loading state shows
   - Wait for response

6. **Verify Admin Fix Option**
   - ✅ Diagnosis card appears:
     - Issue Type: "ACCESS DENIED"
     - Severity: "high" (orange)
     - "Auto-fixable" badge
     - "Requires Admin" badge
   - ✅ Recommended actions list shown
   - ✅ Red warning card appears:
     - Shield icon
     - "Admin Confirmation Required" heading
     - Warning message about system-wide changes
     - ✅ "Confirm & Fix" button IS visible (red background #DC2626)

7. **Execute Fix**
   - Click "Confirm & Fix" button
   - ✅ Button shows loading spinner: "Applying Fix..."
   - ✅ Button disabled during processing
   - Wait for response

8. **Verify Success**
   - ✅ Green success card appears:
     - Checkmark icon (green)
     - "Fix Applied" heading
     - Message: "✅ Access granted! You have been added to the workspace as a developer."
   - ✅ Toast notification: "✅ Issue fixed!"
   - ✅ Details section shows JSON:
     ```json
     {
       "role": "developer",
       "workspaceId": "workspace-xyz"
     }
     ```

9. **Verify Backend**
   - Check console logs
   - ✅ Should see:
     ```
     🔧 Attempting auto-fix for: access_denied
     ✅ Admin fix confirmed and executed
     ```

### Expected Result
✅ **PASS**: Admin user successfully diagnoses and fixes access issue

### Common Issues
- "Confirm & Fix" doesn't appear → Check isAdmin === true
- Fix fails → Check backend logs for errors
- No success card → Check fixResult state

---

## Test Scenario 3: Missing Data Issue (Any User)

### Objective
Verify that any user can auto-fix data verification issues (no admin required).

### Prerequisites
- QA user created and logged in
- Test workspace with data

### Steps

1. **Login as QA User**
   - Login with `qa@projify.test` / `TestQA123!`
   - ✅ Successful login

2. **Trigger Data Issue**
   - Open search
   - Type: `"my tickets are missing"`
   - ✅ Search opens

3. **Open Troubleshooting**
   - ✅ Hint banner appears
   - Click "Get AI Help"
   - ✅ Modal opens
   - ✅ Role badge shows "qa"

4. **Diagnose Issue**
   - Query: "my tickets are missing"
   - Click "Diagnose Issue"
   - ✅ Loading state

5. **Verify Diagnosis**
   - ✅ Issue Type: "MISSING DATA"
   - ✅ Severity: "medium" (gold badge #FCA311)
   - ✅ "Auto-fixable" badge present
   - ✅ NO "Requires Admin" badge
   - ✅ Recommended actions list:
     1. Check active filters
     2. Verify workspace selection
     3. Refresh the page
     4. Contact support if issue persists

6. **Verify Auto-Fix**
   - ✅ Fix result card appears immediately (no confirmation needed)
   - ✅ Green checkmark or yellow warning icon
   - ✅ Message: "✅ Data check complete. Found X stories and Y epics in this workspace. Try refreshing the page or clearing active filters."
   - ✅ Suggests refreshing page or clearing filters

7. **Verify No Admin Requirement**
   - ✅ NO admin warning card
   - ✅ NO "Confirm & Fix" button
   - ✅ Fix applied automatically without approval

### Expected Result
✅ **PASS**: Non-admin user can automatically verify data without approval

### Common Issues
- Shows "Requires Admin" → Check issue type detection
- No auto-fix → Check requiresAdmin === false logic
- Admin warning appears → Check conditional rendering

---

## Test Scenario 4: Search Integration Test

### Objective
Verify that troubleshooting keywords in search trigger the detection system.

### Test Keywords

#### Access Keywords (Should trigger hint)
1. Search: `"I don't have access"`
   - ✅ Troubleshooting hint appears
   
2. Search: `"access denied"`
   - ✅ Troubleshooting hint appears
   
3. Search: `"permission error"`
   - ✅ Troubleshooting hint appears

#### Data Keywords (Should trigger hint)
4. Search: `"data is missing"`
   - ✅ Troubleshooting hint appears
   
5. Search: `"tickets disappeared"`
   - ✅ Troubleshooting hint appears
   
6. Search: `"lost my work"`
   - ✅ Troubleshooting hint appears

#### Error Keywords (Should trigger hint)
7. Search: `"something is broken"`
   - ✅ Troubleshooting hint appears
   
8. Search: `"not working properly"`
   - ✅ Troubleshooting hint appears
   
9. Search: `"getting an error"`
   - ✅ Troubleshooting hint appears

#### Help Keywords (Should trigger hint)
10. Search: `"I need help with"`
    - ✅ Troubleshooting hint appears
    
11. Search: `"having an issue"`
    - ✅ Troubleshooting hint appears
    
12. Search: `"can't figure out"`
    - ✅ Troubleshooting hint appears

#### Normal Search (Should NOT trigger hint)
13. Search: `"MOB-123"`
    - ✅ NO troubleshooting hint
    
14. Search: `"John Doe"`
    - ✅ NO troubleshooting hint
    
15. Search: `"Sprint Planning"`
    - ✅ NO troubleshooting hint

### Expected Result
✅ **PASS**: Only troubleshooting-related searches show the hint

### Common Issues
- All searches trigger hint → Check keyword regex is correct
- No searches trigger hint → Check troubleshootingHint in response

---

## Test Scenario 5: Role Configuration Issue

### Objective
Test role-related issue detection and fixing.

### Steps

#### Part A: Developer Cannot Fix

1. **Login as Developer**
   - Login: `developer@projify.test`

2. **Search Issue**
   - Type: `"my role permissions are not working"`
   - Click "Get AI Help"

3. **Diagnose**
   - Click "Diagnose Issue"
   - ✅ Issue Type: "USER ROLE ISSUE"
   - ✅ Severity: "high" (orange)
   - ✅ "Requires Admin" badge (red)

4. **Verify Recommendations**
   - ✅ Shows current role: "developer"
   - ✅ Suggests contacting admin
   - ✅ Lists role-based access control steps

5. **Developer Cannot Fix**
   - ✅ "Admin Access Required" warning shown
   - ✅ No fix button

#### Part B: Admin Can Fix

6. **Switch to Admin**
   - Logout
   - Login as `admin@projify.test`
   - Repeat search: `"my role permissions are not working"`

7. **Diagnose as Admin**
   - Click "Get AI Help"
   - ✅ Admin badge visible
   - Click "Diagnose Issue"

8. **Execute Fix**
   - ✅ "Confirm & Fix" button appears
   - Click to fix
   - ✅ Success card appears
   - ✅ Message: "Role validated and confirmed"

### Expected Result
✅ **PASS**: Role issues require admin approval

---

## Test Scenario 6: Authentication Issue

### Objective
Test authentication problem diagnosis.

### Steps

1. **Login as Any User**
   - Use any test user

2. **Search**
   - Type: `"I'm having login problems"`
   - Open troubleshooting

3. **Diagnose**
   - Click "Diagnose Issue"
   - ✅ Issue Type: "AUTHENTICATION ISSUE"
   - ✅ Severity: "critical" (red badge #DC2626)
   - ✅ "Auto-fixable" badge
   - ✅ NO "Requires Admin" badge

4. **Verify Recommendations**
   - ✅ Fix result shows immediately
   - ✅ Message suggests:
     - Log out and log back in
     - Clear browser cache
     - Reset password
   - ✅ Instructions provided (not actual fix)
   - ✅ Orange/yellow warning card with steps

### Expected Result
✅ **PASS**: Auth issues show self-service instructions

---

## Test Scenario 7: Configuration Issue (Admin Only)

### Objective
Test system configuration issue handling.

### Steps

#### Part A: Developer Blocked

1. **Login as Developer**
   - Search: `"workspace settings are broken"`
   - Open troubleshooting
   - Diagnose
   - ✅ Issue Type: "CONFIGURATION ERROR"
   - ✅ Severity: "high" (orange)
   - ✅ "Requires Admin" badge
   - ✅ Cannot fix (admin required message)

#### Part B: Admin Can Fix

2. **Login as Admin**
   - Same search: `"workspace settings are broken"`
   - Diagnose
   - ✅ "Confirm & Fix" button appears
   - Click button
   - ✅ Loading state
   - ✅ Fix applied
   - ✅ Message: "Workspace settings have been verified and corrected"

### Expected Result
✅ **PASS**: Config changes require admin

---

## Test Scenario 8: Direct Modal Access

### Objective
Test opening troubleshooting modal and changing queries.

### Steps

1. **From Any Page**
   - Open search
   - Type any troubleshooting query
   - Click "Get AI Help"
   - ✅ Modal opens

2. **Change Query in Modal**
   - Modal opens with pre-filled query
   - Clear query field
   - Type new issue: `"I can't create new tickets"`
   - Click "Diagnose Issue"
   - ✅ New diagnosis appears
   - ✅ Diagnosis matches new query

3. **Multiple Queries**
   - Test changing query 3-4 times
   - ✅ Each diagnosis is relevant to query

### Expected Result
✅ **PASS**: Can change query within modal

---

## Test Scenario 9: OpenAI Fallback Test

### Objective
Verify pattern-based diagnosis works when OpenAI is unavailable.

### Steps

1. **Simulate OpenAI Failure**
   - Method A: Temporarily set invalid OPENAI_API_KEY in environment
   - Method B: Wait for quota limit (if applicable)
   - Method C: Test during OpenAI outage

2. **Test Diagnosis**
   - Search: `"access denied"`
   - Open troubleshooting
   - Click "Diagnose Issue"
   - Wait for response

3. **Verify Fallback**
   - ✅ Console shows: "⚠️ OpenAI diagnosis failed, using pattern matching"
   - ✅ Diagnosis still appears
   - ✅ Issue detected based on keywords
   - ✅ Correct issue type assigned

4. **Test Multiple Patterns**
   Test each and verify correct issue type:
   
   | Query | Expected Issue Type |
   |-------|---------------------|
   | `"access"` | access_denied |
   | `"missing data"` | missing_data |
   | `"login problem"` | authentication_issue |
   | `"role issue"` | user_role_issue |
   | `"settings broken"` | configuration_error |

5. **Verify Accuracy**
   - ✅ All pattern matches work
   - ✅ Severity levels correct
   - ✅ Recommendations relevant

### Expected Result
✅ **PASS**: System works without OpenAI using pattern matching

---

## Test Scenario 10: Multiple Issues in One Query

### Objective
Test how system handles complex queries with multiple issues.

### Steps

1. **Complex Query**
   - Type: `"I can't access my workspace and my data is missing"`
   - Open troubleshooting

2. **Diagnose**
   - Click "Diagnose Issue"
   - ✅ AI processes entire query
   - ✅ AI identifies primary issue

3. **Verify Priority**
   - Check which issue type is diagnosed:
   - ✅ Should be "access_denied" (more critical than missing_data)
   - ✅ Recommendations may mention data verification
   - ✅ Severity reflects most critical issue

4. **Alternative Complex Queries**
   Test:
   - `"login problems and permission errors"`
   - `"broken settings and missing tickets"`
   - `"can't login and role is wrong"`

### Expected Result
✅ **PASS**: AI prioritizes most critical issue

---

## Test Scenario 11: Edge Cases

### Test 1: Empty Query

1. Open modal
2. Leave query empty
3. Click "Diagnose Issue"
4. ✅ Toast error: "Please describe the issue you're experiencing"
5. ✅ No API call made

### Test 2: Very Long Query

1. Type 500+ character description
2. Click "Diagnose Issue"
3. ✅ AI processes successfully
4. ✅ Diagnosis returned
5. ✅ No truncation errors

### Test 3: Special Characters

1. Query: `"Error: [500] - Can't access @workspace #123"`
2. Click "Diagnose Issue"
3. ✅ System handles gracefully
4. ✅ No parsing errors
5. ✅ Special chars don't break JSON

### Test 4: Rapid Clicking

1. Click "Diagnose Issue" 5 times quickly
2. ✅ Button disables during processing
3. ✅ Only one request sent
4. ✅ No duplicate responses

### Test 5: Modal Close During Processing

1. Click "Diagnose Issue"
2. Immediately close modal
3. ✅ Request cancels or completes silently
4. ✅ No errors in console

### Expected Result
✅ **PASS**: All edge cases handled properly

---

## Test Scenario 12: UI/UX Validation

### Color Scheme Verification

Check all UI elements use correct brand colors:

**Primary Colors:**
- ✅ Text: #000000 (black)
- ✅ Buttons: #14213D (dark blue)
- ✅ Icons/Symbols: #FCA311 (orange/gold)
- ✅ Backgrounds: #E5E5E5 (light gray) / #FFFFFF (white)

**Severity Colors:**
- ✅ Critical: #DC2626 (red)
- ✅ High: #EA580C (orange)
- ✅ Medium: #FCA311 (gold)
- ✅ Low: #10B981 (green)

**Badge Colors:**
- ✅ "Auto-fixable": Green border
- ✅ "Requires Admin": Red border with shield icon
- ✅ Role badges: Orange background (#FCA311)

### Responsive Design

Test on multiple screen sizes:

**Desktop (1920x1080):**
- ✅ Modal centered
- ✅ Maximum width constraint
- ✅ Readable text
- ✅ Buttons accessible

**Tablet (768x1024):**
- ✅ Modal scales appropriately
- ✅ No horizontal scroll
- ✅ Touch targets 44px minimum
- ✅ Content remains readable

**Mobile (375x667):**
- ✅ Full-width with padding
- ✅ Vertical scroll if needed
- ✅ Buttons remain clickable
- ✅ Text size appropriate
- ✅ No layout breaks

### Accessibility

**Keyboard Navigation:**
- ✅ Tab through all interactive elements
- ✅ Enter/Space activates buttons
- ✅ Esc closes modal
- ✅ Focus indicators visible

**Screen Reader:**
- ✅ Alt text on icons
- ✅ ARIA labels on buttons
- ✅ Semantic HTML structure
- ✅ Announcements on state changes

**Color Contrast:**
- ✅ All text meets WCAG AA (4.5:1)
- ✅ Interactive elements distinguishable
- ✅ Error states clearly visible

### Expected Result
✅ **PASS**: UI matches brand and is accessible

---

## Test Scenario 13: Backend Logging

### Verify Console Logs

Open browser DevTools → Console and monitor during tests.

**Expected logs for successful diagnosis:**
```javascript
🔧 AI Troubleshooting Request: { 
  query: "I can't access my workspace",
  workspaceId: "workspace-123"
}

📋 Issue Diagnosis: { 
  issueType: "access_denied",
  severity: "high",
  requiresAdmin: true,
  autoFixable: true
}
```

**Expected logs for fix attempt:**
```javascript
🔧 Attempting auto-fix for: access_denied

✅ Fix applied successfully
```

**Expected logs for admin confirmation:**
```javascript
✅ Admin fix confirmed and executed

Details: {
  role: "developer",
  workspaceId: "workspace-xyz"
}
```

**Expected error logs (if any):**
```javascript
❌ AI Troubleshooting error: [detailed error message]
```

**OpenAI Fallback:**
```javascript
⚠️ OpenAI diagnosis failed, using pattern matching: Error: quota exceeded

📋 Issue Diagnosis: { 
  issueType: "access_denied",
  source: "pattern_matching"
}
```

### Backend Server Logs

If you have access to server logs:

**Successful diagnosis:**
```
POST /ai-troubleshoot - 200 OK - 1.2s
AI diagnosis completed: access_denied
```

**Admin fix:**
```
POST /ai-troubleshoot/confirm-fix - 200 OK - 0.8s
Admin fix applied by user-abc123
```

**Security block:**
```
POST /ai-troubleshoot/confirm-fix - 403 Forbidden - 0.1s
Non-admin attempted fix: user-xyz789
```

### Expected Result
✅ **PASS**: All operations logged correctly with context

---

## Test Scenario 14: Permission Security Test

### Objective
Verify security measures prevent unauthorized access.

### Test 1: Unauthorized Fix Attempt

**Manually Call API as Non-Admin:**

1. Login as developer
2. Open DevTools → Console
3. Get access token:
   ```javascript
   const token = localStorage.getItem('sb-access-token');
   console.log('Token:', token);
   ```

4. Attempt unauthorized fix:
   ```javascript
   fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-troubleshoot/confirm-fix', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
     },
     body: JSON.stringify({
       diagnosis: { 
         issueType: 'access_denied',
         requiresAdmin: true 
       },
       workspaceId: 'workspace-123'
     })
   }).then(r => r.json()).then(console.log);
   ```

5. **Verify Response:**
   - ✅ Status: 403 Forbidden
   - ✅ Error: "Admin access required to confirm this action"
   - ✅ No changes made to database

### Test 2: No Token

1. Call API without Authorization header:
   ```javascript
   fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-troubleshoot', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ query: 'test' })
   }).then(r => r.json()).then(console.log);
   ```

2. **Verify Response:**
   - ✅ Status: 401 Unauthorized
   - ✅ Error: "Unauthorized"

### Test 3: Invalid Token

1. Call API with fake token:
   ```javascript
   fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-troubleshoot', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer fake-token-123'
     },
     body: JSON.stringify({ query: 'test' })
   }).then(r => r.json()).then(console.log);
   ```

2. **Verify Response:**
   - ✅ Status: 401 Unauthorized
   - ✅ Error: "Unauthorized" or "Invalid token"

### Test 4: Token Validation

1. **Valid Admin Token:**
   - ✅ Allows diagnoses
   - ✅ Allows admin fixes
   - ✅ Returns role: "admin"

2. **Valid Non-Admin Token:**
   - ✅ Allows diagnoses
   - ✅ Blocks admin fixes
   - ✅ Returns role: "developer" or "qa"

3. **Expired Token:**
   - ✅ Returns 401 Unauthorized
   - ✅ Requires re-login

### Expected Result
✅ **PASS**: Security checks prevent unauthorized fixes

---

## Test Scenario 15: Integration with Existing Features

### Test 1: Workspace Context

**Objective:** Verify workspaceId is passed correctly

1. **Select Workspace**
   - Navigate to specific workspace
   - Note workspace ID in URL: `/workspace/workspace-abc123`

2. **Search from Workspace**
   - Use search: `"can't see my tickets"`
   - Open troubleshooting
   - Click "Diagnose Issue"

3. **Verify Context**
   - Open DevTools → Network tab
   - Find POST to `/ai-troubleshoot`
   - Check request payload:
   - ✅ Body includes: `{ query: "...", workspaceId: "workspace-abc123" }`

4. **Verify Fix Uses Context**
   - If fix is applied:
   - ✅ Fix applies to correct workspace
   - ✅ Console shows workspaceId in fix logs

### Test 2: User Context

**Objective:** Verify user role detection

1. **Check User Data**
   - Modal shows correct user role badge
   - ✅ Matches actual user role in database

2. **Verify Different Roles**
   - Login as admin:
     - ✅ Badge shows "admin" with shield
     - ✅ Can execute admin fixes
   - Login as developer:
     - ✅ Badge shows "developer"
     - ✅ Cannot execute admin fixes
   - Login as qa:
     - ✅ Badge shows "qa"
     - ✅ Cannot execute admin fixes

3. **Verify Fix Logs User**
   - Admin executes fix
   - Check console/backend:
   - ✅ Shows userId in fix logs
   - ✅ Audit trail created

### Test 3: Search Integration

**Objective:** Seamless integration with search

1. **Hint in Search Results**
   - Search troubleshooting query
   - ✅ Hint appears within search modal
   - ✅ Positioned correctly
   - ✅ Doesn't interfere with results

2. **Modal Opens with Context**
   - Click "Get AI Help"
   - ✅ Troubleshooting modal opens
   - ✅ Search query transferred
   - ✅ Search modal can close

3. **Context Preserved**
   - ✅ WorkspaceId from URL preserved
   - ✅ User session maintained
   - ✅ Can return to search

### Expected Result
✅ **PASS**: Integrates seamlessly with workspace and user context

---

# Testing Checklist

## Printable Quick Reference Checklist

### Pre-Test Setup ✓

- [ ] **Environment Variables Set**
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] OPENAI_API_KEY
  - [ ] JWT_SECRET

- [ ] **Test Users Created**
  - [ ] Admin: admin@projify.test
  - [ ] Developer: developer@projify.test
  - [ ] QA: qa@projify.test

- [ ] **Test Workspace Created**
  - [ ] Name: Test Banking App
  - [ ] Key: TBA
  - [ ] Has 10+ tickets

- [ ] **Backend Verification**
  - [ ] Health endpoint: 200 OK
  - [ ] AI search endpoint: responds
  - [ ] AI troubleshoot endpoint: responds

---

### Quick Test Matrix

| Test # | Test Name | User | Expected Result | Pass/Fail |
|--------|-----------|------|-----------------|-----------|
| 1 | Non-Admin Access | Developer | Cannot fix | ☐ |
| 2 | Admin Access | Admin | Can fix | ☐ |
| 3 | Missing Data | QA | Auto-fix | ☐ |
| 4 | Keyword Detection | Any | Hints show | ☐ |
| 5 | Role Config | Both | Admin only | ☐ |
| 6 | Auth Issue | Any | Instructions | ☐ |
| 7 | Config Error | Both | Admin only | ☐ |
| 8 | Modal Query | Any | Changes work | ☐ |
| 9 | OpenAI Fallback | Any | Pattern works | ☐ |
| 10 | Complex Query | Any | Prioritizes | ☐ |
| 11 | Edge Cases | Any | Handles all | ☐ |
| 12 | UI/UX | All | Matches brand | ☐ |
| 13 | Logging | All | Complete logs | ☐ |
| 14 | Security | All | Blocks unauth | ☐ |
| 15 | Integration | All | Context works | ☐ |

---

### Issue Types Checklist

Test each issue type is detected:

- [ ] **ACCESS DENIED**
  - [ ] Keywords: access, permission, denied
  - [ ] Severity: high (orange)
  - [ ] Requires: Admin
  - [ ] Fix: Grant access

- [ ] **USER ROLE ISSUE**
  - [ ] Keywords: role, permission
  - [ ] Severity: high (orange)
  - [ ] Requires: Admin
  - [ ] Fix: Validate role

- [ ] **MISSING DATA**
  - [ ] Keywords: missing, lost, disappeared
  - [ ] Severity: medium (gold)
  - [ ] Requires: None
  - [ ] Fix: Verify data

- [ ] **CONFIGURATION ERROR**
  - [ ] Keywords: settings, config, broken
  - [ ] Severity: high (orange)
  - [ ] Requires: Admin
  - [ ] Fix: Verify settings

- [ ] **AUTHENTICATION ISSUE**
  - [ ] Keywords: login, auth, credentials
  - [ ] Severity: critical (red)
  - [ ] Requires: None
  - [ ] Fix: Instructions

---

### UI Element Checklist

Modal appearance:

- [ ] Wrench icon in header
- [ ] "AI Troubleshooting" title
- [ ] User role badge
- [ ] Query textarea
- [ ] "Diagnose Issue" button (gradient)
- [ ] Close X button

Diagnosis card:

- [ ] Issue type (uppercase)
- [ ] Severity badge (correct color)
- [ ] Description text
- [ ] "Auto-fixable" badge (if applicable)
- [ ] "Requires Admin" badge (if applicable)
- [ ] Recommended actions list (numbered)

Admin controls:

- [ ] Admin badge with shield (if admin)
- [ ] Admin warning/confirmation card
- [ ] "Confirm & Fix" button (if admin + required)

Fix result:

- [ ] Success/warning card
- [ ] Icon (checkmark or alert)
- [ ] Message text
- [ ] Details JSON (if applicable)
- [ ] Toast notification

Colors:

- [ ] Primary buttons: #14213D
- [ ] Icons: #FCA311
- [ ] Text: #000000
- [ ] Backgrounds: #E5E5E5 / #FFFFFF
- [ ] Critical: #DC2626
- [ ] High: #EA580C
- [ ] Medium: #FCA311
- [ ] Low: #10B981

---

### Quick Commands Reference

**Get Access Token:**
```javascript
localStorage.getItem('sb-access-token')
```

**Health Check:**
```javascript
fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/health')
  .then(r => r.json()).then(console.log)
```

**Test Troubleshoot:**
```javascript
const token = localStorage.getItem('sb-access-token');
fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-troubleshoot', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ 
    query: 'I cannot access my workspace' 
  })
}).then(r => r.json()).then(console.log);
```

---

### Final Sign-Off

**Date:** _______________  
**Tester:** _______________  
**Environment:** _______________

**Tests Passed:** _____ / 15  
**Tests Failed:** _____ / 15

**Status:**
- [ ] ✅ READY FOR DEPLOYMENT
- [ ] ⚠️ NEEDS FIXES
- [ ] ❌ MAJOR ISSUES

**Signature:** _______________

---

# Visual Testing Guide

## What You Should See

### 1. Search Bar - Troubleshooting Detection

When you search for issues, you should see:

```
┌─────────────────────────────────────────┐
│ 🔍 "I can't access my workspace"       │
└─────────────────────────────────────────┘
           ↓ (Hint appears below)
┌─────────────────────────────────────────┐
│ ⚠️ Troubleshooting mode detected        │
│                                         │
│ This looks like a troubleshooting       │
│ query. Click "Get AI Help" for          │
│ automated issue resolution.             │
│                                         │
│         [🔧 Get AI Help]                │
└─────────────────────────────────────────┘
```

**Visual Checks:**
- Orange/gold banner (#FCA311)
- Warning icon
- Clear message
- Gradient button (red to orange)

---

### 2. AI Troubleshooting Modal - Initial

```
┌──────────────────────────────────────────────────┐
│ 🔧 AI Troubleshooting                      [✕]  │
│ Automatically diagnose and fix issues            │
├──────────────────────────────────────────────────┤
│                                                  │
│ 🏷️ developer                                     │
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
- Header with gradient background
- Wrench icon visible
- User role badge (developer/admin/qa)
- Query textarea with content
- Gradient button

---

### 3. Diagnosis Display - Non-Admin

```
┌──────────────────────────────────────────────────┐
│ ⚠️ ACCESS DENIED                   🔴 high       │
├──────────────────────────────────────────────────┤
│ You may not have the required permissions       │
│ to access this resource...                      │
│                                                  │
│ ✅ Auto-fixable    🛡️ Requires Admin            │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Recommended Actions                              │
├──────────────────────────────────────────────────┤
│ 1️⃣ Check your workspace membership              │
│ 2️⃣ Verify your user role                        │
│ 3️⃣ Contact an admin                             │
│ 4️⃣ Request workspace access                     │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ ⚠️ Admin Access Required                         │
├──────────────────────────────────────────────────┤
│ You don't have admin privileges to fix this     │
│ issue. Please contact your administrator.       │
└──────────────────────────────────────────────────┘
```

**Visual Checks:**
- Issue type in uppercase
- Severity badge (orange for high)
- Two badges: Auto-fixable + Requires Admin
- Numbered action list
- Yellow warning box
- NO "Confirm & Fix" button

---

### 4. Diagnosis Display - Admin

```
┌──────────────────────────────────────────────────┐
│ 🛡️ admin                                         │
│ You have admin privileges                        │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ ⚠️ ACCESS DENIED                   🔴 high       │
├──────────────────────────────────────────────────┤
│ [Same description]                               │
│                                                  │
│ ✅ Auto-fixable    🛡️ Requires Admin            │
└──────────────────────────────────────────────────┘

[Recommended Actions - same as above]

┌──────────────────────────────────────────────────┐
│ 🛡️ Admin Confirmation Required                   │
├──────────────────────────────────────────────────┤
│ This fix will make system-wide changes.         │
│ As an admin, you can approve this fix.          │
│                                                  │
│         [🛡️ Confirm & Fix]                      │
└──────────────────────────────────────────────────┘
```

**Visual Checks:**
- Shield icon with admin badge
- Red background on confirmation card
- "Confirm & Fix" button IS visible
- Button has shield icon
- Red button (#DC2626)

---

### 5. Fix Applied - Success

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

Toast (top-right):
┌────────────────────────┐
│ ✅ Issue fixed!        │
└────────────────────────┘
```

**Visual Checks:**
- Green checkmark icon
- Green border
- Success message
- JSON details visible
- Toast notification (green)

---

### 6. Severity Colors Reference

**Critical (Red #DC2626):**
```
🔴 critical
```
- Solid red border
- Red alert icon
- Red badge background

**High (Orange #EA580C):**
```
🟠 high
```
- Solid orange border
- Orange triangle icon
- Orange badge background

**Medium (Gold #FCA311):**
```
🟡 medium
```
- Solid gold border
- Gold info icon
- Gold badge background

**Low (Green #10B981):**
```
🟢 low
```
- Solid green border
- Green checkmark
- Green badge background

---

### 7. Loading States

**Diagnosis Loading:**
```
[⟳ Analyzing...]
```

**Fix Loading:**
```
[⟳ Applying Fix...]
```

**Visual:**
- Spinning icon
- Disabled button (greyed)
- Loading text

---

### 8. Toast Notifications

**Success:**
```
┌────────────────────────────┐
│ ✅ Issue fixed!            │
└────────────────────────────┘
```
- Green checkmark
- Green border
- Top-right corner

**Warning:**
```
┌────────────────────────────┐
│ ⚠️ Admin access required   │
└────────────────────────────┘
```
- Warning triangle
- Yellow/orange border

**Error:**
```
┌────────────────────────────┐
│ ❌ Search failed           │
└────────────────────────────┘
```
- X icon
- Red border

---

### Mobile View Requirements

On screens < 768px:

- ✅ Modal takes full width with padding
- ✅ Scrolls vertically if needed
- ✅ Buttons min 44x44px (tappable)
- ✅ Text remains readable
- ✅ No horizontal scroll

---

# Technical Implementation Reference

## Architecture Overview

### System Components

1. **Frontend (React)**
   - `AITroubleshootingModal.tsx` - Main modal component
   - Search integration in existing search component
   - Toast notifications via Sonner

2. **Backend (Supabase Edge Functions)**
   - `/ai-troubleshoot` - Diagnosis endpoint
   - `/ai-troubleshoot/confirm-fix` - Fix execution endpoint
   - OpenAI integration
   - Pattern matching fallback

3. **Database (Supabase)**
   - `kv_store_3acdc7c6` table for data
   - User authentication via Supabase Auth
   - Role-based access control

### API Endpoints

#### POST /ai-troubleshoot

**Request:**
```json
{
  "query": "I can't access my workspace",
  "workspaceId": "workspace-123"
}
```

**Response:**
```json
{
  "success": true,
  "diagnosis": {
    "issueType": "access_denied",
    "severity": "high",
    "description": "...",
    "requiresAdmin": true,
    "autoFixable": true,
    "recommendedActions": [...]
  },
  "fixResult": null,
  "canFix": false,
  "requiresAdminApproval": true,
  "userRole": "developer",
  "isAdmin": false
}
```

#### POST /ai-troubleshoot/confirm-fix

**Request:**
```json
{
  "diagnosis": {
    "issueType": "access_denied",
    "requiresAdmin": true
  },
  "workspaceId": "workspace-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Access granted!",
  "details": {
    "role": "developer",
    "workspaceId": "workspace-123"
  }
}
```

### Issue Types

| Type | Severity | Requires Admin | Auto-Fix |
|------|----------|----------------|----------|
| access_denied | high | Yes | Yes |
| user_role_issue | high | Yes | Yes |
| missing_data | medium | No | Yes |
| configuration_error | high | Yes | Yes |
| authentication_issue | critical | No | Instructions only |

### Pattern Matching Keywords

```javascript
const patterns = {
  access_denied: ['access', 'permission', 'denied', 'forbidden'],
  user_role_issue: ['role', 'permission', 'privilege'],
  missing_data: ['missing', 'lost', 'disappeared', 'gone'],
  configuration_error: ['config', 'settings', 'setup', 'broken'],
  authentication_issue: ['login', 'auth', 'signin', 'credentials']
};
```

### Security Model

1. **Authentication**: All endpoints require valid Supabase access token
2. **Authorization**: Admin-required fixes check user role
3. **Validation**: Input sanitization and query validation
4. **Audit**: All fixes logged with userId and timestamp

---

# Troubleshooting Common Issues

## Frontend Issues

### Modal Doesn't Open
**Symptoms:** Click "Get AI Help" but nothing happens

**Checks:**
1. Check browser console for errors
2. Verify `AITroubleshootingModal` is imported
3. Check `showTroubleshootingModal` state
4. Verify modal component is rendered

**Fix:**
```javascript
// In search component
const [showTroubleshootingModal, setShowTroubleshootingModal] = useState(false);

// Ensure this is in JSX:
{showTroubleshootingModal && (
  <AITroubleshootingModal
    isOpen={showTroubleshootingModal}
    onClose={() => setShowTroubleshootingModal(false)}
    initialQuery={searchQuery}
  />
)}
```

---

### Troubleshooting Hint Not Showing
**Symptoms:** Search works but no hint appears

**Checks:**
1. Verify backend returns `troubleshootingHint` in response
2. Check keyword detection in search query
3. Verify hint rendering logic

**Fix:**
```javascript
// Backend should return:
{
  results: [...],
  troubleshootingHint: {
    detected: true,
    message: "This looks like a troubleshooting query...",
    severity: "info"
  }
}

// Frontend should render:
{searchResults?.troubleshootingHint?.detected && (
  <div className="troubleshooting-hint">
    {/* Hint content */}
  </div>
)}
```

---

### Role Badge Not Showing
**Symptoms:** Modal opens but no role badge

**Checks:**
1. Verify `userRole` is fetched
2. Check user session is valid
3. Verify badge rendering logic

**Fix:**
```javascript
// Fetch user role:
const { data: { user } } = await supabase.auth.getUser(token);
const userRole = await getUserRole(user.id); // Implement this

// Render badge:
{userRole && (
  <div className="role-badge">
    {isAdmin && <Shield className="w-3 h-3" />}
    {userRole}
  </div>
)}
```

---

### Colors Don't Match Brand
**Symptoms:** UI shows wrong colors

**Fix:**
Update Tailwind classes to use exact hex values:

```css
/* In component */
.primary-button {
  background-color: #14213D;
}

.icon-color {
  color: #FCA311;
}

.text-primary {
  color: #000000;
}

/* Severity colors */
.severity-critical {
  border-color: #DC2626;
}

.severity-high {
  border-color: #EA580C;
}

.severity-medium {
  border-color: #FCA311;
}

.severity-low {
  border-color: #10B981;
}
```

---

## Backend Issues

### "Search failed" Error
**Symptoms:** Toast shows "Search failed. Please try again."

**Checks:**
1. Check OPENAI_API_KEY is set
2. Verify backend endpoint is accessible
3. Check network tab for 500 errors

**Fix:**
```bash
# Verify environment variables
echo $OPENAI_API_KEY

# Check backend logs
# Should see error details
```

If OpenAI quota exceeded, pattern matching should activate automatically.

---

### "Admin access required" for All Users
**Symptoms:** Even admins see "cannot fix" message

**Checks:**
1. Verify `isAdmin` calculation
2. Check user role in database
3. Verify role badge shows "admin"

**Fix:**
```javascript
// Backend should check:
const userRole = await getUserRole(userId);
const isAdmin = userRole === 'admin';

// Response should include:
{
  isAdmin: true,
  canFix: isAdmin || !diagnosis.requiresAdmin
}
```

---

### Fix Doesn't Apply
**Symptoms:** Click "Confirm & Fix" but nothing happens

**Checks:**
1. Check network tab for API call
2. Verify 200 response
3. Check backend logs for errors
4. Verify workspaceId is valid

**Fix:**
```javascript
// Ensure correct endpoint:
const response = await fetch(
  `${API_URL}/ai-troubleshoot/confirm-fix`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      diagnosis,
      workspaceId
    })
  }
);

// Check response:
if (!response.ok) {
  const error = await response.json();
  console.error('Fix failed:', error);
}
```

---

### Diagnosis Takes Too Long
**Symptoms:** Loading spinner for >5 seconds

**Checks:**
1. Check OpenAI API response time
2. Verify network connection
3. Check backend timeout settings

**Fix:**
```javascript
// Add timeout to fetch:
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

try {
  const response = await fetch(url, {
    signal: controller.signal,
    // ... other options
  });
} catch (error) {
  if (error.name === 'AbortError') {
    // Handle timeout
    console.error('Request timed out');
  }
} finally {
  clearTimeout(timeoutId);
}
```

---

### Pattern Matching Not Working
**Symptoms:** Fallback doesn't detect issue type

**Checks:**
1. Check console for fallback message
2. Verify query contains keywords
3. Check pattern matching logic

**Fix:**
```javascript
// Backend pattern matching:
const patterns = {
  access_denied: /access|permission|denied|forbidden/i,
  missing_data: /missing|lost|disappeared|gone/i,
  // ... other patterns
};

// Match query:
for (const [type, pattern] of Object.entries(patterns)) {
  if (pattern.test(query)) {
    return type;
  }
}
```

---

## Security Issues

### 403 Forbidden on Fix
**Symptoms:** Admin gets 403 when fixing

**Checks:**
1. Verify admin role is correctly set
2. Check Authorization header
3. Verify token is valid

**Fix:**
```javascript
// Backend should verify:
const { data: { user } } = await supabase.auth.getUser(token);
const userRole = await getUserRole(user.id);

if (diagnosis.requiresAdmin && userRole !== 'admin') {
  return new Response(
    JSON.stringify({ error: 'Admin access required' }),
    { status: 403 }
  );
}
```

---

### Unauthorized Access Attempt
**Symptoms:** 401 errors in console

**Checks:**
1. Verify user is logged in
2. Check token exists in localStorage
3. Verify token hasn't expired

**Fix:**
```javascript
// Check session before API call:
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  // Redirect to login
  navigate('/login');
  return;
}

// Use fresh token:
const token = session.access_token;
```

---

## Performance Issues

### Slow Modal Open
**Symptoms:** Delay when clicking "Get AI Help"

**Fix:**
- Lazy load modal component
- Preload user role on login
- Use React.memo for static parts

```javascript
// Lazy load:
const AITroubleshootingModal = React.lazy(() => 
  import('./components/AITroubleshootingModal')
);

// Usage:
<Suspense fallback={<div>Loading...</div>}>
  <AITroubleshootingModal {...props} />
</Suspense>
```

---

### Multiple API Calls
**Symptoms:** Network tab shows duplicate requests

**Fix:**
- Debounce button clicks
- Use request deduplication
- Disable button during processing

```javascript
const [isProcessing, setIsProcessing] = useState(false);

const handleDiagnose = async () => {
  if (isProcessing) return; // Prevent duplicates
  
  setIsProcessing(true);
  try {
    // API call
  } finally {
    setIsProcessing(false);
  }
};
```

---

## Testing Issues

### Can't Create Test Users
**Symptoms:** Signup fails for test emails

**Fix:**
- Use unique emails each time
- Check email format
- Verify backend allows test domains

```javascript
// Use timestamp for unique emails:
const timestamp = Date.now();
const email = `admin-${timestamp}@projify.test`;
```

---

### Workspace Creation Fails
**Symptoms:** ZCPC doesn't create workspace

**Fix:**
1. Check OpenAI API key
2. Try manual creation
3. Verify user has permission

```javascript
// Manual creation fallback:
const workspace = {
  name: 'Test Banking App',
  key: 'TBA',
  type: 'Software Development',
  createdBy: userId
};
```

---

## Browser-Specific Issues

### Safari Modal Issues
**Symptoms:** Modal doesn't display correctly in Safari

**Fix:**
- Add `-webkit-` prefixes
- Test backdrop blur
- Check z-index stacking

```css
.modal-backdrop {
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}
```

---

### Mobile Touch Issues
**Symptoms:** Buttons not tappable on mobile

**Fix:**
- Ensure min height 44px
- Add touch-action CSS
- Test with mobile DevTools

```css
.button {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}
```

---

## Quick Debug Script

Run this in console for comprehensive debug info:

```javascript
async function debugTroubleshooting() {
  console.log('🔍 Debugging AI Troubleshooting System\n');
  
  // 1. Check session
  const token = localStorage.getItem('sb-access-token');
  console.log('1️⃣ Session:', token ? '✅ Exists' : '❌ Missing');
  
  // 2. Check backend health
  try {
    const health = await fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/health')
      .then(r => r.json());
    console.log('2️⃣ Backend:', health.status === 'ok' ? '✅ OK' : '❌ Down');
    console.log('   OpenAI:', health.env.hasOpenAiKey ? '✅' : '❌');
  } catch (e) {
    console.log('2️⃣ Backend: ❌ Unreachable', e.message);
  }
  
  // 3. Test search
  try {
    const search = await fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query: 'access denied' })
    }).then(r => r.json());
    console.log('3️⃣ Search:', search.troubleshootingHint?.detected ? '✅ Detected' : '❌ Not detected');
  } catch (e) {
    console.log('3️⃣ Search: ❌ Failed', e.message);
  }
  
  // 4. Test troubleshoot
  try {
    const troubleshoot = await fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-troubleshoot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query: 'I cannot access my workspace' })
    }).then(r => r.json());
    console.log('4️⃣ Troubleshoot:', troubleshoot.success ? '✅ Working' : '❌ Failed');
    console.log('   User Role:', troubleshoot.userRole);
    console.log('   Is Admin:', troubleshoot.isAdmin ? '✅' : '❌');
  } catch (e) {
    console.log('4️⃣ Troubleshoot: ❌ Failed', e.message);
  }
  
  console.log('\n✅ Debug Complete');
}

// Run it:
debugTroubleshooting();
```

---

# Summary & Success Criteria

## What Was Implemented

✅ **AI-Powered Troubleshooting System** with:
- Automatic issue detection from search queries
- OpenAI-powered diagnosis with pattern matching fallback
- Permission-based fix execution (admin vs non-admin)
- 5 issue types (access, role, data, config, auth)
- Complete UI with modal, badges, and toasts
- Security controls and audit logging

## Testing Coverage

✅ **15 Comprehensive Test Scenarios** covering:
- Permission workflows (admin vs non-admin)
- All issue types
- Keyword detection (15+ triggers)
- UI/UX validation
- Security testing
- Integration testing
- Edge cases
- Performance validation

## Success Criteria

Your implementation is **READY FOR DEPLOYMENT** when:

- ✅ All 15 test scenarios pass
- ✅ Security tests confirm no unauthorized access
- ✅ UI matches brand colors (#14213D, #FCA311, #000000)
- ✅ Admin users can execute fixes
- ✅ Non-admin users see appropriate warnings
- ✅ OpenAI fallback works with pattern matching
- ✅ No console errors during normal operation
- ✅ Responsive on desktop, tablet, and mobile
- ✅ Accessibility requirements met (WCAG AA)
- ✅ Performance benchmarks met (<2s diagnosis)

## Quick Start Testing (Recap)

1. **Setup (5 min):** Create 3 test users + workspace
2. **Test (45 min):** Run all 15 scenarios
3. **Verify (10 min):** Check UI, security, performance
4. **Deploy (✅):** All tests pass → Ship it! 🚀

---

**Document Version:** 1.0  
**Last Updated:** March 10, 2026  
**Status:** Ready for Testing

---

**Need Help?**
- Review section-specific guides above
- Check troubleshooting section
- Run debug script
- Verify environment variables
- Check console logs

**Happy Testing! 🧪**
