import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { format, startOfWeek, endOfWeek } from "date-fns";

export default function EmotionalJournal() {
  const [entries, setEntries] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: "neutral",
    energy_level: 5,
    notes: ""
  });
  const [weeklyInsights, setWeeklyInsights] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadEntries();
    }
  }, [currentUser]);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    try {
      setLoading(true);
      const fetchedEntries = await base44.entities.EmotionalEntry.filter(
        { created_by_id: currentUser.id },
        "-date"
      );
      setEntries(fetchedEntries);

      if (fetchedEntries.length > 0) {
        generateWeeklyInsights(fetchedEntries);
      }
    } catch (error) {
      console.error("Error loading entries:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyInsights = async (allEntries) => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    
    const weekEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    if (weekEntries.length === 0) {
      setWeeklyInsights(null);
      return;
    }

    const moodCounts = {};
    let totalEnergy = 0;
    
    weekEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      totalEnergy += entry.energy_level;
    });

    const avgEnergy = (totalEnergy / weekEntries.length).toFixed(1);
    const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    const prompt = `As an emotional wellness coach, analyze this week's mood data:
- ${weekEntries.length} entries this week
- Dominant mood: ${dominantMood}
- Average energy level: ${avgEnergy}/10
- Mood distribution: ${JSON.stringify(moodCounts)}

Provide:
1. A brief summary of the week's emotional pattern
2. 2-3 personalized insights or observations
3. 1-2 suggestions for maintaining or improving wellbeing

Be empathetic, supportive, and constructive. Keep it concise (3-4 sentences).`;

    try {
      const insights = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });
      
      setWeeklyInsights(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
    }
  };

  const addEntry = async () => {
    if (!newEntry.notes.trim()) return;
    
    await base44.entities.EmotionalEntry.create(newEntry);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      mood: "neutral",
      energy_level: 5,
      notes: ""
    });
    setIsAdding(false);
    loadEntries();
  };

  const moodEmojis = {
    very_happy: { emoji: "😄", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    happy: { emoji: "😊", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    neutral: { emoji: "😐", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
    sad: { emoji: "😢", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    stressed: { emoji: "😰", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
    anxious: { emoji: "😟", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    energetic: { emoji: "⚡", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
    tired: { emoji: "😴", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" }
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
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Emotional Journal</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your mood, energy, and wellbeing over time
            </p>
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-purple-500 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">New Journal Entry</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Record how you're feeling today
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    How are you feeling?
                  </label>
                  <Select
                    value={newEntry.mood}
                    onValueChange={(value) => setNewEntry({ ...newEntry, mood: value })}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(moodEmojis).map(([mood, { emoji }]) => (
                        <SelectItem key={mood} value={mood}>
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{emoji}</span>
                            {mood.replace('_', ' ')}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Energy Level: {newEntry.energy_level}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newEntry.energy_level}
                    onChange={(e) => setNewEntry({ ...newEntry, energy_level: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <Textarea
                  placeholder="What's on your mind? How was your day?"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />

                <Button onClick={addEntry} className="w-full bg-gradient-to-br from-purple-500 to-blue-600">
                  Save Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {weeklyInsights && (
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 mb-6 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                This Week's Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {weeklyInsights}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {entries.map((entry) => {
            const moodInfo = moodEmojis[entry.mood];
            return (
              <Card key={entry.id} className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{moodInfo.emoji}</span>
                      <div>
                        <Badge className={moodInfo.color}>
                          {entry.mood.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {format(new Date(entry.date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Energy: {entry.energy_level}/10
                      </div>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full"
                          style={{ width: `${(entry.energy_level / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {entry.notes}
                  </p>
                  {entry.ai_insights && (
                    <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-800 dark:text-purple-300">
                        💡 {entry.ai_insights}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {entries.length === 0 && (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="py-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Start your emotional wellness journey by creating your first entry
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}