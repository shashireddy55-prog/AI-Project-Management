import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { FileText, Plus, Loader2, X, ChevronRight, File, Folder } from 'lucide-react';

interface ArticlesPanelProps {
  accessToken: string;
  onClose: () => void;
}

interface ArticleSpace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  pageCount: number;
}

interface ArticlePage {
  id: string;
  spaceId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function ArticlesPanel({ accessToken, onClose }: ArticlesPanelProps) {
  const [spaces, setSpaces] = useState<ArticleSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [pages, setPages] = useState<ArticlePage[]>([]);
  const [selectedPage, setSelectedPage] = useState<ArticlePage | null>(null);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [isEditingPage, setIsEditingPage] = useState(false);

  const [newSpace, setNewSpace] = useState({
    name: '',
    description: ''
  });

  const [newPage, setNewPage] = useState({
    title: '',
    content: ''
  });

  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isSavingPage, setIsSavingPage] = useState(false);

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/articles/spaces`,
        {
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load article spaces');
      }

      const data = await response.json();
      setSpaces(data.spaces || []);
    } catch (error) {
      console.error('Error loading article spaces:', error);
      toast.error('Failed to load article spaces');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPages = async (spaceId: string) => {
    setIsLoadingPages(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/articles/spaces/${spaceId}/pages`,
        {
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load pages');
      }

      const data = await response.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSpace.name.trim()) {
      toast.error('Please enter a space name');
      return;
    }

    setIsCreatingSpace(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/articles/spaces`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(newSpace)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create space');
      }

      toast.success('Article space created successfully!');
      setNewSpace({ name: '', description: '' });
      setShowCreateSpace(false);
      loadSpaces();
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('Failed to create article space');
    } finally {
      setIsCreatingSpace(false);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPage.title.trim()) {
      toast.error('Please enter a page title');
      return;
    }

    setIsCreatingPage(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/articles/spaces/${selectedSpace}/pages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(newPage)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create page');
      }

      toast.success('Page created successfully!');
      setNewPage({ title: '', content: '' });
      setShowCreatePage(false);
      if (selectedSpace) {
        loadPages(selectedSpace);
      }
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Failed to create page');
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleUpdatePage = async () => {
    if (!selectedPage) return;

    setIsSavingPage(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/articles/pages/${selectedPage.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            title: selectedPage.title,
            content: selectedPage.content
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update page');
      }

      toast.success('Page saved successfully!');
      setIsEditingPage(false);
      if (selectedSpace) {
        loadPages(selectedSpace);
      }
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error('Failed to save page');
    } finally {
      setIsSavingPage(false);
    }
  };

  const handleSpaceClick = (spaceId: string) => {
    setSelectedSpace(spaceId);
    setSelectedPage(null);
    setShowCreatePage(false);
    loadPages(spaceId);
  };

  const handlePageClick = (page: ArticlePage) => {
    setSelectedPage(page);
    setIsEditingPage(false);
  };

  const handleBackToSpaces = () => {
    setSelectedSpace(null);
    setSelectedPage(null);
    setPages([]);
    setShowCreatePage(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex z-50" onClick={onClose}>
      <div 
        className="w-96 bg-white h-full shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Articles</h2>
            <p className="text-blue-100 text-sm mt-1">
              {selectedSpace ? 'Manage pages' : 'Documentation spaces'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Spaces View */}
          {!selectedSpace && (
            <div className="p-6">
              {!showCreateSpace && (
                <Button
                  onClick={() => setShowCreateSpace(true)}
                  className="w-full mb-6 text-white"
                  style={{ background: 'linear-gradient(135deg, #14213D, #1a2d52)' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Article Space
                </Button>
              )}

              {showCreateSpace && (
                <Card className="mb-6 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">New Article Space</CardTitle>
                    <CardDescription>Create a space for documentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateSpace} className="space-y-4">
                      <div>
                        <Label htmlFor="spaceName">Space Name</Label>
                        <Input
                          id="spaceName"
                          value={newSpace.name}
                          onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                          placeholder="Enter article space name..."
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="spaceDescription">Description (Optional)</Label>
                        <Input
                          id="spaceDescription"
                          value={newSpace.description}
                          onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                          placeholder="Brief description..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1" disabled={isCreatingSpace}>
                          {isCreatingSpace ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCreateSpace(false);
                            setNewSpace({ name: '', description: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : spaces.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No article spaces yet</p>
                  <p className="text-sm text-gray-400">Create your first space to organize documentation</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    All Spaces ({spaces.length})
                  </h3>
                  {spaces.map((space) => (
                    <Card
                      key={space.id}
                      className="cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
                      onClick={() => handleSpaceClick(space.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E5E5E5', color: '#14213D' }}>
                            <Folder className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 transition-colors truncate" style={{ ':hover': { color: '#14213D' } }}>
                              {space.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {space.pageCount} page{space.pageCount !== 1 ? 's' : ''}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(space.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {space.description && (
                              <p className="text-sm text-gray-600 mt-1 truncate">
                                {space.description}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pages View */}
          {selectedSpace && !selectedPage && (
            <div className="p-6">
              <Button
                onClick={handleBackToSpaces}
                variant="outline"
                className="mb-4"
              >
                ← Back to Spaces
              </Button>

              {!showCreatePage && (
                <Button
                  onClick={() => setShowCreatePage(true)}
                  className="w-full mb-6 text-white"
                  style={{ background: 'linear-gradient(135deg, #14213D, #1a2d52)' }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Page
                </Button>
              )}

              {showCreatePage && (
                <Card className="mb-6 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">New Page</CardTitle>
                    <CardDescription>Create a documentation page</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePage} className="space-y-4">
                      <div>
                        <Label htmlFor="pageTitle">Page Title</Label>
                        <Input
                          id="pageTitle"
                          value={newPage.title}
                          onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                          placeholder="Enter page title..."
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="pageContent">Content (Optional)</Label>
                        <Textarea
                          id="pageContent"
                          value={newPage.content}
                          onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                          placeholder="Start writing..."
                          rows={6}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1" disabled={isCreatingPage}>
                          {isCreatingPage ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Page'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCreatePage(false);
                            setNewPage({ title: '', content: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {isLoadingPages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : pages.length === 0 ? (
                <div className="text-center py-12">
                  <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No pages yet</p>
                  <p className="text-sm text-gray-400">Create your first page</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Pages ({pages.length})
                  </h3>
                  {pages.map((page) => (
                    <Card
                      key={page.id}
                      className="cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
                      onClick={() => handlePageClick(page)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {page.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Updated {new Date(page.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Page Editor View */}
          {selectedPage && (
            <div className="p-6">
              <Button
                onClick={() => setSelectedPage(null)}
                variant="outline"
                className="mb-4"
              >
                ← Back to Pages
              </Button>

              <Card>
                <CardHeader>
                  {isEditingPage ? (
                    <Input
                      value={selectedPage.title}
                      onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
                      className="text-xl font-semibold"
                    />
                  ) : (
                    <CardTitle>{selectedPage.title}</CardTitle>
                  )}
                  <CardDescription>
                    Last updated: {new Date(selectedPage.updatedAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditingPage ? (
                    <>
                      <Textarea
                        value={selectedPage.content}
                        onChange={(e) => setSelectedPage({ ...selectedPage, content: e.target.value })}
                        rows={15}
                        className="mb-4"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdatePage}
                          disabled={isSavingPage}
                          className="flex-1"
                        >
                          {isSavingPage ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingPage(false);
                            // Reload page to reset content
                            if (selectedSpace) {
                              loadPages(selectedSpace);
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="prose max-w-none mb-4 whitespace-pre-wrap">
                        {selectedPage.content || <p className="text-gray-400 italic">No content yet</p>}
                      </div>
                      <Button
                        onClick={() => setIsEditingPage(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Edit Page
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
