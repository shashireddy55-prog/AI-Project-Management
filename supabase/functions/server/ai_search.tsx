// AI Search Handler for Projify AI
import { Context } from "npm:hono";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

export async function handleAISearch(c: Context) {
  try {
    const { query } = await c.req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return c.json({ error: "Search query is required" }, 400);
    }

    console.log('🔍 AI Search Request:', { query });

    // Detect if this is a troubleshooting query
    const troubleshootingKeywords = [
      'issue', 'problem', 'error', 'fix', 'broken', 'not working',
      'access', 'denied', 'permission', "can't", 'cannot', 'unable',
      'missing', 'lost', 'disappeared', 'help', 'troubleshoot'
    ];
    
    const queryLower = query.toLowerCase();
    const isTroubleshootingQuery = troubleshootingKeywords.some(keyword => 
      queryLower.includes(keyword)
    );

    if (isTroubleshootingQuery) {
      console.log('🔧 Detected troubleshooting query, adding hint to results...');
      
      // Still perform search but add a troubleshooting hint
      const searchResponse = await performSearch(c, query);
      
      // Add troubleshooting suggestion to results
      if (searchResponse) {
        const data = await searchResponse.json();
        return c.json({
          ...data,
          troubleshootingHint: {
            detected: true,
            message: 'This looks like a troubleshooting query. Click "Get AI Help" for automated issue resolution.',
            severity: 'info'
          }
        });
      }
    }

    // Regular search
    return await performSearch(c, query);

  } catch (error) {
    console.error('❌ AI Search error:', error);
    return c.json({ 
      results: [],
      summary: "Search encountered an error, but you can still create workspaces and manage your projects.",
      query: '',
      timestamp: new Date().toISOString()
    }, 200);
  }
}

async function performSearch(c: Context, query: string) {
  try {
    // Get user from token (optional - search can work without auth for demo)
    let userId = null;
    try {
      // Try to get token from X-Access-Token header first (bypasses Supabase JWT validation)
      let token = c.req.header('X-Access-Token');
      
      // Fallback to Authorization header if X-Access-Token not provided
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
      
      if (token) {
        // Only try to get user if it's not the anon key
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
        if (token !== anonKey) {
          const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          );
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            userId = user.id;
            console.log('✅ Authenticated user search:', user.id);
          }
        }
      }
      
      if (!userId) {
        console.log('ℹ️ Anonymous search - no user context');
      }
    } catch (e) {
      console.log('⚠️ Token validation error, proceeding with anonymous search:', e);
    }

    // Fetch all workspaces for the user
    const workspacesData = userId 
      ? await kv.getByPrefix(`workspace:${userId}:`)
      : await kv.getByPrefix('workspace:');
    
    console.log(`📦 Found ${workspacesData.length} workspaces to search`);

    // Fetch all stories/tickets for search
    const storiesData = await kv.getByPrefix('story:');
    console.log(`🎫 Found ${storiesData.length} stories/tickets to search`);

    // Fetch all epics for search
    const epicsData = await kv.getByPrefix('epic:');
    console.log(`📋 Found ${epicsData.length} epics to search`);

    // Prepare context for AI
    const searchContext = {
      workspaces: workspacesData.map((ws: any) => ({
        id: ws.id,
        name: ws.name,
        key: ws.key,
        description: ws.description,
        type: ws.type
      })),
      stories: storiesData.map((story: any) => ({
        id: story.id,
        ticketId: story.ticketId,
        title: story.title,
        description: story.description,
        status: story.status,
        workspaceId: story.workspaceId,
        epicId: story.epicId,
        priority: story.priority
      })),
      epics: epicsData.map((epic: any) => ({
        id: epic.id,
        ticketId: epic.ticketId,
        title: epic.title,
        description: epic.description,
        workspaceId: epic.workspaceId
      }))
    };

    // Use OpenAI to perform intelligent search
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // Try OpenAI, but have fallback logic
    let results: any[] = [];
    let summary = '';

    if (openaiApiKey) {
      try {
        console.log('🤖 Calling OpenAI for intelligent search...');
        
        // Call OpenAI to analyze and search
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
                content: `You are an intelligent search assistant for Projify AI, a project management platform. Analyze the user's search query and the available data to provide relevant results. 

IMPORTANT: If the search query looks like a ticket number (e.g., "MOB-1", "TSK-42", or partial like "MOB"), prioritize searching for stories/epics with matching ticketId.

Return your response as a JSON object with two fields:
1. "results": An array of search results (max 10), each with: id, type (workspace/ticket/epic/story/document), title, description, metadata (object), and relevanceScore (0-100)
2. "summary": A helpful 2-3 sentence summary of what you found

Available data: ${JSON.stringify(searchContext, null, 2)}`
              },
              {
                role: 'user',
                content: `Search query: "${query}"`
              }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" }
          })
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          const aiResponse = JSON.parse(openaiData.choices[0].message.content);
          
          results = aiResponse.results || [];
          summary = aiResponse.summary || '';
          
          console.log('✅ AI Search completed:', {
            resultsCount: results.length,
            hasSummary: !!summary
          });
        } else {
          const errorText = await openaiResponse.text();
          console.error('❌ OpenAI API error:', openaiResponse.status, errorText);
          throw new Error('OpenAI failed, using fallback');
        }
      } catch (openaiError) {
        console.warn('⚠️ OpenAI search failed, using basic search:', openaiError);
        // Will fall through to basic search
      }
    }

    // Fallback: Basic keyword search if OpenAI didn't work
    if (results.length === 0) {
      console.log('📝 Using basic keyword search...');
      
      // Check if query looks like a ticket number (e.g., "MOB-1" or "MOB")
      const ticketPattern = /^([A-Z]+)-?(\d+)?$/i;
      const ticketMatch = query.match(ticketPattern);
      
      if (ticketMatch) {
        console.log('🎫 Detected ticket number search pattern:', ticketMatch[0]);
        
        // Search for exact or partial ticket ID matches
        const matchedStories = storiesData.filter((story: any) => 
          story.ticketId?.toLowerCase().includes(queryLower)
        );
        
        const matchedEpics = epicsData.filter((epic: any) => 
          epic.ticketId?.toLowerCase().includes(queryLower)
        );
        
        results = [
          ...matchedStories.map((story: any, idx: number) => ({
            id: story.id,
            type: 'ticket',
            title: `${story.ticketId}: ${story.title || 'Untitled Story'}`,
            description: story.description || 'No description available',
            metadata: {
              ticketId: story.ticketId,
              status: story.status || 'TODO',
              priority: story.priority || 'Medium',
              workspaceId: story.workspaceId
            },
            relevanceScore: 95 - (idx * 3)
          })),
          ...matchedEpics.map((epic: any, idx: number) => ({
            id: epic.id,
            type: 'epic',
            title: `${epic.ticketId}: ${epic.title || 'Untitled Epic'}`,
            description: epic.description || 'No description available',
            metadata: {
              ticketId: epic.ticketId,
              workspaceId: epic.workspaceId
            },
            relevanceScore: 90 - (idx * 3)
          }))
        ].slice(0, 10);
        
        summary = results.length > 0
          ? `Found ${results.length} ticket${results.length > 1 ? 's' : ''} matching "${query}". These are stories and epics with matching ticket IDs.`
          : `No tickets found matching "${query}". Try searching by workspace name or create a new ticket.`;
      } else {
        // Regular keyword search across workspaces, stories, and epics
        const matchedWorkspaces = workspacesData.filter((ws: any) => 
          ws.name?.toLowerCase().includes(queryLower) ||
          ws.key?.toLowerCase().includes(queryLower) ||
          ws.description?.toLowerCase().includes(queryLower)
        );
        
        const matchedStories = storiesData.filter((story: any) =>
          story.title?.toLowerCase().includes(queryLower) ||
          story.description?.toLowerCase().includes(queryLower) ||
          story.ticketId?.toLowerCase().includes(queryLower)
        );
        
        const matchedEpics = epicsData.filter((epic: any) =>
          epic.title?.toLowerCase().includes(queryLower) ||
          epic.description?.toLowerCase().includes(queryLower) ||
          epic.ticketId?.toLowerCase().includes(queryLower)
        );

        results = [
          ...matchedWorkspaces.slice(0, 3).map((ws: any, idx: number) => ({
            id: ws.id,
            type: 'workspace',
            title: ws.name || 'Untitled Workspace',
            description: ws.description || `Workspace ${ws.key || 'N/A'} - Click to view details`,
            metadata: {
              key: ws.key,
              type: ws.type || 'General',
              status: 'Active'
            },
            relevanceScore: 90 - (idx * 5)
          })),
          ...matchedStories.slice(0, 5).map((story: any, idx: number) => ({
            id: story.id,
            type: 'ticket',
            title: `${story.ticketId || 'N/A'}: ${story.title || 'Untitled Story'}`,
            description: story.description || 'No description available',
            metadata: {
              ticketId: story.ticketId,
              status: story.status || 'TODO',
              priority: story.priority || 'Medium'
            },
            relevanceScore: 85 - (idx * 4)
          })),
          ...matchedEpics.slice(0, 2).map((epic: any, idx: number) => ({
            id: epic.id,
            type: 'epic',
            title: `${epic.ticketId || 'N/A'}: ${epic.title || 'Untitled Epic'}`,
            description: epic.description || 'No description available',
            metadata: {
              ticketId: epic.ticketId
            },
            relevanceScore: 80 - (idx * 5)
          }))
        ].slice(0, 10);

        summary = results.length > 0 
          ? `Found ${results.length} item${results.length > 1 ? 's' : ''} matching "${query}". Results include workspaces, tickets, and epics.`
          : `No items found matching "${query}". Try creating a new workspace or refining your search.`;
      }
    }

    return c.json({
      results,
      summary,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Search error:', error);
    // Even in case of total failure, return valid JSON with empty results
    return c.json({ 
      results: [],
      summary: "Search encountered an error, but you can still create workspaces and manage your projects.",
      query: '',
      timestamp: new Date().toISOString()
    }, 200); // Return 200 instead of 500 so frontend doesn't fail
  }
}