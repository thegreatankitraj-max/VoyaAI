import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek } from "date-fns";

export default function MemoryDiaryView({ currentUser }) {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadDiaries();
    }
  }, [currentUser]);

  const loadDiaries = async () => {
    setLoading(true);
    const fetchedDiaries = await base44.entities.MemoryDiary.filter(
      { created_by: currentUser.email },
      "-week_start",
      10
    );
    setDiaries(fetchedDiaries);
    setLoading(false);
  };

  const generateWeeklySummary = async () => {
    setGenerating(true);
    try {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());

      // Get all messages from this week
      const allSessions = await base44.entities.ChatSession.filter(
        { created_by: currentUser.email },
        "-created_date"
      );

      let allMessages = [];
      for (const session of allSessions) {
        const messages = await base44.entities.ChatMessage.filter(
          { session_id: session.id },
          "created_date"
        );
        allMessages = [...allMessages, ...messages.filter(m => {
          const msgDate = new Date(m.created_date);
          return msgDate >= weekStart && msgDate <= weekEnd;
        })];
      }

      if (allMessages.length === 0) {
        alert("No conversations this week to summarize!");
        setGenerating(false);
        return;
      }

      // Create conversation summary for AI
      const conversationText = allMessages.map(m => 
        `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`
      ).join('\n\n');

      const prompt = `You are Voya AI's memory diary assistant. Analyze the following week's conversations and create a thoughtful summary.

Conversations this week:
${conversationText}

Please provide:
1. A brief summary (2-3 sentences) of what was discussed
2. Key topics (list 3-5 main topics)
3. Overall mood/emotion trend detected
4. Insights and recommendations for the user

Format as JSON:
{
  "summary": "...",
  "key_topics": ["topic1", "topic2", ...],
  "mood_trend": "...",
  "insights": "..."
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_topics: { type: "array", items: { type: "string" } },
            mood_trend: { type: "string" },
            insights: { type: "string" }
          }
        }
      });

      await base44.entities.MemoryDiary.create({
        week_start: format(weekStart, 'yyyy-MM-dd'),
        summary: response.summary,
        key_topics: response.key_topics,
        mood_trend: response.mood_trend,
        insights: response.insights
      });

      loadDiaries();
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Failed to generate weekly summary");
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">Memory Diary</h2>
        <Button 
          onClick={generateWeeklySummary}
          disabled={generating}
          className="bg-gradient-to-br from-purple-500 to-blue-600"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate This Week
            </>
          )}
        </Button>
      </div>

      {diaries.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No memory diaries yet. Generate your first weekly summary!
            </p>
          </CardContent>
        </Card>
      ) : (
        diaries.map(diary => (
          <Card key={diary.id} className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-900 dark:text-gray-100">
                    Week of {format(new Date(diary.week_start), 'MMM d, yyyy')}
                  </span>
                </div>
                {diary.mood_trend && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {diary.mood_trend}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {diary.summary}
              </p>
              
              {diary.key_topics && diary.key_topics.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Key Topics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {diary.key_topics.map((topic, i) => (
                      <Badge key={i} variant="outline" className="bg-gray-50 dark:bg-gray-700">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {diary.insights && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Insights & Recommendations
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {diary.insights}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}