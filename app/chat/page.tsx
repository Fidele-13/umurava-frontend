'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  LayoutDashboard,
  Users,
  FileStack,
  BarChart3,
  ListChecks,
  Settings,
  LogOut,
  X,
  Menu,
  Search,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  MoreHorizontal,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Brain,
  TrendingUp,
  Target,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Zap,
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  ChevronDown,


} from 'lucide-react';
import clsx from 'clsx';
import { AppShell, useAppShell } from '@/app/components/app-shell';
import ReactMarkdown from 'react-markdown';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'https://umurava-jaq4.onrender.com';

// ============================================================================
// API TYPES
// ============================================================================

export type Job = {
  _id: string;
  jobId: string;
  title: string;
  department: string;
  location: string;
};

export type ChatMessage = {
  role: 'hr' | 'assistant';
  content: string;
  createdAt: string;
  visualizations?: VisualizationData[];
};

export type ChatSession = {
  _id: string;
  sessionId: string;
  jobId?: string;
  jobExternalId?: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

export type VisualizationData = {
  type: 'bar' | 'pie' | 'line' | 'area';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
};

export type ScreeningResult = {
  _id: string;
  jobExternalId: string;
  rankedCandidates: Array<{
    candidateId: { firstName: string; lastName: string; _id: string };
    rank: number;
    score: number;
    decision: string;
  }>;
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status} at ${path}`);
  }

  return response.json() as Promise<T>;
}

function getJobs() {
  return request<Job[]>('/jobs');
}

function sendAIChat(prompt: string, sessionId?: string, jobId?: string) {
  return request<{ sessionId: string; answer: string; messages: ChatMessage[] }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt, sessionId, jobId }),
  });
}

function getAIChatSession(sessionId: string) {
  return request<ChatSession>(`/ai/chat/${sessionId}`);
}

function getAIScreenings() {
  return request<ScreeningResult[]>('/ai/screenings');
}

// ============================================================================
// CHAT SIDEBAR COMPONENT
// ============================================================================

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  isLoading: boolean;
}

function ChatSidebar({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  isLoading,
}: ChatSidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  const handleRename = (session: ChatSession) => {
    setEditingSessionId(session.sessionId);
    setEditingTitle(session.title);
    setMenuOpenFor(null);
  };

  const handleSaveRename = (sessionId: string) => {
    if (editingTitle.trim()) {
      onRenameSession(sessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleDelete = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      onDeleteSession(sessionId);
    }
    setMenuOpenFor(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-50 flex h-full w-80 flex-col bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transition-all duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-content-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-semibold text-white">Chat History</h2>
            </div>
            <button
              onClick={onNewChat}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white transition-all hover:bg-white/20"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-white/20" />
              <p className="mt-2 text-sm text-white/40">No chat history</p>
              <p className="text-xs text-white/30">Start a new conversation</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.sessionId}
                className={clsx(
                  'group relative rounded-xl transition-all duration-200',
                  currentSessionId === session.sessionId
                    ? 'bg-white/10 shadow-lg'
                    : 'hover:bg-white/5'
                )}
              >
                <button
                  onClick={() => {
                    onSelectSession(session.sessionId);
                    onClose();
                  }}
                  className="w-full p-3 text-left"
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/40" />
                    <div className="flex-1 min-w-0">
                      {editingSessionId === session.sessionId ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(session.sessionId);
                              if (e.key === 'Escape') setEditingSessionId(null);
                            }}
                            className="flex-1 rounded-lg bg-slate-700 px-2 py-1 text-sm text-white outline-none ring-1 ring-purple-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(session.sessionId)}
                            className="rounded p-1 text-white/60 hover:text-white"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-white truncate">
                            {session.title}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {formatDate(session.updatedAt)}
                          </p>
                          {session.jobExternalId && (
                            <span className="mt-1 inline-block rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                              Job Context
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </button>

                {/* Menu Button */}
                <div className="absolute right-2 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenFor(menuOpenFor === session.sessionId ? null : session.sessionId)}
                      className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menuOpenFor === session.sessionId && (
                      <div className="absolute right-0 top-full mt-1 z-10 min-w-32 rounded-lg bg-slate-700 shadow-lg overflow-hidden">
                        <button
                          onClick={() => handleRename(session)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                        >
                          <Edit2 className="h-3 w-3" />
                          Rename
                        </button>
                        <button
                          onClick={() => handleDelete(session.sessionId)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Brain className="h-3 w-3" />
            <span>AI Assistant powered by Gemini</span>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============================================================================
// MESSAGE COMPONENT WITH VISUALIZATIONS
// ============================================================================

interface MessageProps {
  message: ChatMessage;
  isUser: boolean;
  onCopy?: (content: string) => void;
  onRegenerate?: () => void;
}

function Message({ message, isUser, onCopy, onRegenerate }: MessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.(message.content);
  };

  const renderVisualization = (viz: VisualizationData, idx: number) => {
    const colors = viz.colors || ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

    switch (viz.type) {
      case 'bar':
        return (
          <div key={idx} className="mt-4 rounded-xl bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">{viz.title}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={viz.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={viz.xAxis || 'name'} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'pie':
        return (
          <div key={idx} className="mt-4 rounded-xl bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">{viz.title}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={viz.data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {viz.data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'line':
        return (
          <div key={idx} className="mt-4 rounded-xl bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">{viz.title}</h4>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsLineChart data={viz.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={viz.xAxis || 'name'} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={clsx('flex gap-3', isUser ? 'flex-row-reverse' : '')}>
      {/* Avatar */}
      <div className={clsx(
        'flex-shrink-0 grid h-8 w-8 place-content-center rounded-full',
        isUser
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
          : 'bg-gradient-to-br from-purple-500 to-pink-500'
      )}>
        {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
      </div>

      {/* Message Content */}
      <div className={clsx('flex-1 max-w-[80%]', isUser ? 'text-right' : '')}>
        <div className={clsx(
          'rounded-2xl px-4 py-3',
          isUser
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
            : 'bg-white shadow-sm border border-slate-200'
        )}>
          <div className={clsx(
            'prose prose-sm max-w-none',
            isUser ? 'text-white' : 'text-slate-700'
          )}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>

        {/* Visualizations */}
        {message.visualizations?.map((viz, idx) => renderVisualization(viz, idx))}

        {/* Actions */}
        <div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {!isUser && (
            <>
              <button
                onClick={handleCopy}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Copy response"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="Regenerate response"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              )}
              <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Helpful">
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Not helpful">
                <ThumbsDown className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
        <span className="text-xs text-slate-400 mt-1 block">
          {new Date(message.createdAt).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// TYPING INDICATOR COMPONENT
// ============================================================================

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 place-content-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// JOB SELECTOR COMPONENT
// ============================================================================

interface JobSelectorProps {
  jobs: Job[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string | null) => void;
}

function JobSelector({ jobs, selectedJobId, onSelectJob }: JobSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedJob = jobs.find(j => j.jobId === selectedJobId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
      >
        <Briefcase className="h-4 w-4" />
        {selectedJob ? selectedJob.title : 'No Job Context'}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-20 w-64 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <button
              onClick={() => {
                onSelectJob(null);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-50',
                !selectedJobId && 'bg-purple-50 text-purple-700'
              )}
            >
              No Job Context (General Chat)
            </button>
            {jobs.map((job) => (
              <button
                key={job.jobId}
                onClick={() => {
                  onSelectJob(job.jobId);
                  setIsOpen(false);
                }}
                className={clsx(
                  'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-50',
                  selectedJobId === job.jobId && 'bg-purple-50 text-purple-700'
                )}
              >
                <p className="font-medium">{job.title}</p>
                <p className="text-xs text-slate-500">{job.department}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// MAIN AI CHAT PAGE
// ============================================================================

export default function AIChatPage() {
  const { openSidebar } = useAppShell();
  const [chatSidebarOpen, setChatSidebarOpen] = useState(true);
  
  // Chat State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load jobs and sessions on mount
  useEffect(() => {
    loadJobs();
    loadSessionsFromStorage();
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('ai_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Load current session when sessionId changes
  useEffect(() => {
    if (currentSessionId) {
      loadSession(currentSessionId);
    } else {
      setCurrentSession(null);
      setMessages([]);
    }
  }, [currentSessionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  async function loadJobs() {
    try {
      const jobsData = await getJobs();
      setJobs(jobsData);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  }

  function loadSessionsFromStorage() {
    try {
      const stored = localStorage.getItem('ai_chat_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadSession(sessionId: string) {
    try {
      const session = await getAIChatSession(sessionId);
      setCurrentSession(session);
      setMessages(session.messages);
      setSelectedJobId(session.jobExternalId || null);
    } catch (err) {
      console.error('Failed to load session:', err);
      // Try to find in local storage
      const localSession = sessions.find(s => s.sessionId === sessionId);
      if (localSession) {
        setCurrentSession(localSession);
        setMessages(localSession.messages);
        setSelectedJobId(localSession.jobExternalId || null);
      }
    }
  }

  async function createNewChat() {
    const newSessionId = crypto.randomUUID();
    const newSession: ChatSession = {
      _id: newSessionId,
      sessionId: newSessionId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setInputValue('');
    textareaRef.current?.focus();
  }

  async function sendMessage() {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'hr',
      content: inputValue.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // Create or update session
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      setCurrentSessionId(sessionId);
    }

    try {
      const response = await sendAIChat(userMessage.content, sessionId, selectedJobId || undefined);
      
      // Update session in state
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update or create session in list
      const updatedSession: ChatSession = {
        _id: sessionId,
        sessionId: response.sessionId,
        title: sessions.find(s => s.sessionId === sessionId)?.title || generateChatTitle(userMessage.content),
        messages: [...messages, userMessage, assistantMessage],
        jobExternalId: selectedJobId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setSessions(prev => {
        const filtered = prev.filter(s => s.sessionId !== sessionId);
        return [updatedSession, ...filtered];
      });
      setCurrentSessionId(response.sessionId);
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }

  function generateChatTitle(firstMessage: string): string {
    const maxLength = 30;
    const title = firstMessage.slice(0, maxLength);
    return title.length < firstMessage.length ? `${title}...` : title;
  }

  async function deleteSession(sessionId: string) {
    setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  }

  async function renameSession(sessionId: string, newTitle: string) {
    setSessions(prev => prev.map(s => 
      s.sessionId === sessionId ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s
    ));
    if (currentSessionId === sessionId && currentSession) {
      setCurrentSession({ ...currentSession, title: newTitle });
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AppShell
      mainClassName={clsx(
        'min-h-screen transition-all duration-300 lg:pl-80',
        chatSidebarOpen ? 'lg:pr-80' : 'lg:pr-0',
      )}
    >
      {/* Chat History Sidebar */}
      <ChatSidebar
        isOpen={chatSidebarOpen}
        onClose={() => setChatSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        isLoading={loadingSessions}
      />

      {/* Main Chat Area */}
        <div className="flex h-screen flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={openSidebar}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                {chatSidebarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h1 className="text-lg font-semibold text-slate-800">AI Assistant</h1>
              </div>
              {currentSession && (
                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">
                  {currentSession.title}
                </span>
              )}
            </div>
            <JobSelector
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={setSelectedJobId}
            />
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-6">
                  <Brain className="h-12 w-12 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">AI Recruitment Assistant</h2>
                <p className="mt-2 max-w-md text-slate-500">
                  Ask me anything about candidates, job requirements, screening results, or recruitment strategies.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {[
                    "Show me top candidates for this job",
                    "What are the common skills among applicants?",
                    "Summarize the hiring pipeline",
                    "Suggest interview questions for top candidates",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInputValue(suggestion);
                        setTimeout(() => sendMessage(), 100);
                      }}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-all hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, idx) => (
                <Message
                  key={idx}
                  message={message}
                  isUser={message.role === 'hr'}
                />
              ))
            )}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI about candidates, jobs, or recruitment..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none ring-purple-500 transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 text-white shadow-md transition-all hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              AI may generate inaccurate information. Always verify critical decisions.
            </p>
          </div>
        </div>
    </AppShell>
  );
}
