# AI Troubleshooting - Testing Checklist ✓

Quick reference checklist for validating the AI troubleshooting system.

---

## Pre-Testing Setup ✓

- [ ] **Environment Variables Set**
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY  
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] OPENAI_API_KEY
  - [ ] JWT_SECRET

- [ ] **Test Users Created**
  - [ ] Admin: `admin@projify.test` / `TestAdmin123!`
  - [ ] Developer: `developer@projify.test` / `TestDev123!`
  - [ ] QA: `qa@projify.test` / `TestQA123!`

- [ ] **Test Workspace Created**
  - [ ] Name: "Test Banking App"
  - [ ] Key: "TBA"
  - [ ] Has 10+ tickets

- [ ] **Backend Verification**
  - [ ] Health endpoint returns 200 OK
  - [ ] AI search endpoint responds
  - [ ] AI troubleshoot endpoint responds

---

## Test 1: Non-Admin Access Issue ✓

**User:** Developer (`developer@projify.test`)

- [ ] Login successful
- [ ] Search: `"I can't access my workspace"`
- [ ] Troubleshooting hint banner appears (orange)
- [ ] "Get AI Help" button visible
- [ ] Modal opens with query pre-filled
- [ ] User badge shows "developer"
- [ ] Click "Diagnose Issue"
- [ ] Loading spinner appears
- [ ] Diagnosis shows "ACCESS DENIED"
- [ ] Severity badge: "high" (orange)
- [ ] "Auto-fixable" badge present
- [ ] "Requires Admin" badge present (red)
- [ ] Yellow warning card appears
- [ ] Warning says "Admin Access Required"
- [ ] NO "Confirm & Fix" button visible
- [ ] Toast: "Admin access required to fix this issue"

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 2: Admin Access Issue ✓

**User:** Admin (`admin@projify.test`)

- [ ] Login successful
- [ ] Search: `"permission denied when accessing workspace"`
- [ ] Troubleshooting hint appears
- [ ] Click "Get AI Help"
- [ ] Modal opens
- [ ] User badge shows "admin" with shield icon
- [ ] Text: "You have admin privileges"
- [ ] Click "Diagnose Issue"
- [ ] Diagnosis appears
- [ ] "Requires Admin" badge present
- [ ] Red warning card appears
- [ ] Warning: "Admin Confirmation Required"
- [ ] "Confirm & Fix" button IS visible (red)
- [ ] Click "Confirm & Fix"
- [ ] Button shows "Applying Fix..."
- [ ] Green success card appears
- [ ] Message: "✅ Access granted!"
- [ ] Details show role and workspaceId
- [ ] Toast: "✅ Issue fixed!"

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 3: Missing Data (Any User) ✓

**User:** QA (`qa@projify.test`)

- [ ] Login successful
- [ ] Search: `"my tickets are missing"`
- [ ] Troubleshooting hint appears
- [ ] Click "Get AI Help"
- [ ] Role badge shows "qa"
- [ ] Click "Diagnose Issue"
- [ ] Issue Type: "MISSING DATA"
- [ ] Severity: "medium" (yellow/gold)
- [ ] "Auto-fixable" badge present
- [ ] NO "Requires Admin" badge
- [ ] Fix result appears immediately
- [ ] Message includes story/epic count
- [ ] Suggests refreshing or clearing filters
- [ ] NO admin warning
- [ ] NO "Confirm & Fix" button

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 4: Keyword Detection ✓

Test each query and check if hint appears:

**Access Keywords:**
- [ ] `"I don't have access"` → Hint shown
- [ ] `"access denied"` → Hint shown
- [ ] `"permission error"` → Hint shown

**Data Keywords:**
- [ ] `"data is missing"` → Hint shown
- [ ] `"tickets disappeared"` → Hint shown
- [ ] `"lost my work"` → Hint shown

**Error Keywords:**
- [ ] `"something is broken"` → Hint shown
- [ ] `"not working properly"` → Hint shown
- [ ] `"getting an error"` → Hint shown

**Normal Searches (No Hint):**
- [ ] `"MOB-123"` → NO hint
- [ ] `"John Doe"` → NO hint
- [ ] `"Sprint Planning"` → NO hint

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 5: Role Configuration ✓

**Part A - Developer:**
- [ ] Login as developer
- [ ] Search: `"my role permissions are not working"`
- [ ] Click "Get AI Help"
- [ ] Diagnose shows "USER ROLE ISSUE"
- [ ] Severity: "high"
- [ ] "Requires Admin" badge
- [ ] Shows current role: "developer"
- [ ] Recommends contacting admin
- [ ] "Admin Access Required" warning
- [ ] NO fix button

**Part B - Admin:**
- [ ] Logout, login as admin
- [ ] Same search
- [ ] "Confirm & Fix" button appears
- [ ] Click to apply fix
- [ ] Role validated successfully

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 6: Authentication Issue ✓

**User:** Any

- [ ] Search: `"I'm having login problems"`
- [ ] Open troubleshooting
- [ ] Issue Type: "AUTHENTICATION ISSUE"
- [ ] Severity: "critical" (red)
- [ ] "Auto-fixable" badge
- [ ] NO "Requires Admin" badge
- [ ] Fix result shows immediately
- [ ] Recommendations include:
  - [ ] Log out and log back in
  - [ ] Clear browser cache
  - [ ] Reset password
- [ ] Instructions provided (not actual fix)

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 7: Configuration Issue ✓

**Part A - Developer:**
- [ ] Login as developer
- [ ] Search: `"workspace settings are broken"`
- [ ] Open troubleshooting
- [ ] Issue Type: "CONFIGURATION ERROR"
- [ ] "Requires Admin" badge
- [ ] Cannot fix (admin required message)

**Part B - Admin:**
- [ ] Login as admin
- [ ] Same search
- [ ] "Confirm & Fix" button appears
- [ ] Click button
- [ ] Fix applied
- [ ] Message: "Workspace settings verified and corrected"

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 8: Modal Query Change ✓

- [ ] Open search
- [ ] Type: `"access issue"`
- [ ] Click "Get AI Help"
- [ ] Modal opens with "access issue"
- [ ] Clear query field
- [ ] Type new: `"I can't create new tickets"`
- [ ] Click "Diagnose Issue"
- [ ] New diagnosis appears
- [ ] Diagnosis matches new query

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 9: OpenAI Fallback ✓

**Setup:** Simulate OpenAI unavailable

- [ ] Temporarily invalidate OPENAI_API_KEY (or wait for quota)
- [ ] Search: `"access denied"`
- [ ] Open troubleshooting
- [ ] Click "Diagnose Issue"
- [ ] Console shows: "⚠️ OpenAI diagnosis failed, using pattern matching"
- [ ] Diagnosis still appears
- [ ] Issue detected correctly
- [ ] Correct issue type assigned

**Test multiple patterns:**
- [ ] `"access"` → access_denied
- [ ] `"missing data"` → missing_data
- [ ] `"login problem"` → authentication_issue
- [ ] `"role issue"` → user_role_issue
- [ ] `"settings broken"` → configuration_error

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 10: Edge Cases ✓

**Empty Query:**
- [ ] Open modal
- [ ] Leave query empty
- [ ] Click "Diagnose Issue"
- [ ] Toast error: "Please describe the issue you're experiencing"

**Long Query:**
- [ ] Type 500+ character description
- [ ] Click "Diagnose Issue"
- [ ] AI processes successfully
- [ ] Diagnosis returned

**Special Characters:**
- [ ] Query: `"Error: [500] - Can't access @workspace #123"`
- [ ] System handles gracefully
- [ ] No parsing errors

**Rapid Clicking:**
- [ ] Click "Diagnose Issue" multiple times quickly
- [ ] Button disables during processing
- [ ] Only one request sent

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 11: UI/UX Validation ✓

**Colors:**
- [ ] Primary buttons: #14213D
- [ ] Icons/highlights: #FCA311
- [ ] Text: #000000
- [ ] Backgrounds: #E5E5E5 / #FFFFFF
- [ ] Critical severity: #DC2626 (red)
- [ ] High severity: #EA580C (orange)
- [ ] Medium severity: #FCA311 (gold)
- [ ] Low severity: #10B981 (green)

**Responsive:**
- [ ] Desktop (1920x1080): Modal scales properly
- [ ] Tablet (768x1024): No horizontal scroll
- [ ] Mobile (375x667): Buttons clickable

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Tab order logical
- [ ] Color contrast meets WCAG AA

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 12: Backend Logs ✓

**Check console for:**

**Diagnosis Request:**
- [ ] `🔧 AI Troubleshooting Request: { query: "..." }`
- [ ] `📋 Issue Diagnosis: { issueType: "...", severity: "..." }`

**Fix Attempt:**
- [ ] `🔧 Attempting auto-fix for: [issue_type]`

**Admin Confirmation:**
- [ ] Admin fix logged properly

**Errors (if any):**
- [ ] `❌ AI Troubleshooting error: [message]`
- [ ] Error messages are descriptive

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 13: Security Validation ✓

**Unauthorized Fix Attempt:**
- [ ] Call `/confirm-fix` as non-admin
- [ ] Returns 403 Forbidden
- [ ] Error: "Admin access required"

**No Token:**
- [ ] Call API without Authorization header
- [ ] Returns 401 Unauthorized

**Invalid Token:**
- [ ] Call API with fake token
- [ ] Returns 401 Unauthorized

**Token Validation:**
- [ ] Valid admin token allows fixes
- [ ] Non-admin token blocks admin fixes
- [ ] All operations verify user role

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 14: Integration Tests ✓

**Workspace Context:**
- [ ] Select specific workspace
- [ ] Note workspace ID in URL
- [ ] Search: `"can't see my tickets"`
- [ ] Open troubleshooting
- [ ] Verify workspaceId in network request
- [ ] Fix applies to correct workspace

**User Context:**
- [ ] Modal shows correct user role badge
- [ ] Role matches database
- [ ] Admin fixes log userId
- [ ] Console shows userId

**Search Integration:**
- [ ] Troubleshooting hint in search results
- [ ] Modal opens with search query
- [ ] Context preserved

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Test 15: Performance ✓

**Response Times:**
- [ ] Search detection: < 100ms
- [ ] Modal open: < 200ms
- [ ] AI diagnosis: 1-3 seconds
- [ ] Pattern diagnosis: < 500ms
- [ ] Fix execution: < 1 second
- [ ] Toast notification: < 100ms

**Load:**
- [ ] 10 concurrent diagnoses: Handles gracefully
- [ ] Multiple rapid searches: No errors
- [ ] Large query (1000 chars): Processes successfully

**Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Final Verification ✓

- [ ] All 15 tests passed
- [ ] No console errors during any test
- [ ] All API endpoints respond correctly
- [ ] Security tests passed
- [ ] UI renders correctly on all screens
- [ ] Color scheme matches brand
- [ ] Fallback works without OpenAI
- [ ] Admin/non-admin workflows correct
- [ ] Edge cases handled
- [ ] Logging is comprehensive
- [ ] Performance acceptable
- [ ] Toasts appear correctly
- [ ] Animations smooth
- [ ] Documentation complete

---

## Test Summary

**Date:** _______________  
**Tester:** _______________  
**Environment:** _______________

**Tests Passed:** _____ / 15  
**Tests Failed:** _____ / 15  
**Critical Issues:** _______________  
**Minor Issues:** _______________

**Overall Status:** 
- [ ] ✅ READY FOR DEPLOYMENT
- [ ] ⚠️ NEEDS FIXES
- [ ] ❌ MAJOR ISSUES

**Sign-off:** _______________

---

## Quick Reference Commands

**Health Check:**
```javascript
fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/health')
  .then(r => r.json()).then(console.log);
```

**Get Access Token:**
```javascript
localStorage.getItem('sb-access-token');
```

**Test Troubleshoot:**
```javascript
fetch('https://[PROJECT-ID].supabase.co/functions/v1/make-server-3acdc7c6/ai-troubleshoot', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}`
  },
  body: JSON.stringify({ query: 'I cannot access my workspace' })
}).then(r => r.json()).then(console.log);
```

---

## Notes Section

Use this space for additional observations during testing:

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
