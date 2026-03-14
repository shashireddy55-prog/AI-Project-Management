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
  Linkedin,
  Star,
  Grid3x3,
  Link as LinkIcon,
  Zap,
  Calendar,
  Users,
  TrendingUp,
  Github,
  Figma,
  Database
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
        opacity: isDragging ? 0.6 : 1,
        cursor: 'move',
      }}
      className="group"
    >
      {/* Glass Card */}
      <div className="relative backdrop-blur-xl bg-white/40 rounded-2xl border border-white/50 p-4 hover:bg-white/50 transition-all duration-300 min-w-[160px] shadow-lg hover:shadow-xl hover:-translate-y-0.5">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{card.name}</p>
            {card.connections !== undefined && (
              <p className="text-xs text-gray-600">{card.connections} connections</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(card.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center"
          >
            <Plus className="w-3.5 h-3.5 text-white rotate-45" />
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
          radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
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

      {/* Connection Lines - Glass Style */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {cards.slice(0, -1).map((card, i) => {
          const nextCard = cards[i + 1];
          if (!nextCard) return null;
          return (
            <line
              key={`${card.id}-${nextCard.id}`}
              x1={card.x + 80}
              y1={card.y + 35}
              x2={nextCard.x + 80}
              y2={nextCard.y + 35}
              stroke="rgba(139, 92, 246, 0.3)"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.5"
            />
          );
        })}
      </svg>

      {/* Floating Action Buttons - Unified Color */}
      <div className="absolute top-6 right-6 flex flex-col gap-2">
        <Button 
          size="sm" 
          className="backdrop-blur-xl bg-blue-500/90 hover:bg-blue-600/90 text-white border border-white/30 shadow-lg"
        >
          100%
        </Button>
        <Button 
          size="sm" 
          className="backdrop-blur-xl bg-blue-500/90 hover:bg-blue-600/90 text-white border border-white/30 shadow-lg w-9 h-9 p-0"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Bottom Toolbar - Glass Style */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 backdrop-blur-xl bg-white/40 rounded-full shadow-xl px-3 py-2 border border-white/50">
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full h-9 w-9 p-0 hover:bg-blue-500/20 text-blue-600"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full h-9 w-9 p-0 hover:bg-blue-500/20 text-blue-600"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full h-9 w-9 p-0 hover:bg-blue-500/20 text-blue-600"
        >
          <Star className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full h-9 w-9 p-0 hover:bg-blue-500/20 text-blue-600"
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full h-9 w-9 p-0 hover:bg-blue-500/20 text-blue-600"
        >
          <FileText className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

function IntegrationWorkspaceGlassContent() {
  const [cards, setCards] = useState<IntegrationCard[]>([
    { id: '1', name: 'Gmail', icon: Mail, color: '#EA4335', gradient: 'from-red-400 to-rose-500', x: 150, y: 120, connections: 12, category: 'basic' },
    { id: '2', name: 'Slack', icon: MessageSquare, color: '#4A154B', gradient: 'from-blue-400 to-cyan-500', x: 340, y: 140, connections: 8, category: 'basic' },
    { id: '3', name: 'Notion', icon: FileText, color: '#000000', gradient: 'from-gray-500 to-gray-700', x: 150, y: 260, connections: 5, category: 'productivity' },
    { id: '4', name: 'OpenAI', icon: Zap, color: '#10A37F', gradient: 'from-emerald-400 to-teal-500', x: 340, y: 260, connections: 15, category: 'favorites' },
    { id: '5', name: 'Calendar', icon: Calendar, color: '#4285F4', gradient: 'from-blue-400 to-cyan-500', x: 520, y: 160, connections: 20, category: 'basic' },
    { id: '6', name: 'Analytics', icon: TrendingUp, color: '#34A853', gradient: 'from-green-400 to-emerald-500', x: 520, y: 260, connections: 25, category: 'favorites' },
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
      x: 250 + Math.random() * 250,
      y: 150 + Math.random() * 180,
    };
    setCards((prev) => [...prev, newCard]);
  };

  const integrationLibrary = {
    basic: [
      { name: 'Gmail', icon: Mail, color: '#EA4335', gradient: 'from-red-400 to-rose-500', connections: 12, category: 'basic' as const },
      { name: 'Slack', icon: MessageSquare, color: '#4A154B', gradient: 'from-blue-400 to-cyan-500', connections: 8, category: 'basic' as const },
      { name: 'Calendar', icon: Calendar, color: '#4285F4', gradient: 'from-blue-400 to-cyan-500', connections: 20, category: 'basic' as const },
      { name: 'GitHub', icon: Github, color: '#181717', gradient: 'from-gray-600 to-gray-800', connections: 16, category: 'basic' as const },
    ],
    social: [
      { name: 'Instagram', icon: Instagram, color: '#E4405F', gradient: 'from-rose-400 to-red-500', connections: 45, category: 'social' as const },
      { name: 'Twitter', icon: Twitter, color: '#1DA1F2', gradient: 'from-blue-400 to-sky-500', connections: 32, category: 'social' as const },
      { name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', gradient: 'from-blue-500 to-blue-700', connections: 28, category: 'social' as const },
    ],
    favorites: [
      { name: 'OpenAI', icon: Zap, color: '#10A37F', gradient: 'from-emerald-400 to-teal-500', connections: 15, category: 'favorites' as const },
      { name: 'Notion', icon: FileText, color: '#000000', gradient: 'from-gray-500 to-gray-700', connections: 18, category: 'favorites' as const },
      { name: 'Analytics', icon: TrendingUp, color: '#34A853', gradient: 'from-green-400 to-emerald-500', connections: 25, category: 'favorites' as const },
      { name: 'Figma', icon: Figma, color: '#F24E1E', gradient: 'from-orange-400 to-red-500', connections: 22, category: 'favorites' as const },
    ],
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-gray-50">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-transparent to-cyan-50/50"></div>
      </div>

      {/* Top Bar - Glass */}
      <div className="relative backdrop-blur-xl bg-white/50 border-b border-white/60 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-800">Integration Workspace</h1>
          <Badge className="bg-blue-500/90 text-white border-white/30 shadow-md">
            <Zap className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            className="bg-blue-500/90 hover:bg-blue-600/90 text-white border border-white/30 shadow-md h-8 w-8 p-0"
          >
            <Users className="w-4 h-4" />
          </Button>
          <Button 
            size="sm"
            className="bg-blue-500/90 hover:bg-blue-600/90 text-white border border-white/30 shadow-md h-8 w-8 p-0"
          >
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

        {/* Integration Panel - Glass */}
        {showIntegrationPanel && (
          <div className="absolute bottom-0 left-0 right-0 backdrop-blur-xl bg-white/60 border-t border-white/60 shadow-2xl rounded-t-3xl">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Seamless Integrations</h3>
                  <p className="text-sm text-gray-600">Connect with your favorite platforms</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowIntegrationPanel(false)}
                  className="bg-blue-500/90 hover:bg-blue-600/90 text-white border border-white/30 shadow-md h-8 w-8 p-0"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Basic Apps */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Basic Apps</h4>
                  <p className="text-xs text-gray-600 mb-3">Essential integrations</p>
                  <div className="space-y-2">
                    {integrationLibrary.basic.map((integration, i) => {
                      const Icon = integration.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => addIntegration(integration)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/60 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-white/60"
                        >
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${integration.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-sm text-gray-800">{integration.name}</p>
                            <p className="text-xs text-gray-600">{integration.connections} connections</p>
                          </div>
                          <Plus className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Social Media</h4>
                  <p className="text-xs text-gray-600 mb-3">Social platforms</p>
                  <div className="space-y-2">
                    {integrationLibrary.social.map((integration, i) => {
                      const Icon = integration.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => addIntegration(integration)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/60 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-white/60"
                        >
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${integration.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-sm text-gray-800">{integration.name}</p>
                            <p className="text-xs text-gray-600">{integration.connections} connections</p>
                          </div>
                          <Plus className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Favourites */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Favourites</h4>
                  <p className="text-xs text-gray-600 mb-3">Your top picks</p>
                  <div className="space-y-2">
                    {integrationLibrary.favorites.map((integration, i) => {
                      const Icon = integration.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => addIntegration(integration)}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/60 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-white/60"
                        >
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${integration.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-sm text-gray-800">{integration.name}</p>
                            <p className="text-xs text-gray-600">{integration.connections} connections</p>
                          </div>
                          <Star className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            className="absolute bottom-6 left-6 backdrop-blur-xl bg-blue-500/90 hover:bg-blue-600/90 text-white border border-white/30 shadow-xl"
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Show Integrations
          </Button>
        )}
      </div>
    </div>
  );
}

export function IntegrationWorkspaceGlass() {
  return (
    <DndProvider backend={HTML5Backend}>
      <IntegrationWorkspaceGlassContent />
    </DndProvider>
  );
}
