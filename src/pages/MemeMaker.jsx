import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Laugh, Sparkles, Download, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MemeMaker() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("funny");
  const [generatedMeme, setGeneratedMeme] = useState("");
  const [memeText, setMemeText] = useState("");
  const [loading, setLoading] = useState(false);

  const generateMeme = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setGeneratedMeme("");
    setMemeText("");
    
    try {
      // First, generate the meme concept and text
      const textPrompt = `Create a ${style} meme about: ${topic}

Provide a meme concept with:
1. A brief description of the image needed
2. The top text (if any)
3. The bottom text (if any)

Format as JSON:
{
  "image_description": "...",
  "top_text": "...",
  "bottom_text": "..."
}`;

      const memeData = await base44.integrations.Core.InvokeLLM({
        prompt: textPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            image_description: { type: "string" },
            top_text: { type: "string" },
            bottom_text: { type: "string" }
          }
        }
      });

      // Generate the image
      const imagePrompt = `${memeData.image_description}. Meme style, internet culture, high quality, funny, relatable.`;
      
      const imageResult = await base44.integrations.Core.GenerateImage({
        prompt: imagePrompt
      });

      setGeneratedMeme(imageResult.url);
      setMemeText(`${memeData.top_text || ''}\n\n${memeData.bottom_text || ''}`);
    } catch (error) {
      console.error("Error generating meme:", error);
      alert("Failed to generate meme. Please try again.");
    }
    
    setLoading(false);
  };

  const saveToWorkspace = async () => {
    if (!generatedMeme) return;
    
    await base44.entities.AIDocument.create({
      title: `Meme: ${topic.substring(0, 50)}`,
      content: `Topic: ${topic}\nStyle: ${style}\nText: ${memeText}\nImage URL: ${generatedMeme}`,
      document_type: "other",
      tags: ["meme", style]
    });
    
    alert("Meme saved to workspace!");
  };

  const styleDescriptions = {
    funny: "😂 Classic funny meme",
    sarcastic: "😏 Sarcastic and witty",
    wholesome: "🥰 Wholesome and heartwarming",
    dark: "🌑 Dark humor",
    relatable: "👌 Relatable everyday situations"
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">AI Meme Maker</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate hilarious memes automatically with AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Laugh className="w-5 h-5" />
                Meme Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meme Topic or Idea
                </label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="E.g., When you try to code at 3 AM..."
                  className="h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meme Style
                </label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="bg-white dark:bg-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(styleDescriptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateMeme}
                disabled={!topic.trim() || loading}
                className="w-full bg-gradient-to-br from-purple-500 to-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Meme...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Meme
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                AI will create both the image and the perfect caption
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Your Meme
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedMeme ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={generatedMeme}
                      alt="Generated meme"
                      className="w-full object-contain"
                    />
                    {memeText && (
                      <div className="p-4 bg-black/80 text-white text-center">
                        <p className="font-bold whitespace-pre-wrap">{memeText}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(generatedMeme, '_blank')}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={saveToWorkspace}
                      variant="outline"
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-center p-8">
                  <Laugh className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Your hilarious meme will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}