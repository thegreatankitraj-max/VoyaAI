import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      setCurrentUser(user);

      const [unlocked, sessions, tasks, documents] = await Promise.all([
        base44.entities.UserAchievement.filter({ created_by_id: user.id }, "-unlocked_date"),
        base44.entities.ChatSession.filter({ created_by_id: user.id }, "-created_date"),
        base44.entities.Task.filter({ created_by_id: user.id, status: "completed" }, "-created_date"),
        base44.entities.AIDocument.filter({ created_by_id: user.id }, "-created_date")
      ]);

      setAchievements(unlocked);
      setStats({
        totalSessions: sessions.length,
        completedTasks: tasks.length,
        totalDocuments: documents.length
      });

      const points = unlocked.reduce((sum, ach) => sum + (ach.points || 0), 0);
      setTotalPoints(points);

      // Auto-check for new achievements
      await checkAchievements(sessions.length, tasks.length, documents.length, unlocked);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async (sessionCount, taskCount, docCount, currentAchievements) => {
    const achievementDefs = [
      {
        type: "first_chat",
        title: "First Conversation",
        description: "Started your first chat with Voya AI",
        points: 10,
        condition: sessionCount >= 1,
        icon: "💬"
      },
      {
        type: "10_conversations",
        title: "Conversationalist",
        description: "Had 10 conversations with Voya AI",
        points: 50,
        condition: sessionCount >= 10,
        icon: "🗣️"
      },
      {
        type: "task_master",
        title: "Task Master",
        description: "Completed 20 tasks",
        points: 100,
        condition: taskCount >= 20,
        icon: "✅"
      },
      {
        type: "creative_genius",
        title: "Creative Genius",
        description: "Created 15 AI documents",
        points: 75,
        condition: docCount >= 15,
        icon: "🎨"
      },
      {
        type: "knowledge_seeker",
        title: "Knowledge Seeker",
        description: "Used Voya AI for 7 consecutive days",
        points: 150,
        condition: false, // Would need day tracking
        icon: "📚"
      }
    ];

    const unlockedTypes = currentAchievements.map(a => a.achievement_type);

    for (const def of achievementDefs) {
      if (def.condition && !unlockedTypes.includes(def.type)) {
        await base44.entities.UserAchievement.create({
          achievement_type: def.type,
          title: def.title,
          description: def.description,
          points: def.points,
          unlocked_date: new Date().toISOString()
        });
      }
    }
  };

  const allAchievements = [
    { type: "first_chat", title: "First Conversation", description: "Started your first chat", points: 10, icon: "💬" },
    { type: "10_conversations", title: "Conversationalist", description: "Had 10 conversations", points: 50, icon: "🗣️" },
    { type: "task_master", title: "Task Master", description: "Completed 20 tasks", points: 100, icon: "✅" },
    { type: "creative_genius", title: "Creative Genius", description: "Created 15 documents", points: 75, icon: "🎨" },
    { type: "knowledge_seeker", title: "Knowledge Seeker", description: "7 day streak", points: 150, icon: "📚" },
    { type: "week_streak", title: "Weekly Warrior", description: "Used Voya AI every day for a week", points: 200, icon: "🔥" },
    { type: "month_streak", title: "Monthly Master", description: "30 day streak", points: 500, icon: "👑" }
  ];

  const unlockedTypes = achievements.map(a => a.achievement_type);

  const level = Math.floor(totalPoints / 100) + 1;
  const nextLevelPoints = level * 100;
  const levelProgress = (totalPoints % 100);

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
          <h1 className="text-3xl font-bold gradient-text mb-2">Achievements & Progress</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your journey and unlock rewards
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-10 h-10" />
                <div>
                  <p className="text-3xl font-bold">{totalPoints}</p>
                  <p className="text-sm opacity-90">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Star className="w-10 h-10 text-yellow-500" />
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Level {level}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
                </div>
              </div>
              <Progress value={levelProgress} className="mt-3" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {levelProgress}/100 to Level {level + 1}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="w-10 h-10 text-green-500" />
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{achievements.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unlocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAchievements.map((ach) => {
            const isUnlocked = unlockedTypes.includes(ach.type);
            return (
              <Card
                key={ach.type}
                className={`${
                  isUnlocked
                    ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border-purple-200 dark:border-purple-800'
                    : 'bg-white dark:bg-gray-800 opacity-60'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-4xl ${isUnlocked ? '' : 'grayscale'}`}>
                      {ach.icon}
                    </span>
                    {isUnlocked && (
                      <Badge className="bg-green-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                    {ach.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {ach.description}
                  </p>
                  <Badge variant="outline" className="text-purple-600 dark:text-purple-400">
                    {ach.points} points
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}