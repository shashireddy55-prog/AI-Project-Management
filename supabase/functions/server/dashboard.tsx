import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Get dashboard statistics
app.get('/stats', async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all workspaces to calculate stats
    const workspaces = await kv.getByPrefix('workspace:workspace_');
    
    let totalTasks = 0;
    let completedToday = 0;
    let activeSprints = 0;
    const teamMembersSet = new Set();

    const today = new Date().toISOString().split('T')[0];

    // Calculate stats across all workspaces
    for (const workspace of workspaces) {
      // Get workspace tasks
      const taskIds = await kv.get(`workspace:${workspace.id}:tasks`) || [];
      totalTasks += taskIds.length;

      // Count completed tasks today
      for (const taskId of taskIds) {
        const task = await kv.get(`workspace:${workspace.id}:task:${taskId}`);
        if (task) {
          if (task.status === 'Done' && task.updatedAt?.startsWith(today)) {
            completedToday++;
          }
          if (task.assignee) {
            teamMembersSet.add(task.assignee);
          }
          if (task.reporter) {
            teamMembersSet.add(task.reporter);
          }
        }
      }

      // Count active sprints
      const sprints = await kv.getByPrefix(`workspace:${workspace.id}:sprint:`);
      activeSprints += sprints.filter((s: any) => s.status === 'active').length;
    }

    // Calculate productivity score (simplified)
    const productivity = totalTasks > 0 
      ? Math.min(100, Math.round((completedToday / Math.max(1, totalTasks * 0.1)) * 100))
      : 85;

    const stats = {
      totalTasks,
      completedToday,
      activeSprints,
      teamMembers: teamMembersSet.size,
      productivity
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return c.json({ 
      stats: {
        totalTasks: 0,
        completedToday: 0,
        activeSprints: 0,
        teamMembers: 0,
        productivity: 85
      }
    });
  }
});

// Get AI-powered insight
app.get('/insight', async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if AI is enabled
    const settings = await kv.get('global:settings');
    const aiEnabled = settings?.aiEnabled !== false;

    if (!aiEnabled) {
      return c.json({ 
        insight: "Enable AI in settings to receive personalized insights and recommendations."
      });
    }

    // Get workspace data for context
    const workspaces = await kv.getByPrefix('workspace:workspace_');
    
    let totalTasks = 0;
    let completedTasks = 0;
    let highPriorityTasks = 0;
    let blockedTasks = 0;

    for (const workspace of workspaces) {
      const taskIds = await kv.get(`workspace:${workspace.id}:tasks`) || [];
      totalTasks += taskIds.length;

      for (const taskId of taskIds) {
        const task = await kv.get(`workspace:${workspace.id}:task:${taskId}`);
        if (task) {
          if (task.status === 'Done') completedTasks++;
          if (task.priority === 'HIGH' || task.priority === 'High') highPriorityTasks++;
          if (task.blocked) blockedTasks++;
        }
      }
    }

    // Generate insight using OpenAI
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are FlowForge AI, providing brief, actionable insights. Respond in one concise sentence with a specific recommendation.'
              },
              {
                role: 'user',
                content: `Workspace stats: ${totalTasks} total tasks, ${completedTasks} completed, ${highPriorityTasks} high priority, ${blockedTasks} blocked. Provide one actionable insight.`
              }
            ],
            temperature: 0.7,
            max_tokens: 100
          })
        });

        if (response.ok) {
          const data = await response.json();
          const insight = data.choices[0]?.message?.content;
          if (insight) {
            return c.json({ insight });
          }
        }
      } catch (aiError) {
        console.error('AI insight generation error:', aiError);
      }
    }

    // Fallback insights based on stats
    const insights = [];
    
    if (totalTasks === 0) {
      insights.push("Your workspace is ready! Create your first project to get started with AI-powered project management.");
    } else {
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0;
      
      if (completionRate > 80) {
        insights.push(`Excellent work! You've completed ${completionRate.toFixed(0)}% of tasks. Consider starting a new sprint to maintain momentum.`);
      } else if (completionRate > 50) {
        insights.push(`You're making good progress with ${completionRate.toFixed(0)}% completion. Focus on high-priority items to boost efficiency.`);
      } else {
        insights.push(`${highPriorityTasks} high-priority tasks need attention. Break them into smaller chunks for faster progress.`);
      }
    }

    if (blockedTasks > 0) {
      insights.push(`⚠️ ${blockedTasks} blocked tasks detected. Review dependencies to unblock your team.`);
    }

    if (highPriorityTasks > 5) {
      insights.push(`You have ${highPriorityTasks} high-priority tasks. Consider delegating or reprioritizing to avoid overwhelm.`);
    }

    const selectedInsight = insights[Math.floor(Math.random() * insights.length)];
    
    return c.json({ insight: selectedInsight });
  } catch (error) {
    console.error('Dashboard insight error:', error);
    return c.json({ 
      insight: "Welcome to your AI-powered workspace! Create projects, assign tasks, and let AI optimize your workflow."
    });
  }
});

// Get recent activity
app.get('/activity', async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const activities = [];
    const workspaces = await kv.getByPrefix('workspace:workspace_');

    // Get recent activity from all workspaces
    for (const workspace of workspaces.slice(0, 5)) {
      const taskIds = await kv.get(`workspace:${workspace.id}:tasks`) || [];
      
      for (const taskId of taskIds.slice(0, 3)) {
        const task = await kv.get(`workspace:${workspace.id}:task:${taskId}`);
        if (task) {
          activities.push({
            id: task.id,
            type: 'task',
            action: task.status === 'Done' ? 'completed' : 'updated',
            title: task.summary,
            workspace: workspace.name,
            timestamp: task.updatedAt || task.createdAt,
            user: task.assignee || task.reporter || 'Team'
          });
        }
      }
    }

    // Sort by timestamp
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return c.json({ activities: activities.slice(0, 10) });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return c.json({ activities: [] });
  }
});

export default app;
