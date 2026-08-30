import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Video, Sparkles, Loader2, FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VideoCompanion() {
  const [videoUrl, setVideoUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [keyPoints, setKeyPoints] = useState([]);
  const [loading, setLoading] = useState(false);

  const analyzeVideo = async () => {
    if (!videoUrl.trim()) return;
    
    setLoading(true);
    setSummary("");
    setKeyPoints([]);
    
    try {
      const prompt = `Analyze this video URL: ${videoUrl}

Please provide:
1. A comprehensive summary of the video content
2. Key points and main takeaways
3. Important quotes or moments
4. Overall assessment and recommendations

Format as JSON:
{
  "summary": "...",
  "key_points": ["point1", "point2", ...],
  "assessment": "..."
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            assessment: { type: "string" }
          }
        }
      });

      setSummary(response.summary + "\n\n" + response.assessment);
      setKeyPoints(response.key_points || []);
    } catch (error) {
      console.error("Error analyzing video:", error);
      setSummary("Failed to analyze video. Please make sure the URL is valid and publicly accessible.");
    }
    
    setLoading(false);
  };

  const saveAnalysis = async () => {
    if (!summary) return;
    
    const content = `Video URL: ${videoUrl}\n\nSummary:\n${summary}\n\nKey Points:\n${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    
    await base44.entities.AIDocument.create({
      title: `Video Analysis: ${videoUrl.substring(0, 50)}`,
      content: content,
      document_type: "summary",
      tags: ["video", "analysis"]
    });
    
    alert("Video analysis saved to workspace!");
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">AI Video Companion</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Summarize and analyze YouTube, TikTok, or any video content
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video URL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube, TikTok, or video URL..."
                className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <Button
                onClick={analyzeVideo}
                disabled={!videoUrl.trim() || loading}
                className="bg-gradient-to-br from-purple-500 to-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Video
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports YouTube, TikTok, and most public video URLs
            </p>
          </CardContent>
        </Card>

        {summary && (
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Analysis Results
                </div>
                <Button onClick={saveAnalysis} variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="keypoints">Key Points</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="mt-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {summary}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="keypoints" className="mt-4">
                  <div className="space-y-2">
                    {keyPoints.map((point, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 flex-1">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}