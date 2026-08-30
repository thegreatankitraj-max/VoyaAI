import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Download, Trash2, Eye, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

export default function PrivacyDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      setCurrentUser(user);

      // Load all user data
      const [sessions, messages, tasks, documents, preferences, stories, diary] = await Promise.all([
        base44.entities.ChatSession.filter({ created_by_id: user.id }, "-created_date"),
        base44.entities.ChatMessage.filter({ created_by_id: user.id }, "-created_date"),
        base44.entities.Task.filter({ created_by_id: user.id }, "-created_date"),
        base44.entities.AIDocument.filter({ created_by_id: user.id }, "-created_date"),
        base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date"),
        base44.entities.StoryContext.filter({ created_by_id: user.id }, "-created_date"),
        base44.entities.MemoryDiary.filter({ created_by_id: user.id }, "-created_date")
      ]);

      setAllData({
        sessions,
        messages,
        tasks,
        documents,
        preferences,
        stories,
        diary
      });

      setStats({
        totalSessions: sessions.length,
        totalMessages: messages.length,
        totalTasks: tasks.length,
        totalDocuments: documents.length,
        totalStories: stories.length
      });
    } catch (error) {
      console.error("Error loading privacy data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportAllData = () => {
    const dataToExport = {
      user: currentUser,
      ...allData,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voya-ai-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteAllData = async () => {
    setLoading(true);
    
    // Delete all user data
    const deletePromises = [];
    
    allData.sessions.forEach(item => deletePromises.push(base44.entities.ChatSession.delete(item.id)));
    allData.messages.forEach(item => deletePromises.push(base44.entities.ChatMessage.delete(item.id)));
    allData.tasks.forEach(item => deletePromises.push(base44.entities.Task.delete(item.id)));
    allData.documents.forEach(item => deletePromises.push(base44.entities.AIDocument.delete(item.id)));
    allData.stories.forEach(item => deletePromises.push(base44.entities.StoryContext.delete(item.id)));
    allData.diary.forEach(item => deletePromises.push(base44.entities.MemoryDiary.delete(item.id)));
    allData.preferences.forEach(item => deletePromises.push(base44.entities.UserPreferences.delete(item.id)));

    await Promise.all(deletePromises);
    
    alert("All your data has been deleted successfully.");
    loadUserAndData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Privacy & Data Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View, export, or delete all your data
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalMessages}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalDocuments}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Lock className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSessions}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Chat Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white dark:bg-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Export All Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download all your conversations, tasks, and documents as JSON
                </p>
              </div>
              <Button onClick={exportAllData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Delete All Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently remove all your data from Voya AI
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white dark:bg-gray-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Delete All Data?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                      This will permanently delete all your chat sessions, messages, tasks, documents, stories, and preferences. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white dark:bg-gray-700">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAllData} className="bg-red-500 hover:bg-red-600">
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Data Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Total Chat Sessions</span>
                  <Badge>{stats.totalSessions}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Total Messages</span>
                  <Badge>{stats.totalMessages}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Total Tasks</span>
                  <Badge>{stats.totalTasks}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Total Documents</span>
                  <Badge>{stats.totalDocuments}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Total Stories</span>
                  <Badge>{stats.totalStories}</Badge>
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="mt-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allData.sessions.map((session) => (
                    <div key={session.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{session.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Created: {new Date(session.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allData.tasks.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className="text-xs">{task.status}</Badge>
                        <Badge className="text-xs">{task.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allData.documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{doc.title}</p>
                      <Badge className="text-xs mt-1">{doc.document_type}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}