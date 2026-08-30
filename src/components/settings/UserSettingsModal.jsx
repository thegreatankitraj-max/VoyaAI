
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Save, User, FileText, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemoryDiaryView from "../memory/MemoryDiaryView";

export default function UserSettingsModal({ isOpen, onClose, currentUser }) {
  const [preferences, setPreferences] = useState(null);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadUserData();
    }
  }, [isOpen, currentUser]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const prefs = await base44.entities.UserPreferences.filter(
        { created_by: currentUser.email },
        "created_date",
        1
      );
      
      if (prefs.length > 0) {
        setPreferences(prefs[0]);
      } else {
        setPreferences({
          personality_mode: "friendly",
          tone_preference: "friendly",
          reasoning_mode: "fast",
          remember_context: true,
          user_context: "",
          voice_enabled: false,
          emotion_aware: true,
          // New privacy preferences defaults
          show_reasoning: true,
          bias_filter: true,
          private_mode: false,
        });
      }

      const kb = await base44.entities.KnowledgeBase.filter(
        { created_by: currentUser.email, is_active: true },
        "-created_date"
      );
      setKnowledgeBase(kb);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setLoading(false);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      if (preferences.id) {
        await base44.entities.UserPreferences.update(preferences.id, preferences);
      } else {
        await base44.entities.UserPreferences.create(preferences);
      }
      onClose();
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
    setSaving(false);
  };

  const handleDeleteKnowledge = async (id) => {
    await base44.entities.KnowledgeBase.delete(id);
    loadUserData();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-white dark:bg-gray-800">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Settings & Personalization</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Customize how Voya AI interacts with you
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preferences">
              <User className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="memory">
              <Calendar className="w-4 h-4 mr-2" />
              Memory Diary
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <FileText className="w-4 h-4 mr-2" />
              Knowledge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-900 dark:text-gray-100">AI Personality Mode</Label>
              <Select
                value={preferences?.personality_mode || "friendly"}
                onValueChange={(value) => setPreferences({...preferences, personality_mode: value})}
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">🎯 Professional - Formal and business-like</SelectItem>
                  <SelectItem value="friendly">😊 Friendly - Warm and approachable</SelectItem>
                  <SelectItem value="funny">😄 Funny - Humorous and entertaining</SelectItem>
                  <SelectItem value="therapist">💙 Therapist - Empathetic and supportive</SelectItem>
                  <SelectItem value="developer">👨‍💻 Developer - Technical and precise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-900 dark:text-gray-100">Conversation Tone</Label>
              <Select
                value={preferences?.tone_preference || "friendly"}
                onValueChange={(value) => setPreferences({...preferences, tone_preference: value})}
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-900 dark:text-gray-100">Default Reasoning Mode</Label>
              <Select
                value={preferences?.reasoning_mode || "fast"}
                onValueChange={(value) => setPreferences({...preferences, reasoning_mode: value})}
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">⚡ Fast Mode - Quick responses</SelectItem>
                  <SelectItem value="deep">🧠 Deep Mode - Detailed analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-900 dark:text-gray-100">Voice Input/Output</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enable speech-to-text and text-to-speech</p>
              </div>
              <Switch
                checked={preferences?.voice_enabled || false}
                onCheckedChange={(checked) => setPreferences({...preferences, voice_enabled: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-900 dark:text-gray-100">Emotion-Aware Responses</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI detects your mood and adjusts responses</p>
              </div>
              <Switch
                checked={preferences?.emotion_aware !== false}
                onCheckedChange={(checked) => setPreferences({...preferences, emotion_aware: checked})}
              />
            </div>

            <div>
              <Label className="text-gray-900 dark:text-gray-100">About You (helps Voya AI remember context)</Label>
              <Textarea
                value={preferences?.user_context || ""}
                onChange={(e) => setPreferences({...preferences, user_context: e.target.value})}
                placeholder="E.g., I'm a software engineer working on web apps, interested in AI and productivity..."
                className="h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This helps Voya AI provide more personalized and contextual responses
              </p>
            </div>

            <Button 
              onClick={handleSavePreferences}
              disabled={saving}
              className="w-full bg-gradient-to-br from-purple-500 to-blue-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-900 dark:text-gray-100">Show AI Reasoning</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI explains why it gave specific answers</p>
              </div>
              <Switch
                checked={preferences?.show_reasoning !== false}
                onCheckedChange={(checked) => setPreferences({...preferences, show_reasoning: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-900 dark:text-gray-100">Bias Filter</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Filter politically sensitive content</p>
              </div>
              <Switch
                checked={preferences?.bias_filter !== false}
                onCheckedChange={(checked) => setPreferences({...preferences, bias_filter: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-900 dark:text-gray-100">Private Mode</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Enhanced privacy (limited features)</p>
              </div>
              <Switch
                checked={preferences?.private_mode === true}
                onCheckedChange={(checked) => setPreferences({...preferences, private_mode: checked})}
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Your Privacy Matters</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Voya AI is committed to protecting your privacy. Visit the Privacy Dashboard to view, export, or delete all your data at any time.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="mt-4">
            <MemoryDiaryView currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4 mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your custom knowledge sources (coming soon: upload files or websites for Voya AI to learn from)
            </p>
            
            {knowledgeBase.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No custom knowledge sources yet
              </div>
            ) : (
              <div className="space-y-2">
                {knowledgeBase.map((kb) => (
                  <div key={kb.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{kb.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{kb.source_type}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKnowledge(kb.id)}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
