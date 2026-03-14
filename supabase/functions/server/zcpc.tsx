import { Hono } from 'npm:hono';
import OpenAI from 'npm:openai';
import * as kv from './kv_store.tsx';

const zcpc = new Hono();

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

// ZCPC Generation Endpoint
zcpc.post('/generate', async (c) => {
  try {
    const { description } = await c.req.json();

    if (!description) {
      return c.json({ error: 'Project description is required' }, 400);
    }

    // Check if OpenAI API key is configured
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.log('ℹ️  No API key found - using demo mode');
      // Return demo mode instead of error
      const zcpcData = generateDemoWorkspace(description);
      const workspaceId = crypto.randomUUID();
      const response = buildWorkspaceResponse(workspaceId, zcpcData, description, true);
      await storeWorkspace(workspaceId, response);
      
      return c.json({
        ...response,
        demoMode: true
      });
    }

    // Log API key status (first 7 chars only for security)
    console.log('ℹ️  API key configured');
    console.log('ℹ️  Generating workspace:', description.substring(0, 50) + '...');

    // Call OpenAI to generate comprehensive project structure
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are Projify AI - an expert project management system that implements Zero-Config Project Creation (ZCPC).

Given a project description, you must generate a complete workspace following this EXACT hierarchy:

MANDATORY HIERARCHY MODEL:
Workspace
└── Program (optional - only for large multi-project initiatives)
    └── Project
        └── Epic
            └── Story
                └── Subtask

CRITICAL HIERARCHY RULES:
- WORKSPACE is the top-level container (always created)
- PROGRAM is optional - only create for multi-project initiatives (e.g., "company-wide digital transformation")
- PROJECT is mandatory - every workspace must have at least 1 project
- EPIC belongs to a Project (not directly to Workspace)
- STORY belongs to an Epic (not directly to Project)
- SUBTASK belongs to a Story (not directly to Epic)
- Each level must reference its parent ID

WORKSPACE CREATION REQUIREMENTS:
1. Workspace ID (generated UUID)
2. Project container (mandatory)
3. Project metadata (name, description, owner, timeline)
4. Methodology (Scrum, Kanban, or Hybrid)
5. Estimation model (Story Points, T-Shirt Sizes, or Hours)
6. Sprint cadence (1-4 weeks)
7. Risk model (Low/Medium/High/Critical with mitigation strategies)

Generate ALL 13 ZCPC COMPONENTS:
1. Industry Detection - Identify industry and domain
2. Methodology Selection - Choose Scrum/Kanban/Hybrid with reasoning
3. Workflow Generation - Define workflow states (To Do, In Progress, In Review, Done, etc.)
4. Issue Type Creation - Define types (Epic, Story, Subtask, Bug, Task)
5. Role Assignment - Create roles (Product Owner, Scrum Master, Developer, QA, Stakeholder)
6. Backlog Generation - Create Programs (ONLY if multi-project), Projects (mandatory), Epics, Stories, and Subtasks following the hierarchy
7. Sprint Plan Creation - Generate sprint structure with timeline
8. Capacity Allocation - Assign story points and estimates
9. Automation Setup - Define automation rules (auto-assign, status transitions)
10. Risk Engine Activation - Identify risks with mitigation plans
11. Report Generation - Create reporting structure and KPIs
12. Integration Setup - Recommend integrations (Slack, GitHub, Jira, etc.)
13. Governance Snapshot - Define compliance rules and governance policies

BACKLOG HIERARCHY REQUIREMENTS:
- IMPORTANT: DO NOT generate sample epics, stories, or subtasks
- Create ONLY 1 project with basic metadata
- Leave epics, stories, and subtasks arrays EMPTY
- Users will create their own tickets manually after workspace setup

Return ONLY valid JSON with this EXACT structure:
{
  "workspace": {
    "name": "Workspace name",
    "description": "Brief description",
    "type": "scrum"
  },
  "industry": {
    "domain": "Industry domain",
    "sector": "Specific sector",
    "keywords": ["keyword1", "keyword2"]
  },
  "methodology": {
    "type": "scrum",
    "reasoning": "Why this methodology",
    "estimationModel": "story_points",
    "sprintCadence": 2
  },
  "workflow": {
    "states": ["To Do", "In Progress", "In Review", "Done"],
    "transitions": [{"from": "To Do", "to": "In Progress"}]
  },
  "issueTypes": [
    {"name": "Epic", "icon": "layers", "color": "purple", "hierarchy": 1},
    {"name": "Story", "icon": "book", "color": "blue", "hierarchy": 2},
    {"name": "Subtask", "icon": "check-square", "color": "green", "hierarchy": 3}
  ],
  "roles": [
    {"name": "Product Owner", "permissions": ["admin"], "responsibilities": []}
  ],
  "backlog": {
    "programs": [],
    "projects": [
      {
        "id": "proj-1",
        "name": "Project name",
        "description": "Project description",
        "metadata": {
          "owner": "Product Owner",
          "startDate": "2026-03-01",
          "endDate": "2026-06-01"
        }
      }
    ],
    "epics": [],
    "stories": [],
    "subtasks": []
  },
  "sprints": {
    "cadence": 2,
    "duration": "weeks",
    "sprints": []
  },
  "capacity": {
    "totalPoints": 50,
    "allocatedPoints": 30,
    "velocity": 25,
    "teamSize": 5
  },
  "automation": {
    "rules": []
  },
  "risk": {
    "model": "4-tier",
    "risks": []
  },
  "reports": {
    "dashboards": ["Burndown Chart", "Velocity Chart"],
    "kpis": []
  },
  "integrations": {
    "recommended": ["Slack", "GitHub"],
    "configured": []
  },
  "governance": {
    "policies": [],
    "compliance": []
  }
}`
          },
          {
            role: 'user',
            content: `Generate a complete ZCPC workspace for: ${description}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
    } catch (openaiError: any) {
      // Check if it's a quota error (429) - handle silently with demo mode
      if (openaiError.status === 429 || openaiError.code === 'insufficient_quota' || openaiError.type === 'insufficient_quota' || openaiError.message?.includes('quota')) {
        console.log('ℹ️  Demo mode active - using sample workspace data');
        
        // Generate demo workspace data based on the description
        const zcpcData = generateDemoWorkspace(description);
        
        // Continue with demo data instead of failing
        const workspaceId = crypto.randomUUID();
        const response = buildWorkspaceResponse(workspaceId, zcpcData, description, true);
        
        // Store in KV database
        await storeWorkspace(workspaceId, response);
        
        console.log('✅ Demo workspace generated successfully');
        
        return c.json({
          ...response,
          demoMode: true,
          demoNotice: 'This workspace was generated using demo data because OpenAI API quota was exceeded. Add billing at platform.openai.com to enable AI-powered generation.'
        });
      }
      
      // For other OpenAI errors, return demo mode as fallback
      console.log('ℹ️  Demo mode active - using sample workspace data');
      
      const zcpcData = generateDemoWorkspace(description);
      const workspaceId = crypto.randomUUID();
      const response = buildWorkspaceResponse(workspaceId, zcpcData, description, true);
      await storeWorkspace(workspaceId, response);
      
      return c.json({
        ...response,
        demoMode: true
      });
    }

    const generatedContent = completion.choices[0]?.message?.content;
    
    if (!generatedContent) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Generated Content:', generatedContent.substring(0, 200) + '...');

    let zcpcData;
    try {
      zcpcData = JSON.parse(generatedContent);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', generatedContent);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    // Generate workspace and project IDs
    const workspaceId = crypto.randomUUID();
    const projectId = zcpcData.backlog?.projects?.[0]?.id || crypto.randomUUID();
    
    // Extract clean workspace name
    const workspaceName = zcpcData.workspace?.name || extractWorkspaceName(description);
    const workspaceType = zcpcData.methodology?.type?.toLowerCase() || 'scrum';
    const defaultDescription = `${workspaceName} workspace for ${workspaceType} project management`;
    
    // Build comprehensive response with proper hierarchy
    const response = {
      workspace: {
        id: workspaceId,
        name: workspaceName,
        type: workspaceType,
        description: zcpcData.workspace?.description || defaultDescription,
        created_at: new Date().toISOString()
      },
      industry: zcpcData.industry || {
        domain: 'Software',
        sector: 'Technology',
        keywords: []
      },
      methodology: {
        type: zcpcData.methodology?.type || 'scrum',
        reasoning: zcpcData.methodology?.reasoning || 'Agile approach for iterative development',
        estimationModel: zcpcData.methodology?.estimationModel || 'story_points',
        sprintCadence: zcpcData.methodology?.sprintCadence || 2
      },
      workflow: zcpcData.workflow || {
        states: ['To Do', 'In Progress', 'In Review', 'Done'],
        transitions: []
      },
      issueTypes: zcpcData.issueTypes || [
        { name: 'Epic', icon: 'layers', color: 'purple', hierarchy: 1 },
        { name: 'Story', icon: 'book', color: 'blue', hierarchy: 2 },
        { name: 'Subtask', icon: 'check-square', color: 'green', hierarchy: 3 }
      ],
      roles: zcpcData.roles || [
        { name: 'Product Owner', permissions: ['admin'], responsibilities: [] }
      ],
      backlog: zcpcData.backlog || {
        programs: [],
        projects: [],
        epics: [],
        stories: [],
        subtasks: []
      },
      sprints: zcpcData.sprints || {
        cadence: 2,
        duration: 'weeks',
        sprints: []
      },
      capacity: zcpcData.capacity || {
        totalPoints: 0,
        allocatedPoints: 0,
        velocity: 0,
        teamSize: 5
      },
      automation: zcpcData.automation || {
        rules: []
      },
      risk: zcpcData.risk || {
        model: '4-tier',
        risks: []
      },
      reports: zcpcData.reports || {
        dashboards: ['Burndown Chart', 'Velocity Chart'],
        kpis: []
      },
      integrations: zcpcData.integrations || {
        recommended: ['Slack', 'GitHub'],
        configured: []
      },
      governance: zcpcData.governance || {
        policies: [],
        compliance: []
      },
      stats: {
        programs: zcpcData.backlog?.programs?.length || 0,
        projects: zcpcData.backlog?.projects?.length || 0,
        epics: zcpcData.backlog?.epics?.length || 0,
        stories: zcpcData.backlog?.stories?.length || 0,
        subtasks: zcpcData.backlog?.subtasks?.length || 0
      },
      generatedAt: new Date().toISOString(),
      aiModel: 'gpt-4o',
      prompt: description
    };

    // Store in KV database
    await kv.set(`workspace:${workspaceId}`, response.workspace);
    
    // Store methodology and metadata
    await kv.set(`workspace:${workspaceId}:methodology`, response.methodology);
    await kv.set(`workspace:${workspaceId}:metadata`, {
      industry: response.industry,
      workflow: response.workflow,
      issueTypes: response.issueTypes,
      roles: response.roles,
      capacity: response.capacity,
      risk: response.risk
    });
    
    // Store backlog hierarchy
    if (response.backlog.programs.length > 0) {
      await kv.set(`workspace:${workspaceId}:programs`, response.backlog.programs);
    }
    if (response.backlog.projects.length > 0) {
      await kv.set(`workspace:${workspaceId}:projects`, response.backlog.projects);
    }
    if (response.backlog.epics.length > 0) {
      await kv.set(`workspace:${workspaceId}:epics`, response.backlog.epics);
    }
    if (response.backlog.stories.length > 0) {
      await kv.set(`workspace:${workspaceId}:stories`, response.backlog.stories);
    }
    if (response.backlog.subtasks.length > 0) {
      await kv.set(`workspace:${workspaceId}:subtasks`, response.backlog.subtasks);
    }
    
    // Store sprints
    if (response.sprints.sprints.length > 0) {
      await kv.set(`workspace:${workspaceId}:sprints`, response.sprints);
    }
    
    // Store automation, reports, integrations, governance
    await kv.set(`workspace:${workspaceId}:automation`, response.automation);
    await kv.set(`workspace:${workspaceId}:reports`, response.reports);
    await kv.set(`workspace:${workspaceId}:integrations`, response.integrations);
    await kv.set(`workspace:${workspaceId}:governance`, response.governance);

    console.log('ZCPC Generation Success:', {
      workspace: response.workspace.name,
      type: response.workspace.type,
      methodology: response.methodology.type,
      estimationModel: response.methodology.estimationModel,
      sprintCadence: response.methodology.sprintCadence,
      components: Object.keys(response).length,
      hierarchy: {
        programs: response.stats.programs,
        projects: response.stats.projects,
        epics: response.stats.epics,
        stories: response.stats.stories,
        subtasks: response.stats.subtasks
      }
    });

    return c.json(response);
  } catch (error: any) {
    console.error('ZCPC Generation Error:', error);
    return c.json(
      {
        error: 'Failed to generate workspace',
        message: error.message,
        details: error.toString()
      },
      500
    );
  }
});

// Helper function to extract workspace name from description
function extractWorkspaceName(description: string): string {
  // Parse the command to extract clean project name
  // Format: "create [Project Name] workspace with [scrum|kanban] type"
  
  // Try multiple parsing patterns
  const createMatch = description.match(/^create\s+(.+?)\s+workspace\s+with\s+(scrum|kanban|agile|waterfall)\s+type$/i);
  const simpleMatch = description.match(/^create\s+(.+?)\s+workspace$/i);
  
  if (createMatch) {
    return createMatch[1].trim();
  } else if (simpleMatch) {
    return simpleMatch[1].trim();
  }
  
  // Fallback: clean up the description
  let name = description
    .replace(/^create\s+/i, '')
    .replace(/\s+workspace.*$/i, '')
    .replace(/\s+with\s+(scrum|kanban|agile|waterfall).*$/i, '')
    .trim();
  
  // Capitalize first letter of each word
  name = name
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  
  return name || 'New Workspace';
}

// Helper function to generate demo workspace data
function generateDemoWorkspace(description: string) {
  const projectName = extractWorkspaceName(description);
  const workspaceKey = generateWorkspaceKey(projectName);
  const projectDescription = `${projectName} workspace for project management`;
  const projectOwner = 'Product Owner';
  const projectStartDate = '2026-03-01';
  const projectEndDate = '2026-06-01';
  
  return {
    workspace: {
      name: projectName,
      key: workspaceKey,
      description: projectDescription,
      type: 'scrum'
    },
    industry: {
      domain: 'Software',
      sector: 'Technology',
      keywords: ['software', 'technology', 'development']
    },
    methodology: {
      type: 'scrum',
      reasoning: 'Agile approach for iterative development',
      estimationModel: 'story_points',
      sprintCadence: 2
    },
    workflow: {
      states: ['To Do', 'In Progress', 'In Review', 'Done'],
      transitions: [{'from': 'To Do', 'to': 'In Progress'}]
    },
    issueTypes: [
      {'name': 'Epic', 'icon': 'layers', 'color': 'purple', 'hierarchy': 1},
      {'name': 'Story', 'icon': 'book', 'color': 'blue', 'hierarchy': 2},
      {'name': 'Subtask', 'icon': 'check-square', 'color': 'green', 'hierarchy': 3}
    ],
    roles: [
      {'name': 'Product Owner', 'permissions': ['admin'], 'responsibilities': []},
      {'name': 'Scrum Master', 'permissions': ['manage'], 'responsibilities': []},
      {'name': 'Developer', 'permissions': ['edit'], 'responsibilities': []},
      {'name': 'QA Engineer', 'permissions': ['edit'], 'responsibilities': []}
    ],
    backlog: {
      programs: [],
      projects: [
        {
          "id": "proj-1",
          "name": projectName,
          "description": projectDescription,
          "metadata": {
            "owner": projectOwner,
            "startDate": projectStartDate,
            "endDate": projectEndDate
          }
        }
      ],
      epics: [],
      stories: [],
      subtasks: []
    },
    sprints: {
      "cadence": 2,
      "duration": "weeks",
      "sprints": []
    },
    capacity: {
      "totalPoints": 50,
      "allocatedPoints": 0,
      "velocity": 25,
      "teamSize": 5
    },
    automation: {
      "rules": []
    },
    risk: {
      "model": "4-tier",
      "risks": []
    },
    reports: {
      "dashboards": ["Burndown Chart", "Velocity Chart"],
      "kpis": []
    },
    integrations: {
      "recommended": ["Slack", "GitHub"],
      "configured": []
    },
    governance: {
      "policies": [],
      "compliance": []
    }
  };
}

// Helper function to build workspace response
function buildWorkspaceResponse(workspaceId: string, zcpcData: any, description: string, demoMode: boolean) {
  const workspaceName = zcpcData.workspace?.name || extractWorkspaceName(description);
  const workspaceKey = generateWorkspaceKey(workspaceName);
  
  // Generate a clean default description if AI doesn't provide one
  const workspaceType = zcpcData.methodology?.type?.toLowerCase() || 'scrum';
  const defaultDescription = `${workspaceName} workspace for ${workspaceType} project management`;
  
  return {
    workspace: {
      id: workspaceId,
      name: workspaceName,
      key: workspaceKey,
      type: workspaceType,
      description: zcpcData.workspace?.description || defaultDescription,
      created_at: new Date().toISOString()
    },
    industry: zcpcData.industry || {
      domain: 'Software',
      sector: 'Technology',
      keywords: []
    },
    methodology: {
      type: zcpcData.methodology?.type || 'scrum',
      reasoning: zcpcData.methodology?.reasoning || 'Agile approach for iterative development',
      estimationModel: zcpcData.methodology?.estimationModel || 'story_points',
      sprintCadence: zcpcData.methodology?.sprintCadence || 2
    },
    workflow: zcpcData.workflow || {
      states: ['To Do', 'In Progress', 'In Review', 'Done'],
      transitions: []
    },
    issueTypes: zcpcData.issueTypes || [
      { name: 'Epic', icon: 'layers', color: 'purple', hierarchy: 1 },
      { name: 'Story', icon: 'book', color: 'blue', hierarchy: 2 },
      { name: 'Subtask', icon: 'check-square', color: 'green', hierarchy: 3 }
    ],
    roles: zcpcData.roles || [
      { name: 'Product Owner', permissions: ['admin'], responsibilities: [] }
    ],
    backlog: zcpcData.backlog || {
      programs: [],
      projects: [],
      epics: [],
      stories: [],
      subtasks: []
    },
    sprints: zcpcData.sprints || {
      cadence: 2,
      duration: 'weeks',
      sprints: []
    },
    capacity: zcpcData.capacity || {
      totalPoints: 0,
      allocatedPoints: 0,
      velocity: 0,
      teamSize: 5
    },
    automation: zcpcData.automation || {
      rules: []
    },
    risk: zcpcData.risk || {
      model: '4-tier',
      risks: []
    },
    reports: zcpcData.reports || {
      dashboards: ['Burndown Chart', 'Velocity Chart'],
      kpis: []
    },
    integrations: zcpcData.integrations || {
      recommended: ['Slack', 'GitHub'],
      configured: []
    },
    governance: zcpcData.governance || {
      policies: [],
      compliance: []
    },
    stats: {
      programs: zcpcData.backlog?.programs?.length || 0,
      projects: zcpcData.backlog?.projects?.length || 0,
      epics: zcpcData.backlog?.epics?.length || 0,
      stories: zcpcData.backlog?.stories?.length || 0,
      subtasks: zcpcData.backlog?.subtasks?.length || 0
    },
    generatedAt: new Date().toISOString(),
    aiModel: 'gpt-4o',
    prompt: description,
    demoMode: demoMode
  };
}

// Helper function to store workspace data in KV
async function storeWorkspace(workspaceId: string, response: any) {
  // Store in KV database
  await kv.set(`workspace:${workspaceId}`, response.workspace);
  
  // Store methodology and metadata
  await kv.set(`workspace:${workspaceId}:methodology`, response.methodology);
  await kv.set(`workspace:${workspaceId}:metadata`, {
    industry: response.industry,
    workflow: response.workflow,
    issueTypes: response.issueTypes,
    roles: response.roles,
    capacity: response.capacity,
    risk: response.risk
  });
  
  // Store backlog hierarchy
  if (response.backlog.programs.length > 0) {
    await kv.set(`workspace:${workspaceId}:programs`, response.backlog.programs);
  }
  if (response.backlog.projects.length > 0) {
    await kv.set(`workspace:${workspaceId}:projects`, response.backlog.projects);
  }
  if (response.backlog.epics.length > 0) {
    await kv.set(`workspace:${workspaceId}:epics`, response.backlog.epics);
  }
  if (response.backlog.stories.length > 0) {
    await kv.set(`workspace:${workspaceId}:stories`, response.backlog.stories);
  }
  if (response.backlog.subtasks.length > 0) {
    await kv.set(`workspace:${workspaceId}:subtasks`, response.backlog.subtasks);
  }
  
  // Store sprints
  if (response.sprints.sprints.length > 0) {
    await kv.set(`workspace:${workspaceId}:sprints`, response.sprints);
  }
  
  // Store automation, reports, integrations, governance
  await kv.set(`workspace:${workspaceId}:automation`, response.automation);
  await kv.set(`workspace:${workspaceId}:reports`, response.reports);
  await kv.set(`workspace:${workspaceId}:integrations`, response.integrations);
  await kv.set(`workspace:${workspaceId}:governance`, response.governance);
}

// Helper function to generate a workspace key
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

export default zcpc;