# AI-Powered Troubleshooting System

## Overview
Implemented an intelligent troubleshooting system that automatically detects, diagnoses, and fixes common issues in Projify AI based on user permissions. The system uses AI to understand user problems and applies appropriate fixes, with admin approval required for system-wide changes.

## Features Implemented

### 1. Intelligent Issue Detection
- **Automatic Pattern Recognition**: Detects when users search for problems (e.g., "access denied", "can't see workspace", "permission error")
- **AI-Powered Diagnosis**: Uses OpenAI to understand and categorize issues
- **Fallback Pattern Matching**: Works even without AI using keyword-based detection

### 2. User Permission-Based Fixes
- **Role Checking**: Determines user role (admin, project_manager, developer, etc.)
- **Permission Validation**: Checks if user has authority to fix the issue
- **Admin-Only Actions**: Protects sensitive operations requiring administrator access

### 3. Auto-Fix Capabilities

#### Issues That Can Be Auto-Fixed:

**Access/Permission Issues** (`access_denied`, `workspace_visibility`)
- Adds user to workspace if not a member
- Reactivates suspended workspace membership
- Grants appropriate access levels
- **Requires**: User ID and Workspace ID
- **Admin Required**: Yes (for adding to workspaces)

**User Role Issues** (`user_role_issue`)
- Sets default role if missing or invalid
- Validates role permissions
- Provides role upgrade instructions
- **Requires**: User ID
- **Admin Required**: Yes (for role changes)

**Missing Data Issues** (`missing_data`)
- Verifies data integrity
- Checks workspace existence
- Counts stories and epics
- Suggests filter/refresh actions
- **Requires**: Workspace ID (optional)
- **Admin Required**: No

**Configuration Issues** (`configuration_error`)
- Resets workspace settings to defaults
- Validates global settings
- Fixes corrupted configuration
- **Requires**: Workspace ID (optional)
- **Admin Required**: Yes (for system-wide settings)

**Authentication Issues** (`authentication_issue`)
- Provides logout/login instructions
- Suggests password reset
- Clears session recommendations
- **Requires**: None
- **Admin Required**: No (user self-service)

### 4. Admin Approval Workflow

```
1. User reports issue → AI diagnoses
2. If requires admin:
   a. Non-admin user → Shows warning + contact admin message
   b. Admin user → Shows warning + "Confirm & Fix" button
3. Admin clicks "Confirm & Fix"
4. System applies fix with full logging
5. Success/failure notification
```

### 5. Severity Levels

- **Critical**: System-breaking issues (authentication failures, data corruption)
- **High**: Major functionality blocked (access denied, permission errors)
- **Medium**: Partial functionality affected (missing data, configuration issues)
- **Low**: Minor inconveniences (UI glitches, cosmetic issues)

## Architecture

### Backend Components

#### `/supabase/functions/server/ai-troubleshoot.tsx`
Main troubleshooting handler with:
- `handleTroubleshooting()` - Diagnoses issues and checks permissions
- `confirmAdminFix()` - Executes admin-approved fixes
- `diagnoseIssue()` - AI-powered issue analysis
- `patternBasedDiagnosis()` - Fallback keyword matching
- `attemptAutoFix()` - Routes to specific fix functions
- Fix handlers for each issue type

#### `/supabase/functions/server/ai_search.tsx` (Enhanced)
- Detects troubleshooting queries in search
- Adds `troubleshootingHint` to search results
- Suggests using dedicated troubleshooting tool

#### `/supabase/functions/server/index.tsx` (Enhanced)
New endpoints:
- `POST /ai-troubleshoot` - Diagnose and fix issues
- `POST /ai-troubleshoot/confirm-fix` - Execute admin-approved fixes

### Frontend Components

#### `/src/app/components/AITroubleshootModal.tsx`
Full-featured modal for:
- Issue description input
- AI diagnosis display
- Severity visualization
- Recommended actions list
- Admin confirmation UI
- Fix result feedback
- Role badge display

#### `/src/app/components/AISearchResults.tsx` (Enhanced)
- Detects troubleshooting hints from search
- Shows "Get AI Help" button
- Opens troubleshooting modal
- Maintains search results context

## Usage Examples

### Example 1: User Can't Access Workspace

**User Input:** "I can't access my workspace"

**AI Diagnosis:**
```json
{
  "issueType": "access_denied",
  "severity": "high",
  "description": "You may not have the required permissions to access this resource.",
  "requiresAdmin": true,
  "autoFixable": true,
  "recommendedActions": [
    "Check your workspace membership",
    "Verify your user role",
    "Contact an admin to grant access"
  ]
}
```

**If User is Admin:**
- Shows warning: "This action requires admin privileges and will make system-wide changes"
- Button: "Confirm & Fix"
- On confirm: Adds user to workspace with developer role
- Result: "✅ Access granted! You have been added to the workspace as a developer."

**If User is Not Admin:**
- Shows warning: "⚠️ Admin access required to fix this issue"
- Message: "Contact your workspace administrator for help"
- No fix button available

### Example 2: Missing Data

**User Input:** "My tickets are missing"

**AI Diagnosis:**
```json
{
  "issueType": "missing_data",
  "severity": "medium",
  "description": "Data may be missing due to sync issues, filters, or accidental deletion.",
  "requiresAdmin": false,
  "autoFixable": true,
  "recommendedActions": [
    "Check if filters are applied",
    "Verify workspace selection",
    "Try refreshing the page"
  ]
}
```

**Auto-Fix (No Admin Required):**
- Verifies workspace exists
- Counts stories and epics
- Result: "✅ Data check complete. Found 25 stories and 8 epics. Try refreshing the page or clearing filters."

### Example 3: Permission Error

**User Input:** "permission denied error"

**Search Results:**
- Shows troubleshooting hint banner
- Button: "Get AI Help"
- Opens AI Troubleshooting Modal
- Diagnoses and fixes if possible

## API Reference

### POST /ai-troubleshoot

**Request:**
```json
{
  "query": "I can't access workspace",
  "workspaceId": "workspace-123" (optional),
  "context": {} (optional)
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
  "fixResult": {
    "success": false,
    "message": "Admin confirmation required",
    "requiresAdminApproval": true
  },
  "canFix": false,
  "requiresAdminApproval": true,
  "userRole": "developer",
  "isAdmin": false
}
```

### POST /ai-troubleshoot/confirm-fix

**Request:**
```json
{
  "diagnosis": {
    "issueType": "access_denied",
    ...
  },
  "workspaceId": "workspace-123",
  "userId": "user-456"
}
```

**Response:**
```json
{
  "success": true,
  "fixResult": {
    "success": true,
    "message": "✅ Access granted! You have been added to the workspace.",
    "details": {
      "role": "developer",
      "workspaceId": "workspace-123"
    }
  }
}
```

## Security Considerations

### Permission Checks
1. **User Authentication**: Validates access token before processing
2. **Role Verification**: Checks user role from database, not client input
3. **Admin Validation**: Double-checks admin status for sensitive operations
4. **Workspace Membership**: Verifies user belongs to workspace before granting access

### Protected Operations
- Adding users to workspaces (admin only)
- Changing user roles (admin only)
- Modifying global settings (admin only)
- System-wide configuration changes (admin only)

### Audit Trail
All fix operations are logged with:
- User ID
- Action performed
- Timestamp
- Success/failure status
- Changed values

## Color Scheme (Projify AI Brand)
- **Primary (Buttons)**: #14213D (Dark Blue)
- **Icons/Highlights**: #FCA311 (Orange/Gold)
- **Text**: #000000 (Black)
- **Backgrounds**: #E5E5E5/#FFFFFF (Light Gray/White)
- **Severity Colors**:
  - Critical: #DC2626 (Red)
  - High: #EA580C (Orange)
  - Medium: #FCA311 (Gold)
  - Low: #10B981 (Green)

## Testing Scenarios

### Scenario 1: Access Issue (Admin User)
1. Login as admin
2. Search: "can't access workspace"
3. Click "Get AI Help"
4. See diagnosis with admin badge
5. Click "Confirm & Fix"
6. Verify access granted

### Scenario 2: Access Issue (Regular User)
1. Login as developer
2. Search: "permission denied"
3. Click "Get AI Help"
4. See "Admin Required" warning
5. Contact admin message displayed

### Scenario 3: Data Issue (Any User)
1. Search: "missing data"
2. Click "Get AI Help"
3. Auto-fix runs immediately
4. Data verification results shown

### Scenario 4: Configuration Issue (Admin)
1. Login as admin
2. Report: "settings not working"
3. See admin confirmation required
4. Approve and fix configuration
5. Settings reset to defaults

## Future Enhancements (Optional)

1. **Fix History**: Track all fixes applied with rollback capability
2. **Batch Fixes**: Fix multiple issues at once
3. **Scheduled Maintenance**: Proactive issue detection
4. **User Notifications**: Email admin when fixes require approval
5. **Analytics Dashboard**: Track common issues and resolution rates
6. **Custom Fix Scripts**: Allow admins to define custom troubleshooting workflows
7. **Integration Testing**: Automated tests for fix scenarios
8. **Fix Recommendations**: Suggest preventive measures

## Files Modified/Created

### New Files:
1. `/supabase/functions/server/ai-troubleshoot.tsx` - Main troubleshooting logic
2. `/src/app/components/AITroubleshootModal.tsx` - UI component
3. `/AI_TROUBLESHOOTING_IMPLEMENTATION.md` - This documentation

### Modified Files:
1. `/supabase/functions/server/index.tsx` - Added troubleshooting endpoints
2. `/supabase/functions/server/ai_search.tsx` - Added issue detection
3. `/src/app/components/AISearchResults.tsx` - Added troubleshooting hint UI

## Troubleshooting Query Keywords

The system automatically detects these keywords as troubleshooting queries:
- `issue`, `problem`, `error`, `fix`, `broken`, `not working`
- `access`, `denied`, `permission`, `can't`, `cannot`, `unable`
- `missing`, `lost`, `disappeared`, `help`, `troubleshoot`

## Integration with Existing Features

- **AI Search**: Seamlessly integrated with search to detect issues
- **User Management**: Uses existing role system
- **Workspace Access**: Leverages workspace membership system
- **Authentication**: Works with Supabase auth
- **Toast Notifications**: Provides user feedback
- **Modal System**: Consistent UI with other modals

## Success Criteria

✅ Users can describe issues in natural language  
✅ AI accurately diagnoses common problems  
✅ Auto-fix works for appropriate issues  
✅ Admin approval required for sensitive operations  
✅ Non-admin users see clear guidance  
✅ All fixes are logged and auditable  
✅ Fallback works without OpenAI  
✅ UI is intuitive and branded correctly  
✅ Security checks prevent unauthorized access  

## Support

For issues with the troubleshooting system:
1. Check console logs for error messages
2. Verify OpenAI API key is configured
3. Ensure user roles are properly set
4. Contact system administrator if auto-fix fails
