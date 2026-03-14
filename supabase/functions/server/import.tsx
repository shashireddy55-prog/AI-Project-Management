import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Test connection to external service
app.post('/test-connection', async (c) => {
  try {
    const { source, credentials } = await c.req.json();
    const accessToken = c.req.header('X-Access-Token');

    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    let preview: any[] = [];
    let itemCount = 0;

    // Simulate fetching data from external services
    // In production, make actual API calls to the services
    switch (source) {
      case 'jira':
        if (!credentials.domain || !credentials.email || !credentials.apiToken) {
          return c.json({ error: 'Missing Jira credentials' }, 400);
        }
        // Simulate Jira API call
        preview = [
          {
            key: 'PROJ-1',
            summary: 'Sample Jira Issue 1',
            description: 'This is a sample issue imported from Jira',
            status: 'In Progress',
            priority: 'High',
            assignee: 'john@example.com',
            reporter: 'jane@example.com',
            created: '2026-02-01T10:00:00Z',
            updated: '2026-02-20T15:30:00Z',
            dueDate: '2026-03-15',
            storyPoints: 5,
            sprint: 'Sprint 5',
            labels: ['backend', 'api'],
            comments: [
              { author: 'john@example.com', body: 'Working on this', created: '2026-02-10T12:00:00Z' }
            ]
          },
          {
            key: 'PROJ-2',
            summary: 'Sample Jira Issue 2',
            description: 'Another sample issue',
            status: 'To Do',
            priority: 'Medium',
            assignee: 'bob@example.com',
            storyPoints: 3
          }
        ];
        itemCount = 145; // Simulated total count
        break;

      case 'asana':
        if (!credentials.apiToken) {
          return c.json({ error: 'Missing Asana API token' }, 400);
        }
        preview = [
          {
            gid: '12345',
            name: 'Sample Asana Task',
            notes: 'Task description',
            completed: false,
            assignee: { name: 'John Doe', email: 'john@example.com' },
            due_on: '2026-03-10',
            custom_fields: [
              { name: 'Priority', text_value: 'High' }
            ]
          }
        ];
        itemCount = 89;
        break;

      case 'trello':
        if (!credentials.apiKey || !credentials.apiToken) {
          return c.json({ error: 'Missing Trello credentials' }, 400);
        }
        preview = [
          {
            id: 'abc123',
            name: 'Sample Trello Card',
            desc: 'Card description',
            due: '2026-03-05T12:00:00Z',
            labels: [{ name: 'Important', color: 'red' }],
            idMembers: ['user1']
          }
        ];
        itemCount = 67;
        break;

      default:
        preview = [];
        itemCount = 0;
    }

    return c.json({
      success: true,
      itemCount,
      preview
    });

  } catch (error) {
    console.error('Test connection error:', error);
    return c.json({ error: 'Connection test failed: ' + error.message }, 500);
  }
});

// Start import process
app.post('/start', async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const source = formData.get('source') as string;
    const workspaceId = formData.get('workspaceId') as string;
    const credentialsStr = formData.get('credentials') as string;
    const mappingStr = formData.get('mapping') as string;
    const file = formData.get('file') as File | null;

    const credentials = credentialsStr ? JSON.parse(credentialsStr) : {};
    const mapping = mappingStr ? JSON.parse(mappingStr) : {};

    let importData: any[] = [];

    // Handle file imports
    if (file) {
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        importData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        importData = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index];
          });
          return obj;
        });
      }
    } else {
      // Handle API imports
      // In production, fetch actual data from the external service
      // For now, use demo data
      importData = await fetchExternalData(source, credentials);
    }

    // Transform data according to mapping
    const transformedData = importData.map(item => transformItem(item, mapping, source));

    // Store imported tasks
    let successCount = 0;
    let failedCount = 0;

    for (const task of transformedData) {
      try {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const taskKey = `workspace:${workspaceId}:task:${taskId}`;
        
        const taskData = {
          id: taskId,
          workspaceId,
          summary: task.summary || 'Untitled',
          description: task.description || '',
          status: task.status || 'To Do',
          priority: task.priority || 'Medium',
          assignee: task.assignee || '',
          reporter: task.reporter || '',
          tags: task.tags || [],
          startDate: task.startDate || '',
          dueDate: task.dueDate || '',
          storyPoints: task.storyPoints || 0,
          sprint: task.sprint || '',
          parentTicket: task.parentTicket || '',
          createdAt: task.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          importSource: source,
          originalId: task.originalId || '',
          comments: task.comments || [],
          attachments: task.attachments || [],
          dependencies: task.dependencies || [],
          watchers: task.watchers || []
        };

        await kv.set(taskKey, taskData);
        successCount++;
      } catch (error) {
        console.error('Failed to import task:', error);
        failedCount++;
      }
    }

    // Store import log
    const importLogKey = `workspace:${workspaceId}:import:${Date.now()}`;
    await kv.set(importLogKey, {
      source,
      timestamp: new Date().toISOString(),
      total: importData.length,
      success: successCount,
      failed: failedCount
    });

    return c.json({
      success: true,
      total: importData.length,
      success: successCount,
      failed: failedCount
    });

  } catch (error) {
    console.error('Import error:', error);
    return c.json({ error: 'Import failed: ' + error.message }, 500);
  }
});

// Fetch data from external service (placeholder - implement actual API calls)
async function fetchExternalData(source: string, credentials: any): Promise<any[]> {
  // In production, make actual API calls to external services
  // For now, return demo data
  
  const demoData: any = {
    jira: [
      {
        key: 'DEMO-1',
        fields: {
          summary: 'Implement user authentication',
          description: 'Add JWT-based authentication to the API',
          status: { name: 'In Progress' },
          priority: { name: 'High' },
          assignee: { displayName: 'John Doe', emailAddress: 'john@example.com' },
          reporter: { displayName: 'Jane Smith', emailAddress: 'jane@example.com' },
          created: '2026-01-15T10:00:00.000Z',
          updated: '2026-02-20T15:30:00.000Z',
          duedate: '2026-03-15',
          customfield_10016: 5, // Story points
          labels: ['backend', 'security'],
          comment: {
            comments: [
              { author: { displayName: 'John' }, body: 'Started working on this', created: '2026-02-10' }
            ]
          }
        }
      },
      {
        key: 'DEMO-2',
        fields: {
          summary: 'Design dashboard UI',
          description: 'Create wireframes and mockups for the main dashboard',
          status: { name: 'To Do' },
          priority: { name: 'Medium' },
          customfield_10016: 3
        }
      },
      {
        key: 'DEMO-3',
        fields: {
          summary: 'Set up CI/CD pipeline',
          description: 'Configure automated deployment',
          status: { name: 'Done' },
          priority: { name: 'High' },
          assignee: { displayName: 'Bob Wilson', emailAddress: 'bob@example.com' },
          customfield_10016: 8
        }
      }
    ],
    asana: [
      {
        gid: '1234567890',
        name: 'Update documentation',
        notes: 'Refresh API documentation with new endpoints',
        completed: false,
        assignee: { name: 'Alice Brown', email: 'alice@example.com' },
        due_on: '2026-03-10',
        custom_fields: [
          { name: 'Priority', text_value: 'High' },
          { name: 'Story Points', number_value: 2 }
        ]
      }
    ],
    trello: [
      {
        id: 'abc123',
        name: 'Fix login bug',
        desc: 'Users unable to login with special characters in password',
        due: '2026-03-05T12:00:00.000Z',
        labels: [{ name: 'Bug', color: 'red' }, { name: 'Critical', color: 'orange' }],
        idMembers: ['user1', 'user2']
      }
    ]
  };

  return demoData[source] || [];
}

// Transform item according to field mapping
function transformItem(item: any, mapping: any, source: string): any {
  const transformed: any = {
    originalId: item.id || item.key || item.gid || '',
  };

  // Handle Jira format
  if (source === 'jira' && item.fields) {
    transformed.summary = item.fields.summary;
    transformed.description = item.fields.description;
    transformed.status = item.fields.status?.name || 'To Do';
    transformed.priority = item.fields.priority?.name || 'Medium';
    transformed.assignee = item.fields.assignee?.emailAddress || item.fields.assignee?.displayName || '';
    transformed.reporter = item.fields.reporter?.emailAddress || item.fields.reporter?.displayName || '';
    transformed.createdAt = item.fields.created;
    transformed.updatedAt = item.fields.updated;
    transformed.dueDate = item.fields.duedate;
    transformed.storyPoints = item.fields.customfield_10016 || 0;
    transformed.tags = item.fields.labels || [];
    transformed.comments = item.fields.comment?.comments?.map((c: any) => ({
      author: c.author?.displayName || 'Unknown',
      body: c.body,
      created: c.created
    })) || [];
  }
  // Handle Asana format
  else if (source === 'asana') {
    transformed.summary = item.name;
    transformed.description = item.notes;
    transformed.status = item.completed ? 'Done' : 'To Do';
    transformed.assignee = item.assignee?.email || item.assignee?.name || '';
    transformed.dueDate = item.due_on;
    
    // Extract custom fields
    if (item.custom_fields) {
      item.custom_fields.forEach((field: any) => {
        if (field.name === 'Priority') {
          transformed.priority = field.text_value || 'Medium';
        }
        if (field.name === 'Story Points') {
          transformed.storyPoints = field.number_value || 0;
        }
      });
    }
  }
  // Handle Trello format
  else if (source === 'trello') {
    transformed.summary = item.name;
    transformed.description = item.desc;
    transformed.dueDate = item.due;
    transformed.tags = item.labels?.map((l: any) => l.name) || [];
    
    // Determine priority from labels
    const priorityLabel = item.labels?.find((l: any) => 
      ['Critical', 'High', 'Medium', 'Low'].includes(l.name)
    );
    transformed.priority = priorityLabel?.name || 'Medium';
  }
  // Handle generic CSV/JSON format
  else {
    // Apply field mapping
    Object.keys(mapping).forEach(sourceField => {
      const targetField = mapping[sourceField];
      if (item[sourceField] !== undefined) {
        transformed[targetField] = item[sourceField];
      }
    });
  }

  return transformed;
}

export default app;
