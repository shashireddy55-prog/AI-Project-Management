// Projify AI Server v7.0 - With Inline ZCPC
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "npm:jose@5";
import * as kv from "./kv_store.tsx";
import { handleAISearch } from "./ai_search.tsx";
import { handleTroubleshooting, confirmAdminFix } from "./ai-troubleshoot.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Access-Token", "X-User-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3acdc7c6/health", (c) => {
  return c.json({ 
    status: "ok",
    version: "7.0-INLINE-ZCPC-FIXED",
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasAnonKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
      hasOpenAiKey: !!Deno.env.get('OPENAI_API_KEY'),
      hasJwtSecret: !!Deno.env.get('SUPABASE_JWT_SECRET') || !!Deno.env.get('JWT_SECRET')
    }
  });
});

// Test endpoint - NO AUTH REQUIRED
app.get("/make-server-3acdc7c6/test-no-auth", (c) => {
  return c.json({ 
    SUCCESS: true,
    VERSION: "6.0",
    MESSAGE: "NEW SERVER CODE IS DEFINITELY RUNNING",
    timestamp: new Date().toISOString()
  });
});

// Another test endpoint with different path
app.get("/make-server-3acdc7c6/ping", (c) => {
  return c.text("PONG v6.0");
});

// Helper function to generate a workspace key (e.g., "Mobile Banking" -> "MB", "Program Management" -> "PM")
function generateWorkspaceKey(name: string): string {
  // Extract capital letters or first letters of each word
  const words = name.trim().split(/\s+/);
  
  // If name has multiple words, use first letter of each word (up to 4)
  if (words.length > 1) {
    return words
      .slice(0, 4)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  }
  
  // If single word, use first 3-4 characters
  return name.substring(0, Math.min(4, name.length)).toUpperCase();
}

// User signup endpoint
app.post("/make-server-3acdc7c6/signup", async (c) => {
  try {
    console.log('🟢 Signup endpoint called');
    const { email, password, name, organizationName, subdomain, industry, teamSize, jobTitle } = await c.req.json();
    console.log(`Email: ${email}, Name: ${name}`);
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    // Check if this is a business signup
    const isBusinessSignup = !!organizationName || !!subdomain;
    console.log(`Signup type: ${isBusinessSignup ? 'Business' : 'Personal'}`);
    
    if (isBusinessSignup) {
      console.log(`Organization: ${organizationName}, Subdomain: ${subdomain}, Industry: ${industry}, Team Size: ${teamSize}, Job Title: ${jobTitle}`);
      
      // Validate business fields
      if (!organizationName || !subdomain) {
        console.log('❌ Missing required business fields');
        return c.json({ error: 'Organization name and subdomain are required for business signup' }, 400);
      }
      
      // Check subdomain availability
      const existingWorkspaces = await kv.getByPrefix('workspace:');
      const takenSubdomains = existingWorkspaces
        .map((ws: any) => ws.value?.subdomain)
        .filter((sd: string) => sd);
      
      if (takenSubdomains.includes(subdomain.toLowerCase())) {
        console.log(`❌ Subdomain ${subdomain} is already taken`);
        return c.json({ error: `Subdomain ${subdomain} is already taken. Please choose a different subdomain.` }, 400);
      }
    }
    
    console.log('Creating Supabase admin client...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    
    console.log('Calling Supabase admin.createUser...');
    
    // Build user metadata
    const userMetadata: any = { name };
    if (isBusinessSignup) {
      userMetadata.accountType = 'business';
      userMetadata.organizationName = organizationName;
      userMetadata.subdomain = subdomain.toLowerCase();
      userMetadata.industry = industry;
      userMetadata.teamSize = teamSize;
      userMetadata.jobTitle = jobTitle;
    } else {
      userMetadata.accountType = 'personal';
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: userMetadata,
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log(`❌ Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    
    // If business signup, store organization info
    if (isBusinessSignup && data.user) {
      const orgData = {
        userId: data.user.id,
        organizationName,
        subdomain: subdomain.toLowerCase(),
        industry,
        teamSize,
        jobTitle,
        fullDomain: `${subdomain.toLowerCase()}.projifyai.com`,
        createdAt: new Date().toISOString()
      };
      await kv.set(`organization:${data.user.id}`, orgData);
      console.log(`✅ Organization data saved for user: ${data.user.id}`);
    }
    
    console.log(`✅ User created successfully: ${data.user?.id}`);
    return c.json({ 
      user: data.user,
      accountType: isBusinessSignup ? 'business' : 'personal',
      organization: isBusinessSignup ? {
        name: organizationName,
        subdomain: subdomain.toLowerCase(),
        fullDomain: `${subdomain.toLowerCase()}.projifyai.com`
      } : null
    });
  } catch (error) {
    console.log(`❌ Signup exception:`, error);
    console.log(`Error type: ${typeof error}`);
    console.log(`Error message: ${error instanceof Error ? error.message : String(error)}`);
    return c.json({ error: error instanceof Error ? error.message : "Signup failed" }, 500);
  }
});

// Helper to decode and validate JWT inline - NO SUPABASE AUTH API CALLS
function validateToken(authHeader: string | undefined): { userId: string; email: string } | null {
  console.log('🔐 validateToken called');
  
  if (!authHeader) {
    console.log('❌ No authorization header');
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts[0] !== 'Bearer' || !parts[1]) {
    console.log('❌ Invalid authorization header format');
    return null;
  }
  
  const accessToken = parts[1];
  console.log('Token length:', accessToken.length);
  console.log('Token (first 20 chars):', accessToken.substring(0, 20));
  
  try {
    const tokenParts = accessToken.split('.');
    if (tokenParts.length !== 3) {
      console.log('❌ Invalid JWT format - expected 3 parts, got', tokenParts.length);
      return null;
    }
    
    console.log('Decoding JWT payload...');
    const bytes = jose.base64url.decode(tokenParts[1]);
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    
    console.log('Token payload:', {
      sub: payload.sub,
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat,
      role: payload.role
    });
    
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < currentTime;
    const timeRemaining = payload.exp - currentTime;
    
    console.log(`Token expiration check: exp=${payload.exp}, now=${currentTime}, expired=${isExpired}, remaining=${timeRemaining}s`);
    
    if (isExpired) {
      console.log('❌ Token is expired!');
      return null;
    }
    
    if (!payload.sub) {
      console.log('❌ No user ID in token');
      return null;
    }
    
    console.log(`✅ Token is valid. User ID: ${payload.sub}, Email: ${payload.email}`);
    return { userId: payload.sub, email: payload.email || 'unknown' };
    
  } catch (e) {
    console.error('❌ Exception during token decode:', e);
    console.error('Error message:', e instanceof Error ? e.message : String(e));
    return null;
  }
}

// Helper function to validate token from custom header
async function validateCustomToken(token: string | undefined): Promise<{ userId: string; email: string } | null> {
  if (!token) {
    console.log('❌ No token in custom header');
    return null;
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('❌ Custom token validation failed:', error?.message || 'No user');
      return null;
    }
    
    console.log('✅ Custom token validated for user:', user.id);
    return {
      userId: user.id,
      email: user.email!
    };
  } catch (error) {
    console.log('❌ Custom token validation error:', error);
    return null;
  }
}

// Get user's workspaces - NOW USING CUSTOM HEADER TO BYPASS PLATFORM JWT CHECK
app.get("/make-server-3acdc7c6/user/workspaces", async (c) => {
  console.log('=== WORKSPACES REQUEST v7.0 - CUSTOM HEADER ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    console.log('Custom token present?', !!customToken);
    
    const auth = await validateCustomToken(customToken);
    if (!auth) {
      console.log('❌ Auth failed');
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const { userId } = auth;
    console.log(`✅ Authenticated user: ${userId}`);
    
    const workspaceIds = await kv.get(`user:${userId}:workspaces`) || [];
    console.log(`Found ${workspaceIds.length} workspace IDs`);
    
    const workspaces = await Promise.all(
      workspaceIds.map((id: string) => kv.get(`workspace:${id}`))
    );
    
    console.log(`Returning ${workspaces.filter(Boolean).length} workspaces`);
    return c.json({ workspaces: workspaces.filter(Boolean) });
  } catch (error) {
    console.error(`Exception: ${error}`);
    return c.json({ error: "Failed to fetch workspaces" }, 500);
  }
});

// Create workspace with AI generation
app.post("/make-server-3acdc7c6/workspace", async (c) => {
  console.log('=== CREATE WORKSPACE REQUEST START [v8.0 - MOCK FALLBACK] ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      console.log('❌ Token validation failed');
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const { userId } = auth;
    console.log(`✅ Authenticated user: ${userId}`);
    
    const { prompt } = await c.req.json();
    console.log('Workspace prompt:', prompt);
    
    // Parse the command to extract project name and type
    // Format: "create [Project Name] workspace with [scrum|kanban] type"
    let parsedName = prompt;
    let parsedType = 'scrum'; // default
    
    const createMatch = prompt.match(/^create\s+(.+?)\s+workspace\s+with\s+(scrum|kanban)\s+type$/i);
    if (createMatch) {
      parsedName = createMatch[1].trim();
      parsedType = createMatch[2].toLowerCase();
      console.log(`Parsed command - Name: "${parsedName}", Type: "${parsedType}"`);
    } else {
      // Fallback: try to clean up the prompt
      parsedName = prompt
        .replace(/^create\s+/i, '')
        .replace(/\s+workspace.*$/i, '')
        .replace(/\s+with\s+(scrum|kanban)\s+type$/i, '')
        .trim();
      console.log(`Fallback parsing - Name: "${parsedName}"`);
    }
    
    // Limit name length
    parsedName = parsedName.substring(0, 100);
    
    // Try to use OpenAI, but fallback to mock data if it fails
    let generated;
    let usingDemoMode = false;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (openaiKey) {
      try {
        console.log('Attempting OpenAI API call...');
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an AI project planner. Create a structured project plan with a project name, 3-5 epics, and 3-5 user stories per epic. Also create Sprint 1 with 5-8 stories. Return valid JSON with this structure: { "workspace": { "name": string }, "project": { "name": string }, "epics": [{ "id": string, "title": string }], "stories": [{ "id": string, "title": string, "epicId": string, "status": "TODO"|"IN_PROGRESS"|"DONE", "sprintId": string|null }], "sprints": [{ "id": string, "name": string }] }'
              },
              {
                role: 'user',
                content: `Create a ${parsedType} project plan for: ${parsedName}. Generate appropriate epics and user stories.`
              }
            ],
            response_format: { type: 'json_object' }
          })
        });
        
        if (openaiResponse.ok) {
          const aiResult = await openaiResponse.json();
          generated = JSON.parse(aiResult.choices[0].message.content);
          // Override workspace and project names with parsed name
          generated.workspace.name = parsedName;
          generated.project.name = parsedName;
          console.log('✅ OpenAI generation successful');
        } else {
          const errorText = await openaiResponse.text();
          
          // Parse error details for better user feedback
          let errorDetails = { type: 'unknown', message: 'OpenAI API error' };
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error) {
              errorDetails = {
                type: errorJson.error.code || errorJson.error.type || 'unknown',
                message: errorJson.error.message || 'OpenAI API error'
              };
              
              // Log specific error types with cleaner messages
              if (errorDetails.type === 'insufficient_quota') {
                console.log('ℹ️  Demo mode active');
              } else {
                console.log(`ℹ️  Demo mode active`);
              }
            }
          } catch (e) {
            // Error text is not JSON
            console.log(`ℹ️  Demo mode active`);
          }
          
          console.log('✓ Using demo mode with sample data');
          generated = null;
          usingDemoMode = true;
        }
      } catch (error) {
        console.log('ℹ️  Demo mode active');
        generated = null;
        usingDemoMode = true;
      }
    }
    
    // Fallback to mock data if OpenAI failed or no API key
    if (!generated) {
      console.log('ℹ️  Generating sample workspace data');
      usingDemoMode = true;
      const epic1 = crypto.randomUUID();
      const epic2 = crypto.randomUUID();
      const epic3 = crypto.randomUUID();
      const sprint1 = crypto.randomUUID();
      
      generated = {
        workspace: { name: parsedName },
        project: { name: parsedName },
        epics: [
          { id: epic1, title: 'User Authentication & Onboarding' },
          { id: epic2, title: 'Core Features Development' },
          { id: epic3, title: 'Testing & Deployment' }
        ],
        sprints: [
          { id: sprint1, name: 'Sprint 1' }
        ],
        stories: [
          { id: crypto.randomUUID(), title: 'Set up user registration flow', epicId: epic1, status: 'TODO', sprintId: sprint1 },
          { id: crypto.randomUUID(), title: 'Implement login authentication', epicId: epic1, status: 'TODO', sprintId: sprint1 },
          { id: crypto.randomUUID(), title: 'Create user dashboard', epicId: epic2, status: 'TODO', sprintId: sprint1 },
          { id: crypto.randomUUID(), title: 'Build main feature interface', epicId: epic2, status: 'TODO', sprintId: sprint1 },
          { id: crypto.randomUUID(), title: 'Add data management', epicId: epic2, status: 'TODO', sprintId: sprint1 },
          { id: crypto.randomUUID(), title: 'Write unit tests', epicId: epic3, status: 'TODO', sprintId: null },
          { id: crypto.randomUUID(), title: 'Perform integration testing', epicId: epic3, status: 'TODO', sprintId: null },
          { id: crypto.randomUUID(), title: 'Deploy to production', epicId: epic3, status: 'TODO', sprintId: null }
        ]
      };
    }
    
    // Create workspace ID
    const workspaceId = crypto.randomUUID();
    const projectId = crypto.randomUUID();
    
    // Generate workspace key
    const workspaceKey = generateWorkspaceKey(parsedName);
    
    // Store in KV
    await kv.set(`workspace:${workspaceId}`, {
      id: workspaceId,
      name: generated.workspace.name,
      key: workspaceKey,
      type: parsedType,
      userId: userId,
      createdAt: new Date().toISOString()
    });
    
    await kv.set(`project:${projectId}`, {
      id: projectId,
      name: generated.project.name,
      workspaceId,
      createdAt: new Date().toISOString()
    });
    
    // Store epics
    for (const epic of generated.epics) {
      const epicId = epic.id || crypto.randomUUID();
      await kv.set(`epic:${epicId}`, {
        id: epicId,
        title: epic.title,
        projectId,
        createdAt: new Date().toISOString()
      });
    }
    
    // Store sprints
    for (const sprint of generated.sprints) {
      const sprintId = sprint.id || crypto.randomUUID();
      await kv.set(`sprint:${sprintId}`, {
        id: sprintId,
        name: sprint.name,
        projectId,
        createdAt: new Date().toISOString()
      });
    }
    
    // Store stories
    for (const story of generated.stories) {
      const storyId = story.id || crypto.randomUUID();
      await kv.set(`story:${storyId}`, {
        id: storyId,
        title: story.title,
        status: story.status || 'TODO',
        projectId,
        epicId: story.epicId,
        sprintId: story.sprintId || null,
        createdAt: new Date().toISOString()
      });
    }
    
    // Store user's workspace list
    const userWorkspacesKey = `user:${userId}:workspaces`;
    const existingWorkspaces = await kv.get(userWorkspacesKey) || [];
    await kv.set(userWorkspacesKey, [...existingWorkspaces, workspaceId]);
    
    console.log(`✅ Workspace created: ${workspaceId}`);
    console.log('=== CREATE WORKSPACE REQUEST END (SUCCESS) ===');
    return c.json({ 
      workspaceId, 
      projectId,
      demoMode: usingDemoMode,
      usingMockData: usingDemoMode 
    });
  } catch (error) {
    console.error(`Workspace creation exception: ${error}`);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    return c.json({ error: "Workspace creation failed" }, 500);
  }
});

// Get workspace data
app.get("/make-server-3acdc7c6/workspace/:id", async (c) => {
  console.log('=== GET WORKSPACE DATA ===');
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const workspaceId = c.req.param('id');
    console.log(`Fetching workspace: ${workspaceId}`);
    const workspace = await kv.get(`workspace:${workspaceId}`);
    
    if (!workspace) {
      console.log('❌ Workspace not found');
      return c.json({ error: 'Workspace not found' }, 404);
    }
    
    console.log(`✓ Found workspace: ${workspace.name}`);
    
    // Get associated project
    const projects = await kv.getByPrefix(`project:`);
    console.log(`Found ${projects.length} total projects`);
    const project = projects.find((p: any) => p.workspaceId === workspaceId);
    
    if (!project) {
      console.log('❌ Project not found for workspace');
      return c.json({ error: 'Project not found' }, 404);
    }
    
    console.log(`✓ Found project: ${project.name} (ID: ${project.id})`);
    
    // Get epics - include both by projectId and workspaceId (for backward compatibility)
    const epics = await kv.getByPrefix(`epic:`);
    console.log(`Found ${epics.length} total epics`);
    const projectEpics = epics.filter((e: any) => 
      e.projectId === project.id || e.workspaceId === workspaceId
    );
    console.log(`✓ Filtered to ${projectEpics.length} epics for this project`);
    
    // Get stories - include both by projectId and workspaceId (for backward compatibility)
    const stories = await kv.getByPrefix(`story:`);
    console.log(`Found ${stories.length} total stories in database`);
    const projectStories = stories.filter((s: any) => 
      s.projectId === project.id || s.workspaceId === workspaceId
    );
    console.log(`✓ Filtered to ${projectStories.length} stories for this project/workspace`);
    
    // Log sample story for debugging
    if (stories.length > 0) {
      const sampleStory = stories[0];
      console.log(`Sample story structure:`, {
        id: sampleStory.id,
        title: sampleStory.title,
        projectId: sampleStory.projectId,
        workspaceId: sampleStory.workspaceId,
        status: sampleStory.status
      });
    }
    
    // Get sprints
    const sprints = await kv.getByPrefix(`sprint:`);
    console.log(`Found ${sprints.length} total sprints`);
    const projectSprints = sprints.filter((s: any) => s.projectId === project.id);
    console.log(`✓ Filtered to ${projectSprints.length} sprints for this project`);
    
    console.log(`=== RETURNING WORKSPACE DATA ===`);
    console.log(`- Epics: ${projectEpics.length}`);
    console.log(`- Stories: ${projectStories.length}`);
    console.log(`- Sprints: ${projectSprints.length}`);
    
    return c.json({
      workspace,
      project,
      epics: projectEpics,
      stories: projectStories,
      sprints: projectSprints
    });
  } catch (error) {
    console.error(`Get workspace exception: ${error}`);
    return c.json({ error: "Failed to get workspace" }, 500);
  }
});

// Create new story
app.post("/make-server-3acdc7c6/story", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const { workspaceId, title, epicId, sprintId, status, description } = await c.req.json();
    
    if (!title || !epicId) {
      return c.json({ error: 'Title and epicId are required' }, 400);
    }
    
    // Get the project associated with this workspace
    const projects = await kv.getByPrefix(`project:`);
    const project = projects.find((p: any) => p.workspaceId === workspaceId);
    
    if (!project) {
      return c.json({ error: 'Project not found for workspace' }, 404);
    }
    
    // Generate unique story ID
    const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newStory = {
      id: storyId,
      title,
      description: description || '',
      epicId,
      sprintId: sprintId || null,
      status: status || 'TODO',
      workspaceId,
      projectId: project.id,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(`story:${storyId}`, newStory);
    
    // Add story to workspace's story list
    const workspaceStoryKey = `workspace:${workspaceId}:stories`;
    const existingStories = await kv.get(workspaceStoryKey) || [];
    await kv.set(workspaceStoryKey, [...existingStories, storyId]);
    
    return c.json({ story: newStory });
  } catch (error) {
    console.error(`Create story exception: ${error}`);
    return c.json({ error: "Failed to create story" }, 500);
  }
});

// Update story (for drag and drop and editing)
app.put("/make-server-3acdc7c6/story/:id", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const storyId = c.req.param('id');
    const updates = await c.req.json();
    
    const story = await kv.get(`story:${storyId}`);
    if (!story) {
      return c.json({ error: 'Story not found' }, 404);
    }
    
    // Merge updates with existing story
    const updatedStory = { 
      ...story, 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await kv.set(`story:${storyId}`, updatedStory);
    
    return c.json({ story: updatedStory });
  } catch (error) {
    console.error(`Update story exception: ${error}`);
    return c.json({ error: "Failed to update story" }, 500);
  }
});

// Delete story
app.delete("/make-server-3acdc7c6/story/:id", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const storyId = c.req.param('id');
    
    const story = await kv.get(`story:${storyId}`);
    if (!story) {
      return c.json({ error: 'Story not found' }, 404);
    }
    
    // Delete the story
    await kv.del(`story:${storyId}`);
    
    // Remove from workspace's story list if it exists
    if (story.workspaceId) {
      const workspaceStoryKey = `workspace:${story.workspaceId}:stories`;
      const existingStories = await kv.get(workspaceStoryKey) || [];
      await kv.set(workspaceStoryKey, existingStories.filter((id: string) => id !== storyId));
    }
    
    return c.json({ success: true, message: 'Story deleted' });
  } catch (error) {
    console.error(`Delete story exception: ${error}`);
    return c.json({ error: "Failed to delete story" }, 500);
  }
});

// Add task to story
app.post("/make-server-3acdc7c6/story/:id/task", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const storyId = c.req.param('id');
    const taskData = await c.req.json();
    
    if (!taskData.summary) {
      return c.json({ error: 'Summary is required' }, 400);
    }
    
    const story = await kv.get(`story:${storyId}`);
    if (!story) {
      return c.json({ error: 'Story not found' }, 404);
    }
    
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTask = {
      id: taskId,
      summary: taskData.summary,
      description: taskData.description || '',
      status: taskData.status || 'TODO',
      startDate: taskData.startDate || null,
      dueDate: taskData.dueDate || null,
      storyId,
      sprintId: taskData.sprintId || null,
      storyPoints: taskData.storyPoints || 0,
      assignee: taskData.assignee || '',
      priority: taskData.priority || 'MEDIUM',
      tags: taskData.tags || [],
      createdAt: new Date().toISOString()
    };
    
    const updatedStory = {
      ...story,
      tasks: [...(story.tasks || []), newTask]
    };
    
    await kv.set(`story:${storyId}`, updatedStory);
    
    return c.json({ story: updatedStory, task: newTask });
  } catch (error) {
    console.error(`Add task exception: ${error}`);
    return c.json({ error: "Failed to add task" }, 500);
  }
});

// Update task
app.put("/make-server-3acdc7c6/story/:storyId/task/:taskId", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const storyId = c.req.param('storyId');
    const taskId = c.req.param('taskId');
    const updates = await c.req.json();
    
    const story = await kv.get(`story:${storyId}`);
    if (!story) {
      return c.json({ error: 'Story not found' }, 404);
    }
    
    const updatedStory = {
      ...story,
      tasks: (story.tasks || []).map((task: any) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    };
    
    await kv.set(`story:${storyId}`, updatedStory);
    
    return c.json({ story: updatedStory });
  } catch (error) {
    console.error(`Update task exception: ${error}`);
    return c.json({ error: "Failed to update task" }, 500);
  }
});

// Delete task
app.delete("/make-server-3acdc7c6/story/:storyId/task/:taskId", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const storyId = c.req.param('storyId');
    const taskId = c.req.param('taskId');
    
    const story = await kv.get(`story:${storyId}`);
    if (!story) {
      return c.json({ error: 'Story not found' }, 404);
    }
    
    const updatedStory = {
      ...story,
      tasks: (story.tasks || []).filter((task: any) => task.id !== taskId)
    };
    
    await kv.set(`story:${storyId}`, updatedStory);
    
    return c.json({ story: updatedStory });
  } catch (error) {
    console.error(`Delete task exception: ${error}`);
    return c.json({ error: "Failed to delete task" }, 500);
  }
});

// Migration endpoint to add projectId to existing stories and epics
app.post("/make-server-3acdc7c6/migrate/add-project-ids", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    console.log('🔄 Starting migration to add projectId to stories and epics...');
    
    // Get all projects
    const projects = await kv.getByPrefix(`project:`);
    console.log(`Found ${projects.length} projects`);
    
    // Get all stories and epics first to log stats
    const allStories = await kv.getByPrefix(`story:`);
    const allEpics = await kv.getByPrefix(`epic:`);
    console.log(`Total stories in database: ${allStories.length}`);
    console.log(`Total epics in database: ${allEpics.length}`);
    
    let storiesUpdated = 0;
    let epicsUpdated = 0;
    
    // For each project, find stories and epics by workspaceId and add projectId
    for (const project of projects) {
      console.log(`\nProcessing project ${project.id} for workspace ${project.workspaceId}`);
      
      // Update stories
      const stories = await kv.getByPrefix(`story:`);
      const workspaceStories = stories.filter((s: any) => s.workspaceId === project.workspaceId);
      const storiesNeedingUpdate = workspaceStories.filter((s: any) => !s.projectId);
      
      console.log(`  Stories for workspace ${project.workspaceId}: ${workspaceStories.length}`);
      console.log(`  Stories needing projectId: ${storiesNeedingUpdate.length}`);
      
      for (const story of stories) {
        // Only update if story belongs to this workspace and doesn't have projectId
        if (story.workspaceId === project.workspaceId && !story.projectId) {
          const updatedStory = {
            ...story,
            projectId: project.id
          };
          await kv.set(`story:${story.id}`, updatedStory);
          storiesUpdated++;
          console.log(`  ✓ Updated story ${story.id} with projectId ${project.id}`);
        }
      }
      
      // Update epics
      const epics = await kv.getByPrefix(`epic:`);
      for (const epic of epics) {
        // Only update if epic belongs to this workspace and doesn't have projectId
        if (epic.workspaceId === project.workspaceId && !epic.projectId) {
          const updatedEpic = {
            ...epic,
            projectId: project.id
          };
          await kv.set(`epic:${epic.id}`, updatedEpic);
          epicsUpdated++;
          console.log(`✓ Updated epic ${epic.id} with projectId ${project.id}`);
        }
      }
    }
    
    console.log(`✅ Migration complete: ${storiesUpdated} stories and ${epicsUpdated} epics updated`);
    
    return c.json({ 
      success: true, 
      message: 'Migration completed successfully',
      storiesUpdated,
      epicsUpdated
    });
  } catch (error) {
    console.error(`Migration exception: ${error}`);
    return c.json({ error: "Migration failed" }, 500);
  }
});

// ============================================
// AI ENDPOINTS
// ============================================

// AI Workspace Creation (Zero-Config Project Creation)
app.post("/make-server-3acdc7c6/ai/create-workspace", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const { userId } = auth;
    const { prompt } = await c.req.json();
    
    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    // Call OpenAI to analyze the prompt and create workspace structure
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const systemPrompt = `You are FlowForge AI, an intelligent project manager that creates complete workspace structures from user descriptions.
Analyze the project requirements and determine:
1. The best workspace type (kanban, scrum, business, or test)
   - Use "test" for QA/Testing teams or test management projects
   - Use "scrum" for agile software development
   - Use "kanban" for continuous flow work
   - Use "business" for general project management
2. A clear workspace name and description
3. Initial project structure with epics and stories

Return ONLY valid JSON in this exact format:
{
  "workspace": {
    "name": "Workspace name",
    "type": "kanban" | "scrum" | "business" | "test",
    "description": "Brief description"
  },
  "project": {
    "name": "Project name",
    "description": "Project description"
  },
  "epics": [
    {
      "title": "Epic title",
      "description": "Epic description",
      "stories": [
        {
          "title": "Story title",
          "description": "Story description",
          "acceptance_criteria": ["criterion 1", "criterion 2"],
          "tasks": ["task 1", "task 2"],
          "storyPoints": 5,
          "priority": "HIGH"
        }
      ]
    }
  ],
  "sprints": [
    {
      "name": "Sprint 1",
      "goal": "Sprint goal"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Check if it's a quota error and return demo mode
      if (response.status === 429 || errorText.includes('quota') || errorText.includes('insufficient_quota')) {
        console.log('ℹ️  Demo mode active - using sample workspace data');
        
        // Return demo mode workspace structure
        const workspaceId = crypto.randomUUID();
        const projectId = crypto.randomUUID();
        
        const workspace = {
          id: workspaceId,
          name: 'Demo Workspace',
          type: 'scrum',
          description: prompt,
          createdAt: new Date().toISOString(),
          userId
        };
        
        const project = {
          id: projectId,
          name: 'Demo Project',
          description: 'Sample project created in demo mode',
          workspaceId,
          createdAt: new Date().toISOString()
        };
        
        // Save workspace and project
        await kv.set(`workspace:${workspaceId}`, workspace);
        await kv.set(`project:${projectId}`, project);
        await kv.set(`workspace:${workspaceId}:project`, projectId);
        
        // Add workspace to user's list
        const userWorkspaces = await kv.get(`user:${userId}:workspaces`) || [];
        userWorkspaces.push(workspaceId);
        await kv.set(`user:${userId}:workspaces`, userWorkspaces);
        
        return c.json({
          workspaceId,
          workspace,
          project,
          epics: [],
          stories: [],
          sprints: [],
          demoMode: true
        });
      }
      
      return c.json({ error: 'Failed to generate workspace structure' }, 500);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    // Parse JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return c.json({ error: 'Invalid AI response format' }, 500);
    }

    // Create workspace, project, epics, stories, and sprints
    const workspaceId = crypto.randomUUID();
    const projectId = crypto.randomUUID();
    
    const workspace = {
      id: workspaceId,
      name: parsedData.workspace.name,
      type: parsedData.workspace.type || 'kanban',
      description: parsedData.workspace.description || '',
      createdAt: new Date().toISOString(),
      userId
    };
    
    const project = {
      id: projectId,
      name: parsedData.project.name,
      description: parsedData.project.description || '',
      workspaceId,
      createdAt: new Date().toISOString()
    };
    
    // Save workspace and project
    await kv.set(`workspace:${workspaceId}`, workspace);
    await kv.set(`project:${projectId}`, project);
    await kv.set(`workspace:${workspaceId}:project`, projectId);
    
    // Add workspace to user's list
    const userWorkspaces = await kv.get(`user:${userId}:workspaces`) || [];
    userWorkspaces.push(workspaceId);
    await kv.set(`user:${userId}:workspaces`, userWorkspaces);
    
    // Create epics, stories, and tasks
    const epicIds: string[] = [];
    const storyIds: string[] = [];
    const sprintIds: string[] = [];
    
    // Create sprints first
    if (parsedData.sprints && parsedData.sprints.length > 0) {
      for (const sprintData of parsedData.sprints) {
        const sprintId = crypto.randomUUID();
        const sprint = {
          id: sprintId,
          name: sprintData.name,
          goal: sprintData.goal || '',
          projectId,
          createdAt: new Date().toISOString()
        };
        await kv.set(`sprint:${sprintId}`, sprint);
        sprintIds.push(sprintId);
      }
    }
    
    // Create epics and stories
    for (const epicData of parsedData.epics) {
      const epicId = crypto.randomUUID();
      const epic = {
        id: epicId,
        title: epicData.title,
        description: epicData.description || '',
        projectId,
        createdAt: new Date().toISOString()
      };
      await kv.set(`epic:${epicId}`, epic);
      epicIds.push(epicId);
      
      // Create stories for this epic
      for (const storyData of epicData.stories) {
        const storyId = crypto.randomUUID();
        const story = {
          id: storyId,
          title: storyData.title,
          description: storyData.description || '',
          epicId,
          projectId,
          status: 'TODO',
          sprintId: sprintIds[0] || null, // Assign to first sprint if available
          storyPoints: storyData.storyPoints || 0,
          priority: storyData.priority || 'MEDIUM',
          createdAt: new Date().toISOString()
        };
        await kv.set(`story:${storyId}`, story);
        storyIds.push(storyId);
        
        // Create tasks for this story
        const taskIds: string[] = [];
        if (storyData.tasks && storyData.tasks.length > 0) {
          for (const taskSummary of storyData.tasks) {
            const taskId = crypto.randomUUID();
            const task = {
              id: taskId,
              summary: taskSummary,
              description: '',
              status: 'TODO',
              storyId,
              sprintId: sprintIds[0] || null,
              createdAt: new Date().toISOString()
            };
            await kv.set(`task:${taskId}`, task);
            taskIds.push(taskId);
          }
        }
        
        // Save task IDs for this story
        await kv.set(`story:${storyId}:tasks`, taskIds);
      }
    }
    
    // Save epic and story IDs
    await kv.set(`project:${projectId}:epics`, epicIds);
    await kv.set(`project:${projectId}:stories`, storyIds);
    await kv.set(`project:${projectId}:sprints`, sprintIds);
    
    return c.json({ 
      workspace,
      project,
      epicCount: epicIds.length,
      storyCount: storyIds.length,
      sprintCount: sprintIds.length,
      message: 'Workspace created successfully with AI-generated structure'
    });
  } catch (error) {
    console.error(`AI workspace creation exception: ${error}`);
    return c.json({ error: "Failed to create AI workspace" }, 500);
  }
});

// AI Work Breakdown Generation
app.post("/make-server-3acdc7c6/ai/work-breakdown", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const { prompt, workspaceId } = await c.req.json();
    
    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }

    // Call OpenAI to generate work breakdown
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const systemPrompt = `You are FlowForge AI, an intelligent project manager that breaks down project requirements into structured work items.
Generate a detailed work breakdown with epics, stories, tasks, and acceptance criteria.
Return ONLY valid JSON in this exact format:
{
  "epics": [
    {
      "title": "Epic title",
      "description": "Epic description",
      "stories": [
        {
          "title": "Story title",
          "description": "Story description",
          "acceptance_criteria": ["criterion 1", "criterion 2"],
          "tasks": ["task 1", "task 2"],
          "dependencies": [],
          "risks": [],
          "storyPoints": 5,
          "priority": "HIGH"
        }
      ]
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Check if it's a quota error and return demo mode
      if (response.status === 429 || errorText.includes('quota') || errorText.includes('insufficient_quota')) {
        console.log('ℹ️  Demo mode active - using sample work breakdown');
        
        // Return demo mode work breakdown
        return c.json({
          epics: [{
            title: 'Demo Epic',
            description: 'Sample epic created in demo mode',
            stories: [{
              title: 'Demo User Story',
              description: 'Sample user story created in demo mode',
              acceptance_criteria: ['Demo criterion 1', 'Demo criterion 2'],
              tasks: ['Demo task 1', 'Demo task 2'],
              dependencies: [],
              risks: [],
              storyPoints: 5,
              priority: 'MEDIUM'
            }]
          }],
          demoMode: true
        });
      }
      
      return c.json({ error: 'Failed to generate work breakdown' }, 500);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    // Parse JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return c.json({ error: 'Invalid AI response format' }, 500);
    }

    return c.json(parsedData);
  } catch (error) {
    console.error(`AI work breakdown exception: ${error}`);
    return c.json({ error: "Failed to generate work breakdown" }, 500);
  }
});

// Approve and persist work breakdown
app.post("/make-server-3acdc7c6/ai/work-breakdown/approve", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const { workspaceId, epics } = await c.req.json();
    
    if (!workspaceId || !epics) {
      return c.json({ error: 'WorkspaceId and epics are required' }, 400);
    }

    // Get the project associated with this workspace
    const projects = await kv.getByPrefix(`project:`);
    const project = projects.find((p: any) => p.workspaceId === workspaceId);
    
    if (!project) {
      return c.json({ error: 'Project not found for workspace' }, 404);
    }

    // Create epics, stories, and tasks
    for (const epic of epics) {
      const epicId = `epic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newEpic = {
        id: epicId,
        title: epic.title,
        description: epic.description,
        projectId: project.id,
        workspaceId,
        createdAt: new Date().toISOString()
      };
      
      await kv.set(`epic:${epicId}`, newEpic);
      
      // Create stories for this epic
      for (const story of epic.stories || []) {
        const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newStory = {
          id: storyId,
          title: story.title,
          description: story.description,
          epicId,
          projectId: project.id,
          workspaceId,
          status: 'TODO',
          storyPoints: story.storyPoints || 0,
          priority: story.priority || 'MEDIUM',
          acceptanceCriteria: story.acceptance_criteria || [],
          createdAt: new Date().toISOString()
        };
        
        // Create tasks for this story
        const tasks = [];
        for (const taskTitle of story.tasks || []) {
          const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          tasks.push({
            id: taskId,
            summary: taskTitle,
            status: 'TODO',
            storyId,
            createdAt: new Date().toISOString()
          });
        }
        
        newStory.tasks = tasks;
        await kv.set(`story:${storyId}`, newStory);
      }
    }

    return c.json({ success: true, message: 'Work breakdown created successfully' });
  } catch (error) {
    console.error(`Approve work breakdown exception: ${error}`);
    return c.json({ error: "Failed to create work breakdown" }, 500);
  }
});

// AI Sprint Health Analysis
app.post("/make-server-3acdc7c6/ai/sprint-health", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const { workspaceId } = await c.req.json();
    
    // Get workspace data
    const stories = await kv.getByPrefix(`story:`);
    const workspaceStories = stories.filter((s: any) => s.workspaceId === workspaceId);
    
    const totalStories = workspaceStories.length;
    const completedStories = workspaceStories.filter((s: any) => s.status === 'DONE').length;
    const inProgressStories = workspaceStories.filter((s: any) => s.status === 'IN_PROGRESS').length;
    const todoStories = workspaceStories.filter((s: any) => s.status === 'TODO').length;
    
    const completionRate = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0;
    
    return c.json({
      type: 'sprint_health',
      confidence: completionRate,
      analysis: `Sprint Health Analysis:\n\n- Total Stories: ${totalStories}\n- Completed: ${completedStories} (${completionRate}%)\n- In Progress: ${inProgressStories}\n- To Do: ${todoStories}\n\nHealth Score: ${completionRate}%`,
      recommendations: [
        completionRate < 50 ? 'Consider breaking down large stories into smaller tasks' : 'Great progress! Keep the momentum going',
        inProgressStories > 5 ? 'High WIP detected. Consider limiting work in progress' : 'WIP levels are healthy',
        todoStories > 10 ? 'Large backlog detected. Prioritize top items' : 'Backlog size is manageable'
      ]
    });
  } catch (error) {
    console.error(`Sprint health analysis exception: ${error}`);
    return c.json({ error: "Failed to analyze sprint health" }, 500);
  }
});

// AI Risk Analysis
app.post("/make-server-3acdc7c6/ai/risk-analysis", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    const { workspaceId } = await c.req.json();
    
    const stories = await kv.getByPrefix(`story:`);
    const workspaceStories = stories.filter((s: any) => s.workspaceId === workspaceId);
    
    const risks = [];
    const totalStories = workspaceStories.length;
    const completedStories = workspaceStories.filter((s: any) => s.status === 'DONE').length;
    const velocity = totalStories > 0 ? (completedStories / totalStories) * 100 : 0;
    
    if (velocity < 30) {
      risks.push('Low velocity detected - delivery timeline at risk');
    }
    
    const blockedStories = workspaceStories.filter((s: any) => s.blocked).length;
    if (blockedStories > 0) {
      risks.push(`${blockedStories} blocked stories requiring attention`);
    }
    
    return c.json({
      type: 'risk_analysis',
      confidence: velocity > 50 ? 75 : 45,
      analysis: `Risk Analysis:\n\nDelivery Confidence: ${Math.round(velocity)}%\nRisk Level: ${velocity > 50 ? 'LOW' : 'MEDIUM'}\n\nKey Metrics:\n- Velocity: ${velocity.toFixed(1)}%\n- Blocked Items: ${blockedStories}`,
      recommendations: risks.length > 0 ? risks : ['No critical risks detected. Continue monitoring progress.']
    });
  } catch (error) {
    console.error(`Risk analysis exception: ${error}`);
    return c.json({ error: "Failed to analyze risks" }, 500);
  }
});

// AI Process Optimization
app.post("/make-server-3acdc7c6/ai/optimization", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    return c.json({
      type: 'optimization',
      confidence: 80,
      analysis: 'Process Optimization Suggestions:\n\n- Implement WIP limits on In Progress column\n- Consider daily standups for better coordination\n- Use story point estimation for better planning',
      recommendations: [
        'Set WIP limit of 3-5 items per person',
        'Break stories larger than 8 points into smaller pieces',
        'Conduct regular retrospectives to identify bottlenecks',
        'Use automated workflows for common transitions'
      ]
    });
  } catch (error) {
    console.error(`Optimization analysis exception: ${error}`);
    return c.json({ error: "Failed to generate optimizations" }, 500);
  }
});

// Get integrations
app.get("/make-server-3acdc7c6/integrations", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    // Return comprehensive integrations list
    const integrations = [
      // Project Management
      { id: 'jira', name: 'Jira', status: 'available', category: 'dev', description: 'Atlassian project tracking' },
      { id: 'asana', name: 'Asana', status: 'available', category: 'productivity', description: 'Team collaboration' },
      { id: 'trello', name: 'Trello', status: 'available', category: 'productivity', description: 'Visual project boards' },
      { id: 'linear', name: 'Linear', status: 'available', category: 'dev', description: 'Modern issue tracking' },
      
      // Code Repositories
      { id: 'github', name: 'GitHub', status: 'available', category: 'dev', description: 'Git repository hosting' },
      { id: 'gitlab', name: 'GitLab', status: 'available', category: 'dev', description: 'DevOps platform' },
      { id: 'bitbucket', name: 'Bitbucket', status: 'available', category: 'dev', description: 'Atlassian Git solution' },
      
      // CI/CD
      { id: 'jenkins', name: 'Jenkins', status: 'available', category: 'dev', description: 'Automation server' },
      { id: 'circleci', name: 'CircleCI', status: 'available', category: 'dev', description: 'Continuous integration' },
      { id: 'github_actions', name: 'GitHub Actions', status: 'available', category: 'dev', description: 'Workflow automation' },
      { id: 'travis', name: 'Travis CI', status: 'available', category: 'dev', description: 'Build and test' },
      { id: 'gitlab_ci', name: 'GitLab CI/CD', status: 'available', category: 'dev', description: 'Built-in CI/CD' },
      
      // Communication
      { id: 'slack', name: 'Slack', status: 'available', category: 'communication', description: 'Team messaging' },
      { id: 'teams', name: 'Microsoft Teams', status: 'available', category: 'communication', description: 'Collaboration hub' },
      { id: 'discord', name: 'Discord', status: 'available', category: 'communication', description: 'Voice & chat' },
      
      // Documentation
      { id: 'confluence', name: 'Confluence', status: 'available', category: 'productivity', description: 'Team wiki' },
      { id: 'notion', name: 'Notion', status: 'available', category: 'productivity', description: 'Connected workspace' },
      
      // Design
      { id: 'figma', name: 'Figma', status: 'available', category: 'design', description: 'Design collaboration' },
      { id: 'sketch', name: 'Sketch', status: 'coming_soon', category: 'design', description: 'Design toolkit' }
    ];

    return c.json({ integrations });
  } catch (error) {
    console.error(`Get integrations exception: ${error}`);
    return c.json({ error: "Failed to get integrations" }, 500);
  }
});

// Connect integration
app.post("/make-server-3acdc7c6/integrations/:id/connect", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const integrationId = c.req.param('id');
    const { workspaceId, config } = await c.req.json();

    // Store integration configuration
    const integrationKey = `integration:${workspaceId}:${integrationId}`;
    await kv.set(integrationKey, {
      integrationId,
      workspaceId,
      config,
      status: 'connected',
      connectedAt: new Date().toISOString()
    });

    return c.json({ success: true, message: 'Integration connected successfully' });
  } catch (error) {
    console.error(`Connect integration exception: ${error}`);
    return c.json({ error: "Failed to connect integration" }, 500);
  }
});

// Disconnect integration
app.post("/make-server-3acdc7c6/integrations/:id/disconnect", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const integrationId = c.req.param('id');
    const { workspaceId } = await c.req.json();

    const integrationKey = `integration:${workspaceId}:${integrationId}`;
    await kv.del(integrationKey);

    return c.json({ success: true, message: 'Integration disconnected successfully' });
  } catch (error) {
    console.error(`Disconnect integration exception: ${error}`);
    return c.json({ error: "Failed to disconnect integration" }, 500);
  }
});

// Get all users
app.get("/make-server-3acdc7c6/users", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const workspaceId = c.req.query('workspaceId');
    
    // Get users for workspace or all users
    const usersData = workspaceId 
      ? await kv.getByPrefix(`workspace_user:${workspaceId}:`)
      : await kv.getByPrefix('user:');
    
    // Return users or default admin user
    const users = usersData.length > 0 ? usersData : [
      {
        id: auth.userId,
        email: auth.email || 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      }
    ];

    return c.json({ users });
  } catch (error) {
    console.error(`Get users exception: ${error}`);
    return c.json({ error: "Failed to get users" }, 500);
  }
});

// Get workspace users
app.get("/make-server-3acdc7c6/workspace/:id/users", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const workspaceId = c.req.param('id');
    
    // Get users for workspace
    const usersData = await kv.getByPrefix(`workspace_user:${workspaceId}:`);
    
    // Return users or default admin user
    const users = usersData.length > 0 ? usersData : [
      {
        id: auth.userId,
        email: auth.email || 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      }
    ];

    return c.json({ users });
  } catch (error) {
    console.error(`Get workspace users exception: ${error}`);
    return c.json({ error: "Failed to get workspace users" }, 500);
  }
});

// Invite user
app.post("/make-server-3acdc7c6/users/invite", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const { email, name, role, workspaceId } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Create user invitation
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userKey = workspaceId ? `workspace_user:${workspaceId}:${userId}` : `user:${userId}`;
    
    const newUser = {
      id: userId,
      email,
      name: name || email,
      role: role || 'developer',
      status: 'invited',
      joinedAt: new Date().toISOString(),
      invitedBy: auth.userId
    };

    await kv.set(userKey, newUser);

    return c.json({ success: true, user: newUser });
  } catch (error) {
    console.error(`Invite user exception: ${error}`);
    return c.json({ error: "Failed to invite user" }, 500);
  }
});

// Invite user to workspace
app.post("/make-server-3acdc7c6/workspace/:id/users/invite", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const workspaceId = c.req.param('id');
    const { email, name, role } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // Create user invitation
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userKey = `workspace_user:${workspaceId}:${userId}`;
    
    const newUser = {
      id: userId,
      email,
      name: name || email,
      role: role || 'developer',
      status: 'invited',
      joinedAt: new Date().toISOString(),
      invitedBy: auth.userId
    };

    await kv.set(userKey, newUser);

    return c.json({ success: true, user: newUser });
  } catch (error) {
    console.error(`Invite user exception: ${error}`);
    return c.json({ error: "Failed to invite user" }, 500);
  }
});

// Update user role
app.put("/make-server-3acdc7c6/users/:userId/role", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const userId = c.req.param('userId');
    const { role, workspaceId } = await c.req.json();

    const userKey = workspaceId ? `workspace_user:${workspaceId}:${userId}` : `user:${userId}`;
    const user = await kv.get(userKey);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedUser = { ...user, role };
    await kv.set(userKey, updatedUser);

    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(`Update user role exception: ${error}`);
    return c.json({ error: "Failed to update user role" }, 500);
  }
});

// Update user role (workspace-specific)
app.put("/make-server-3acdc7c6/workspace/:workspaceId/users/:userId/role", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const workspaceId = c.req.param('workspaceId');
    const userId = c.req.param('userId');
    const { role } = await c.req.json();

    const userKey = `workspace_user:${workspaceId}:${userId}`;
    const user = await kv.get(userKey);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedUser = { ...user, role };
    await kv.set(userKey, updatedUser);

    return c.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error(`Update user role exception: ${error}`);
    return c.json({ error: "Failed to update user role" }, 500);
  }
});

// Remove user
app.delete("/make-server-3acdc7c6/users/:userId", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const userId = c.req.param('userId');
    const workspaceId = c.req.query('workspaceId');

    const userKey = workspaceId ? `workspace_user:${workspaceId}:${userId}` : `user:${userId}`;
    await kv.del(userKey);

    return c.json({ success: true });
  } catch (error) {
    console.error(`Remove user exception: ${error}`);
    return c.json({ error: "Failed to remove user" }, 500);
  }
});

// Remove user from workspace
app.delete("/make-server-3acdc7c6/workspace/:workspaceId/users/:userId", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const workspaceId = c.req.param('workspaceId');
    const userId = c.req.param('userId');

    const userKey = `workspace_user:${workspaceId}:${userId}`;
    await kv.del(userKey);

    return c.json({ success: true });
  } catch (error) {
    console.error(`Remove user exception: ${error}`);
    return c.json({ error: "Failed to remove user" }, 500);
  }
});

// Get teams
app.get("/make-server-3acdc7c6/teams", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const workspaceId = c.req.query('workspaceId');
    
    // Get all teams
    const allTeams = await kv.getByPrefix('team:');
    
    // Filter by workspace if specified
    const teams = workspaceId 
      ? allTeams.filter(team => team.workspaceIds?.includes(workspaceId))
      : allTeams;

    return c.json({ teams });
  } catch (error) {
    console.error(`Get teams exception: ${error}`);
    return c.json({ error: "Failed to get teams" }, 500);
  }
});

// Create team
app.post("/make-server-3acdc7c6/teams", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const { name, description, color, memberIds, workspaceIds } = await c.req.json();

    if (!name) {
      return c.json({ error: 'Team name is required' }, 400);
    }

    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const teamKey = `team:${teamId}`;
    
    const newTeam = {
      id: teamId,
      name,
      description: description || '',
      color: color || 'bg-blue-500',
      memberIds: memberIds || [],
      workspaceIds: workspaceIds || [],
      createdAt: new Date().toISOString(),
      createdBy: auth.userId
    };

    await kv.set(teamKey, newTeam);

    return c.json({ success: true, team: newTeam });
  } catch (error) {
    console.error(`Create team exception: ${error}`);
    return c.json({ error: "Failed to create team" }, 500);
  }
});

// Update team
app.put("/make-server-3acdc7c6/teams/:id", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const teamId = c.req.param('id');
    const { name, description, color, memberIds, workspaceIds } = await c.req.json();

    const teamKey = `team:${teamId}`;
    const team = await kv.get(teamKey);

    if (!team) {
      return c.json({ error: 'Team not found' }, 404);
    }

    const updatedTeam = {
      ...team,
      name: name || team.name,
      description: description !== undefined ? description : team.description,
      color: color || team.color,
      memberIds: memberIds !== undefined ? memberIds : team.memberIds,
      workspaceIds: workspaceIds !== undefined ? workspaceIds : team.workspaceIds,
      updatedAt: new Date().toISOString()
    };

    await kv.set(teamKey, updatedTeam);

    return c.json({ success: true, team: updatedTeam });
  } catch (error) {
    console.error(`Update team exception: ${error}`);
    return c.json({ error: "Failed to update team" }, 500);
  }
});

// Delete team
app.delete("/make-server-3acdc7c6/teams/:id", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const teamId = c.req.param('id');
    const teamKey = `team:${teamId}`;

    await kv.del(teamKey);

    return c.json({ success: true });
  } catch (error) {
    console.error(`Delete team exception: ${error}`);
    return c.json({ error: "Failed to delete team" }, 500);
  }
});

// Assign team to workspace
app.post("/make-server-3acdc7c6/teams/:id/assign-workspace", async (c) => {
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }

    const teamId = c.req.param('id');
    const { workspaceId } = await c.req.json();

    if (!workspaceId) {
      return c.json({ error: 'Workspace ID is required' }, 400);
    }

    const teamKey = `team:${teamId}`;
    const team = await kv.get(teamKey);

    if (!team) {
      return c.json({ error: 'Team not found' }, 404);
    }

    // Add workspace to team if not already assigned
    if (!team.workspaceIds.includes(workspaceId)) {
      team.workspaceIds.push(workspaceId);
      await kv.set(teamKey, team);
    }

    return c.json({ success: true, team });
  } catch (error) {
    console.error(`Assign team to workspace exception: ${error}`);
    return c.json({ error: "Failed to assign team to workspace" }, 500);
  }
});

// Catch-all route for debugging
// ============================================
// WORKSPACES MANAGEMENT ENDPOINTS
// ============================================

// Create workspace (manual, with type)
app.post("/make-server-3acdc7c6/workspaces/create", async (c) => {
  console.log('=== CREATE MANUAL WORKSPACE ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const { userId } = auth;
    const { name, type, description, key } = await c.req.json();
    
    const workspaceId = crypto.randomUUID();
    
    // Generate workspace key if not provided
    const workspaceKey = key || generateWorkspaceKey(name);
    
    const workspace = {
      id: workspaceId,
      name,
      key: workspaceKey,
      type: type || 'kanban',
      description: description || '',
      createdAt: new Date().toISOString(),
      userId
    };
    
    await kv.set(`workspace:${workspaceId}`, workspace);
    
    const userWorkspaces = await kv.get(`user:${userId}:workspaces`) || [];
    userWorkspaces.push(workspaceId);
    await kv.set(`user:${userId}:workspaces`, userWorkspaces);
    
    return c.json({ workspace });
  } catch (error) {
    console.error('Create workspace error:', error);
    return c.json({ error: 'Failed to create workspace' }, 500);
  }
});

// Update workspace settings
app.put("/make-server-3acdc7c6/workspace/:workspaceId/settings", async (c) => {
  console.log('=== UPDATE WORKSPACE SETTINGS ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const workspaceId = c.req.param('workspaceId');
    const settings = await c.req.json();
    
    // Get existing workspace
    const workspace = await kv.get(`workspace:${workspaceId}`);
    if (!workspace) {
      return c.json({ error: 'Workspace not found' }, 404);
    }
    
    // Update workspace with new settings
    const updatedWorkspace = {
      ...workspace,
      // General settings
      name: settings.general?.name || workspace.name,
      description: settings.general?.description || workspace.description,
      key: settings.general?.key || workspace.key,
      visibility: settings.general?.visibility || workspace.visibility,
      defaultAssignee: settings.general?.defaultAssignee || workspace.defaultAssignee,
      
      // Methodology settings
      methodology: {
        ...workspace.methodology,
        type: settings.methodology?.type || workspace.methodology?.type,
        estimationModel: settings.methodology?.estimationModel || workspace.methodology?.estimationModel,
        sprintDuration: settings.methodology?.sprintDuration || workspace.methodology?.sprintDuration,
        startDay: settings.methodology?.startDay || workspace.methodology?.startDay,
      },
      
      // Workflow settings
      workflow: {
        ...workspace.workflow,
        states: settings.workflow?.states || workspace.workflow?.states,
        allowCustomStates: settings.workflow?.allowCustomStates !== undefined 
          ? settings.workflow.allowCustomStates 
          : workspace.workflow?.allowCustomStates,
      },
      
      // Permissions settings
      permissions: {
        ...workspace.permissions,
        allowGuestAccess: settings.permissions?.allowGuestAccess !== undefined
          ? settings.permissions.allowGuestAccess
          : workspace.permissions?.allowGuestAccess,
        requireApprovalForEpics: settings.permissions?.requireApprovalForEpics !== undefined
          ? settings.permissions.requireApprovalForEpics
          : workspace.permissions?.requireApprovalForEpics,
        allowMembersToCreateSprints: settings.permissions?.allowMembersToCreateSprints !== undefined
          ? settings.permissions.allowMembersToCreateSprints
          : workspace.permissions?.allowMembersToCreateSprints,
        allowMembersToInvite: settings.permissions?.allowMembersToInvite !== undefined
          ? settings.permissions.allowMembersToInvite
          : workspace.permissions?.allowMembersToInvite,
      },
      
      // Notifications settings
      notifications: {
        ...workspace.notifications,
        emailNotifications: settings.notifications?.emailNotifications !== undefined
          ? settings.notifications.emailNotifications
          : workspace.notifications?.emailNotifications,
        slackNotifications: settings.notifications?.slackNotifications !== undefined
          ? settings.notifications.slackNotifications
          : workspace.notifications?.slackNotifications,
        assignmentNotifications: settings.notifications?.assignmentNotifications !== undefined
          ? settings.notifications.assignmentNotifications
          : workspace.notifications?.assignmentNotifications,
        sprintNotifications: settings.notifications?.sprintNotifications !== undefined
          ? settings.notifications.sprintNotifications
          : workspace.notifications?.sprintNotifications,
        mentionNotifications: settings.notifications?.mentionNotifications !== undefined
          ? settings.notifications.mentionNotifications
          : workspace.notifications?.mentionNotifications,
      },
      
      // Automation settings
      automation: {
        ...workspace.automation,
        autoAssignIssues: settings.automation?.autoAssignIssues !== undefined
          ? settings.automation.autoAssignIssues
          : workspace.automation?.autoAssignIssues,
        autoCloseCompletedSprints: settings.automation?.autoCloseCompletedSprints !== undefined
          ? settings.automation.autoCloseCompletedSprints
          : workspace.automation?.autoCloseCompletedSprints,
        autoArchiveOldIssues: settings.automation?.autoArchiveOldIssues !== undefined
          ? settings.automation.autoArchiveOldIssues
          : workspace.automation?.autoArchiveOldIssues,
        archiveAfterDays: settings.automation?.archiveAfterDays || workspace.automation?.archiveAfterDays,
      },
      
      // Integrations settings
      integrations: {
        ...workspace.integrations,
        github: settings.integrations?.github !== undefined
          ? settings.integrations.github
          : workspace.integrations?.github,
        slack: settings.integrations?.slack !== undefined
          ? settings.integrations.slack
          : workspace.integrations?.slack,
        jira: settings.integrations?.jira !== undefined
          ? settings.integrations.jira
          : workspace.integrations?.jira,
        confluence: settings.integrations?.confluence !== undefined
          ? settings.integrations.confluence
          : workspace.integrations?.confluence,
      },
      
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`workspace:${workspaceId}`, updatedWorkspace);
    
    console.log(`✅ Workspace settings updated successfully`);
    console.log(`   - Workspace ID: ${workspaceId}`);
    console.log(`   - Name: ${updatedWorkspace.name}`);
    console.log(`   - Key: ${updatedWorkspace.key}`);
    console.log(`   - Methodology: ${updatedWorkspace.methodology?.type}`);
    console.log(`   - Workflow states: ${updatedWorkspace.workflow?.states?.length || 0}`);
    
    return c.json({ 
      success: true, 
      workspace: updatedWorkspace,
      message: 'Workspace settings updated successfully'
    });
  } catch (error) {
    console.error('Update workspace settings error:', error);
    return c.json({ error: 'Failed to update workspace settings' }, 500);
  }
});

// ============================================
// ARTICLES ENDPOINTS
// ============================================

// Get all article spaces for user
app.get("/make-server-3acdc7c6/articles/spaces", async (c) => {
  console.log('=== GET ARTICLE SPACES ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const { userId } = auth;
    const spaceIds = await kv.get(`user:${userId}:article-spaces`) || [];
    
    const spaces = await Promise.all(
      spaceIds.map(async (id: string) => {
        const space = await kv.get(`article-space:${id}`);
        if (space) {
          const pages = await kv.get(`article-space:${id}:pages`) || [];
          return { ...space, pageCount: pages.length };
        }
        return null;
      })
    );
    
    return c.json({ spaces: spaces.filter(Boolean) });
  } catch (error) {
    console.error('Get article spaces error:', error);
    return c.json({ error: 'Failed to fetch article spaces' }, 500);
  }
});

// Create article space
app.post("/make-server-3acdc7c6/articles/spaces", async (c) => {
  console.log('=== CREATE ARTICLE SPACE ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const { userId } = auth;
    const { name, description } = await c.req.json();
    
    const spaceId = crypto.randomUUID();
    const space = {
      id: spaceId,
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      userId,
      pageCount: 0
    };
    
    await kv.set(`article-space:${spaceId}`, space);
    await kv.set(`article-space:${spaceId}:pages`, []);
    
    const userSpaces = await kv.get(`user:${userId}:article-spaces`) || [];
    userSpaces.push(spaceId);
    await kv.set(`user:${userId}:article-spaces`, userSpaces);
    
    return c.json({ space });
  } catch (error) {
    console.error('Create article space error:', error);
    return c.json({ error: 'Failed to create article space' }, 500);
  }
});

// Get pages in a space
app.get("/make-server-3acdc7c6/articles/spaces/:spaceId/pages", async (c) => {
  console.log('=== GET ARTICLE PAGES ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const spaceId = c.req.param('spaceId');
    const pageIds = await kv.get(`article-space:${spaceId}:pages`) || [];
    
    const pages = await Promise.all(
      pageIds.map((id: string) => kv.get(`article-page:${id}`))
    );
    
    return c.json({ pages: pages.filter(Boolean) });
  } catch (error) {
    console.error('Get article pages error:', error);
    return c.json({ error: 'Failed to fetch pages' }, 500);
  }
});

// Create page in a space
app.post("/make-server-3acdc7c6/articles/spaces/:spaceId/pages", async (c) => {
  console.log('=== CREATE ARTICLE PAGE ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const spaceId = c.req.param('spaceId');
    const { title, content } = await c.req.json();
    
    const pageId = crypto.randomUUID();
    const page = {
      id: pageId,
      spaceId,
      title,
      content: content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`article-page:${pageId}`, page);
    
    const spacePages = await kv.get(`article-space:${spaceId}:pages`) || [];
    spacePages.push(pageId);
    await kv.set(`article-space:${spaceId}:pages`, spacePages);
    
    // Update page count in space
    const space = await kv.get(`article-space:${spaceId}`);
    if (space) {
      space.pageCount = spacePages.length;
      await kv.set(`article-space:${spaceId}`, space);
    }
    
    return c.json({ page });
  } catch (error) {
    console.error('Create article page error:', error);
    return c.json({ error: 'Failed to create page' }, 500);
  }
});

// Update page
app.put("/make-server-3acdc7c6/articles/pages/:pageId", async (c) => {
  console.log('=== UPDATE ARTICLE PAGE ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const pageId = c.req.param('pageId');
    const { title, content } = await c.req.json();
    
    const existingPage = await kv.get(`article-page:${pageId}`);
    if (!existingPage) {
      return c.json({ error: 'Page not found' }, 404);
    }
    
    const updatedPage = {
      ...existingPage,
      title,
      content,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`article-page:${pageId}`, updatedPage);
    
    return c.json({ page: updatedPage });
  } catch (error) {
    console.error('Update article page error:', error);
    return c.json({ error: 'Failed to update page' }, 500);
  }
});

// Delete page
app.delete("/make-server-3acdc7c6/articles/pages/:pageId", async (c) => {
  console.log('=== DELETE ARTICLE PAGE ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const pageId = c.req.param('pageId');
    const page = await kv.get(`article-page:${pageId}`);
    
    if (!page) {
      return c.json({ error: 'Page not found' }, 404);
    }
    
    const spaceId = page.spaceId;
    
    // Remove page from space's page list
    const spacePages = await kv.get(`article-space:${spaceId}:pages`) || [];
    const updatedPages = spacePages.filter((id: string) => id !== pageId);
    await kv.set(`article-space:${spaceId}:pages`, updatedPages);
    
    // Update page count
    const space = await kv.get(`article-space:${spaceId}`);
    if (space) {
      space.pageCount = updatedPages.length;
      await kv.set(`article-space:${spaceId}`, space);
    }
    
    // Delete the page
    await kv.del(`article-page:${pageId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete article page error:', error);
    return c.json({ error: 'Failed to delete page' }, 500);
  }
});

// ============================================
// WORKDESK (SERVICE DESK) ENDPOINTS
// ============================================

// Get all tickets for a workspace
app.get("/make-server-3acdc7c6/workdesk/:workspaceId/tickets", async (c) => {
  console.log('=== GET WORKDESK TICKETS ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const workspaceId = c.req.param('workspaceId');
    const ticketIds = await kv.get(`workdesk:${workspaceId}:tickets`) || [];
    
    const tickets = await Promise.all(
      ticketIds.map(async (id: string) => {
        return await kv.get(`workdesk-ticket:${id}`);
      })
    );
    
    return c.json({ tickets: tickets.filter(Boolean) });
  } catch (error) {
    console.error('Get workdesk tickets error:', error);
    return c.json({ error: 'Failed to fetch tickets' }, 500);
  }
});

// Create new ticket
app.post("/make-server-3acdc7c6/workdesk/:workspaceId/tickets", async (c) => {
  console.log('=== CREATE WORKDESK TICKET ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const { userId } = auth;
    const workspaceId = c.req.param('workspaceId');
    const { subject, description, priority, category, requester } = await c.req.json();
    
    const ticketId = crypto.randomUUID();
    const ticketNumber = `WD-${Date.now().toString().slice(-6)}`;
    
    const ticket = {
      id: ticketId,
      ticketNumber,
      subject,
      description: description || '',
      status: 'Open',
      priority: priority || 'Medium',
      category: category || 'General',
      requester: requester || 'User',
      assignee: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workspaceId,
      userId
    };
    
    await kv.set(`workdesk-ticket:${ticketId}`, ticket);
    
    const workspaceTickets = await kv.get(`workdesk:${workspaceId}:tickets`) || [];
    workspaceTickets.push(ticketId);
    await kv.set(`workdesk:${workspaceId}:tickets`, workspaceTickets);
    
    return c.json({ ticket });
  } catch (error) {
    console.error('Create workdesk ticket error:', error);
    return c.json({ error: 'Failed to create ticket' }, 500);
  }
});

// Update ticket
app.put("/make-server-3acdc7c6/workdesk/:workspaceId/tickets/:ticketId", async (c) => {
  console.log('=== UPDATE WORKDESK TICKET ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const ticketId = c.req.param('ticketId');
    const updates = await c.req.json();
    
    const ticket = await kv.get(`workdesk-ticket:${ticketId}`);
    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }
    
    const updatedTicket = {
      ...ticket,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`workdesk-ticket:${ticketId}`, updatedTicket);
    
    return c.json({ ticket: updatedTicket });
  } catch (error) {
    console.error('Update workdesk ticket error:', error);
    return c.json({ error: 'Failed to update ticket' }, 500);
  }
});

// Delete ticket
app.delete("/make-server-3acdc7c6/workdesk/:workspaceId/tickets/:ticketId", async (c) => {
  console.log('=== DELETE WORKDESK TICKET ===');
  
  try {
    const customToken = c.req.header('X-Access-Token');
    const auth = await validateCustomToken(customToken);
    
    if (!auth) {
      return c.json({ error: 'Authentication failed' }, 401);
    }
    
    const workspaceId = c.req.param('workspaceId');
    const ticketId = c.req.param('ticketId');
    
    await kv.del(`workdesk-ticket:${ticketId}`);
    
    const workspaceTickets = await kv.get(`workdesk:${workspaceId}:tickets`) || [];
    const updatedTickets = workspaceTickets.filter((id: string) => id !== ticketId);
    await kv.set(`workdesk:${workspaceId}:tickets`, updatedTickets);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete workdesk ticket error:', error);
    return c.json({ error: 'Failed to delete ticket' }, 500);
  }
});

// Import routes
import importRoutes from './import.tsx';
app.route('/make-server-3acdc7c6/import', importRoutes);

// Settings routes
import settingsRoutes from './settings.tsx';
app.route('/make-server-3acdc7c6/settings', settingsRoutes);

// AI Commands routes
import aiCommandsRoutes from './ai-commands.tsx';
app.route('/make-server-3acdc7c6/ai-commands', aiCommandsRoutes);

// Delivery Intelligence routes
import deliveryIntelligenceRoutes from './delivery-intelligence.tsx';
app.route('/make-server-3acdc7c6/delivery-intelligence', deliveryIntelligenceRoutes);

// Dependency Intelligence routes
import dependencyIntelligenceRoutes from './dependency-intelligence.tsx';
app.route('/make-server-3acdc7c6/dependency-intelligence', dependencyIntelligenceRoutes);

// Dashboard routes
import dashboardRoutes from './dashboard.tsx';
app.route('/make-server-3acdc7c6/dashboard', dashboardRoutes);

// ZCPC routes
import zcpcRoutes from './zcpc.tsx';
app.route('/make-server-3acdc7c6/zcpc', zcpcRoutes);

// Test endpoint to verify ZCPC is loaded
app.get('/make-server-3acdc7c6/zcpc-test', (c) => {
  return c.json({ 
    status: 'ZCPC routes are loaded',
    timestamp: new Date().toISOString()
  });
});

// Subdomain availability check endpoint
app.post('/make-server-3acdc7c6/subdomain/check', async (c) => {
  try {
    const { subdomain } = await c.req.json();
    
    if (!subdomain) {
      return c.json({ error: 'Subdomain is required' }, 400);
    }
    
    // Validate subdomain format (alphanumeric and hyphens only, 3-63 characters)
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
    if (!subdomainRegex.test(subdomain)) {
      return c.json({ 
        available: false, 
        error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens (3-63 characters).'
      }, 400);
    }
    
    // Reserved subdomains
    const reserved = ['www', 'api', 'app', 'admin', 'dashboard', 'mail', 'ftp', 'localhost', 'staging', 'dev', 'test', 'demo'];
    if (reserved.includes(subdomain.toLowerCase())) {
      return c.json({ 
        available: false, 
        message: 'This subdomain is reserved and cannot be used.'
      });
    }
    
    // Check if subdomain is already taken
    const existingWorkspaces = await kv.getByPrefix('workspace:');
    const takenSubdomains = existingWorkspaces
      .map((ws: any) => ws.value?.subdomain)
      .filter((sd: string) => sd);
    
    const isAvailable = !takenSubdomains.includes(subdomain.toLowerCase());
    
    return c.json({ 
      available: isAvailable,
      subdomain: subdomain.toLowerCase(),
      fullDomain: `${subdomain.toLowerCase()}.projifyai.com`,
      message: isAvailable 
        ? `${subdomain}.projifyai.com is available!` 
        : `${subdomain}.projifyai.com is already taken. Please try a different subdomain.`
    });
  } catch (error: any) {
    console.error('Subdomain check error:', error);
    return c.json({ error: 'Failed to check subdomain availability', message: error.message }, 500);
  }
});

// ZCPC Generation Endpoint - INLINE VERSION (BACKUP)
app.post('/make-server-3acdc7c6/zcpc/generate', async (c) => {
  try {
    const { description } = await c.req.json();

    if (!description) {
      return c.json({ error: 'Project description is required' }, 400);
    }

    console.log('ZCPC Generation Request (INLINE):', description);
    
    // Parse the command to extract project name and type
    // Format: "create [Project Name] workspace with [scrum|kanban] type"
    let parsedName = description;
    let parsedType = 'scrum'; // default
    
    // Try multiple parsing patterns
    const createMatch = description.match(/^create\s+(.+?)\s+workspace\s+with\s+(scrum|kanban|agile|waterfall)\s+type$/i);
    const simpleMatch = description.match(/^create\s+(.+?)\s+workspace$/i);
    
    if (createMatch) {
      parsedName = createMatch[1].trim();
      parsedType = createMatch[2].toLowerCase();
      console.log(`✅ ZCPC Parsed command (with type) - Name: "${parsedName}", Type: "${parsedType}"`);
    } else if (simpleMatch) {
      parsedName = simpleMatch[1].trim();
      console.log(`✅ ZCPC Parsed command (simple) - Name: "${parsedName}", Type: "${parsedType}"`);
    } else {
      // Fallback: try to clean up the prompt
      parsedName = description
        .replace(/^create\s+/i, '')
        .replace(/\s+workspace.*$/i, '')
        .replace(/\s+with\s+(scrum|kanban|agile|waterfall).*$/i, '')
        .trim();
      
      // Capitalize first letter of each word
      parsedName = parsedName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
        
      console.log(`⚠️ ZCPC Fallback parsing - Name: "${parsedName}"`);
    }
    
    // Limit name length
    parsedName = parsedName.substring(0, 100);
    
    // Generate workspace key
    const workspaceKey = generateWorkspaceKey(parsedName);
    console.log(`ZCPC Generated workspace key: "${workspaceKey}"`);

    // Check for OpenAI API key
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    // Call OpenAI
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Generate a workspace structure in JSON format with: workspace (name, description, type), industry, methodology (type, estimationModel, sprintCadence), backlog (programs, projects, epics, stories, subtasks with proper parent IDs), capacity (totalPoints, velocity, teamSize), risk (model, risks). Follow hierarchy: Workspace -> Program (optional) -> Project -> Epic -> Story -> Subtask.`
          },
          {
            role: 'user',
            content: `Generate a ${parsedType} workspace named "${parsedName}". Create appropriate programs, projects, epics, stories, and subtasks for this workspace.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      
      // Check if it's a quota error and return demo mode
      if (aiResponse.status === 429 || errorText.includes('quota') || errorText.includes('insufficient_quota')) {
        console.log('ℹ️  Demo mode active - using sample data');
        
        // Return demo mode workspace data
        const workspaceId = crypto.randomUUID();
        const demoDescription = `${parsedName} workspace for ${parsedType} project management`;
        const demoResponse = {
          workspace: {
            id: workspaceId,
            name: parsedName,
            key: workspaceKey,
            type: parsedType,
            description: demoDescription
          },
          industry: { domain: 'Technology', sector: 'Software Development', keywords: ['agile', 'scrum', 'demo'] },
          methodology: { type: 'scrum', estimationModel: 'story_points', sprintCadence: 2 },
          workflow: { 
            states: ['To Do', 'In Progress', 'Code Review', 'Testing', 'Done'], 
            transitions: [
              { from: 'To Do', to: 'In Progress' },
              { from: 'In Progress', to: 'Code Review' },
              { from: 'Code Review', to: 'Testing' },
              { from: 'Testing', to: 'Done' }
            ] 
          },
          backlog: { 
            programs: [], 
            projects: [{
              id: 'project_demo_1',
              name: 'Demo Project',
              description: 'Sample project for demo mode',
              workspaceId
            }], 
            epics: [{
              id: 'epic_demo_1',
              title: 'Demo Epic',
              description: 'Sample epic for demo mode',
              projectId: 'project_demo_1',
              workspaceId
            }], 
            stories: [{
              id: 'story_demo_1',
              title: 'Demo User Story',
              description: 'Sample user story for demo mode',
              epicId: 'epic_demo_1',
              projectId: 'project_demo_1',
              workspaceId,
              storyPoints: 5,
              priority: 'MEDIUM',
              status: 'To Do'
            }], 
            subtasks: [] 
          },
          sprints: { cadence: 2, sprints: [] },
          capacity: { totalPoints: 50, velocity: 25, teamSize: 5 },
          risk: { model: '4-tier', risks: [] },
          stats: {
            programs: 0,
            projects: 1,
            epics: 1,
            stories: 1,
            subtasks: 0
          },
          demoMode: true
        };
        
        return c.json(demoResponse);
      }
      
      return c.json({ error: 'AI generation failed', details: errorText }, 500);
    }

    const completion = await aiResponse.json();
    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      return c.json({ error: 'No content generated' }, 500);
    }

    let zcpcData;
    try {
      zcpcData = JSON.parse(content);
    } catch (parseError: any) {
      console.error('Parse Error:', parseError, 'Content:', content.substring(0, 500));
      return c.json({ error: 'Failed to parse AI response', message: parseError.message }, 500);
    }

    // Build response
    const workspaceId = crypto.randomUUID();
    
    // Generate a clean default description if AI doesn't provide one
    const defaultDescription = `${parsedName} workspace for ${parsedType} project management`;
    
    const response = {
      workspace: {
        id: workspaceId,
        name: parsedName,
        key: workspaceKey,
        type: parsedType,
        description: zcpcData.workspace?.description || defaultDescription
      },
      industry: zcpcData.industry || { domain: 'Technology', sector: 'Software', keywords: [] },
      methodology: {
        type: parsedType,
        estimationModel: zcpcData.methodology?.estimationModel || 'story_points',
        sprintCadence: zcpcData.methodology?.sprintCadence || 2
      },
      workflow: zcpcData.workflow || { states: ['To Do', 'In Progress', 'Done'], transitions: [] },
      backlog: zcpcData.backlog || { programs: [], projects: [], epics: [], stories: [], subtasks: [] },
      sprints: zcpcData.sprints || { cadence: 2, sprints: [] },
      capacity: zcpcData.capacity || { totalPoints: 50, velocity: 25, teamSize: 5 },
      risk: zcpcData.risk || { model: '4-tier', risks: [] },
      stats: {
        programs: zcpcData.backlog?.programs?.length || 0,
        projects: zcpcData.backlog?.projects?.length || 0,
        epics: zcpcData.backlog?.epics?.length || 0,
        stories: zcpcData.backlog?.stories?.length || 0,
        subtasks: zcpcData.backlog?.subtasks?.length || 0
      }
    };

    console.log('ZCPC Success:', response.workspace.name, response.stats);
    return c.json(response);
  } catch (error: any) {
    console.error('ZCPC Error:', error);
    return c.json({ error: 'Failed to generate workspace', message: error.message }, 500);
  }
});

// ============================================
// SPRINT MANAGEMENT
// ============================================

// Create Sprint
app.post("/make-server-3acdc7c6/sprints/create", async (c) => {
  try {
    // Get user token from custom header (Authorization header has ANON_KEY for edge functions)
    const userToken = c.req.header('X-User-Token');
    console.log('🔐 Sprint creation - User token received:', userToken ? 'YES' : 'NO');
    
    // Try to get user from Supabase auth using SERVICE_ROLE_KEY
    let userId = null;
    let userEmail = null;
    
    if (userToken) {
      console.log('User token (first 30 chars):', userToken.substring(0, 30));
      
      try {
        // Use SERVICE_ROLE_KEY to validate the user's JWT token
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        );
        
        const { data: { user }, error } = await supabase.auth.getUser(userToken);
        
        if (error) {
          console.error('❌ Supabase auth error:', error.message);
          console.error('Error details:', JSON.stringify(error, null, 2));
        }
        
        if (user) {
          userId = user.id;
          userEmail = user.email;
          console.log('✅ User authenticated via Supabase:', userId, userEmail);
        } else {
          console.log('⚠️ No user found from token validation');
        }
      } catch (authError) {
        console.error('❌ Auth exception:', authError);
        console.error('Exception type:', typeof authError);
        console.error('Exception message:', authError instanceof Error ? authError.message : String(authError));
      }
    } else {
      console.log('⚠️ No X-User-Token header provided');
    }
    
    if (!userId) {
      console.error('❌ Sprint creation failed: Unauthorized - no valid user found');
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { workspaceId, projectId, sprintName, sprintGoal, startDate, endDate, capacity, selectedStories } = await c.req.json();
    
    console.log('📝 Creating sprint:', { 
      sprintName, 
      workspaceId, 
      projectId,
      startDate,
      endDate,
      capacity,
      storiesCount: selectedStories?.length || 0
    });
    
    if (!sprintName || !sprintGoal || !startDate || !endDate) {
      console.error('❌ Sprint creation failed: Missing required fields', {
        hasName: !!sprintName,
        hasGoal: !!sprintGoal,
        hasStartDate: !!startDate,
        hasEndDate: !!endDate
      });
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Generate sprint ID
    const sprintId = `sprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create sprint object
    const newSprint = {
      id: sprintId,
      name: sprintName,
      goal: sprintGoal,
      startDate,
      endDate,
      capacity: capacity || 40,
      status: 'PLANNED',
      workspaceId,
      projectId,
      createdAt: new Date().toISOString(),
      createdBy: userId
    };
    
    // Save sprint
    await kv.set(`sprint:${sprintId}`, newSprint);
    
    // Update workspace sprints list
    const workspaceSprintsKey = `workspace:${workspaceId}:sprints`;
    const existingSprints = await kv.get(workspaceSprintsKey) || [];
    await kv.set(workspaceSprintsKey, [...existingSprints, sprintId]);
    
    // ✅ UPDATE: Also update the workspace object itself
    const workspace = await kv.get(`workspace:${workspaceId}`);
    if (workspace) {
      const updatedWorkspace = {
        ...workspace,
        sprints: {
          ...workspace.sprints,
          sprints: [...(workspace.sprints?.sprints || []), newSprint]
        }
      };
      await kv.set(`workspace:${workspaceId}`, updatedWorkspace);
      console.log('✅ Workspace object updated with new sprint');
    }
    
    // Update selected stories with sprint ID
    if (selectedStories && Array.isArray(selectedStories)) {
      for (const storyId of selectedStories) {
        const story = await kv.get(`story:${storyId}`);
        if (story) {
          await kv.set(`story:${storyId}`, { ...story, sprintId });
        }
      }
    }
    
    console.log('✅ Sprint created successfully:', sprintId, sprintName);
    
    return c.json({ 
      success: true, 
      sprint: newSprint,
      message: 'Sprint created successfully' 
    });
  } catch (error) {
    console.error('❌ Create sprint error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to create sprint', details: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// AI-powered sprint generation
app.post("/make-server-3acdc7c6/ai/generate-sprint", async (c) => {
  try {
    // AI sprint generation doesn't require strict auth since it's just suggestions
    // Only validate if a token is provided (but don't block if invalid)
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader !== `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`) {
      const auth = validateToken(authHeader);
      if (!auth) {
        console.log('⚠️  Invalid auth token provided, continuing without auth for AI generation');
      }
    }
    
    const { prompt, workspaceId, projectId, sprintNumber, sprintCadence, availableStories } = await c.req.json();
    
    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400);
    }
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.log('⚠️  OpenAI API key not configured, using demo mode');
      console.log('📝 Full prompt:', prompt);
      // Select first 5 stories and calculate their total story points
      const selectedStories = availableStories.slice(0, 5);
      const totalPoints = selectedStories.reduce((sum: number, s: any) => sum + (s.storyPoints || 0), 0);
      const recommendedCapacity = Math.max(totalPoints, 30); // At least 30 points
      
      // Return demo data with full prompt (no truncation)
      return c.json({
        sprintGoal: `Sprint ${sprintNumber}: ${prompt}`,
        suggestedStories: selectedStories.map((s: any) => s.id),
        recommendedCapacity
      });
    }
    
    // Call OpenAI API for sprint planning
    const systemPrompt = `You are an expert Agile sprint planner. Given a user's prompt and available stories, suggest:
1. A clear, focused sprint goal (keep it concise but complete - don't truncate)
2. Which stories to include (by ID) based on priority and coherence
3. Recommended capacity in story points (calculate as sum of selected story points + 20% buffer)

Return ONLY valid JSON in this exact format: { "sprintGoal": "...", "suggestedStories": ["id1", "id2"], "recommendedCapacity": 50 }`;
    
    const userPrompt = `Sprint ${sprintNumber} (${sprintCadence} weeks)
User Request: ${prompt}

Available Stories:
${availableStories.map((s: any) => `- ${s.id}: ${s.title} (${s.storyPoints || 0} pts, ${s.priority || 'MEDIUM'})`).join('\n')}

Suggest 3-6 stories that align with the user's focus and can be completed in ${sprintCadence} weeks. Calculate recommendedCapacity as the total story points of selected stories plus a 20% buffer.`;
    
    console.log('🤖 Calling OpenAI API for sprint planning...');
    
    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: "json_object" }
        }),
      });
      
      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        
        // Check if it's a quota error - use demo mode gracefully
        if (openaiResponse.status === 429 || errorText.includes('quota') || errorText.includes('insufficient_quota')) {
          console.log('ℹ️  OpenAI quota exceeded - using demo mode with intelligent defaults');
          
          // Return demo data immediately (no need to throw error)
          const selectedStories = availableStories.slice(0, 5);
          const totalPoints = selectedStories.reduce((sum: number, s: any) => sum + (s.storyPoints || 0), 0);
          const recommendedCapacity = Math.max(totalPoints, 30);
          
          return c.json({
            sprintGoal: `Sprint ${sprintNumber}: ${prompt}`,
            suggestedStories: selectedStories.map((s: any) => s.id),
            recommendedCapacity
          });
        }
        
        // For other errors, log and continue to fallback
        console.error('❌ OpenAI API Error:', errorText);
        throw new Error('OpenAI API request failed');
      }
      
      const openaiData = await openaiResponse.json();
      const aiResponse = openaiData.choices[0].message.content;
      
      console.log('✅ OpenAI Response received:', aiResponse);
      
      // Parse JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed AI result:', result);
        return c.json(result);
      }
      
      // Fallback if parsing fails (use full prompt)
      console.log('⚠️  JSON parsing failed, using fallback');
      const selectedStories = availableStories.slice(0, 5);
      const totalPoints = selectedStories.reduce((sum: number, s: any) => sum + (s.storyPoints || 0), 0);
      const recommendedCapacity = Math.max(totalPoints, 30);
      
      return c.json({
        sprintGoal: `Sprint ${sprintNumber}: ${prompt}`,
        suggestedStories: selectedStories.map((s: any) => s.id),
        recommendedCapacity
      });
      
    } catch (openaiError) {
      console.log('ℹ️  Demo mode active - using intelligent defaults based on available stories');
      // Only log actual errors (not quota issues which are handled above)
      if (!(openaiError instanceof Error && openaiError.message === 'OpenAI API request failed')) {
        console.log('Reason:', openaiError);
      }
      
      // Fallback to demo mode with full prompt (no truncation)
      const selectedStories = availableStories.slice(0, 5);
      const totalPoints = selectedStories.reduce((sum: number, s: any) => sum + (s.storyPoints || 0), 0);
      const recommendedCapacity = Math.max(totalPoints, 30);
      
      return c.json({
        sprintGoal: `Sprint ${sprintNumber}: ${prompt}`,
        suggestedStories: selectedStories.map((s: any) => s.id),
        recommendedCapacity
      });
    }
    
  } catch (error) {
    console.error('AI sprint generation error:', error);
    return c.json({ error: 'Failed to generate sprint plan' }, 500);
  }
});

// ============================================
// AI TICKET CREATION
// ============================================

// Create Ticket with AI
app.post("/make-server-3acdc7c6/ai/create-ticket", async (c) => {
  try {
    const { description, context, workspaceId } = await c.req.json();
    
    if (!description) {
      return c.json({ error: 'Description is required' }, 400);
    }
    
    console.log('AI Ticket Creation Request:', { description, context, workspaceId });
    
    // Check for OpenAI API key
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }
    
    // Call OpenAI to generate ticket details
    const systemPrompt = `You are an AI assistant that helps create detailed project management tickets.
Based on the user's description, generate a comprehensive ticket with the following structure:
{
  "type": "epic" | "story" | "subtask",
  "title": "brief, clear title",
  "description": "detailed description",
  "acceptanceCriteria": ["criterion 1", "criterion 2", ...],
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "storyPoints": number (1-21),
  "tags": ["tag1", "tag2", ...],
  "subtasks": [{"title": "...", "description": "..."}] (only for stories/epics)
}

Determine the appropriate ticket type based on scope:
- Epic: Large feature or initiative that spans multiple sprints
- Story: User-facing feature deliverable in 1-2 sprints
- Subtask: Technical task or sub-component of a story

Return ONLY valid JSON.`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Create a ticket for: ${description}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      })
    });

    // Handle OpenAI errors (including quota exceeded)
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      
      // Check if it's a quota error
      if (aiResponse.status === 429 || errorText.includes('quota')) {
        // Return demo mode data
        const demoTicket = {
          type: 'story',
          title: 'Sample User Story (Demo Mode)',
          description: description,
          acceptanceCriteria: [
            'User can complete the main action',
            'UI is responsive and accessible',
            'Error handling is implemented'
          ],
          priority: 'MEDIUM',
          storyPoints: 5,
          tags: ['demo', 'ai-generated'],
          subtasks: []
        };
        
        return c.json({
          ...demoTicket,
          id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          demoMode: true,
          createdAt: new Date().toISOString()
        });
      }
      
      return c.json({ error: 'AI generation failed', details: errorText }, aiResponse.status);
    }

    const completion = await aiResponse.json();
    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      return c.json({ error: 'No content generated' }, 500);
    }

    let ticketData;
    try {
      ticketData = JSON.parse(content);
    } catch (parseError: any) {
      console.error('Parse Error:', parseError, 'Content:', content.substring(0, 500));
      return c.json({ error: 'Failed to parse AI response', message: parseError.message }, 500);
    }

    // Generate ticket ID
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Build response
    const ticket = {
      id: ticketId,
      type: ticketData.type || 'story',
      title: ticketData.title || 'Untitled Ticket',
      description: ticketData.description || description,
      acceptanceCriteria: ticketData.acceptanceCriteria || [],
      priority: ticketData.priority || 'MEDIUM',
      storyPoints: ticketData.storyPoints || 3,
      tags: ticketData.tags || ['ai-generated'],
      subtasks: ticketData.subtasks || [],
      status: 'To Do',
      createdAt: new Date().toISOString(),
      createdBy: 'ai',
      workspaceId: workspaceId || null
    };

    // Optionally store in KV if workspaceId is provided
    if (workspaceId) {
      const ticketKey = `workspace:${workspaceId}:ticket:${ticketId}`;
      await kv.set(ticketKey, ticket);
      
      // Add to workspace tickets list
      const workspaceTickets = await kv.get(`workspace:${workspaceId}:tickets`) || [];
      workspaceTickets.push(ticketId);
      await kv.set(`workspace:${workspaceId}:tickets`, workspaceTickets);
    }

    console.log('AI Ticket Created:', ticket.title);
    return c.json(ticket);
    
  } catch (error: any) {
    console.error('AI ticket creation error:', error);
    return c.json({ error: 'Failed to create ticket', message: error.message }, 500);
  }
});

// ============================================
// AI SEARCH ENDPOINT
// ============================================
app.post("/make-server-3acdc7c6/ai-search", async (c) => {
  return await handleAISearch(c);
});

// ============================================
// AI TROUBLESHOOTING ENDPOINTS
// ============================================
app.post("/make-server-3acdc7c6/ai-troubleshoot", async (c) => {
  return await handleTroubleshooting(c);
});

app.post("/make-server-3acdc7c6/ai-troubleshoot/confirm-fix", async (c) => {
  return await confirmAdminFix(c);
});

// ============================================
// STORY/TICKET CRUD ENDPOINTS
// ============================================

// Update Story/Ticket
app.put("/make-server-3acdc7c6/stories/:id", async (c) => {
  try {
    const storyId = c.req.param('id');
    const updateData = await c.req.json();
    
    console.log('📝 Updating story:', storyId, updateData);

    // Get existing story
    const existingStory = await kv.get(`story:${storyId}`);
    if (!existingStory) {
      return c.json({ error: 'Story not found' }, 404);
    }

    // Update story with new data
    const updatedStory = {
      ...existingStory,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`story:${storyId}`, updatedStory);
    
    console.log('✅ Story updated successfully');
    return c.json(updatedStory);
  } catch (error) {
    console.error('❌ Update story error:', error);
    return c.json({ error: 'Failed to update story' }, 500);
  }
});

// Delete Story/Ticket
app.delete("/make-server-3acdc7c6/stories/:id", async (c) => {
  try {
    const storyId = c.req.param('id');
    
    console.log('🗑️ Deleting story:', storyId);

    // Check if story exists
    const existingStory = await kv.get(`story:${storyId}`);
    if (!existingStory) {
      return c.json({ error: 'Story not found' }, 404);
    }

    // Delete the story
    await kv.del(`story:${storyId}`);
    
    console.log('✅ Story deleted successfully');
    return c.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('❌ Delete story error:', error);
    return c.json({ error: 'Failed to delete story' }, 500);
  }
});

// ============================================
// EPIC CRUD ENDPOINTS
// ============================================

// Update Epic
app.put("/make-server-3acdc7c6/epics/:id", async (c) => {
  try {
    const epicId = c.req.param('id');
    const updateData = await c.req.json();
    
    console.log('📝 Updating epic:', epicId, updateData);

    // Get existing epic
    const existingEpic = await kv.get(`epic:${epicId}`);
    if (!existingEpic) {
      return c.json({ error: 'Epic not found' }, 404);
    }

    // Update epic with new data
    const updatedEpic = {
      ...existingEpic,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`epic:${epicId}`, updatedEpic);
    
    console.log('✅ Epic updated successfully');
    return c.json(updatedEpic);
  } catch (error) {
    console.error('❌ Update epic error:', error);
    return c.json({ error: 'Failed to update epic' }, 500);
  }
});

// Delete Epic
app.delete("/make-server-3acdc7c6/epics/:id", async (c) => {
  try {
    const epicId = c.req.param('id');
    
    console.log('🗑️ Deleting epic:', epicId);

    // Check if epic exists
    const existingEpic = await kv.get(`epic:${epicId}`);
    if (!existingEpic) {
      return c.json({ error: 'Epic not found' }, 404);
    }

    // Unlink all stories from this epic
    const allStories = await kv.getByPrefix('story:');
    for (const story of allStories) {
      if (story.epicId === epicId) {
        await kv.set(`story:${story.id}`, { ...story, epicId: null });
      }
    }

    // Delete the epic
    await kv.del(`epic:${epicId}`);
    
    console.log('✅ Epic deleted successfully');
    return c.json({ success: true, message: 'Epic deleted successfully' });
  } catch (error) {
    console.error('❌ Delete epic error:', error);
    return c.json({ error: 'Failed to delete epic' }, 500);
  }
});

// ============================================
// WORKSPACE UPDATE ENDPOINT
// ============================================

// Update Workspace
app.put("/make-server-3acdc7c6/workspaces/:id", async (c) => {
  try {
    const workspaceId = c.req.param('id');
    const updateData = await c.req.json();
    
    console.log('📝 Updating workspace:', workspaceId, updateData);

    // Get access token
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get existing workspace
    const workspaceKey = `workspace:${user.id}:${workspaceId}`;
    const existingWorkspace = await kv.get(workspaceKey);
    
    if (!existingWorkspace) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    // Update workspace with new data
    const updatedWorkspace = {
      ...existingWorkspace,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(workspaceKey, updatedWorkspace);
    
    console.log('✅ Workspace updated successfully');
    return c.json(updatedWorkspace);
  } catch (error) {
    console.error('❌ Update workspace error:', error);
    return c.json({ error: 'Failed to update workspace' }, 500);
  }
});

// ============================================
// CUSTOM FIELDS ENDPOINTS
// ============================================

// Get custom fields for a workspace
app.get("/make-server-3acdc7c6/workspaces/:id/custom-fields", async (c) => {
  try {
    const workspaceId = c.req.param('id');
    
    // Get access token
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get custom fields
    const customFieldsKey = `custom-fields:workspace:${workspaceId}`;
    const customFields = await kv.get(customFieldsKey);
    
    return c.json({ customFields: customFields || [] });
  } catch (error) {
    console.error('❌ Get custom fields error:', error);
    return c.json({ error: 'Failed to get custom fields' }, 500);
  }
});

// Create custom field
app.post("/make-server-3acdc7c6/workspaces/:id/custom-fields", async (c) => {
  try {
    const workspaceId = c.req.param('id');
    const fieldData = await c.req.json();
    
    // Get access token
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get existing custom fields
    const customFieldsKey = `custom-fields:workspace:${workspaceId}`;
    const existingFields = await kv.get(customFieldsKey) || [];

    // Create new field
    const newField = {
      id: `cf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...fieldData,
      createdAt: new Date().toISOString()
    };

    const updatedFields = [...existingFields, newField];
    await kv.set(customFieldsKey, updatedFields);
    
    return c.json({ customField: newField });
  } catch (error) {
    console.error('❌ Create custom field error:', error);
    return c.json({ error: 'Failed to create custom field' }, 500);
  }
});

// Update custom field
app.put("/make-server-3acdc7c6/workspaces/:id/custom-fields/:fieldId", async (c) => {
  try {
    const workspaceId = c.req.param('id');
    const fieldId = c.req.param('fieldId');
    const updateData = await c.req.json();
    
    // Get access token
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get existing custom fields
    const customFieldsKey = `custom-fields:workspace:${workspaceId}`;
    const existingFields = await kv.get(customFieldsKey) || [];

    // Update field
    const updatedFields = existingFields.map((field: any) =>
      field.id === fieldId
        ? { ...field, ...updateData, updatedAt: new Date().toISOString() }
        : field
    );

    await kv.set(customFieldsKey, updatedFields);
    
    const updatedField = updatedFields.find((f: any) => f.id === fieldId);
    return c.json({ customField: updatedField });
  } catch (error) {
    console.error('❌ Update custom field error:', error);
    return c.json({ error: 'Failed to update custom field' }, 500);
  }
});

// Delete custom field
app.delete("/make-server-3acdc7c6/workspaces/:id/custom-fields/:fieldId", async (c) => {
  try {
    const workspaceId = c.req.param('id');
    const fieldId = c.req.param('fieldId');
    
    // Get access token
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get existing custom fields
    const customFieldsKey = `custom-fields:workspace:${workspaceId}`;
    const existingFields = await kv.get(customFieldsKey) || [];

    // Remove field
    const updatedFields = existingFields.filter((field: any) => field.id !== fieldId);
    await kv.set(customFieldsKey, updatedFields);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Delete custom field error:', error);
    return c.json({ error: 'Failed to delete custom field' }, 500);
  }
});

// AI Generate Script for Custom Field
app.post("/make-server-3acdc7c6/ai/generate-script", async (c) => {
  try {
    const body = await c.req.json();
    const { description, fieldName } = body;

    console.log('🤖 Generating script for custom field:', fieldName);

    // Get access token
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Use OpenAI to generate the script
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const prompt = `You are an expert at creating computed field scripts for project management tools.

Generate a JavaScript function that will be used as a custom field script for: "${fieldName}"

Description: ${description}

The function should:
1. Accept a 'context' parameter that contains: { story, epic, workspace, customFields }
2. Return the computed value based on the description
3. Be clean, efficient, and well-commented
4. Handle edge cases gracefully

Return ONLY the JavaScript function code, no explanations.

Example format:
function(context) {
  // Your code here
  return result;
}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert JavaScript developer specializing in creating computed field scripts for project management tools.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('❌ OpenAI API error:', error);
      return c.json({ error: 'Failed to generate script' }, 500);
    }

    const openaiData = await openaiResponse.json();
    const script = openaiData.choices[0]?.message?.content?.trim() || '';

    console.log('✅ Script generated successfully');
    return c.json({ script });
  } catch (error) {
    console.error('❌ Generate script error:', error);
    return c.json({ error: 'Failed to generate script' }, 500);
  }
});

// Delete Workspace
app.delete("/make-server-3acdc7c6/workspaces/:id", async (c) => {
  try {
    const workspaceId = c.req.param('id');
    
    console.log('🗑️ Deleting workspace:', workspaceId);

    // Get access token
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get workspace key
    const workspaceKey = `workspace:${user.id}:${workspaceId}`;
    const existingWorkspace = await kv.get(workspaceKey);
    
    if (!existingWorkspace) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    // Delete all associated stories
    const allStories = await kv.getByPrefix('story:');
    for (const story of allStories) {
      if (story.workspaceId === workspaceId) {
        await kv.del(`story:${story.id}`);
      }
    }

    // Delete all associated epics
    const allEpics = await kv.getByPrefix('epic:');
    for (const epic of allEpics) {
      if (epic.workspaceId === workspaceId) {
        await kv.del(`epic:${epic.id}`);
      }
    }

    // Delete the workspace
    await kv.del(workspaceKey);
    
    console.log('✅ Workspace and all associated data deleted successfully');
    return c.json({ success: true, message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('❌ Delete workspace error:', error);
    return c.json({ error: 'Failed to delete workspace' }, 500);
  }
});

// ============================================
// 404 HANDLER - MUST BE LAST!
// ============================================
app.all("*", (c) => {
  console.log('❓ Unmatched route:', c.req.method, c.req.url);
  return c.json({
    error: "Not found",
    method: c.req.method,
    url: c.req.url,
    path: c.req.path,
    message: "This route doesn't exist. Server version 7.0 is running."
  }, 404);
});

Deno.serve(app.fetch);
