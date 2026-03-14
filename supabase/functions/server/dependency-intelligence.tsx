// Dependency Intelligence Service
import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Test endpoint - NO AUTH
app.get('/test', (c) => {
  console.log('[Dependency Intelligence] Test endpoint hit!');
  return c.json({ 
    success: true, 
    message: 'Dependency Intelligence router is working!',
    timestamp: new Date().toISOString()
  });
});

// Helper function to validate token from custom header
async function validateCustomToken(token: string | undefined): Promise<{ userId: string; email: string } | null> {
  console.log('[Dependency Intelligence] validateCustomToken called');
  console.log('[Dependency Intelligence] Token present:', !!token);
  
  if (!token) {
    console.log('[Dependency Intelligence] ❌ No token in custom header');
    return null;
  }
  
  try {
    console.log('[Dependency Intelligence] Creating Supabase client with ANON_KEY...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    
    console.log('[Dependency Intelligence] Calling supabase.auth.getUser...');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.log('[Dependency Intelligence] ❌ Supabase auth error:', error.message);
      console.log('[Dependency Intelligence] Error details:', JSON.stringify(error));
      return null;
    }
    
    if (!user) {
      console.log('[Dependency Intelligence] ❌ No user returned from Supabase');
      return null;
    }
    
    console.log('[Dependency Intelligence] ✅ Custom token validated for user:', user.id);
    console.log('[Dependency Intelligence] User email:', user.email);
    return {
      userId: user.id,
      email: user.email || 'unknown'
    };
  } catch (e) {
    console.error('[Dependency Intelligence] ❌ Exception during token validation:', e);
    console.error('[Dependency Intelligence] Exception message:', e instanceof Error ? e.message : String(e));
    return null;
  }
}

interface Story {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  storyPoints?: number;
  dependencies?: string[];
  blockedBy?: string[];
  epicId?: string;
  projectId?: string;
  dueDate?: string;
  priority?: string;
}

interface Epic {
  id: string;
  title: string;
  status: string;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  targetDate?: string;
}

interface DependencyChain {
  storyId: string;
  storyTitle: string;
  chainDepth: number;
  dependencies: string[];
  isBlocked: boolean;
  blockedBy: string[];
}

interface DependencyRisk {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  impact: string;
  affectedItems: string[];
  delayEstimate?: number;
}

interface DependencyAlert {
  id: string;
  type: 'delay' | 'blocking' | 'conflict' | 'risk';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedStories: string[];
  suggestedAction: string;
}

interface DependencyGraph {
  nodes: Array<{
    id: string;
    label: string;
    status: string;
    type: 'story' | 'epic' | 'project';
    riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  }>;
  edges: Array<{
    from: string;
    to: string;
    type: 'depends_on' | 'blocks';
    status: 'active' | 'delayed' | 'resolved';
  }>;
}

// Main dependency analysis endpoint
app.post('/analyze', async (c) => {
  console.log('[Dependency Intelligence] ========== ANALYZE ENDPOINT HIT ==========');
  
  try {
    // Log all headers
    const headers = {};
    c.req.raw.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('[Dependency Intelligence] All headers:', JSON.stringify(headers, null, 2));
    
    // Validate using X-Access-Token header
    const customToken = c.req.header('X-Access-Token');
    console.log('[Dependency Intelligence] X-Access-Token present:', !!customToken);
    if (customToken) {
      console.log('[Dependency Intelligence] Token length:', customToken.length);
      console.log('[Dependency Intelligence] Token preview:', customToken.substring(0, 30) + '...');
    }
    
    const auth = await validateCustomToken(customToken);
    if (!auth) {
      console.error('[Dependency Intelligence] ❌ Authentication failed - returning 401');
      return c.json({ code: 401, message: 'Authentication failed' }, 401);
    }
    
    console.log('[Dependency Intelligence] ✅ User authenticated:', auth.userId);

    const { workspaceId, userId } = await c.req.json();

    if (!workspaceId || !userId) {
      return c.json({ error: 'workspaceId and userId required' }, 400);
    }

    // Fetch all projects for workspace
    const projectsData = await kv.getByPrefix(`workspace:${workspaceId}:project:`);
    const projects: Project[] = projectsData.map(p => p.value);

    const allDependencyData = [];

    for (const project of projects) {
      // Fetch project data
      const epicsData = await kv.getByPrefix(`project:${project.id}:epic:`);
      const epics: Epic[] = epicsData.map(e => e.value);

      const storiesData = await kv.getByPrefix(`project:${project.id}:story:`);
      const stories: Story[] = storiesData.map(s => s.value);

      // Analyze dependency chains
      const dependencyChains = detectDependencyChains(stories);

      // Detect blocked work
      const blockedWork = detectBlockedWork(stories, dependencyChains);

      // Identify cross-team conflicts (simulated for demo)
      const conflicts = identifyConflicts(stories, epics);

      // Detect upstream delays
      const delays = detectUpstreamDelays(stories, dependencyChains);

      // Calculate impact
      const impact = calculateDependencyImpact(stories, dependencyChains, blockedWork, delays);

      // Generate dependency graph
      const dependencyGraph = generateDependencyGraph(stories, epics, project);

      // Generate alerts
      const alerts = generateAlerts(blockedWork, delays, conflicts);

      // Generate risks
      const risks = generateRisks(stories, dependencyChains, blockedWork, delays);

      // Recommendations for re-planning
      const recommendations = generateRecommendations(risks, blockedWork, delays);

      allDependencyData.push({
        projectId: project.id,
        projectName: project.name,
        summary: {
          totalDependencies: countTotalDependencies(stories),
          blockedStories: blockedWork.length,
          delayedDependencies: delays.length,
          criticalChains: dependencyChains.filter(dc => dc.chainDepth >= 3).length,
          riskScore: calculateRiskScore(blockedWork, delays, conflicts)
        },
        dependencyChains,
        blockedWork,
        delays,
        conflicts,
        impact,
        dependencyGraph,
        alerts,
        risks,
        recommendations
      });
    }

    return c.json({ dependencyData: allDependencyData });
  } catch (error) {
    console.error('Dependency analysis error:', error);
    return c.json({ error: 'Failed to analyze dependencies', details: error.message }, 500);
  }
});

// Helper functions
function detectDependencyChains(stories: Story[]): DependencyChain[] {
  const chains: DependencyChain[] = [];
  
  stories.forEach(story => {
    if (story.dependencies && story.dependencies.length > 0) {
      const depth = calculateChainDepth(story.id, stories, new Set());
      chains.push({
        storyId: story.id,
        storyTitle: story.title,
        chainDepth: depth,
        dependencies: story.dependencies,
        isBlocked: (story.blockedBy && story.blockedBy.length > 0) || false,
        blockedBy: story.blockedBy || []
      });
    }
  });
  
  return chains.sort((a, b) => b.chainDepth - a.chainDepth);
}

function calculateChainDepth(storyId: string, stories: Story[], visited: Set<string>, depth: number = 0): number {
  if (visited.has(storyId) || depth > 10) return depth;
  visited.add(storyId);
  
  const story = stories.find(s => s.id === storyId);
  if (!story || !story.dependencies || story.dependencies.length === 0) {
    return depth;
  }
  
  let maxDepth = depth;
  story.dependencies.forEach(depId => {
    const depDepth = calculateChainDepth(depId, stories, visited, depth + 1);
    maxDepth = Math.max(maxDepth, depDepth);
  });
  
  return maxDepth;
}

function detectBlockedWork(stories: Story[], chains: DependencyChain[]): Story[] {
  return stories.filter(story => {
    // Check if story has blocking dependencies
    if (story.blockedBy && story.blockedBy.length > 0) {
      // Check if any blocking stories are not done
      const hasActiveBlockers = story.blockedBy.some(blockerId => {
        const blocker = stories.find(s => s.id === blockerId);
        return blocker && blocker.status !== 'Done';
      });
      return hasActiveBlockers;
    }
    return false;
  });
}

function identifyConflicts(stories: Story[], epics: Epic[]): DependencyAlert[] {
  const conflicts: DependencyAlert[] = [];
  
  // Example: Detect when multiple high-priority stories depend on the same resource
  const dependencyMap = new Map<string, string[]>();
  
  stories.forEach(story => {
    if (story.dependencies) {
      story.dependencies.forEach(depId => {
        if (!dependencyMap.has(depId)) {
          dependencyMap.set(depId, []);
        }
        dependencyMap.get(depId)!.push(story.id);
      });
    }
  });
  
  // Find dependencies with multiple dependent stories
  dependencyMap.forEach((dependents, depId) => {
    if (dependents.length >= 2) {
      const depStory = stories.find(s => s.id === depId);
      if (depStory && depStory.status !== 'Done') {
        conflicts.push({
          id: `conflict-${depId}`,
          type: 'conflict',
          severity: dependents.length >= 3 ? 'high' : 'medium',
          title: `Multiple stories depend on ${depStory.title}`,
          description: `${dependents.length} stories are waiting on completion of ${depStory.title}`,
          affectedStories: dependents,
          suggestedAction: 'Prioritize this dependency or parallelize work'
        });
      }
    }
  });
  
  return conflicts;
}

function detectUpstreamDelays(stories: Story[], chains: DependencyChain[]): DependencyAlert[] {
  const delays: DependencyAlert[] = [];
  const today = new Date();
  
  stories.forEach(story => {
    if (story.dependencies && story.dependencies.length > 0 && story.dueDate) {
      story.dependencies.forEach(depId => {
        const depStory = stories.find(s => s.id === depId);
        if (depStory && depStory.status !== 'Done') {
          // Check if dependency is likely delayed
          if (depStory.dueDate) {
            const depDueDate = new Date(depStory.dueDate);
            const storyDueDate = new Date(story.dueDate!);
            
            // If dependency due date is close to or after dependent story's due date
            const daysDiff = Math.ceil((depDueDate.getTime() - storyDueDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff >= -2) { // Within 2 days or after
              const estimatedDelay = Math.max(0, daysDiff + 3);
              delays.push({
                id: `delay-${depId}-${story.id}`,
                type: 'delay',
                severity: estimatedDelay > 5 ? 'critical' : estimatedDelay > 3 ? 'high' : 'medium',
                title: `${depStory.title} is likely delayed`,
                description: `This will impact ${story.title} and may cause ${estimatedDelay} day delay`,
                affectedStories: [story.id],
                suggestedAction: `Expedite ${depStory.title} or adjust timeline for ${story.title}`
              });
            }
          }
        }
      });
    }
  });
  
  return delays;
}

function calculateDependencyImpact(
  stories: Story[], 
  chains: DependencyChain[], 
  blockedWork: Story[], 
  delays: DependencyAlert[]
): {
  totalStoriesAtRisk: number;
  estimatedDelayDays: number;
  criticalPathAffected: boolean;
  milestoneImpact: string[];
} {
  const affectedStoryIds = new Set<string>();
  
  blockedWork.forEach(s => affectedStoryIds.add(s.id));
  delays.forEach(d => d.affectedStories.forEach(id => affectedStoryIds.add(id)));
  
  const totalDelay = delays.reduce((sum, d) => {
    const match = d.description.match(/(\d+) day/);
    return sum + (match ? parseInt(match[1]) : 3);
  }, 0);
  
  const avgDelay = delays.length > 0 ? Math.ceil(totalDelay / delays.length) : 0;
  
  return {
    totalStoriesAtRisk: affectedStoryIds.size,
    estimatedDelayDays: avgDelay,
    criticalPathAffected: chains.some(c => c.chainDepth >= 3 && c.isBlocked),
    milestoneImpact: avgDelay > 5 ? ['Release milestone may slip by 5+ days'] : []
  };
}

function generateDependencyGraph(stories: Story[], epics: Epic[], project: Project): DependencyGraph {
  const nodes = stories.map(story => ({
    id: story.id,
    label: story.title.substring(0, 30),
    status: story.status,
    type: 'story' as const,
    riskLevel: determineRiskLevel(story, stories)
  }));
  
  const edges: DependencyGraph['edges'] = [];
  
  stories.forEach(story => {
    if (story.dependencies) {
      story.dependencies.forEach(depId => {
        const depStory = stories.find(s => s.id === depId);
        edges.push({
          from: story.id,
          to: depId,
          type: 'depends_on',
          status: depStory?.status === 'Done' ? 'resolved' : 'active'
        });
      });
    }
    
    if (story.blockedBy) {
      story.blockedBy.forEach(blockerId => {
        edges.push({
          from: blockerId,
          to: story.id,
          type: 'blocks',
          status: 'active'
        });
      });
    }
  });
  
  return { nodes, edges };
}

function determineRiskLevel(story: Story, allStories: Story[]): 'critical' | 'high' | 'medium' | 'low' | 'none' {
  if (story.blockedBy && story.blockedBy.length > 0) {
    const hasActiveBlockers = story.blockedBy.some(blockerId => {
      const blocker = allStories.find(s => s.id === blockerId);
      return blocker && blocker.status !== 'Done';
    });
    if (hasActiveBlockers) return 'critical';
  }
  
  if (story.dependencies && story.dependencies.length >= 3) return 'high';
  if (story.dependencies && story.dependencies.length >= 1) return 'medium';
  
  return 'none';
}

function generateAlerts(
  blockedWork: Story[], 
  delays: DependencyAlert[], 
  conflicts: DependencyAlert[]
): DependencyAlert[] {
  const alerts: DependencyAlert[] = [...delays, ...conflicts];
  
  // Add blocking alerts
  blockedWork.forEach(story => {
    alerts.push({
      id: `blocked-${story.id}`,
      type: 'blocking',
      severity: 'high',
      title: `${story.title} is blocked`,
      description: `This story cannot progress until dependencies are resolved`,
      affectedStories: [story.id],
      suggestedAction: 'Review and resolve blocking dependencies'
    });
  });
  
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

function generateRisks(
  stories: Story[], 
  chains: DependencyChain[], 
  blockedWork: Story[], 
  delays: DependencyAlert[]
): DependencyRisk[] {
  const risks: DependencyRisk[] = [];
  
  // Risk: Long dependency chains
  const longChains = chains.filter(c => c.chainDepth >= 3);
  if (longChains.length > 0) {
    risks.push({
      severity: 'high',
      type: 'Complex Dependency Chain',
      description: `${longChains.length} stories have dependency chains of 3+ levels`,
      impact: 'Cascading delays if any dependency is delayed',
      affectedItems: longChains.map(c => c.storyId)
    });
  }
  
  // Risk: Blocked work
  if (blockedWork.length > 0) {
    risks.push({
      severity: blockedWork.length >= 5 ? 'critical' : 'high',
      type: 'Blocked Stories',
      description: `${blockedWork.length} stories are currently blocked by dependencies`,
      impact: 'Work cannot proceed, team capacity is wasted',
      affectedItems: blockedWork.map(s => s.id)
    });
  }
  
  // Risk: Upstream delays
  if (delays.length > 0) {
    const criticalDelays = delays.filter(d => d.severity === 'critical');
    if (criticalDelays.length > 0) {
      risks.push({
        severity: 'critical',
        type: 'Upstream Task Delays',
        description: `${criticalDelays.length} critical dependencies are likely delayed`,
        impact: 'Multiple downstream tasks will miss deadlines',
        affectedItems: criticalDelays.flatMap(d => d.affectedStories),
        delayEstimate: 5
      });
    }
  }
  
  return risks;
}

function generateRecommendations(
  risks: DependencyRisk[], 
  blockedWork: Story[], 
  delays: DependencyAlert[]
): Array<{ action: string; impact: string; effort: string }> {
  const recommendations = [];
  
  if (blockedWork.length > 0) {
    recommendations.push({
      action: `Prioritize ${blockedWork.length} blocking dependencies to unblock work`,
      impact: 'Unblock team and restore velocity',
      effort: 'high'
    });
  }
  
  if (delays.length > 0) {
    recommendations.push({
      action: 'Re-plan dependent tasks with adjusted timelines',
      impact: 'Prevent cascade failures and manage expectations',
      effort: 'medium'
    });
  }
  
  const longChainRisk = risks.find(r => r.type === 'Complex Dependency Chain');
  if (longChainRisk) {
    recommendations.push({
      action: 'Break down complex dependency chains into parallel work streams',
      impact: 'Reduce risk of cascading delays',
      effort: 'high'
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      action: 'Continue monitoring dependencies for emerging risks',
      impact: 'Maintain healthy dependency management',
      effort: 'low'
    });
  }
  
  return recommendations;
}

function countTotalDependencies(stories: Story[]): number {
  return stories.reduce((count, story) => {
    return count + (story.dependencies?.length || 0);
  }, 0);
}

function calculateRiskScore(blockedWork: Story[], delays: DependencyAlert[], conflicts: DependencyAlert[]): number {
  let score = 0;
  
  score += blockedWork.length * 15;
  score += delays.filter(d => d.severity === 'critical').length * 20;
  score += delays.filter(d => d.severity === 'high').length * 10;
  score += conflicts.length * 8;
  
  return Math.min(100, score);
}

export default app;
