import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Get settings
app.get('/', async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const workspaceId = c.req.query('workspaceId');
    const settingsKey = workspaceId ? `workspace:${workspaceId}:settings` : 'global:settings';

    const settings = await kv.get(settingsKey);

    return c.json(settings || {
      aiEnabled: true,
      workspaceAiEnabled: true,
      autoAssign: true,
      autoEstimate: true,
      aiSuggestions: true,
      theme: 'light',
      notifications: {
        email: true,
        browser: true,
        slack: false
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return c.json({ error: 'Failed to get settings' }, 500);
  }
});

// Save settings
app.post('/', async (c) => {
  try {
    const accessToken = c.req.header('X-Access-Token');
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const {
      workspaceId,
      aiEnabled,
      workspaceAiEnabled,
      autoAssign,
      autoEstimate,
      aiSuggestions,
      theme,
      notifications
    } = await c.req.json();

    const settingsKey = workspaceId ? `workspace:${workspaceId}:settings` : 'global:settings';

    const settings = {
      aiEnabled,
      workspaceAiEnabled,
      autoAssign,
      autoEstimate,
      aiSuggestions,
      theme,
      notifications,
      updatedAt: new Date().toISOString()
    };

    await kv.set(settingsKey, settings);

    return c.json({ success: true, settings });
  } catch (error) {
    console.error('Save settings error:', error);
    return c.json({ error: 'Failed to save settings' }, 500);
  }
});

export default app;
