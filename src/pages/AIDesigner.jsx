import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Download, Save, Loader2, Image as ImageIcon, Palette } from "lucide-react";
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

export default function AIDesigner() {
  const [prompt, setPrompt] = useState("");
  const [designType, setDesignType] = useState("logo");
  const [style, setStyle] = useState("modern");
  const [generatedImage, setGeneratedImage] = useState("");
  const [loading, setLoading] = useState(false);

  const generateDesign = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setGeneratedImage("");
    
    try {
      const stylePrompts = {
        modern: "modern, clean, minimalist design",
        vintage: "vintage, retro, classic style",
        futuristic: "futuristic, tech, sci-fi aesthetic",
        artistic: "artistic, creative, hand-drawn style",
        corporate: "professional, corporate, business style"
      };

      const typePrompts = {
        logo: "professional logo design",
        ui: "user interface mockup design",
        poster: "poster design with typography",
        banner: "web banner design",
        icon: "icon set design"
      };

      const fullPrompt = `Create a ${typePrompts[designType]} with ${stylePrompts[style]}. ${prompt}. High quality, professional, detailed.`;

      const result = await base44.integrations.Core.GenerateImage({
        prompt: fullPrompt
      });

      setGeneratedImage(result.url);
    } catch (error) {
      console.error("Error generating design:", error);
      alert("Failed to generate design. Please try again.");
    }
    
    setLoading(false);
  };

  const saveToWorkspace = async () => {
    if (!generatedImage) return;
    
    await base44.entities.AIDocument.create({
      title: `AI Design: ${prompt.substring(0, 50)}`,
      content: `Design Type: ${designType}\nStyle: ${style}\nPrompt: ${prompt}\nImage URL: ${generatedImage}`,
      document_type: "other",
      tags: ["design", designType, style]
    });
    
    alert("Design saved to workspace!");
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">AI Designer</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate logos, UI mockups, posters, and more with AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Design Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Design Type
                </label>
                <Select value={designType} onValueChange={setDesignType}>
                  <SelectTrigger className="bg-white dark:bg-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="logo">Logo Design</SelectItem>
                    <SelectItem value="ui">UI Mockup</SelectItem>
                    <SelectItem value="poster">Poster</SelectItem>
                    <SelectItem value="banner">Web Banner</SelectItem>
                    <SelectItem value="icon">Icon Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Style
                </label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="bg-white dark:bg-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern & Clean</SelectItem>
                    <SelectItem value="vintage">Vintage & Retro</SelectItem>
                    <SelectItem value="futuristic">Futuristic & Tech</SelectItem>
                    <SelectItem value="artistic">Artistic & Creative</SelectItem>
                    <SelectItem value="corporate">Corporate & Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Describe Your Design
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., A tech startup logo with a rocket symbol, blue and purple colors..."
                  className="h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <Button
                onClick={generateDesign}
                disabled={!prompt.trim() || loading}
                className="w-full bg-gradient-to-br from-purple-500 to-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Design...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Design
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Generation takes 5-10 seconds. Be detailed in your description for best results.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Generated Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 aspect-square flex items-center justify-center">
                    <img
                      src={generatedImage}
                      alt="Generated design"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(generatedImage, '_blank')}
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
                      Save to Workspace
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-center p-8">
                  <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Your generated design will appear here
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