import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Plus,
  Search,
  BookOpen,
  Users,
  Clock,
  MoreVertical,
  Star,
  TrendingUp,
  FolderOpen,
  Calendar,
  Lightbulb,
  Code,
  Palette,
  Layers,
  Zap,
  Shield,
  Target,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface ArticleSpaceListProps {
  onSelectSpace: (space: any) => void;
  onCreateSpace: () => void;
  onBack?: () => void;
  accessToken?: string;
}

export function ArticleSpaceList({ onSelectSpace, onCreateSpace, onBack, accessToken }: ArticleSpaceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [articleSpaces, setArticleSpaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch article spaces from backend
  useEffect(() => {
    fetchArticleSpaces();
  }, []);

  const fetchArticleSpaces = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/articles/spaces`,
        {
          headers: {
            'X-Access-Token': accessToken || '',
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch article spaces');
      }

      const data = await response.json();
      setArticleSpaces(data.spaces || []);
    } catch (error) {
      console.error('Error fetching article spaces:', error);
      toast.error('Failed to load article spaces');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSpaces = articleSpaces.filter(space =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorClasses = (color: string) => {
    return 'from-blue-600 to-cyan-600 border-blue-500';
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-blue-600" />
                  Article Spaces
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Documentation spaces for your team
                </p>
              </div>
            </div>
            <Button 
              onClick={onCreateSpace}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Space
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search article spaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : articleSpaces.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No article spaces yet</h3>
              <p className="text-gray-600 mb-6">Create your first article space to start organizing documentation</p>
              <Button 
                onClick={onCreateSpace}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Space
              </Button>
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                        <FolderOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {articleSpaces.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Spaces</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center shadow-sm">
                        <BookOpen className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {articleSpaces.length > 0 ? articleSpaces.reduce((sum, space) => sum + (space.pageCount || 0), 0) : 0}
                        </div>
                        <div className="text-sm text-gray-600">Total Pages</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center shadow-sm">
                        <Users className="w-6 h-6 text-blue-700" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {articleSpaces.length > 0 ? Math.max(...articleSpaces.map(s => s.contributors || 0)) : 0}
                        </div>
                        <div className="text-sm text-gray-600">Contributors</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-200 to-cyan-300 flex items-center justify-center shadow-sm">
                        <TrendingUp className="w-6 h-6 text-cyan-700" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {articleSpaces.filter(s => s.isFavorite).length}
                        </div>
                        <div className="text-sm text-gray-600">Favorites</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Favorite Spaces */}
              {articleSpaces.some(s => s.isFavorite) && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Favorite Spaces
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articleSpaces
                      .filter(space => space.isFavorite)
                      .map((space, index) => (
                        <SpaceCard
                          key={space.id}
                          space={space}
                          index={index}
                          onSelect={onSelectSpace}
                          getColorClasses={getColorClasses}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* All Spaces */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  All Spaces ({filteredSpaces.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSpaces.map((space, index) => (
                    <SpaceCard
                      key={space.id}
                      space={space}
                      index={index}
                      onSelect={onSelectSpace}
                      getColorClasses={getColorClasses}
                    />
                  ))}

                  {/* Create New Space Card */}
                  <Card 
                    className="border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer hover:shadow-lg transition-all duration-300 flex items-center justify-center min-h-[200px] group"
                    onClick={onCreateSpace}
                  >
                    <div className="text-center p-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Space</h3>
                      <p className="text-sm text-gray-600">
                        Start a new documentation space
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SpaceCard({ space, index, onSelect, getColorClasses }: any) {
  // Use default icon if not provided
  const IconComponent = space.icon || FileText;
  
  // Calculate days ago safely
  const getDaysAgo = () => {
    if (!space.lastUpdated) return 0;
    try {
      const lastUpdated = typeof space.lastUpdated === 'string' 
        ? new Date(space.lastUpdated) 
        : space.lastUpdated;
      return Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  // Format date safely
  const getFormattedDate = () => {
    if (!space.lastUpdated) return 'N/A';
    try {
      const lastUpdated = typeof space.lastUpdated === 'string' 
        ? new Date(space.lastUpdated) 
        : space.lastUpdated;
      return lastUpdated.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="perspective-1000"
    >
      <Card 
        className="relative overflow-hidden cursor-pointer group transform-gpu transition-all duration-500 hover:shadow-2xl"
        onClick={() => onSelect(space)}
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        {/* 3D Gradient Background */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(space.color)} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
          style={{ transform: 'translateZ(-10px)' }}
        />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* 3D Icon Container */}
              <motion.div 
                className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${getColorClasses(space.color)} flex items-center justify-center shadow-xl`}
                whileHover={{ 
                  rotateY: 15,
                  rotateX: -15,
                  scale: 1.1
                }}
                transition={{ duration: 0.3 }}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2), inset 0 -2px 10px rgba(0,0,0,0.2)'
                }}
              >
                {/* Inner Glow */}
                <div className="absolute inset-1 bg-white/20 rounded-xl" style={{ transform: 'translateZ(5px)' }} />
                
                {/* Icon */}
                <IconComponent 
                  className="w-7 h-7 text-white relative z-10" 
                  style={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    transform: 'translateZ(10px)'
                  }} 
                />
                
                {/* 3D Edge Highlight */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-t-2xl" />
              </motion.div>

              <div className="flex-1">
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors flex items-center gap-2 mb-2">
                  {space.name}
                  {space.isFavorite && (
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-lg" />
                    </motion.div>
                  )}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm">
                  {space.description}
                </CardDescription>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onSelect(space);
                }}>
                  Open Space
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  {space.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Space Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>
                  Delete Space
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          {/* 3D Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div 
              className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center border border-blue-200 overflow-hidden"
              whileHover={{ scale: 1.05, rotateX: 10 }}
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-200/30 to-transparent" />
              <div className="relative z-10">
                <div className="text-xl font-bold text-blue-600 mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  {space.pageCount || space.pages || 0}
                </div>
                <div className="text-xs font-medium text-blue-700">Pages</div>
              </div>
            </motion.div>

            <motion.div 
              className="relative bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-3 text-center border border-cyan-200 overflow-hidden"
              whileHover={{ scale: 1.05, rotateX: 10 }}
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-200/30 to-transparent" />
              <div className="relative z-10">
                <div className="text-xl font-bold text-cyan-600 mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  {space.contributors || 0}
                </div>
                <div className="text-xs font-medium text-cyan-700">Contributors</div>
              </div>
            </motion.div>

            <motion.div 
              className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-3 text-center border border-blue-300 overflow-hidden"
              whileHover={{ scale: 1.05, rotateX: 10 }}
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-300/30 to-transparent" />
              <div className="relative z-10">
                <div className="text-xs text-blue-700 mb-1 font-medium">Updated</div>
                <div className="text-sm font-bold text-blue-600" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  {getDaysAgo()}d ago
                </div>
              </div>
            </motion.div>
          </div>

          {/* Category Badge & Date */}
          <div className="flex items-center justify-between pt-2">
            <Badge 
              variant="outline" 
              className="text-xs font-medium shadow-sm"
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1.5px solid rgba(0,0,0,0.1)'
              }}
            >
              {space.category || 'General'}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {getFormattedDate()}
            </div>
          </div>
        </CardContent>

        {/* Bottom 3D Edge */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </Card>
    </motion.div>
  );
}