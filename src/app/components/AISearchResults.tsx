import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Sparkles, FileText, FolderKanban, CheckSquare, Users, Calendar, TrendingUp, Loader2, ArrowRight, AlertCircle, Wrench } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { AITroubleshootModal } from './AITroubleshootModal';

interface AISearchResultsProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  accessToken?: string;
  onResultClick?: (result: SearchResult) => void;
}

interface SearchResult {
  id: string;
  type: 'workspace' | 'ticket' | 'epic' | 'story' | 'user' | 'document';
  title: string;
  description: string;
  metadata?: any;
  relevanceScore: number;
}

interface TroubleshootingHint {
  detected: boolean;
  message: string;
  severity: string;
}

export function AISearchResults({ isOpen, onClose, searchQuery, accessToken, onResultClick }: AISearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [troubleshootingHint, setTroubleshootingHint] = useState<TroubleshootingHint | null>(null);
  const [showTroubleshootModal, setShowTroubleshootModal] = useState(false);

  useEffect(() => {
    if (isOpen && searchQuery) {
      performAISearch();
    }
  }, [isOpen, searchQuery]);

  const performAISearch = async () => {
    setIsSearching(true);
    try {
      console.log('🔍 AI Search Request:', { 
        query: searchQuery,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0
      });

      // Build headers - use X-Access-Token to bypass Supabase's automatic JWT validation
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Use X-Access-Token instead of Authorization to bypass Supabase JWT validation
      // This allows the backend to handle auth validation itself
      if (accessToken && typeof accessToken === 'string' && accessToken.trim().length > 0) {
        headers['X-Access-Token'] = accessToken;
        console.log('✅ Using X-Access-Token for search');
      } else {
        console.log('ℹ️ No auth token - proceeding with anonymous search');
      }

      console.log('📡 Calling AI search endpoint...');

      // Call backend AI search endpoint
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/ai-search`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: searchQuery })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Search API Error:', response.status, errorText);
        throw new Error(`Search failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Search completed successfully:', {
        resultsCount: data.results?.length || 0,
        hasSummary: !!data.summary
      });

      setResults(data.results || []);
      setAiSummary(data.summary || '');
      setTroubleshootingHint(data.troubleshootingHint || null);

      // Show hint if detected
      if (data.troubleshootingHint?.detected) {
        toast.info('🔧 Troubleshooting mode detected', {
          description: 'Click "Get AI Help" to diagnose and fix this issue'
        });
      }
    } catch (error) {
      console.error('AI Search Error:', error);
      toast.warning('Using demo results', {
        description: 'AI search temporarily unavailable'
      });
      // Fallback to demo results
      generateDemoResults();
    } finally {
      setIsSearching(false);
    }
  };

  const generateDemoResults = () => {
    const demoResults: SearchResult[] = [
      {
        id: '1',
        type: 'workspace',
        title: 'Mobile Banking App',
        description: `Found workspace matching "${searchQuery}". Contains 15 epics, 45 stories, and 120 subtasks.`,
        metadata: { key: 'MOB', status: 'Active', team: 8 },
        relevanceScore: 95
      },
      {
        id: '2',
        type: 'ticket',
        title: 'MOB-42: Implement Biometric Authentication',
        description: `Story related to "${searchQuery}". Assigned to John Doe, In Progress.`,
        metadata: { status: 'In Progress', priority: 'High', assignee: 'John Doe', ticketId: 'MOB-42' },
        relevanceScore: 88
      },
      {
        id: '3',
        type: 'epic',
        title: 'EPIC-5: User Authentication System',
        description: `Epic containing features for "${searchQuery}". 12 stories, 8 completed.`,
        metadata: { progress: 67, stories: 12, completed: 8 },
        relevanceScore: 82
      },
      {
        id: '4',
        type: 'document',
        title: 'Authentication Architecture Document',
        description: `Technical documentation about "${searchQuery}" implementation.`,
        metadata: { lastUpdated: '2 days ago', author: 'Tech Lead' },
        relevanceScore: 75
      }
    ];

    setResults(demoResults);
    setAiSummary(`I found ${demoResults.length} results related to "${searchQuery}". The most relevant items include workspace configurations, active tickets, and related documentation. Would you like me to provide more specific information about any of these items?`);
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Search result clicked:', result);
    
    // Show a toast with the ticket information
    if (result.type === 'ticket' || result.type === 'epic') {
      toast.success(`Opening ${result.metadata?.ticketId || result.title}`, {
        description: 'Navigating to ticket details...'
      });
    } else if (result.type === 'workspace') {
      toast.success(`Opening workspace: ${result.title}`, {
        description: 'Loading workspace details...'
      });
    }
    
    // Call the optional callback
    if (onResultClick) {
      onResultClick(result);
    }
    
    // TODO: Navigate to the appropriate view based on result type
    // This can be enhanced later to actually navigate to the ticket/workspace
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'workspace': return FolderKanban;
      case 'ticket': return CheckSquare;
      case 'epic': return TrendingUp;
      case 'story': return FileText;
      case 'user': return Users;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'workspace': return '#14213D';
      case 'ticket': return '#FCA311';
      case 'epic': return '#9333EA';
      case 'story': return '#3B82F6';
      case 'user': return '#10B981';
      case 'document': return '#6366F1';
      default: return '#6B7280';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ai-search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl shadow-2xl border border-blue-200/30 w-full max-w-4xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200/30 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>
                      AI Search Results
                    </h2>
                    <p className="text-sm text-gray-600">Powered by OpenAI</p>
                  </div>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-8 h-8 p-0 hover:bg-red-100 hover:text-red-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search Query Display */}
              <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-blue-200/30">
                <Search className="w-4 h-4" style={{ color: '#FCA317' }} />
                <span className="font-medium" style={{ color: '#000000' }}>
                  "{searchQuery}"
                </span>
                <Badge 
                  className="ml-auto text-xs"
                  style={{ 
                    backgroundColor: 'rgba(252, 163, 17, 0.1)', 
                    color: '#FCA317',
                    borderColor: '#FCA317'
                  }}
                >
                  {results.length} results
                </Badge>
              </div>
            </div>

            {/* Troubleshooting Hint */}
            {troubleshootingHint?.detected && !isSearching && (
              <div className="p-4 mx-6 mt-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-300 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1" style={{ color: '#000000' }}>
                      Troubleshooting Mode Detected
                    </h4>
                    <p className="text-xs text-gray-700 mb-2">
                      {troubleshootingHint.message}
                    </p>
                    <Button
                      onClick={() => setShowTroubleshootModal(true)}
                      size="sm"
                      className="text-white text-xs"
                      style={{ background: 'linear-gradient(to right, #DC2626, #EA580C)' }}
                    >
                      <Wrench className="w-3 h-3 mr-1" />
                      Get AI Help
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Summary */}
            {aiSummary && !isSearching && (
              <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2" style={{ color: '#000000' }}>
                      AI Analysis
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {aiSummary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            <div className="overflow-y-auto max-h-[50vh]">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#FCA311' }} />
                  <p className="text-gray-600 font-medium">AI is searching through your workspace...</p>
                  <p className="text-sm text-gray-500">Analyzing workspaces, tickets, epics, and documents</p>
                </div>
              ) : results.length > 0 ? (
                <div className="p-6 space-y-3">
                  {results.map((result, index) => {
                    const Icon = getIconForType(result.type);
                    const color = getColorForType(result.type);

                    return (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-strong rounded-xl p-4 border border-slate-200/30 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <Icon className="w-6 h-6" style={{ color }} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="font-semibold text-base truncate" style={{ color: '#000000' }}>
                                {result.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className="text-xs flex-shrink-0"
                                style={{ 
                                  borderColor: color,
                                  color: color,
                                  backgroundColor: `${color}10`
                                }}
                              >
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {result.description}
                            </p>

                            {/* Metadata */}
                            {result.metadata && (
                              <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                                {Object.entries(result.metadata).map(([key, value]) => (
                                  <div key={key} className="flex items-center gap-1">
                                    <span className="font-medium capitalize">{key}:</span>
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Relevance Score */}
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${result.relevanceScore}%`,
                                    backgroundColor: color
                                  }}
                                />
                              </div>
                              <span className="text-xs font-medium" style={{ color }}>
                                {result.relevanceScore}% match
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No results found</p>
                  <p className="text-sm text-gray-500">Try a different search query</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {results.length > 0 && !isSearching && (
              <div className="p-6 border-t border-slate-200/30 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    💡 <span className="font-medium">Tip:</span> Click on any result to view details
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-100"
                      onClick={onClose}
                    >
                      Close
                    </Button>
                    <Button
                      className="text-white shadow-md"
                      style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)' }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" style={{ color: '#FCA311' }} />
                      Refine Search
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      {/* AI Troubleshoot Modal */}
      <AITroubleshootModal
        isOpen={showTroubleshootModal}
        onClose={() => setShowTroubleshootModal(false)}
        initialQuery={searchQuery}
        accessToken={accessToken}
      />
    </AnimatePresence>
  );
}