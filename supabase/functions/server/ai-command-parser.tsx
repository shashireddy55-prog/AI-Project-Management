import * as kv from './kv_store.tsx';

export interface ParsedCommand {
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'configure' | 'bulk';
  targetEntity: string;
  confidence: number;
  params: Record<string, any>;
  summary: string;
  impactLevel: 'low' | 'medium' | 'high';
  affectedItems?: string[];
  warnings?: string[];
  recommendations?: string[];
  requiresConfirmation: boolean;
}

export async function parseAICommand(
  command: string,
  workspaceId: string | undefined,
  context: any
): Promise<ParsedCommand> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are an AI assistant for "Projify AI", a project management system.

The system hierarchy is: Workspace → Program (optional) → Project → Epic → Story → Subtask

You must parse user commands and return detailed information for user confirmation.

Supported actions:
- create_workspace: Create a new workspace with projects, epics, stories, sprints
- create_project: Create a project within a workspace
- create_board: Create a Kanban/Scrum board
- create_dashboard: Create analytics dashboard
- create_epic: Create an epic within a project
- create_story: Create a user story
- create_sprint: Create a sprint
- create_subtask: Create a subtask
- update_workflow: Update workflow configuration
- update_settings: Update project/workspace settings
- add_field: Add custom field to entity
- remove_field: Remove custom field
- add_user: Add user to project/workspace
- remove_user: Remove user
- bulk_update: Update multiple items
- delete_item: Delete an item

Return ONLY valid JSON in this exact format:
{
  "action": "action_name",
  "actionType": "create|update|delete|configure|bulk",
  "targetEntity": "workspace|project|board|dashboard|epic|story|sprint|subtask|field|user",
  "confidence": 0.0-1.0,
  "params": {
    // Extracted parameters from command
    "name": "string",
    "description": "string",
    // ... other relevant params
  },
  "summary": "Clear one-line summary of what will be done",
  "impactLevel": "low|medium|high",
  "affectedItems": ["list of items that will be affected"],
  "warnings": ["list of warnings if any"],
  "recommendations": ["list of AI recommendations"],
  "requiresConfirmation": true
}

Examples:
1. "Create a mobile banking workspace" →
{
  "action": "create_workspace",
  "actionType": "create",
  "targetEntity": "workspace",
  "confidence": 0.95,
  "params": {
    "name": "Mobile Banking",
    "key": "MOB",
    "industry": "Fintech",
    "methodology": "Scrum",
    "projectCount": 3,
    "epicCount": 8,
    "storyCount": 25
  },
  "summary": "Create a Mobile Banking workspace with 3 projects, 8 epics, and 25 stories",
  "impactLevel": "high",
  "affectedItems": ["Mobile Banking Workspace", "Payment Integration Project", "User Authentication Project", "Dashboard Project"],
  "warnings": [],
  "recommendations": ["Consider adding a QA sprint", "Set up CI/CD pipeline early"],
  "requiresConfirmation": true
}

2. "Add priority field to stories" →
{
  "action": "add_field",
  "actionType": "configure",
  "targetEntity": "field",
  "confidence": 0.88,
  "params": {
    "fieldName": "Priority",
    "fieldType": "dropdown",
    "options": ["High", "Medium", "Low"],
    "targetEntity": "story",
    "required": false
  },
  "summary": "Add a Priority field (dropdown) to all stories",
  "impactLevel": "low",
  "affectedItems": [],
  "warnings": [],
  "recommendations": ["Consider making this field required for better prioritization"],
  "requiresConfirmation": true
}

Always set requiresConfirmation to true. Be specific and detailed in params.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Command: "${command}"\n\nWorkspace ID: ${workspaceId || 'none'}\n\nContext: ${JSON.stringify(context || {})}` 
          }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle quota errors with demo mode
      if (response.status === 429 || errorText.includes('quota') || errorText.includes('insufficient_quota')) {
        console.log('ℹ️  Demo mode: Using fallback parser due to OpenAI quota limits');
        return createDemoResponse(command, workspaceId);
      }
      
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);
    
    // Validate the response structure
    if (!parsed.action || !parsed.actionType || !parsed.targetEntity) {
      throw new Error('Invalid AI response structure');
    }

    return parsed as ParsedCommand;

  } catch (error) {
    console.error('AI command parsing error:', error);
    // Fallback to demo mode on any error
    return createDemoResponse(command, workspaceId);
  }
}

function createDemoResponse(command: string, workspaceId: string | undefined): ParsedCommand {
  // Simple pattern matching for demo mode
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand.includes('workspace') && (lowerCommand.includes('create') || lowerCommand.includes('new'))) {
    return {
      action: 'create_workspace',
      actionType: 'create',
      targetEntity: 'workspace',
      confidence: 0.75,
      params: {
        name: extractName(command) || 'New Workspace',
        key: generateKey(extractName(command) || 'New Workspace'),
        industry: 'Software',
        methodology: 'Scrum',
        projectCount: 2,
        epicCount: 5,
        storyCount: 15
      },
      summary: `Create a new workspace "${extractName(command) || 'New Workspace'}" (Demo Mode)`,
      impactLevel: 'high',
      affectedItems: ['New workspace with 2 projects'],
      warnings: ['Demo mode active - AI features limited'],
      recommendations: ['Add OpenAI billing to enable full AI features'],
      requiresConfirmation: true
    };
  }
  
  if (lowerCommand.includes('board') && (lowerCommand.includes('create') || lowerCommand.includes('new'))) {
    return {
      action: 'create_board',
      actionType: 'create',
      targetEntity: 'board',
      confidence: 0.75,
      params: {
        name: extractName(command) || 'New Board',
        boardType: lowerCommand.includes('scrum') ? 'Scrum' : 'Kanban',
        columns: ['To Do', 'In Progress', 'Review', 'Done']
      },
      summary: `Create a new board "${extractName(command) || 'New Board'}" (Demo Mode)`,
      impactLevel: 'medium',
      affectedItems: [],
      warnings: ['Demo mode active - AI features limited'],
      recommendations: [],
      requiresConfirmation: true
    };
  }
  
  if (lowerCommand.includes('dashboard') && (lowerCommand.includes('create') || lowerCommand.includes('new'))) {
    return {
      action: 'create_dashboard',
      actionType: 'create',
      targetEntity: 'dashboard',
      confidence: 0.75,
      params: {
        name: extractName(command) || 'New Dashboard',
        widgets: ['velocity_chart', 'burndown_chart', 'task_distribution'],
        chartTypes: ['line', 'bar', 'pie']
      },
      summary: `Create a new dashboard "${extractName(command) || 'New Dashboard'}" (Demo Mode)`,
      impactLevel: 'low',
      affectedItems: [],
      warnings: ['Demo mode active - AI features limited'],
      recommendations: [],
      requiresConfirmation: true
    };
  }
  
  if (lowerCommand.includes('field') && lowerCommand.includes('add')) {
    const fieldName = extractFieldName(command) || 'Custom Field';
    return {
      action: 'add_field',
      actionType: 'configure',
      targetEntity: 'field',
      confidence: 0.70,
      params: {
        fieldName,
        fieldType: 'text',
        targetEntity: 'story',
        required: false
      },
      summary: `Add "${fieldName}" field (Demo Mode)`,
      impactLevel: 'low',
      affectedItems: [],
      warnings: ['Demo mode active - AI features limited'],
      recommendations: [],
      requiresConfirmation: true
    };
  }
  
  // Default fallback
  return {
    action: 'unknown',
    actionType: 'configure',
    targetEntity: 'general',
    confidence: 0.50,
    params: {
      originalCommand: command
    },
    summary: `Process command: "${command}" (Demo Mode)`,
    impactLevel: 'low',
    affectedItems: [],
    warnings: ['Demo mode active - Command may not be fully understood', 'AI features limited without OpenAI quota'],
    recommendations: ['Try rephrasing the command', 'Add OpenAI billing for better AI understanding'],
    requiresConfirmation: true
  };
}

function extractName(command: string): string | null {
  // Try to extract quoted text
  const quoted = command.match(/"([^"]+)"/);
  if (quoted) return quoted[1];
  
  // Try to extract text after "create" or "for"
  const patterns = [
    /create\s+(?:a\s+)?(?:new\s+)?(?:\w+\s+)?(?:workspace|project|board|dashboard)\s+(?:called\s+|named\s+)?["']?([^"'\n]+?)["']?(?:\s+with|\s+for|$)/i,
    /(?:for|called|named)\s+["']?([^"'\n]+?)["']?(?:\s+with|\s+workspace|$)/i
  ];
  
  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (match) return match[1].trim();
  }
  
  return null;
}

function extractFieldName(command: string): string | null {
  const patterns = [
    /add\s+(?:a\s+)?["']?(\w+)["']?\s+field/i,
    /field\s+(?:called\s+|named\s+)?["']?(\w+)["']?/i
  ];
  
  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (match) return match[1].trim();
  }
  
  return null;
}

function generateKey(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
}

export async function executeCommand(
  parsed: ParsedCommand,
  workspaceId: string | undefined,
  userId: string
): Promise<any> {
  const { action, params } = parsed;

  switch (action) {
    case 'create_workspace':
      return await createWorkspace(params, userId);
    
    case 'create_project':
      return await createProject(params, workspaceId, userId);
    
    case 'create_board':
      return await createBoard(params, workspaceId, userId);
    
    case 'create_dashboard':
      return await createDashboard(params, workspaceId, userId);
    
    case 'create_epic':
      return await createEpic(params, workspaceId, userId);
    
    case 'create_story':
      return await createStory(params, workspaceId, userId);
    
    case 'add_field':
      return await addField(params, workspaceId, userId);
    
    case 'remove_field':
      return await removeField(params, workspaceId, userId);
    
    case 'update_workflow':
      return await updateWorkflow(params, workspaceId, userId);
    
    default:
      return {
        success: false,
        message: `Action "${action}" is not yet implemented`
      };
  }
}

// Implementation functions
async function createWorkspace(params: any, userId: string) {
  const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const key = params.key || generateKey(params.name || 'Workspace');
  
  const workspace = {
    id: workspaceId,
    name: params.name || 'New Workspace',
    key,
    industry: params.industry || 'General',
    methodology: params.methodology || 'Scrum',
    description: params.description || '',
    createdAt: new Date().toISOString(),
    createdBy: userId,
    settings: {
      aiEnabled: true,
      autoAssignment: false
    }
  };
  
  await kv.set(`workspace:${workspaceId}`, workspace);
  await kv.set(`workspace:${workspaceId}:key`, key);
  
  // Add to user's workspaces
  const userWorkspaces = await kv.get(`user:${userId}:workspaces`) || [];
  userWorkspaces.push(workspaceId);
  await kv.set(`user:${userId}:workspaces`, userWorkspaces);
  
  return {
    success: true,
    workspaceId,
    workspace,
    message: `Created workspace: ${workspace.name} (${key})`
  };
}

async function createProject(params: any, workspaceId: string | undefined, userId: string) {
  if (!workspaceId) {
    throw new Error('Workspace ID required');
  }
  
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const project = {
    id: projectId,
    workspaceId,
    name: params.name || 'New Project',
    description: params.description || '',
    methodology: params.methodology || 'Scrum',
    startDate: params.startDate || new Date().toISOString(),
    endDate: params.endDate || '',
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  await kv.set(`workspace:${workspaceId}:project:${projectId}`, project);
  
  return {
    success: true,
    projectId,
    project,
    message: `Created project: ${project.name}`
  };
}

async function createBoard(params: any, workspaceId: string | undefined, userId: string) {
  if (!workspaceId) {
    throw new Error('Workspace ID required');
  }
  
  const boardId = `board_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const board = {
    id: boardId,
    workspaceId,
    name: params.name || 'New Board',
    boardType: params.boardType || 'Kanban',
    columns: params.columns || ['To Do', 'In Progress', 'Done'],
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  await kv.set(`workspace:${workspaceId}:board:${boardId}`, board);
  
  return {
    success: true,
    boardId,
    board,
    message: `Created board: ${board.name}`
  };
}

async function createDashboard(params: any, workspaceId: string | undefined, userId: string) {
  if (!workspaceId) {
    throw new Error('Workspace ID required');
  }
  
  const dashboardId = `dash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const dashboard = {
    id: dashboardId,
    workspaceId,
    name: params.name || 'New Dashboard',
    widgets: params.widgets || [],
    layout: params.layout || 'grid',
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  await kv.set(`workspace:${workspaceId}:dashboard:${dashboardId}`, dashboard);
  
  return {
    success: true,
    dashboardId,
    dashboard,
    message: `Created dashboard: ${dashboard.name}`
  };
}

async function createEpic(params: any, workspaceId: string | undefined, userId: string) {
  if (!workspaceId) {
    throw new Error('Workspace ID required');
  }
  
  const epicId = `epic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const epic = {
    id: epicId,
    workspaceId,
    name: params.name || 'New Epic',
    description: params.description || '',
    status: 'To Do',
    priority: params.priority || 'Medium',
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  await kv.set(`workspace:${workspaceId}:epic:${epicId}`, epic);
  
  return {
    success: true,
    epicId,
    epic,
    message: `Created epic: ${epic.name}`
  };
}

async function createStory(params: any, workspaceId: string | undefined, userId: string) {
  if (!workspaceId) {
    throw new Error('Workspace ID required');
  }
  
  const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const story = {
    id: storyId,
    workspaceId,
    title: params.title || params.name || 'New Story',
    description: params.description || '',
    status: 'To Do',
    priority: params.priority || 'Medium',
    storyPoints: params.storyPoints || 0,
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  await kv.set(`workspace:${workspaceId}:story:${storyId}`, story);
  
  return {
    success: true,
    storyId,
    story,
    message: `Created story: ${story.title}`
  };
}

async function addField(params: any, workspaceId: string | undefined, userId: string) {
  if (!workspaceId) {
    throw new Error('Workspace ID required');
  }
  
  const fieldId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const field = {
    id: fieldId,
    workspaceId,
    name: params.fieldName,
    type: params.fieldType || 'text',
    targetEntity: params.targetEntity || 'story',
    required: params.required || false,
    options: params.options || [],
    createdAt: new Date().toISOString(),
    createdBy: userId
  };
  
  await kv.set(`workspace:${workspaceId}:field:${fieldId}`, field);
  
  // Add to workspace fields list
  const fields = await kv.get(`workspace:${workspaceId}:fields`) || [];
  fields.push(fieldId);
  await kv.set(`workspace:${workspaceId}:fields`, fields);
  
  return {
    success: true,
    fieldId,
    field,
    message: `Added field: ${field.name}`
  };
}

async function removeField(params: any, workspaceId: string | undefined, userId: string) {
  if (!workspaceId) {
    throw new Error('Workspace ID required');
  }
  
  const fields = await kv.get(`workspace:${workspaceId}:fields`) || [];
  const fieldToRemove = fields.find((f: any) => f.name === params.fieldName);
  
  if (!fieldToRemove) {
    throw new Error(`Field "${params.fieldName}" not found`);
  }
  
  // Remove from fields list
  const updatedFields = fields.filter((f: any) => f.name !== params.fieldName);
  await kv.set(`workspace:${workspaceId}:fields`, updatedFields);
  
  return {
    success: true,
    message: `Removed field: ${params.fieldName}`
  };
}

async function updateWorkflow(params: any, workspaceId: string | undefined, userId: string) {
  if (!workspaceId) {
    throw new Error('Workspace ID required');
  }
  
  const workflow = await kv.get(`workspace:${workspaceId}:workflow`) || {};
  
  const updatedWorkflow = {
    ...workflow,
    ...params.changes,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };
  
  await kv.set(`workspace:${workspaceId}:workflow`, updatedWorkflow);
  
  return {
    success: true,
    workflow: updatedWorkflow,
    message: 'Workflow updated successfully'
  };
}
