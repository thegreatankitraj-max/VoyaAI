import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Plus, Sparkles, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function StoryBuilder() {
  const [stories, setStories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newStory, setNewStory] = useState({ title: "", content: "" });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadStories();
    }
  }, [currentUser]);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadStories = async () => {
    const fetchedStories = await base44.entities.StoryContext.filter(
      { created_by: currentUser.email, is_active: true },
      "-last_updated"
    );
    setStories(fetchedStories);
  };

  const createStory = async () => {
    if (!newStory.title.trim()) return;
    
    const story = await base44.entities.StoryContext.create({
      title: newStory.title,
      content: newStory.content || "New story beginning...",
      last_updated: new Date().toISOString()
    });
    
    setNewStory({ title: "", content: "" });
    setIsCreating(false);
    loadStories();
    setSelectedStory(story);
  };

  const continueStory = async () => {
    if (!selectedStory || !prompt.trim()) return;
    
    setLoading(true);
    setGeneratedContent("");
    
    try {
      const fullPrompt = `You are a creative story writer. Continue this story based on the user's prompt.

Current Story:
Title: ${selectedStory.title}
Content: ${selectedStory.content}

User's Prompt: ${prompt}

Continue the story naturally, maintaining the tone, characters, and plot. Write 2-3 paragraphs.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: false
      });

      setGeneratedContent(response);
    } catch (error) {
      console.error("Error generating story:", error);
      setGeneratedContent("Failed to generate story content. Please try again.");
    }
    
    setLoading(false);
  };

  const saveStoryUpdate = async () => {
    if (!generatedContent || !selectedStory) return;
    
    const updatedContent = selectedStory.content + "\n\n" + generatedContent;
    
    await base44.entities.StoryContext.update(selectedStory.id, {
      content: updatedContent,
      last_updated: new Date().toISOString()
    });
    
    setPrompt("");
    setGeneratedContent("");
    loadStories();
    
    const updated = stories.find(s => s.id === selectedStory.id);
    if (updated) {
      setSelectedStory({ ...updated, content: updatedContent });
    }
  };

  const deleteStory = async (storyId) => {
    await base44.entities.StoryContext.delete(storyId);
    loadStories();
    if (selectedStory?.id === storyId) {
      setSelectedStory(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Story Builder</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Co-write stories, scripts, and plots with AI memory
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-purple-500 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Story
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Create New Story</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Start a new story or script
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Story title..."
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Textarea
                  placeholder="Initial content (optional)..."
                  value={newStory.content}
                  onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                  className="h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Button onClick={createStory} className="w-full bg-gradient-to-br from-purple-500 to-blue-600">
                  Create Story
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 text-lg">Your Stories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                    selectedStory?.id === story.id
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedStory(story)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <BookOpen className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {story.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStory(story.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {stories.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No stories yet. Create your first one!
                </p>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            {selectedStory ? (
              <>
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">{selectedStory.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {selectedStory.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Continue Story
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="What happens next? E.g., 'The hero discovers a hidden door...'"
                      className="h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <Button
                      onClick={continueStory}
                      disabled={!prompt.trim() || loading}
                      className="w-full bg-gradient-to-br from-purple-500 to-blue-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Continuation
                        </>
                      )}
                    </Button>

                    {generatedContent && (
                      <div className="space-y-3">
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                            {generatedContent}
                          </p>
                        </div>
                        <Button
                          onClick={saveStoryUpdate}
                          variant="outline"
                          className="w-full"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Add to Story
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a story to continue or create a new one
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}