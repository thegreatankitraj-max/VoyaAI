import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Sparkles, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentSummarizer() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryType, setSummaryType] = useState("concise");

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target.result);
      };
      reader.readAsText(selectedFile);
    }
  };

  const generateSummary = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setSummary("");
    
    try {
      const summaryPrompts = {
        concise: "Provide a concise 2-3 sentence summary of the following text:",
        detailed: "Provide a detailed summary with key points and main ideas:",
        bullet: "Summarize the following text as clear bullet points:",
        executive: "Create an executive summary suitable for business presentation:"
      };

      const prompt = `${summaryPrompts[summaryType]}

Text to summarize:
${text}

Provide a clear, well-structured summary.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setSummary(response);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Failed to generate summary. Please try again.");
    }
    
    setLoading(false);
  };

  const saveSummary = async () => {
    if (!summary) return;
    
    await base44.entities.AIDocument.create({
      title: `Summary: ${file?.name || 'Text Document'}`,
      content: summary,
      document_type: "summary"
    });
    
    alert("Summary saved to workspace!");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-2">Smart Document Summarizer</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a document or paste text to get AI-powered summaries
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload File (TXT, MD)
              </label>
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-50 dark:file:bg-purple-900
                  file:text-purple-700 dark:file:text-purple-300
                  hover:file:bg-purple-100 dark:hover:file:bg-purple-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or Paste Text
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here..."
                className="h-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "concise", label: "Concise" },
                  { value: "detailed", label: "Detailed" },
                  { value: "bullet", label: "Bullet Points" },
                  { value: "executive", label: "Executive" }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSummaryType(type.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      summaryType === type.value
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateSummary}
              disabled={!text.trim() || loading}
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
                  Generate Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {summary}
                  </p>
                </div>
                <Button
                  onClick={saveSummary}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save to Workspace
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                  Your summary will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}