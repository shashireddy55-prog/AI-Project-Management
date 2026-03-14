import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  User,
  Users,
  Circle,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  unreadCount?: number;
}

interface TeamSpaceProps {
  onBack?: () => void;
}

const sampleTeamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Product Manager', status: 'online', unreadCount: 3 },
  { id: '2', name: 'Michael Chen', email: 'michael@company.com', role: 'Lead Developer', status: 'online', unreadCount: 0 },
  { id: '3', name: 'Emma Williams', email: 'emma@company.com', role: 'UX Designer', status: 'away', unreadCount: 1 },
  { id: '4', name: 'David Brown', email: 'david@company.com', role: 'Backend Developer', status: 'online', unreadCount: 0 },
  { id: '5', name: 'Lisa Anderson', email: 'lisa@company.com', role: 'QA Engineer', status: 'offline', lastSeen: new Date(Date.now() - 3600000), unreadCount: 0 },
  { id: '6', name: 'James Wilson', email: 'james@company.com', role: 'DevOps Engineer', status: 'online', unreadCount: 0 },
];

const sampleMessages: Message[] = [
  { id: '1', senderId: '1', senderName: 'Sarah Johnson', text: 'Hey team! How\'s the new sprint going?', timestamp: new Date(Date.now() - 3600000), isMe: false },
  { id: '2', senderId: 'me', senderName: 'You', text: 'Going great! We\'ve completed 60% of our sprint goals.', timestamp: new Date(Date.now() - 3500000), isMe: true },
  { id: '3', senderId: '1', senderName: 'Sarah Johnson', text: 'That\'s awesome! Any blockers I should know about?', timestamp: new Date(Date.now() - 3400000), isMe: false },
  { id: '4', senderId: 'me', senderName: 'You', text: 'Not at the moment. The API integration is going smoothly.', timestamp: new Date(Date.now() - 3300000), isMe: true },
  { id: '5', senderId: '1', senderName: 'Sarah Johnson', text: 'Perfect! Let me know if you need any support.', timestamp: new Date(Date.now() - 3200000), isMe: false },
];

export function TeamSpace({ onBack }: TeamSpaceProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(sampleTeamMembers[0]);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMember) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      text: newMessage,
      timestamp: new Date(),
      isMe: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
    toast.success('Message sent');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (date?: Date) => {
    if (!date) return 'Offline';
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredMembers = sampleTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Team Members List - Left Sidebar */}
      <div className="w-80 glass border-r border-slate-200/30 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="hover:bg-gray-100"
                  style={{ color: '#000000' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <h2 className="text-xl font-bold" style={{ color: '#000000' }}>Team Space</h2>
            </div>
            <Badge variant="outline" className="text-xs px-2 py-1" style={{ borderColor: '#FCA311', color: '#FCA311', backgroundColor: 'rgba(252, 163, 17, 0.1)' }}>
              {sampleTeamMembers.filter(m => m.status === 'online').length} Online
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-black"
            />
          </div>
        </div>

        {/* Team Members List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-all ${
                selectedMember?.id === member.id
                  ? 'border-l-4'
                  : 'hover:bg-slate-50'
              }`}
              style={selectedMember?.id === member.id ? {
                backgroundColor: 'rgba(20, 33, 61, 0.08)',
                borderLeftColor: '#FCA311'
              } : {}}
            >
              <div className="relative">
                <Avatar className="w-12 h-12 border-2" style={{ borderColor: '#FFFFFF' }}>
                  <AvatarFallback className="text-white font-semibold" style={{ background: '#14213D' }}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <Circle 
                  className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status)} border-2 border-white rounded-full fill-current`} 
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <p className="font-semibold" style={{ color: '#000000' }}>{member.name}</p>
                  {member.unreadCount! > 0 && (
                    <Badge className="text-white" style={{ backgroundColor: '#FCA311' }}>{member.unreadCount}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{member.role}</p>
                {member.status === 'offline' && member.lastSeen && (
                  <p className="text-xs text-gray-500">{formatLastSeen(member.lastSeen)}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area - Main Content */}
      {selectedMember ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200/30 glass">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2" style={{ borderColor: '#FFFFFF' }}>
                    <AvatarFallback className="text-white font-semibold" style={{ background: '#14213D' }}>
                      {getInitials(selectedMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Circle 
                    className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(selectedMember.status)} border-2 border-white rounded-full fill-current`} 
                  />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: '#000000' }}>{selectedMember.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedMember.status === 'online' ? 'Active now' : 
                     selectedMember.status === 'away' ? 'Away' :
                     formatLastSeen(selectedMember.lastSeen)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" style={{ color: '#FCA311' }} className="hover:bg-gray-100">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" style={{ color: '#FCA311' }} className="hover:bg-gray-100">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" style={{ color: '#FCA311' }} className="hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[70%] ${message.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!message.isMe && (
                    <Avatar className="w-8 h-8 border border-white">
                      <AvatarFallback className="bg-gradient-to-br from-gray-700 to-black text-white text-xs">
                        {getInitials(message.senderName)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-2`}
                      style={message.isMe ? {
                        background: 'linear-gradient(135deg, #FCA311 0%, #e3930f 100%)',
                        color: '#FFFFFF'
                      } : {
                        backgroundColor: '#FFFFFF',
                        border: '1px solid rgba(0, 0, 0, 0.15)',
                        color: '#000000'
                      }}
                    >
                      <p>{message.text}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${message.isMe ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-200/30 glass">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <Button type="button" variant="ghost" size="sm" style={{ color: '#FCA311' }} className="hover:bg-gray-100">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button type="button" variant="ghost" size="sm" style={{ color: '#FCA311' }} className="hover:bg-gray-100">
                <Smile className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="text-black rounded-2xl"
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 0, 0, 0.15)' }}
                />
              </div>
              <Button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="text-white hover:opacity-90 rounded-2xl glow-orange shadow-lg"
                style={{ backgroundColor: '#14213D' }}
              >
                <Send className="w-5 h-5" style={{ color: '#FCA311' }} />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">Select a team member</h3>
            <p className="text-gray-600">Choose someone from the list to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}