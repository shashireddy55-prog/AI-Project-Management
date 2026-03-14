import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, FolderKanban, MoreVertical, Edit, Trash2, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface BoardsViewProps {
  accessToken: string;
  onBoardClick: (boardId: string) => void;
  onClose: () => void;
}

interface Board {
  id: string;
  name: string;
  type: 'kanban' | 'scrum' | 'business';
  description?: string;
  createdAt: string;
}

export function BoardsView({ accessToken, onBoardClick, onClose }: BoardsViewProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/user/workspaces`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load boards');
      }

      const data = await response.json();
      setBoards(data.workspaces || []);
    } catch (error) {
      console.error('Error loading boards:', error);
      toast.error('Failed to load boards');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'kanban': return 'bg-blue-100 text-blue-800';
      case 'scrum': return 'bg-green-100 text-green-800';
      case 'business': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FolderKanban className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
            <p className="text-sm text-gray-600 mt-1">Manage all your project boards</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button onClick={onClose} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16">
            <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No boards yet</h3>
            <p className="text-gray-600">Create your first board to get started</p>
            <Button onClick={onClose} className="mt-4">
              Create New Board
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {boards.map((board) => (
                  <Card 
                    key={board.id}
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500"
                    onClick={() => onBoardClick(board.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {getTypeIcon(board.type)}
                            {board.name}
                          </CardTitle>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info('Board options');
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge className={getTypeColor(board.type)} variant="secondary">
                          {board.type.toUpperCase()}
                        </Badge>
                        {board.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{board.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Created {new Date(board.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {boards.map((board) => (
                  <Card 
                    key={board.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-blue-500"
                    onClick={() => onBoardClick(board.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            {getTypeIcon(board.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{board.name}</h3>
                            {board.description && (
                              <p className="text-sm text-gray-600 line-clamp-1">{board.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={getTypeColor(board.type)} variant="secondary">
                            {board.type.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(board.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info('Board options');
                            }}
                            className="p-2 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
