import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Plus, Trash2, Sparkles, MessageSquare, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function AITeam() {
  const [personas, setPersonas] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPersona, setNewPersona] = useState({
    name: "",
    role: "developer",
    personality: "",
    expertise: []
  });
  const [teamQuestion, setTeamQuestion] = useState("");
  const [teamResponses, setTeamResponses] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadPersonas();
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

  const loadPersonas = async () => {
    try {
      setLoading(true);
      const fetchedPersonas = await base44.entities.AIPersona.filter(
        { created_by_id: currentUser.id, is_active: true },
        "-created_date"
      );
      setPersonas(fetchedPersonas);
    } catch (error) {
      console.error("Error loading personas:", error);
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  const createPersona = async () => {
    if (!newPersona.name.trim()) return;
    
    await base44.entities.AIPersona.create(newPersona);
    setNewPersona({ name: "", role: "developer", personality: "", expertise: [] });
    setIsCreating(false);
    loadPersonas();
  };

  const deletePersona = async (personaId) => {
    await base44.entities.AIPersona.delete(personaId);
    loadPersonas();
  };

  const askTeam = async () => {
    if (!teamQuestion.trim() || personas.length === 0) return;
    
    setIsAsking(true);
    setTeamResponses([]);
    
    const responses = [];
    
    for (const persona of personas.slice(0, 3)) {
      const prompt = `You are ${persona.name}, a ${persona.role}. ${persona.personality || ''} Your expertise includes: ${persona.expertise.join(', ') || 'general knowledge'}.

The user asks: "${teamQuestion}"

Respond from your persona's unique perspective and expertise. Be helpful and insightful.`;

      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: prompt
        });
        
        responses.push({
          persona: persona.name,
          role: persona.role,
          response: response
        });
      } catch (error) {
        console.error(`Error getting response from ${persona.name}:`, error);
      }
    }
    
    setTeamResponses(responses);
    setIsAsking(false);
  };

  const roleIcons = {
    designer: "🎨",
    developer: "💻",
    marketer: "📊",
    writer: "✍️",
    analyst: "📈",
    therapist: "💙",
    coach: "🎯"
  };

  const roleColors = {
    designer: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    developer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    marketer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    writer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    analyst: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    therapist: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    coach: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
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
            <h1 className="text-3xl font-bold gradient-text mb-2">AI Team</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create AI personas that collaborate and provide diverse perspectives
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-br from-purple-500 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Persona
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Create AI Persona</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Add a new AI team member with unique expertise
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Persona name (e.g., 'Designer Alex')..."
                  value={newPersona.name}
                  onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Select
                  value={newPersona.role}
                  onValueChange={(value) => setNewPersona({ ...newPersona, role: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="designer">🎨 Designer</SelectItem>
                    <SelectItem value="developer">💻 Developer</SelectItem>
                    <SelectItem value="marketer">📊 Marketer</SelectItem>
                    <SelectItem value="writer">✍️ Writer</SelectItem>
                    <SelectItem value="analyst">📈 Analyst</SelectItem>
                    <SelectItem value="therapist">💙 Therapist</SelectItem>
                    <SelectItem value="coach">🎯 Coach</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Personality traits (e.g., 'Creative, detail-oriented, friendly')..."
                  value={newPersona.personality}
                  onChange={(e) => setNewPersona({ ...newPersona, personality: e.target.value })}
                  className="h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Input
                  placeholder="Expertise (comma-separated, e.g., 'UI/UX, Branding, Typography')..."
                  value={newPersona.expertise.join(', ')}
                  onChange={(e) => setNewPersona({ ...newPersona, expertise: e.target.value.split(',').map(s => s.trim()) })}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Button onClick={createPersona} className="w-full bg-gradient-to-br from-purple-500 to-blue-600">
                  Create Persona
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {personas.map((persona) => (
            <Card key={persona.id} className="bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <span className="text-2xl">{roleIcons[persona.role]}</span>
                      {persona.name}
                    </CardTitle>
                    <Badge className={`mt-2 ${roleColors[persona.role]}`}>
                      {persona.role}
                    </Badge>
                  </div>
                  <button
                    onClick={() => deletePersona(persona.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {persona.personality && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {persona.personality}
                  </p>
                )}
                {persona.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {persona.expertise.map((exp, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {personas.length > 0 && (
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Ask Your Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={teamQuestion}
                onChange={(e) => setTeamQuestion(e.target.value)}
                placeholder="Ask a question to get multiple perspectives from your AI team..."
                className="h-24 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <Button
                onClick={askTeam}
                disabled={!teamQuestion.trim() || isAsking}
                className="w-full bg-gradient-to-br from-purple-500 to-blue-600"
              >
                {isAsking ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-pulse" />
                    Team is Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ask Team (up to 3 personas)
                  </>
                )}
              </Button>

              {teamResponses.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Team Responses:</h3>
                  {teamResponses.map((resp, idx) => (
                    <Card key={idx} className="bg-gray-50 dark:bg-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{roleIcons[resp.role]}</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {resp.persona}
                          </span>
                          <Badge className={`${roleColors[resp.role]} text-xs`}>
                            {resp.role}
                          </Badge>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {resp.response}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {personas.length === 0 && (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                Create your first AI persona to start building your team
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}