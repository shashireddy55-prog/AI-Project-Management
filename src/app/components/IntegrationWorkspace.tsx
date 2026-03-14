import { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Mail, 
  MessageSquare, 
  FileText, 
  Plus, 
  Maximize2, 
  Settings,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Star,
  Grid3x3,
  Link as LinkIcon,
  Zap,
  Calendar,
  Users,
  TrendingUp,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface IntegrationCard {
  id: string;
  name: string;
  icon: any;
  color: string;
  gradient: string;
  x: number;
  y: number;
  connections?: number;
  category: 'basic' | 'social' | 'favorites' | 'productivity';
}

interface DraggableCardProps {
  card: IntegrationCard;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}

const DraggableCard = ({ card, onMove, onRemove }: DraggableCardProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'integration-card',
    item: { id: card.id, x: card.x, y: card.y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const Icon = card.icon;

  return (
    <div
      ref={drag}
      style={{
        position: 'absolute',
        left: card.x,
        top: card.y,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
      className="group"
    >
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-200 min-w-[140px]`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{card.name}</p>
            {card.connections !== undefined && (
              <p className="text-xs text-gray-500">{card.connections}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(card.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="w-4 h-4 text-gray-400 hover:text-gray-600 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface CanvasAreaProps {
  cards: IntegrationCard[];
  onMoveCard: (id: string, x: number, y: number) => void;
  onRemoveCard: (id: string) => void;
}

const CanvasArea = ({ cards, onMoveCard, onRemoveCard }: CanvasAreaProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: 'integration-card',
    drop: (item: { id: string; x: number; y: number }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const newX = Math.round(item.x + delta.x);
        const newY = Math.round(item.y + delta.y);
        onMoveCard(item.id, newX, newY);
      }
    },
  });

  return (
    <div
      ref={(node) => {
        canvasRef.current = node;
        drop(node);
      }}
      className="w-full h-full relative"
      style={{
        backgroundImage: `
          radial-gradient(circle, #e5e5e5 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Canvas Content */}
      {cards.map((card) => (
        <DraggableCard
          key={card.id}
          card={card}
          onMove={onMoveCard}
          onRemove={onRemoveCard}
        />
      ))}

      {/* Connection Lines - Visual Enhancement */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {cards.slice(0, -1).map((card, i) => {
          const nextCard = cards[i + 1];
          if (!nextCard) return null;
          return (
            <line
              key={`${card.id}-${nextCard.id}`}
              x1={card.x + 70}
              y1={card.y + 30}
              x2={nextCard.x + 70}
              y2={nextCard.y + 30}
              stroke="#d1d5db"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.3"
            />
          );
        })}
      </svg>

      {/* Floating Action Buttons */}
      <div className="absolute top-6 right-6 flex flex-col gap-2">
        <Button size="sm" variant="outline" className="bg-white shadow-lg">
          100%
        </Button>
        <Button size="sm" variant="outline" className="bg-white shadow-lg">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Bottom Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-full shadow-xl px-2 py-2 border border-gray-200">
        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
          <Star className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
          <Grid3x3 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
          <FileText className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

function IntegrationWorkspaceContent() {
  const [cards, setCards] = useState<IntegrationCard[]>([
    { id: '1', name: 'Gmail', icon: Mail, color: '#EA4335', gradient: 'from-red-500 to-red-600', x: 150, y: 120, connections: 12, category: 'basic' },
    { id: '2', name: 'Slack', icon: MessageSquare, color: '#4A154B', gradient: 'from-blue-500 to-cyan-600', x: 320, y: 140, connections: 8, category: 'basic' },
    { id: '3', name: 'Notion', icon: FileText, color: '#000000', gradient: 'from-gray-700 to-gray-900', x: 150, y: 250, connections: 5, category: 'productivity' },
    { id: '4', name: 'Open AI', icon: Zap, color: '#10A37F', gradient: 'from-green-500 to-green-600', x: 310, y: 220, connections: 15, category: 'favorites' },
    { id: '5', name: 'Calendar', icon: Calendar, color: '#4285F4', gradient: 'from-blue-500 to-blue-600', x: 480, y: 160, connections: 8, category: 'basic' },
    { id: '6', name: 'Analytics', icon: TrendingUp, color: '#34A853', gradient: 'from-green-400 to-green-600', x: 450, y: 240, connections: 12, category: 'favorites' },
  ]);

  const [showIntegrationPanel, setShowIntegrationPanel] = useState(true);

  const moveCard = (id: string, x: number, y: number) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, x, y } : card))
    );
  };

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const addIntegration = (integration: Omit<IntegrationCard, 'id' | 'x' | 'y'>) => {
    const newCard: IntegrationCard = {
      ...integration,
      id: Date.now().toString(),
      x: 300 + Math.random() * 200,
      y: 150 + Math.random() * 150,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const integrationLibrary = {
    basic: [
      { name: 'Gmail', icon: Mail, color: '#EA4335', gradient: 'from-red-500 to-red-600', connections: 12, category: 'basic' as const },
      { name: 'Slack', icon: MessageSquare, color: '#4A154B', gradient: 'from-blue-500 to-cyan-600', connections: 8, category: 'basic' as const },
      { name: 'Calendar', icon: Calendar, color: '#4285F4', gradient: 'from-blue-500 to-blue-600', connections: 20, category: 'basic' as const },
    ],
    social: [
      { name: 'Instagram', icon: Instagram, color: '#E4405F', gradient: 'from-rose-500 to-red-600', connections: 45, category: 'social' as const },
      { name: 'Twitter', icon: Twitter, color: '#1DA1F2', gradient: 'from-blue-400 to-blue-600', connections: 32, category: 'social' as const },
      { name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', gradient: 'from-blue-600 to-blue-700', connections: 28, category: 'social' as const },
    ],
    favorites: [
      { name: 'Gmail', icon: Mail, color: '#EA4335', gradient: 'from-red-500 to-red-600', connections: 12, category: 'favorites' as const },
      { name: 'Notion', icon: FileText, color: '#000000', gradient: 'from-gray-700 to-gray-900', connections: 18, category: 'favorites' as const },
      { name: 'Analytics', icon: TrendingUp, color: '#34A853', gradient: 'from-green-500 to-green-600', connections: 25, category: 'favorites' as const },
    ],
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #E5E5E5 100%)' }}>
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Integration Workspace</h1>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Zap className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Users className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <CanvasArea
          cards={cards}
          onMoveCard={moveCard}
          onRemoveCard={removeCard}
        />

        {/* Integration Panel */}
        {showIntegrationPanel && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl rounded-t-3xl">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Seamless Integrations</h3>
                  <p className="text-sm text-gray-500">Connect with your favorite platforms</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIntegrationPanel(false)}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Basic Apps */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Apps</h4>
                  <p className="text-xs text-gray-500 mb-3">Essential integrations core</p>
                  <div className="space-y-2">
                    {integrationLibrary.basic.map((integration, i) => {
                      const Icon = integration.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => addIntegration(integration)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${integration.gradient} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm text-gray-900">{integration.name}</p>
                            <p className="text-xs text-gray-500">{integration.connections}</p>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Social Media</h4>
                  <p className="text-xs text-gray-500 mb-3">Social media platforms</p>
                  <div className="space-y-2">
                    {integrationLibrary.social.map((integration, i) => {
                      const Icon = integration.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => addIntegration(integration)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${integration.gradient} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm text-gray-900">{integration.name}</p>
                            <p className="text-xs text-gray-500">{integration.connections}</p>
                          </div>
                          <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Favourites */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Favourites</h4>
                  <p className="text-xs text-gray-500 mb-3">Your favourite integrations</p>
                  <div className="space-y-2">
                    {integrationLibrary.favorites.map((integration, i) => {
                      const Icon = integration.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => addIntegration(integration)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${integration.gradient} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm text-gray-900">{integration.name}</p>
                            <p className="text-xs text-gray-500">{integration.connections}</p>
                          </div>
                          <Star className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showIntegrationPanel && (
          <Button
            onClick={() => setShowIntegrationPanel(true)}
            className="absolute bottom-6 left-6 bg-white shadow-xl"
            variant="outline"
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Show Integrations
          </Button>
        )}
      </div>
    </div>
  );
}

export function IntegrationWorkspace() {
  return (
    <DndProvider backend={HTML5Backend}>
      <IntegrationWorkspaceContent />
    </DndProvider>
  );
}
