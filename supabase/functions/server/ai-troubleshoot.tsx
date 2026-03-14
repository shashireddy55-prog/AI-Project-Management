// AI Troubleshooting Handler for Projify AI
import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

interface TroubleshootRequest {
  query: string;
  workspaceId?: string;
  userId?: string;
  userRole?: string;
  context?: any;
}

interface IssueDiagnosis {
  issueType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requiresAdmin: boolean;
  autoFixable: boolean;
  recommendedActions: string[];
}

interface FixResult {
  success: boolean;
  message: string;
  details?: any;
  requiresAdminApproval?: boolean;
}

export async function handleTroubleshooting(c: Context) {
  try {
    const { query, workspaceId, context } = await c.req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return c.json({ error: "Troubleshooting query is required" }, 400);
    }

    console.log('🔧 AI Troubleshooting Request:', { query, workspaceId });

    // Get user from token
    let userId = null;
    let userRole = 'developer'; // Default role
    let isAdmin = false;

    try {
      const authHeader = c.req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
        if (token !== anonKey) {
          const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          );
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            userId = user.id;
            // Get user role
            const userData = await kv.get(`user:${userId}`);
            if (userData) {
              userRole = userData.role || 'developer';
              isAdmin = userRole === 'admin';
            }
          }
        }
      }
    } catch (e) {
      console.log('Proceeding without user context:', e);
    }

    // Diagnose the issue using AI
    const diagnosis = await diagnoseIssue(query, workspaceId, userId, context);
    
    console.log('📋 Issue Diagnosis:', diagnosis);

    // Check if user has permission to fix the issue
    if (diagnosis.requiresAdmin && !isAdmin) {
      return c.json({
        success: false,
        diagnosis,
        message: '⚠️ Admin access required to fix this issue.',
        canFix: false,
        requiresAdminApproval: true,
        userRole,
        isAdmin
      });
    }

    // If auto-fixable, attempt to fix
    let fixResult: FixResult | null = null;
    if (diagnosis.autoFixable) {
      if (diagnosis.requiresAdmin && isAdmin) {
        // Admin can fix, but show warning first
        fixResult = {
          success: false,
          message: '⚠️ This action requires admin privileges and will make system-wide changes. Please confirm to proceed.',
          requiresAdminApproval: true
        };
      } else if (!diagnosis.requiresAdmin) {
        // Non-admin action, can fix automatically
        fixResult = await attemptAutoFix(diagnosis, workspaceId, userId);
      }
    }

    return c.json({
      success: true,
      diagnosis,
      fixResult,
      canFix: diagnosis.autoFixable && (!diagnosis.requiresAdmin || isAdmin),
      requiresAdminApproval: diagnosis.requiresAdmin,
      userRole,
      isAdmin,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Troubleshooting error:', error);
    return c.json({ 
      success: false,
      error: "Troubleshooting failed. Please try again or contact support.",
      timestamp: new Date().toISOString()
    }, 500);
  }
}

// Confirm and execute admin fix
export async function confirmAdminFix(c: Context) {
  try {
    const { diagnosis, workspaceId, userId } = await c.req.json();

    // Verify admin access
    let isAdmin = false;
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
      if (token !== anonKey) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          const userData = await kv.get(`user:${user.id}`);
          isAdmin = userData?.role === 'admin';
        }
      }
    }

    if (!isAdmin) {
      return c.json({ 
        success: false, 
        error: 'Admin access required to confirm this action' 
      }, 403);
    }

    // Execute the fix
    const fixResult = await attemptAutoFix(diagnosis, workspaceId, userId);

    return c.json({
      success: true,
      fixResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Admin fix confirmation error:', error);
    return c.json({ 
      success: false,
      error: "Failed to execute fix. Please try again.",
      timestamp: new Date().toISOString()
    }, 500);
  }
}

// Diagnose the issue using AI
async function diagnoseIssue(
  query: string, 
  workspaceId?: string, 
  userId?: string,
  context?: any
): Promise<IssueDiagnosis> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  // Gather system context
  const systemContext = await gatherSystemContext(workspaceId, userId);

  if (openaiApiKey) {
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an intelligent troubleshooting assistant for Projify AI, a project management platform.

Analyze the user's issue and provide a diagnosis. Common issues include:
- Access/Permission issues (can't view workspace, can't edit tickets, etc.)
- Data issues (missing data, corrupted data, sync issues)
- Configuration issues (wrong settings, missing integrations)
- User account issues (login problems, role issues, team membership)
- Workspace issues (can't create, can't delete, visibility issues)

Return your response as a JSON object with these fields:
{
  "issueType": string (e.g., "access_denied", "missing_data", "configuration_error", "user_role_issue", "workspace_visibility"),
  "severity": "low" | "medium" | "high" | "critical",
  "description": string (clear explanation of the issue),
  "requiresAdmin": boolean (true if admin privileges needed to fix),
  "autoFixable": boolean (true if can be automatically fixed),
  "recommendedActions": [string] (array of recommended actions)
}

System context: ${JSON.stringify(systemContext, null, 2)}`
            },
            {
              role: 'user',
              content: `Issue: "${query}"\n\nAdditional context: ${JSON.stringify(context || {}, null, 2)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        })
      });

      if (openaiResponse.ok) {
        const aiData = await openaiResponse.json();
        const diagnosis = JSON.parse(aiData.choices[0].message.content);
        return diagnosis;
      }
    } catch (error) {
      console.warn('⚠️ OpenAI diagnosis failed, using pattern matching:', error);
    }
  }

  // Fallback: Pattern-based diagnosis
  return patternBasedDiagnosis(query, systemContext);
}

// Pattern-based diagnosis (fallback when AI is not available)
function patternBasedDiagnosis(query: string, systemContext: any): IssueDiagnosis {
  const queryLower = query.toLowerCase();

  // Access/Permission issues
  if (queryLower.includes('access') || queryLower.includes('permission') || 
      queryLower.includes('denied') || queryLower.includes("can't view") ||
      queryLower.includes("cannot access")) {
    return {
      issueType: 'access_denied',
      severity: 'high',
      description: 'You may not have the required permissions to access this resource. This could be due to your role or workspace membership.',
      requiresAdmin: true,
      autoFixable: true,
      recommendedActions: [
        'Check your workspace membership',
        'Verify your user role (current: ' + (systemContext.userRole || 'unknown') + ')',
        'Contact an admin to grant access',
        'Request to be added to the workspace'
      ]
    };
  }

  // Login/Authentication issues
  if (queryLower.includes('login') || queryLower.includes('sign in') || 
      queryLower.includes('authenticate') || queryLower.includes('logged out')) {
    return {
      issueType: 'authentication_issue',
      severity: 'critical',
      description: 'There may be an issue with your authentication session or credentials.',
      requiresAdmin: false,
      autoFixable: true,
      recommendedActions: [
        'Try logging out and logging back in',
        'Clear browser cache and cookies',
        'Check if your account is active',
        'Reset your password if needed'
      ]
    };
  }

  // Data/Content issues
  if (queryLower.includes('missing') || queryLower.includes('not showing') || 
      queryLower.includes('disappeared') || queryLower.includes('lost data') ||
      queryLower.includes('empty')) {
    return {
      issueType: 'missing_data',
      severity: 'medium',
      description: 'Data may be missing due to sync issues, filters, or accidental deletion.',
      requiresAdmin: false,
      autoFixable: true,
      recommendedActions: [
        'Check if filters are applied',
        'Verify workspace selection',
        'Check if data was archived or deleted',
        'Try refreshing the page'
      ]
    };
  }

  // Role/Permission configuration
  if (queryLower.includes('role') || queryLower.includes('admin') || 
      queryLower.includes('permissions') || queryLower.includes('privileges')) {
    return {
      issueType: 'user_role_issue',
      severity: 'high',
      description: 'There may be an issue with your user role or permissions configuration.',
      requiresAdmin: true,
      autoFixable: true,
      recommendedActions: [
        'Check current role: ' + (systemContext.userRole || 'unknown'),
        'Contact admin to update role',
        'Verify workspace permissions',
        'Review role-based access control settings'
      ]
    };
  }

  // Workspace visibility/access
  if (queryLower.includes('workspace') && (queryLower.includes('see') || 
      queryLower.includes('find') || queryLower.includes('missing'))) {
    return {
      issueType: 'workspace_visibility',
      severity: 'medium',
      description: 'Workspace may not be visible due to access restrictions or filtering.',
      requiresAdmin: false,
      autoFixable: true,
      recommendedActions: [
        'Check if you are a member of the workspace',
        'Verify workspace filters',
        'Check workspace status (active/archived)',
        'Request workspace access from admin'
      ]
    };
  }

  // Settings/Configuration issues
  if (queryLower.includes('setting') || queryLower.includes('config') || 
      queryLower.includes('not working') || queryLower.includes('broken')) {
    return {
      issueType: 'configuration_error',
      severity: 'medium',
      description: 'There may be a configuration issue affecting functionality.',
      requiresAdmin: true,
      autoFixable: true,
      recommendedActions: [
        'Check system settings',
        'Verify workspace configuration',
        'Reset to default settings if needed',
        'Contact admin for configuration review'
      ]
    };
  }

  // Generic fallback
  return {
    issueType: 'general_issue',
    severity: 'low',
    description: 'General issue detected. May require manual investigation.',
    requiresAdmin: false,
    autoFixable: false,
    recommendedActions: [
      'Try refreshing the page',
      'Clear browser cache',
      'Check console for errors',
      'Contact support with details of the issue'
    ]
  };
}

// Attempt to automatically fix the issue
async function attemptAutoFix(
  diagnosis: IssueDiagnosis, 
  workspaceId?: string, 
  userId?: string
): Promise<FixResult> {
  console.log('🔧 Attempting auto-fix for:', diagnosis.issueType);

  switch (diagnosis.issueType) {
    case 'access_denied':
    case 'workspace_visibility':
      return await fixAccessIssue(workspaceId, userId);

    case 'user_role_issue':
      return await fixRoleIssue(userId);

    case 'missing_data':
      return await fixMissingData(workspaceId, userId);

    case 'configuration_error':
      return await fixConfigurationIssue(workspaceId, userId);

    case 'authentication_issue':
      return await fixAuthIssue(userId);

    default:
      return {
        success: false,
        message: 'This issue requires manual intervention. Please contact support.',
        details: diagnosis
      };
  }
}

// Fix access/visibility issues
async function fixAccessIssue(workspaceId?: string, userId?: string): Promise<FixResult> {
  if (!workspaceId || !userId) {
    return {
      success: false,
      message: 'Workspace ID and User ID required to fix access issues.'
    };
  }

  try {
    // Check if user is a member of the workspace
    const workspaceUserKey = `workspace_user:${workspaceId}:${userId}`;
    const existingMembership = await kv.get(workspaceUserKey);

    if (!existingMembership) {
      // Add user to workspace with developer role
      const workspaceUser = {
        id: userId,
        workspaceId,
        role: 'developer',
        status: 'active',
        joinedAt: new Date().toISOString()
      };
      await kv.set(workspaceUserKey, workspaceUser);

      return {
        success: true,
        message: '✅ Access granted! You have been added to the workspace as a developer.',
        details: { role: 'developer', workspaceId }
      };
    }

    // User is already a member, check if active
    if (existingMembership.status !== 'active') {
      existingMembership.status = 'active';
      await kv.set(workspaceUserKey, existingMembership);

      return {
        success: true,
        message: '✅ Your workspace access has been reactivated.',
        details: existingMembership
      };
    }

    return {
      success: true,
      message: 'You already have access to this workspace. Try refreshing the page.',
      details: existingMembership
    };

  } catch (error) {
    console.error('Error fixing access issue:', error);
    return {
      success: false,
      message: 'Failed to fix access issue. Please contact an administrator.'
    };
  }
}

// Fix role-related issues
async function fixRoleIssue(userId?: string): Promise<FixResult> {
  if (!userId) {
    return {
      success: false,
      message: 'User ID required to fix role issues.',
      requiresAdminApproval: true
    };
  }

  try {
    const userKey = `user:${userId}`;
    const user = await kv.get(userKey);

    if (!user) {
      return {
        success: false,
        message: 'User not found. Please contact an administrator.'
      };
    }

    // Check if user has a valid role
    const validRoles = ['admin', 'project_manager', 'developer', 'designer', 'qa', 'stakeholder'];
    if (!user.role || !validRoles.includes(user.role)) {
      user.role = 'developer'; // Set default role
      await kv.set(userKey, user);

      return {
        success: true,
        message: '✅ Your role has been set to Developer. Contact admin to change your role.',
        details: { role: 'developer' }
      };
    }

    return {
      success: true,
      message: `Your current role is: ${user.role}. Contact admin if you need a different role.`,
      details: { role: user.role }
    };

  } catch (error) {
    console.error('Error fixing role issue:', error);
    return {
      success: false,
      message: 'Failed to fix role issue. Please contact an administrator.'
    };
  }
}

// Fix missing data issues
async function fixMissingData(workspaceId?: string, userId?: string): Promise<FixResult> {
  try {
    if (!workspaceId) {
      return {
        success: false,
        message: 'Please specify which workspace has missing data.'
      };
    }

    // Check if workspace exists
    const workspace = await kv.get(`workspace:${workspaceId}`);
    if (!workspace) {
      return {
        success: false,
        message: 'Workspace not found. It may have been deleted or you may not have access.'
      };
    }

    // Verify data integrity
    const stories = await kv.getByPrefix(`story:`);
    const epics = await kv.getByPrefix(`epic:`);
    const workspaceStories = stories.filter((s: any) => s.workspaceId === workspaceId);
    const workspaceEpics = epics.filter((e: any) => e.workspaceId === workspaceId);

    return {
      success: true,
      message: `✅ Data check complete. Found ${workspaceStories.length} stories and ${workspaceEpics.length} epics. Try refreshing the page or clearing filters.`,
      details: {
        workspace: workspace.name,
        storiesCount: workspaceStories.length,
        epicsCount: workspaceEpics.length
      }
    };

  } catch (error) {
    console.error('Error fixing missing data:', error);
    return {
      success: false,
      message: 'Failed to verify data. Please try refreshing the page.'
    };
  }
}

// Fix configuration issues
async function fixConfigurationIssue(workspaceId?: string, userId?: string): Promise<FixResult> {
  try {
    // Get global settings
    const globalSettings = await kv.get('global:settings') || {};

    // Ensure AI is enabled
    if (globalSettings.aiEnabled === false) {
      return {
        success: false,
        message: 'AI features are disabled in global settings. This requires admin access to enable.',
        requiresAdminApproval: true
      };
    }

    if (workspaceId) {
      // Check workspace settings
      const workspaceSettings = await kv.get(`workspace:${workspaceId}:settings`) || {};
      
      // Reset to default if corrupted
      const defaultSettings = {
        workspaceAiEnabled: true,
        notifications: true,
        autoAssign: false,
        ...workspaceSettings
      };

      await kv.set(`workspace:${workspaceId}:settings`, defaultSettings);

      return {
        success: true,
        message: '✅ Workspace settings have been verified and corrected if needed.',
        details: defaultSettings
      };
    }

    return {
      success: true,
      message: '✅ Configuration checked. Settings appear to be correct.',
      details: globalSettings
    };

  } catch (error) {
    console.error('Error fixing configuration:', error);
    return {
      success: false,
      message: 'Failed to fix configuration. Please contact an administrator.'
    };
  }
}

// Fix authentication issues
async function fixAuthIssue(userId?: string): Promise<FixResult> {
  return {
    success: false,
    message: 'Authentication issues require you to log out and log back in. If the problem persists, please reset your password.',
    details: {
      actions: [
        'Log out from the system',
        'Clear browser cache and cookies',
        'Log back in with your credentials',
        'If still failing, use password reset'
      ]
    }
  };
}

// Gather system context for better diagnosis
async function gatherSystemContext(workspaceId?: string, userId?: string) {
  const context: any = {
    timestamp: new Date().toISOString(),
    hasWorkspaceId: !!workspaceId,
    hasUserId: !!userId
  };

  try {
    if (userId) {
      const user = await kv.get(`user:${userId}`);
      context.userRole = user?.role || 'unknown';
      context.userStatus = user?.status || 'unknown';
    }

    if (workspaceId) {
      const workspace = await kv.get(`workspace:${workspaceId}`);
      context.workspaceExists = !!workspace;
      context.workspaceName = workspace?.name || 'unknown';

      if (userId) {
        const membership = await kv.get(`workspace_user:${workspaceId}:${userId}`);
        context.isMember = !!membership;
        context.membershipRole = membership?.role || 'none';
      }
    }

    // Check global settings
    const globalSettings = await kv.get('global:settings');
    context.aiEnabled = globalSettings?.aiEnabled !== false;

  } catch (error) {
    console.error('Error gathering system context:', error);
  }

  return context;
}
