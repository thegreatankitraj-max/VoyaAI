import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Bot, Plus, MessageSquare, Trash2, Moon, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import UserSettingsModal from "./components/settings/UserSettingsModal";

export default function Layout({ children, currentPageName }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('voyaai-dark-mode');
    return saved === 'true';
  });
  
  const location = useLocation();
  const activeSessionId = new URLSearchParams(location.search).get('session_id');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchSessions();
    }
  }, [location, currentUser]);

  useEffect(() => {
    localStorage.setItem('voyaai-dark-mode', darkMode.toString());
    const htmlElement = document.documentElement;
    if (darkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedSessions = await base44.entities.ChatSession.filter(
        { created_by_id: currentUser.id },
        "-created_date"
      );
      setSessions(fetchedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteSession = async (sessionIdToDelete) => {
    await base44.entities.ChatSession.delete(sessionIdToDelete);
    fetchSessions();
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <style>
        {`
          :root {
            --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .gradient-text {
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .glass-morphism {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(229, 231, 235, 0.8);
          }
          
          .dark .glass-morphism {
            background: rgba(30, 30, 30, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .message-bubble-user {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .message-bubble-ai {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(229, 231, 235, 0.8);
          }
          
          .dark .message-bubble-ai {
            background: rgba(50, 50, 60, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}
      </style>
      
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
        <header className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text tracking-tight">Voya AI</h1>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(true)}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 flex-1 overflow-y-auto bg-white dark:bg-gray-900">
          <Link to={createPageUrl("VoyaAI")}>
            <Button variant="outline" className="w-full mb-6 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </Link>
          
          <div className="space-y-1 mb-6">
            <Link 
              to={createPageUrl("Tasks")} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                currentPageName === 'Tasks'
                  ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Tasks</span>
            </Link>
            
            <Link 
              to={createPageUrl("Workspace")} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                currentPageName === 'Workspace'
                  ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Workspace</span>
            </Link>

            <Link 
              to={createPageUrl("PrivacyDashboard")} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                currentPageName === 'PrivacyDashboard'
                  ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Privacy</span>
            </Link>

            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">Creative Tools</p>
              
              <Link 
                to={createPageUrl("AIDesigner")} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                  currentPageName === 'AIDesigner'
                    ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">AI Designer</span>
              </Link>

              <Link 
                to={createPageUrl("VideoCompanion")} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                  currentPageName === 'VideoCompanion'
                    ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Video Companion</span>
              </Link>

              <Link 
                to={createPageUrl("StoryBuilder")} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                  currentPageName === 'StoryBuilder'
                    ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Story Builder</span>
              </Link>

              <Link 
                to={createPageUrl("MemeMaker")} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                  currentPageName === 'MemeMaker'
                    ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Meme Maker</span>
              </Link>
            </div>

            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">Advanced Features</p>
              
              <Link 
                to={createPageUrl("AITeam")} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                  currentPageName === 'AITeam'
                    ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">AI Team</span>
              </Link>

              <Link 
                to={createPageUrl("EmotionalJournal")} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                  currentPageName === 'EmotionalJournal'
                    ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Emotional Journal</span>
              </Link>

              <Link 
                to={createPageUrl("Achievements")} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                  currentPageName === 'Achievements'
                    ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Achievements</span>
              </Link>
            </div>
          </div>
          
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 mb-2">Recent Chats</h2>
          <div className="space-y-1">
            {loading ? (
               Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)
            ) : (
              sessions.map(session => (
                <div key={session.id} className="group relative">
                  <Link 
                    to={createPageUrl(`VoyaAI?session_id=${session.id}`)} 
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${
                      activeSessionId === session.id 
                        ? 'bg-gray-100 dark:bg-gray-700/80 shadow-sm' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate flex-1">{session.title}</span>
                  </Link>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-7 h-7">
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-gray-800 dark:border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                            This will permanently delete the chat session. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSession(session.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
            {!loading && sessions.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No chats yet. Start a new conversation!
              </p>
            )}
          </div>
        </div>

        {currentUser && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.full_name?.[0] || currentUser.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {currentUser.full_name || currentUser.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <main className="flex-1 flex flex-col h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {children}
        </main>
      </div>

      {currentUser && (
        <UserSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}