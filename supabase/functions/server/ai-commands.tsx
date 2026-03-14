import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { parseAICommand, executeCommand } from './ai-command-parser.tsx';

const app = new Hono();

// Parse AI command and return details for confirmation
app.post('/parse', async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { command, workspaceId, context, userId } = await c.req.json();

    if (!command) {
      return c.json({ error: 'Command is required' }, 400);
    }

    // Check if AI is enabled
    const globalSettings = await kv.get('global:settings');
    const workspaceSettings = workspaceId ? await kv.get(`workspace:${workspaceId}:settings`) : null;
    
    const aiEnabled = globalSettings?.aiEnabled !== false;
    const workspaceAiEnabled = workspaceSettings?.workspaceAiEnabled !== false;

    if (!aiEnabled || (workspaceId && !workspaceAiEnabled)) {
      return c.json({ 
        error: 'AI is disabled. Enable AI in settings to use AI commands.',
        requiresApproval: true 
      }, 403);
    }

    // Parse the command using AI
    const parsed = await parseAICommand(command, workspaceId, context);

    return c.json({
      success: true,
      details: parsed
    });

  } catch (error) {
    console.error('AI command parsing error:', error);
    return c.json({ error: 'Failed to parse AI command: ' + error.message }, 500);
  }
});

// Execute confirmed AI command
app.post('/execute', async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { parsedCommand, workspaceId, userId } = await c.req.json();

    if (!parsedCommand) {
      return c.json({ error: 'Parsed command is required' }, 400);
    }

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Check if AI is enabled
    const globalSettings = await kv.get('global:settings');
    const workspaceSettings = workspaceId ? await kv.get(`workspace:${workspaceId}:settings`) : null;
    
    const aiEnabled = globalSettings?.aiEnabled !== false;
    const workspaceAiEnabled = workspaceSettings?.workspaceAiEnabled !== false;

    if (!aiEnabled || (workspaceId && !workspaceAiEnabled)) {
      return c.json({ 
        error: 'AI is disabled. Enable AI in settings to use AI commands.',
      }, 403);
    }

    // Execute the command
    const result = await executeCommand(parsedCommand, workspaceId, userId);

    return c.json({
      success: true,
      result,
      message: result.message || 'Command executed successfully'
    });

  } catch (error) {
    console.error('AI command execution error:', error);
    return c.json({ error: 'Failed to execute AI command: ' + error.message }, 500);
  }
});

// Process natural language AI commands (LEGACY - for backwards compatibility)
app.post('/process', async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { command, workspaceId, context } = await c.req.json();

    if (!command) {
      return c.json({ error: 'Command is required' }, 400);
    }

    // Check if AI is enabled
    const globalSettings = await kv.get('global:settings');
    const workspaceSettings = workspaceId ? await kv.get(`workspace:${workspaceId}:settings`) : null;
    
    const aiEnabled = globalSettings?.aiEnabled !== false;
    const workspaceAiEnabled = workspaceSettings?.workspaceAiEnabled !== false;

    if (!aiEnabled || (workspaceId && !workspaceAiEnabled)) {
      return c.json({ 
        error: 'AI is disabled. Enable AI in settings to use AI commands.',
        requiresApproval: true 
      }, 403);
    }

    // Use OpenAI to parse the command intent
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    const systemPrompt = `You are an AI assistant that interprets user commands for a project management system.
Parse the user's command and determine:
1. The action type (create_task, update_task, assign_task, create_sprint, generate_report, import_data, etc.)
2. The relevant parameters extracted from the command
3. Any additional context needed

Return ONLY valid JSON in this format:
{
  "action": "action_type",
  "params": {
    "key": "value"
  },
  "confidence": 0.0-1.0,
  "needsConfirmation": boolean
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
          { role: 'user', content: `Command: ${command}\\n\\nContext: ${JSON.stringify(context || {})}` }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Check if it's a quota error and return demo mode
      if (response.status === 429 || errorText.includes('quota') || errorText.includes('insufficient_quota')) {
        console.log('ℹ️  Demo mode active - using sample AI command response');
        
        // Return a simple demo response
        const demoResponse = {
          action: 'demo_mode',
          params: {
            message: 'AI commands are in demo mode due to OpenAI quota limits',
            command: command
          },
          confidence: 1.0,
          needsConfirmation: false
        };
        
        return c.json({
          success: true,
          demoMode: true,
          action: demoResponse.action,
          result: { message: `Demo mode: Command "${command}" acknowledged but not executed due to API limits` },
          confidence: demoResponse.confidence,
          message: `Demo mode: ${command}`
        });
      }
      
      return c.json({ error: 'Failed to process command' }, 500);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return c.json({ error: 'No response from AI' }, 500);
    }

    // Parse the AI response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return c.json({ error: 'Invalid AI response format' }, 500);
    }

    // Execute the action based on the parsed command
    const result = await executeAction(parsed, workspaceId, accessToken);

    return c.json({
      success: true,
      action: parsed.action,
      result,
      confidence: parsed.confidence,
      message: `Successfully executed: ${command}`
    });

  } catch (error) {
    console.error('AI command processing error:', error);
    return c.json({ error: 'Failed to process AI command: ' + error.message }, 500);
  }
});

// Execute the parsed action
async function executeAction(parsed: any, workspaceId: string | undefined, accessToken: string) {
  const { action, params } = parsed;

  switch (action) {
    case 'create_task':
      return await createTask(params, workspaceId);
    
    case 'update_task':
      return await updateTask(params, workspaceId);
    
    case 'assign_task':
      return await assignTask(params, workspaceId);
    
    case 'create_sprint':
      return await createSprint(params, workspaceId);
    
    case 'estimate_task':
      return await estimateTask(params, workspaceId);
    
    case 'create_workspace':
      return await createWorkspace(params);
    
    case 'import_data':
      return { message: 'Import data action requires manual confirmation', requiresModal: 'import' };
    
    case 'generate_report':
      return { message: 'Opening reports view', requiresModal: 'reports' };
    
    default:
      return { message: `Action ${action} recognized but not yet implemented` };
  }
}

// Action handlers
async function createTask(params: any, workspaceId?: string) {
  if (!workspaceId) {
    throw new Error('Workspace ID required for creating tasks');
  }

  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const taskKey = `workspace:${workspaceId}:task:${taskId}`;

  const task = {
    id: taskId,
    workspaceId,
    summary: params.title || params.summary || 'New Task',
    description: params.description || '',
    status: params.status || 'To Do',
    priority: params.priority || 'Medium',
    assignee: params.assignee || '',
    reporter: params.reporter || 'AI',
    tags: params.tags || [],
    startDate: params.startDate || '',
    dueDate: params.dueDate || '',
    storyPoints: params.storyPoints || 0,
    sprint: params.sprint || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'ai'
  };

  await kv.set(taskKey, task);

  // Add to workspace task list
  const workspaceTasks = await kv.get(`workspace:${workspaceId}:tasks`) || [];
  workspaceTasks.push(taskId);
  await kv.set(`workspace:${workspaceId}:tasks`, workspaceTasks);

  return { taskId, task, message: `Created task: ${task.summary}` };
}

async function updateTask(params: any, workspaceId?: string) {
  if (!workspaceId || !params.taskId) {
    throw new Error('Workspace ID and task ID required');
  }

  const taskKey = `workspace:${workspaceId}:task:${params.taskId}`;
  const existingTask = await kv.get(taskKey);

  if (!existingTask) {
    throw new Error('Task not found');
  }

  const updatedTask = {
    ...existingTask,
    ...params.updates,
    updatedAt: new Date().toISOString()
  };

  await kv.set(taskKey, updatedTask);

  return { task: updatedTask, message: 'Task updated successfully' };
}

async function assignTask(params: any, workspaceId?: string) {
  if (!workspaceId || !params.taskId || !params.assignee) {
    throw new Error('Workspace ID, task ID, and assignee required');
  }

  return await updateTask({
    taskId: params.taskId,
    updates: { assignee: params.assignee }
  }, workspaceId);
}

async function createSprint(params: any, workspaceId?: string) {
  if (!workspaceId) {
    throw new Error('Workspace ID required');
  }

  const sprintId = `sprint_${Date.now()}`;
  const sprintKey = `workspace:${workspaceId}:sprint:${sprintId}`;

  const sprint = {
    id: sprintId,
    workspaceId,
    name: params.name || 'New Sprint',
    startDate: params.startDate || new Date().toISOString(),
    endDate: params.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    goal: params.goal || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  await kv.set(sprintKey, sprint);

  return { sprintId, sprint, message: `Created sprint: ${sprint.name}` };
}

async function estimateTask(params: any, workspaceId?: string) {
  if (!workspaceId || !params.taskId) {
    throw new Error('Workspace ID and task ID required');
  }

  // AI estimation logic - simplified
  const complexity = params.complexity || 'medium';
  const storyPoints = complexity === 'high' ? 8 : complexity === 'medium' ? 5 : 3;

  return await updateTask({
    taskId: params.taskId,
    updates: { storyPoints }
  }, workspaceId);
}

async function createWorkspace(params: any) {
  const workspaceId = `workspace_${Date.now()}`;
  const workspaceKey = `workspace:${workspaceId}`;

  const workspace = {
    id: workspaceId,
    name: params.name || 'New Workspace',
    type: params.type || 'kanban',
    description: params.description || '',
    createdAt: new Date().toISOString(),
    createdBy: 'ai'
  };

  await kv.set(workspaceKey, workspace);

  return { workspaceId, workspace, message: `Created workspace: ${workspace.name}` };
}

export default app;