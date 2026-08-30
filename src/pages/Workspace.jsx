import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Star, StarOff, Trash2, FileText, Code, Brain, Lightbulb, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

export default function Workspace() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: "",
    content: "",
    document_type: "other",
    tags: []
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadDocuments();
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

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await base44.entities.AIDocument.filter(
        { created_by_id: currentUser.id },
        "-created_date"
      );
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (doc) => {
    await base44.entities.AIDocument.update(doc.id, {
      is_favorite: !doc.is_favorite
    });
    loadDocuments();
  };

  const deleteDocument = async (docId) => {
    await base44.entities.AIDocument.delete(docId);
    loadDocuments();
  };

  const handleCreateDocument = async () => {
    if (!newDoc.title.trim() || !newDoc.content.trim()) return;
    
    await base44.entities.AIDocument.create(newDoc);
    setNewDoc({ title: "", content: "", document_type: "other", tags: [] });
    setIsCreating(false);
    loadDocuments();
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || doc.document_type === filterType;
    return matchesSearch && matchesType;
  });

  const typeIcons = {
    summary: FileText,
    generated_text: Brain,
    analysis: Search,
    brainstorm: Lightbulb,
    code: Code,
    other: FileText
  };

  const typeColors = {
    summary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    generated_text: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    analysis: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    brainstorm: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    code: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">AI Workspace</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Organize all your AI-generated content
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-purple-500 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Create Document</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Save AI-generated content for later
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Document title..."
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Select
                  value={newDoc.document_type}
                  onValueChange={(value) => setNewDoc({ ...newDoc, document_type: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="generated_text">Generated Text</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="brainstorm">Brainstorm</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Content..."
                  value={newDoc.content}
                  onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                  className="h-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Button onClick={handleCreateDocument} className="w-full bg-gradient-to-br from-purple-500 to-blue-600">
                  Save Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48 bg-white dark:bg-gray-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="summary">Summaries</SelectItem>
              <SelectItem value="generated_text">Generated Text</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="brainstorm">Brainstorms</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredDocuments.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || filterType !== "all" 
                  ? "No documents match your search" 
                  : "No documents yet. Create your first one!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => {
              const Icon = typeIcons[doc.document_type];
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-gray-900 dark:text-gray-100 mb-2">
                            {doc.title}
                          </CardTitle>
                          <Badge className={typeColors[doc.document_type]}>
                            <Icon className="w-3 h-3 mr-1" />
                            {doc.document_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleFavorite(doc)}
                            className="text-gray-400 hover:text-yellow-500"
                          >
                            {doc.is_favorite ? (
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            ) : (
                              <StarOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                        {doc.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}