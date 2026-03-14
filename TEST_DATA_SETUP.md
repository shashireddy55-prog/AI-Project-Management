# Test Data Setup Guide for AI Troubleshooting

## Quick Setup Script

Use this guide to quickly set up test data for validating the AI troubleshooting system.

---

## Step 1: Create Test Users

### Option A: Using Signup Flow (Recommended)

1. **Create Admin User**
   ```
   Navigate to: /signup
   
   Name: Admin User
   Email: admin@projify.test
   Password: TestAdmin123!
   Account Type: Business
   Subdomain: projify-test-admin
   ```
   
   After signup, you need to set role to admin manually in backend.

2. **Create Developer User**
   ```
   Navigate to: /signup
   
   Name: Developer User
   Email: developer@projify.test
   Password: TestDev123!
   Account Type: Personal
   ```

3. **Create QA User**
   ```
   Navigate to: /signup
   
   Name: QA Tester
   Email: qa@projify.test
   Password: TestQA123!
   Account Type: Personal
   ```

### Option B: Using Backend API (Faster)

Open browser console and run:

```javascript
// Create Admin User
fetch('https://[YOUR-PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@projify.test',
    password: 'TestAdmin123!',
    name: 'Admin User',
    accountType: 'business',
    subdomain: 'projify-test-admin'
  })
}).then(r => r.json()).then(console.log);

// Create Developer User
fetch('https://[YOUR-PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'developer@projify.test',
    password: 'TestDev123!',
    name: 'Developer User',
    accountType: 'personal'
  })
}).then(r => r.json()).then(console.log);

// Create QA User
fetch('https://[YOUR-PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'qa@projify.test',
    password: 'TestQA123!',
    name: 'QA Tester',
    accountType: 'personal'
  })
}).then(r => r.json()).then(console.log);
```

---

## Step 2: Set User Roles

After creating users, you need to set their roles. The admin role must be set manually.

### Method: Using Browser Console

1. **Login as the first user (will become admin)**

2. **Get your access token:**
   ```javascript
   // In browser console
   localStorage.getItem('sb-access-token')
   // Copy the token
   ```

3. **Get your user ID:**
   ```javascript
   // Login and check Supabase session
   const token = localStorage.getItem('sb-access-token');
   fetch('https://[PROJECT-ID].supabase.co/auth/v1/user', {
     headers: { 'Authorization': `Bearer ${token}` }
   }).then(r => r.json()).then(data => {
     console.log('User ID:', data.id);
   });
   ```

4. **Manually Set Roles (Backend required)**
   
   You'll need to update the KV store directly. Since we can't do this from frontend, the easiest way is:

   - First user to create a workspace becomes admin automatically
   - Other users can be invited with specific roles

---

## Step 3: Create Test Workspace

### Using the UI:

1. **Login as admin user**
   - Email: `admin@projify.test`
   - Password: `TestAdmin123!`

2. **Create Workspace via ZCPC**
   - Click "Create New Workspace" or use AI command bar
   - Type: `"Create a mobile banking application project"`
   - AI will generate:
     - Workspace name: "Mobile Banking App" (or similar)
     - Workspace key: "MOB" (auto-generated)
     - Project structure with epics and stories

3. **Verify Creation**
   - Check that workspace appears in sidebar
   - Note the workspace ID from URL
   - Confirm tickets are created (MOB-1, MOB-2, etc.)

### Alternative: Manual Creation

If ZCPC fails, create manually:

1. Navigate to workspace creation
2. Fill in:
   - Name: `Test Banking App`
   - Key: `TBA`
   - Type: `Software Development`
   - Description: `Test workspace for troubleshooting validation`

---

## Step 4: Add Test Users to Workspace

### As Admin User:

1. **Open Workspace Settings**
   - Click workspace name in sidebar
   - Click settings/gear icon

2. **Invite Users**
   - Navigate to "Team" or "Members" tab
   - Click "Invite User"
   - Add:
     ```
     Email: developer@projify.test
     Name: Developer User
     Role: developer
     ```
   - Click "Invite User"
   - Repeat for QA user:
     ```
     Email: qa@projify.test
     Name: QA Tester
     Role: qa
     ```

3. **Verify Members**
   - Check that all 3 users appear in team list
   - Verify roles are correct

---

## Step 5: Create Sample Data

### Create Epics:

1. **Epic 1**
   - Title: "User Authentication System"
   - Description: "Implement complete auth flow"
   - Status: In Progress

2. **Epic 2**
   - Title: "Account Dashboard"
   - Description: "User account management"
   - Status: To Do

3. **Epic 3**
   - Title: "Transaction Processing"
   - Description: "Handle banking transactions"
   - Status: In Progress

### Create Stories:

Create at least 10 stories across epics:

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

---

## Step 6: Test Scenario Preparation

### Scenario 1: Access Denied (Non-Admin)

**Setup:**
1. Create a second workspace (as admin)
2. Do NOT add developer user to it
3. Note workspace ID

**Test:**
1. Login as developer
2. Try to access the workspace (should fail)
3. Search: "I can't access workspace [ID]"
4. Verify troubleshooting detects issue

### Scenario 2: Missing Data

**Setup:**
1. Create workspace with data
2. Note workspace ID

**Test:**
1. Login as any user
2. Search: "my tickets are missing in workspace [ID]"
3. Verify data check runs

### Scenario 3: Permission Error

**Setup:**
1. Ensure developer user is in workspace
2. Give "viewer" role (if role system supports it)

**Test:**
1. Login as developer
2. Try to edit ticket (should fail if viewer)
3. Search: "I can't edit tickets"
4. Verify permission issue detected

---

## Step 7: Verify Backend Connection

### Health Check:

```javascript
fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/health')
  .then(r => r.json())
  .then(data => {
    console.log('Server Status:', data);
    console.log('OpenAI:', data.env.hasOpenAiKey ? '✅' : '❌');
    console.log('Supabase:', data.env.hasSupabaseUrl ? '✅' : '❌');
  });
```

**Expected Output:**
```json
{
  "status": "ok",
  "version": "7.0-INLINE-ZCPC-FIXED",
  "timestamp": "2026-03-10T...",
  "env": {
    "hasSupabaseUrl": true,
    "hasServiceRoleKey": true,
    "hasAnonKey": true,
    "hasOpenAiKey": true,
    "hasJwtSecret": true
  }
}
```

### Test AI Search:

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

**Expected Output:**
```json
{
  "results": [...],
  "summary": "...",
  "troubleshootingHint": {
    "detected": true,
    "message": "This looks like a troubleshooting query...",
    "severity": "info"
  },
  "query": "I need help with access issues",
  "timestamp": "..."
}
```

### Test Troubleshooting:

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

**Expected Output:**
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
  "fixResult": null or {...},
  "canFix": true/false,
  "requiresAdminApproval": true/false,
  "userRole": "developer",
  "isAdmin": false,
  "timestamp": "..."
}
```

---

## Step 8: Quick Validation Checklist

Before running full tests, verify:

- [ ] All 3 test users created (admin, developer, qa)
- [ ] Test workspace created with key "TBA"
- [ ] At least 10 tickets created
- [ ] Developer and QA users added to workspace
- [ ] Admin user has admin role
- [ ] Health check returns status "ok"
- [ ] AI Search endpoint responds
- [ ] AI Troubleshoot endpoint responds
- [ ] OpenAI key is valid (or fallback works)
- [ ] Browser console shows no errors on page load

---

## Step 9: Test User Credentials Summary

Save these for easy access during testing:

```
=== ADMIN USER ===
Email: admin@projify.test
Password: TestAdmin123!
Role: admin
Expected Access: Full system access, can fix all issues

=== DEVELOPER USER ===
Email: developer@projify.test
Password: TestDev123!
Role: developer
Expected Access: Workspace member, limited fixes

=== QA USER ===
Email: qa@projify.test
Password: TestQA123!
Role: qa
Expected Access: Workspace member, limited fixes

=== TEST WORKSPACE ===
Name: Test Banking App
Key: TBA
Tickets: TBA-1 through TBA-10
Members: admin, developer, qa
```

---

## Step 10: Common Setup Issues

### Issue: Can't create users
**Solution:** Check if email already exists, use different emails

### Issue: Admin role not working
**Solution:** First user to create workspace should be auto-admin

### Issue: Workspace creation fails
**Solution:** Check OpenAI key, use manual creation if ZCPC fails

### Issue: Users not appearing in workspace
**Solution:** Check workspace_user KV keys in backend

### Issue: Troubleshooting not detecting queries
**Solution:** Verify keywords like "access", "error", "issue" are in query

---

## Step 11: Quick Test Command

Run this in browser console for a quick end-to-end test:

```javascript
async function quickTest() {
  const token = localStorage.getItem('sb-access-token');
  
  console.log('🧪 Starting Quick Test...\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  const health = await fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/health')
    .then(r => r.json());
  console.log(health.status === 'ok' ? '✅ PASS' : '❌ FAIL', health);
  
  // Test 2: AI Search
  console.log('\n2️⃣ Testing AI Search...');
  const search = await fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query: 'access denied' })
  }).then(r => r.json());
  console.log(search.troubleshootingHint?.detected ? '✅ PASS' : '❌ FAIL', search);
  
  // Test 3: AI Troubleshoot
  console.log('\n3️⃣ Testing AI Troubleshoot...');
  const troubleshoot = await fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-troubleshoot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ 
      query: 'I cannot access my workspace'
    })
  }).then(r => r.json());
  console.log(troubleshoot.success ? '✅ PASS' : '❌ FAIL', troubleshoot);
  
  console.log('\n🏁 Quick Test Complete!');
}

// Run the test
quickTest();
```

Replace `[PROJECT-ID]` with your actual Supabase project ID.

---

## Step 12: Reset Test Data

If you need to start over:

### Clear Test Users:
```javascript
// This would require backend access to delete KV entries
// Easier to just create new test emails:
// admin2@projify.test, developer2@projify.test, etc.
```

### Clear Workspaces:
1. Delete workspaces from UI
2. Or manually delete KV entries from backend

### Fresh Start:
1. Use new email addresses
2. Create new workspace with different key
3. Re-run setup steps

---

## Summary: 5-Minute Quick Setup

**Fastest way to get testing:**

1. ✅ Signup 3 users (admin, dev, qa)
2. ✅ Login as admin
3. ✅ Create workspace via ZCPC: "Create mobile banking app"
4. ✅ Invite other 2 users to workspace
5. ✅ Run quick test script (Step 11)
6. ✅ Start testing scenarios from TROUBLESHOOTING_TESTING_GUIDE.md

**Ready to test in ~5 minutes!** 🚀
