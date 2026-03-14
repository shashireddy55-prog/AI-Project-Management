import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  BookOpen,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Star,
  Clock,
  User,
  Tag,
  Link2,
  Download,
  Share2,
  History,
  MessageSquare,
  Eye,
  Folder,
  File,
  Settings,
  Grid3x3,
  List,
  Users,
  Paperclip,
  Zap,
  Layers,
  Target,
  Palette,
  Code,
  Shield,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ArticleSpaceViewProps {
  space: any;
  onBack: () => void;
}

export function ArticleSpaceView({ space, onBack }: ArticleSpaceViewProps) {
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1', '2']));
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Mock page hierarchy data
  const pageStructure = [
    {
      id: '1',
      type: 'folder',
      title: 'Getting Started',
      icon: BookOpen,
      children: [
        { id: '1-1', type: 'page', title: 'Welcome', icon: Star, content: 'Welcome to the documentation...', author: 'John Doe', lastUpdated: '2 hours ago', views: 234, comments: 5, tags: ['intro', 'guide'] },
        { id: '1-2', type: 'page', title: 'Quick Start Guide', icon: Zap, content: 'Get started in 5 minutes...', author: 'Jane Smith', lastUpdated: '1 day ago', views: 456, comments: 12, tags: ['guide', 'tutorial'] },
        { id: '1-3', type: 'page', title: 'Installation', icon: Download, content: 'Installation instructions...', author: 'Mike Johnson', lastUpdated: '3 days ago', views: 789, comments: 8, tags: ['setup'] }
      ]
    },
    {
      id: '2',
      type: 'folder',
      title: 'Architecture',
      icon: Layers,
      children: [
        { id: '2-1', type: 'page', title: 'System Overview', icon: Target, content: 'High-level architecture...', author: 'Sarah Lee', lastUpdated: '5 hours ago', views: 123, comments: 3, tags: ['architecture'] },
        { id: '2-2', type: 'page', title: 'Database Schema', icon: FileText, content: 'Database design and relationships...', author: 'Tom Brown', lastUpdated: '2 days ago', views: 345, comments: 15, tags: ['database', 'schema'] },
        {
          id: '2-3',
          type: 'folder',
          title: 'Components',
          icon: Grid3x3,
          children: [
            { id: '2-3-1', type: 'page', title: 'Frontend Architecture', icon: Palette, content: 'Frontend component structure...', author: 'Alice Chen', lastUpdated: '1 week ago', views: 234, comments: 7, tags: ['frontend'] },
            { id: '2-3-2', type: 'page', title: 'Backend Services', icon: Settings, content: 'Backend service architecture...', author: 'Bob Wilson', lastUpdated: '1 week ago', views: 198, comments: 4, tags: ['backend'] }
          ]
        }
      ]
    },
    {
      id: '3',
      type: 'folder',
      title: 'API Reference',
      icon: Code,
      children: [
        { id: '3-1', type: 'page', title: 'REST API', icon: Link2, content: 'REST API endpoints...', author: 'David Kim', lastUpdated: '4 hours ago', views: 567, comments: 22, tags: ['api', 'rest'] },
        { id: '3-2', type: 'page', title: 'GraphQL API', icon: Share2, content: 'GraphQL schema and queries...', author: 'Emma Davis', lastUpdated: '1 day ago', views: 432, comments: 18, tags: ['api', 'graphql'] },
        { id: '3-3', type: 'page', title: 'Authentication', icon: Shield, content: 'Authentication methods...', author: 'Frank Miller', lastUpdated: '2 days ago', views: 876, comments: 31, tags: ['auth', 'security'] }
      ]
    },
    {
      id: '4',
      type: 'page',
      title: 'Troubleshooting',
      icon: AlertTriangle,
      content: 'Common issues and solutions...',
      author: 'Grace Taylor',
      lastUpdated: '6 hours ago',
      views: 654,
      comments: 28,
      tags: ['help', 'faq']
    }
  ];

  const templates = [
    { id: 't1', name: 'Blank Page', icon: File, description: 'Start from scratch' },
    { id: 't2', name: 'How-to Article', icon: BookOpen, description: 'Step-by-step guide template' },
    { id: 't3', name: 'Meeting Notes', icon: FileText, description: 'Document meeting discussions' },
    { id: 't4', name: 'Technical Spec', icon: Settings, description: 'Technical specification template' },
    { id: 't5', name: 'Decision Record', icon: Lightbulb, description: 'Architecture decision record' },
    { id: 't6', name: 'Troubleshooting Guide', icon: AlertTriangle, description: 'Problem-solution format' }
  ];

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderPageTree = (items: any[], level = 0) => {
    return items.map((item) => {
      const ItemIcon = item.icon;
      
      return (
        <div key={item.id}>
          <motion.div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200 ${
              selectedPage?.id === item.id ? 'shadow-sm' : ''
            }`}
            style={{
              marginLeft: `${level * 16}px`,
              ...(selectedPage?.id === item.id ? {
                backgroundColor: 'rgba(20, 33, 61, 0.1)',
                borderLeft: '4px solid #FCA311'
              } : {})
            }}
            onClick={() => {
              if (item.type === 'folder') {
                toggleFolder(item.id);
              } else {
                setSelectedPage(item);
              }
            }}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            {item.type === 'folder' && (
              <motion.button 
                className="flex-shrink-0"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {expandedFolders.has(item.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </motion.button>
            )}
            {item.type === 'page' && <div className="w-4" />}
            
            {/* Professional Icon */}
            <motion.div
              className="flex-shrink-0"
              style={{ color: item.type === 'folder' ? '#FCA311' : '#FCA311' }}
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <ItemIcon className="w-4 h-4" />
            </motion.div>
            
            <span className={`flex-1 text-sm transition-colors ${
              selectedPage?.id === item.id ? 'font-semibold' : 'text-gray-700 hover:text-gray-900'
            }`}
            style={selectedPage?.id === item.id ? { color: '#000000' } : {}}
            >
              {item.title}
            </span>
            
            {item.type === 'page' && item.comments > 0 && (
              <Badge variant="outline" className="text-xs bg-white shadow-sm">
                <MessageSquare className="w-3 h-3 mr-1" />
                {item.comments}
              </Badge>
            )}
          </motion.div>
          {item.type === 'folder' && expandedFolders.has(item.id) && item.children && (
            <motion.div 
              className="mt-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderPageTree(item.children, level + 1)}
            </motion.div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg" style={{ backgroundColor: '#14213D' }}>
                  <span style={{ color: '#FCA311' }}>{space.icon}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#000000' }}>{space.name}</h1>
                  <p className="text-sm text-gray-600">{space.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" style={{ color: '#FCA311' }} />
                Share
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" style={{ color: '#FCA311' }} />
                Settings
              </Button>
              <Button className="text-white gap-2" style={{ backgroundColor: '#14213D' }}>
                <Plus className="w-4 h-4" style={{ color: '#FCA311' }} />
                New Page
              </Button>
            </div>
          </div>

          {/* Search and View Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#FCA311' }} />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'tree' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tree')}
                className="gap-2"
                style={viewMode === 'tree' ? { backgroundColor: '#14213D', color: '#FFFFFF' } : {}}
              >
                <List className="w-4 h-4" style={{ color: viewMode === 'tree' ? '#FCA311' : '#737373' }} />
                Tree
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="gap-2"
                style={viewMode === 'grid' ? { backgroundColor: '#14213D', color: '#FFFFFF' } : {}}
              >
                <Grid3x3 className="w-4 h-4" style={{ color: viewMode === 'grid' ? '#FCA311' : '#737373' }} />
                Grid
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Page Tree */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold mb-2" style={{ color: '#000000' }}>Pages</h3>
            <Button variant="outline" className="w-full gap-2 justify-start" size="sm">
              <Plus className="w-4 h-4" style={{ color: '#FCA311' }} />
              Add Page or Folder
            </Button>
          </div>
          <ScrollArea className="flex-1 p-2">
            {renderPageTree(pageStructure)}
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedPage ? (
            <>
              {/* Page Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{selectedPage.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedPage.title}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {selectedPage.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedPage.lastUpdated}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {selectedPage.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {selectedPage.comments} comments
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <History className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => setIsEditing(!isEditing)}>
                      <Edit className="w-4 h-4" />
                      {isEditing ? 'Preview' : 'Edit'}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Export as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link2 className="w-4 h-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Page
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Tags */}
                {selectedPage.tags && selectedPage.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div className="flex gap-2">
                      {selectedPage.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Page Content */}
              <ScrollArea className="flex-1 bg-white">
                <div className="max-w-4xl mx-auto p-8">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Textarea
                        defaultValue={selectedPage.content}
                        className="min-h-[400px] font-mono text-sm"
                        placeholder="Write your content here... (Markdown supported)"
                      />
                      <div className="flex items-center gap-2">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-blue max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {selectedPage.content}
                      </p>

                      {/* Sample content sections */}
                      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Overview</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        This section provides detailed information about the topic. You can use rich text formatting, 
                        including bold, italic, code blocks, and more.
                      </p>

                      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Key Features</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                        <li>Feature one with detailed explanation</li>
                        <li>Feature two with use cases</li>
                        <li>Feature three with best practices</li>
                      </ul>

                      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Code Example</h3>
                      <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
                        <pre>{`function example() {\n  console.log("Hello, World!");\n  return true;\n}`}</pre>
                      </div>

                      {/* Attachments */}
                      <Card className="mt-8">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Paperclip className="w-4 h-4" />
                            Attachments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <File className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700">design-mockup.pdf</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <File className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-gray-700">data-schema.xlsx</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Comments Section */}
                  <Separator className="my-8" />
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Comments ({selectedPage.comments})
                    </h3>
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                              JD
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900">John Doe</span>
                                <span className="text-xs text-gray-500">2 hours ago</span>
                              </div>
                              <p className="text-sm text-gray-700">
                                Great documentation! This really helped me understand the architecture.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          U
                        </div>
                        <Textarea placeholder="Add a comment..." className="flex-1" />
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            // Welcome / Templates View
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome to {space.name}
                  </h2>
                  <p className="text-gray-600">
                    Select a page from the sidebar or create a new one using a template
                  </p>
                </div>

                {/* Templates */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Page Templates</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {templates.map((template) => {
                      const TemplateIcon = template.icon;
                      return (
                        <motion.div
                          key={template.id}
                          whileHover={{ y: -4, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className="relative overflow-hidden cursor-pointer group border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300"
                          >
                            {/* 3D Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            <CardHeader className="relative z-10">
                              <div className="text-center">
                                {/* 3D Icon Container */}
                                <motion.div
                                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
                                  whileHover={{ 
                                    rotateY: 15,
                                    rotateX: -10,
                                    scale: 1.1
                                  }}
                                  transition={{ duration: 0.3 }}
                                  style={{
                                    transformStyle: 'preserve-3d',
                                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                                  }}
                                >
                                  {/* Inner highlight */}
                                  <div className="absolute inset-2 bg-white/20 rounded-xl" style={{ transform: 'translateZ(5px)' }} />
                                  
                                  <TemplateIcon 
                                    className="w-8 h-8 text-white relative z-10" 
                                    style={{ 
                                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                      transform: 'translateZ(10px)'
                                    }}
                                  />
                                  
                                  {/* Top edge highlight */}
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-t-2xl" />
                                </motion.div>
                                
                                <CardTitle className="text-base group-hover:text-blue-600 transition-colors font-semibold">
                                  {template.name}
                                </CardTitle>
                                <CardDescription className="text-xs mt-2">
                                  {template.description}
                                </CardDescription>
                              </div>
                            </CardHeader>
                            
                            {/* Bottom edge shine */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            John Doe edited "Welcome"
                          </div>
                          <div className="text-xs text-gray-500">2 hours ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Jane Smith created "API Authentication"
                          </div>
                          <div className="text-xs text-gray-500">5 hours ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Mike Johnson commented on "Database Schema"
                          </div>
                          <div className="text-xs text-gray-500">1 day ago</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Page Info & Tools */}
        {selectedPage && (
          <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Page Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Page Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created by</span>
                    <span className="font-medium">{selectedPage.author}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last updated</span>
                    <span className="font-medium">{selectedPage.lastUpdated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">{selectedPage.views}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <Share2 className="w-4 h-4" />
                    Share Page
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                    <History className="w-4 h-4" />
                    Version History
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Contributors */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contributors</h4>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs border-2 border-white">
                    JD
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-xs border-2 border-white">
                    JS
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-xs border-2 border-white">
                    MJ
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-xs border-2 border-white">
                    +5
                  </div>
                </div>
              </div>

              <Separator />

              {/* Labels */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Labels</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPage.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}