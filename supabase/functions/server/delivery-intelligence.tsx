// Predictive Delivery Intelligence Service
import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Test endpoint - NO AUTH
app.get('/test', (c) => {
  console.log('[Delivery Intelligence] Test endpoint hit!');
  return c.json({ 
    success: true, 
    message: 'Delivery Intelligence router is working!',
    timestamp: new Date().toISOString()
  });
});

// Helper function to validate token from custom header (matches main server pattern)
async function validateCustomToken(token: string | undefined): Promise<{ userId: string; email: string } | null> {
  console.log('[Delivery Intelligence] validateCustomToken called');
  console.log('[Delivery Intelligence] Token present:', !!token);
  
  if (!token) {
    console.log('[Delivery Intelligence] ❌ No token in custom header');
    return null;
  }
  
  try {
    console.log('[Delivery Intelligence] Creating Supabase client with ANON_KEY...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    console.log('[Delivery Intelligence] Calling supabase.auth.getUser...');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.log('[Delivery Intelligence] ❌ Supabase auth error:', error.message);
      console.log('[Delivery Intelligence] Error details:', JSON.stringify(error));
      return null;
    }
    
    if (!user) {
      console.log('[Delivery Intelligence] ❌ No user returned from Supabase');
      return null;
    }
    
    console.log('[Delivery Intelligence] ✅ Custom token validated for user:', user.id);
    console.log('[Delivery Intelligence] User email:', user.email);
    return {
      userId: user.id,
      email: user.email || 'unknown'
    };
  } catch (e) {
    console.error('[Delivery Intelligence] ❌ Exception during token validation:', e);
    console.error('[Delivery Intelligence] Exception message:', e instanceof Error ? e.message : String(e));
    return null;
  }
}

// Main prediction endpoint
app.post('/predict', async (c) => {
  console.log('[Delivery Intelligence] ========== PREDICT ENDPOINT HIT ==========');
  
  try {
    // Log all headers
    const headers = {};
    c.req.raw.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('[Delivery Intelligence] All headers:', JSON.stringify(headers, null, 2));
    
    // Validate using X-Access-Token header (matches main server pattern)
    const customToken = c.req.header('X-Access-Token');
    console.log('[Delivery Intelligence] X-Access-Token present:', !!customToken);
    if (customToken) {
      console.log('[Delivery Intelligence] Token length:', customToken.length);
      console.log('[Delivery Intelligence] Token preview:', customToken.substring(0, 30) + '...');
    }
    
    const auth = await validateCustomToken(customToken);
    if (!auth) {
      console.error('[Delivery Intelligence] ❌ Authentication failed - returning 401');
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    console.log('[Delivery Intelligence] ✅ User authenticated:', auth.userId);

    const { workspaceId, userId } = await c.req.json();

    if (!workspaceId || !userId) {
      return c.json({ error: 'workspaceId and userId required' }, 400);
    }

    // Fetch all projects for workspace
    const projectsData = await kv.getByPrefix(`workspace:${workspaceId}:project:`);
    const projects: Project[] = projectsData.map(p => p.value);

    const predictions = [];

    for (const project of projects) {
      // Fetch project data
      const epicsData = await kv.getByPrefix(`project:${project.id}:epic:`);
      const epics: Epic[] = epicsData.map(e => e.value);

      const storiesData = await kv.getByPrefix(`project:${project.id}:story:`);
      const stories: Story[] = storiesData.map(s => s.value);

      const sprintsData = await kv.getByPrefix(`project:${project.id}:sprint:`);
      const sprints: Sprint[] = sprintsData.map(s => s.value);

      // Calculate metrics
      const velocity = calculateVelocity(stories, sprints);
      const totalStories = stories.length;
      const completedStories = stories.filter(s => s.status === 'Done').length;
      const completion = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0;

      const remainingStories = stories.filter(s => s.status !== 'Done');
      const remainingPoints = remainingStories.reduce((sum, s) => sum + (s.storyPoints || 3), 0);

      const currentDate = new Date();
      const prediction = predictCompletionDate(remainingPoints, velocity, currentDate);

      // Calculate variance from target
      let daysVariance = 0;
      if (project.targetDate) {
        const targetDate = new Date(project.targetDate);
        const predictedDate = new Date(prediction.date);
        daysVariance = Math.ceil((predictedDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      const onTrack = daysVariance <= 0;

      // Analyze risks
      const risks = analyzeRisks(stories, velocity, project.targetDate, prediction.date);

      // Generate recommendations
      const recommendations = generateRecommendations(risks, remainingPoints);

      // Calculate sprint health
      const currentSprint = sprints.find(s => s.status === 'Active');
      const sprintHealth = calculateSprintHealth(stories, currentSprint);

      // Identify critical path
      const criticalPath = identifyCriticalPath(stories, epics);

      // Calculate confidence (based on data quality and velocity consistency)
      const confidence = Math.min(95, Math.max(50, 75 + (velocity > 0 ? 10 : -10) + (stories.length > 10 ? 10 : -10)));

      predictions.push({
        projectId: project.id,
        projectName: project.name,
        currentStatus: {
          completion,
          velocity,
          sprintsRemaining: prediction.sprintsNeeded
        },
        forecast: {
          expectedCompletionDate: prediction.date,
          confidence,
          daysVariance,
          onTrack
        },
        risks,
        recommendations,
        criticalPath,
        sprintHealth
      });
    }

    return c.json({ predictions });
  } catch (error) {
    console.error('Prediction error:', error);
    return c.json({ error: 'Failed to generate predictions', details: error.message }, 500);
  }
});

// Simulate scenario endpoint
app.post('/simulate', async (c) => {
  try {
    const { projectId, scenario } = await c.req.json();

    // scenario could be: { addResources: 2, removeScope: 20, improveVelocity: 1.3 }
    
    const storiesData = await kv.getByPrefix(`project:${projectId}:story:`);
    const stories: Story[] = storiesData.map(s => s.value);

    const sprintsData = await kv.getByPrefix(`project:${projectId}:sprint:`);
    const sprints: Sprint[] = sprintsData.map(s => s.value);

    let baseVelocity = calculateVelocity(stories, sprints);
    let remainingPoints = stories
      .filter(s => s.status !== 'Done')
      .reduce((sum, s) => sum + (s.storyPoints || 3), 0);

    // Apply scenario modifications
    if (scenario.improveVelocity) {
      baseVelocity = Math.round(baseVelocity * scenario.improveVelocity);
    }
    if (scenario.addResources) {
      baseVelocity += scenario.addResources * 5; // Each resource adds ~5 points per sprint
    }
    if (scenario.removeScope) {
      remainingPoints = Math.max(0, remainingPoints - scenario.removeScope);
    }

    const prediction = predictCompletionDate(remainingPoints, baseVelocity, new Date());

    return c.json({
      scenario,
      prediction: {
        expectedDate: prediction.date,
        sprintsNeeded: prediction.sprintsNeeded,
        velocity: baseVelocity,
        remainingPoints
      }
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return c.json({ error: 'Failed to simulate scenario' }, 500);
  }
});

export default app;