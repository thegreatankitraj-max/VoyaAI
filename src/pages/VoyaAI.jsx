import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { AnimatePresence } from "framer-motion";

import MessageBubble from "../components/chat/MessageBubble";
import TypingIndicator from "../components/chat/TypingIndicator";
import ChatInput from "../components/chat/ChatInput";
import WelcomeScreen from "../components/chat/WelcomeScreen";
import ReasoningModeToggle from "../components/chat/ReasoningModeToggle";
import PersonalitySelector from "../components/chat/PersonalitySelector";
import ExportChat from "../components/chat/ExportChat";

export default function VoyaAI() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [reasoningMode, setReasoningMode] = useState('fast');
  const [personalityMode, setPersonalityMode] = useState('friendly');
  const messagesEndRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get("session_id");
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      const prefs = await base44.entities.UserPreferences.filter(
        { created_by_id: user.id },
        "created_date",
        1
      );
      
      if (prefs.length > 0) {
        setUserPreferences(prefs[0]);
        setReasoningMode(prefs[0].reasoning_mode || 'fast');
        setPersonalityMode(prefs[0].personality_mode || 'friendly');
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      // Always clear the initial load state so the UI never stays stuck,
      // even if auth fails or returns no user in the deployed environment.
      setIsInitialLoad(false);
    }
  };

  const loadMessages = useCallback(async () => {
    if (!currentUser) return;
    
    setIsInitialLoad(true);
    if (sessionId) {
      try {
        const session = await base44.entities.ChatSession.filter(
          { id: sessionId, created_by_id: currentUser.id },
          "created_date",
          1
        );
        
        if (session.length > 0) {
          setCurrentSession(session[0]);
          const chatMessages = await base44.entities.ChatMessage.filter(
            { session_id: sessionId },
            "created_date",
            100
          );
          setMessages(chatMessages);
        } else {
          navigate(createPageUrl("VoyaAI"), { replace: true });
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        setMessages([]);
      }
    } else {
      setMessages([]);
      setCurrentSession(null);
    }
    setIsInitialLoad(false);
  }, [sessionId, currentUser, navigate]);

  useEffect(() => {
    if (currentUser) {
      loadMessages();
    }
  }, [loadMessages, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const detectEmotion = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.match(/sad|depressed|down|unhappy|terrible|awful/)) return "sad";
    if (lowerText.match(/angry|mad|furious|frustrated|annoyed/)) return "angry";
    if (lowerText.match(/excited|happy|great|amazing|wonderful|awesome/)) return "happy";
    if (lowerText.match(/anxious|worried|stressed|nervous/)) return "anxious";
    return "neutral";
  };

  const getPersonalityInstructions = (personality) => {
    const personalities = {
      professional: "Maintain a formal, business-like tone. Be precise, structured, and direct in your responses.",
      friendly: "Be warm, approachable, and conversational. Use casual language while remaining helpful.",
      funny: "Incorporate appropriate humor, wit, and playful language. Make responses entertaining while being helpful.",
      therapist: "Be deeply empathetic, supportive, and non-judgmental. Listen actively and provide emotional support.",
      developer: "Be technical and precise. Use programming terminology, provide code examples, and focus on technical accuracy."
    };
    return personalities[personality] || personalities.friendly;
  };

  const sendMessage = async (content, files = []) => {
    if (!content.trim() && files.length === 0) return;
    if (isLoading) return;

    // Check if message contains task creation keywords
    const taskKeywords = ['create task', 'add task', 'to-do', 'todo', 'remind me', 'task:'];
    const isTaskRequest = taskKeywords.some(keyword => content.toLowerCase().includes(keyword));

    // Check if user is asking for real-time information
    const webKeywords = ['latest', 'current', 'news about', 'price of', 'weather in', 'what is happening'];
    const needsWebAccess = webKeywords.some(keyword => content.toLowerCase().includes(keyword));

    let currentSessionId = sessionId;
    
    if (!currentSessionId) {
        const sessionTitle = content.trim() || `File Analysis - ${files[0]?.name || 'Unknown'}`;
        const newSession = await base44.entities.ChatSession.create({ 
          title: sessionTitle.substring(0, 50)
        });
        currentSessionId = newSession.id;
        navigate(createPageUrl(`VoyaAI?session_id=${currentSessionId}`), { replace: true });
        setCurrentSession(newSession); // Update currentSession state here as well
    }

    let fileUrls = [];
    let fileNames = [];
    let fileTypes = [];
    
    if (files.length > 0) {
      setIsLoading(true);
      try {
        const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
        const uploadResults = await Promise.all(uploadPromises);
        
        fileUrls = uploadResults.map(result => result.file_url);
        fileNames = files.map(file => file.name);
        fileTypes = files.map(file => file.type);
      } catch (error) {
        console.error("Error uploading files:", error);
        const errorMessage = {
          content: "Sorry, I had trouble uploading your files. Please try again.",
          role: "assistant",
          timestamp: new Date().toISOString(),
          session_id: currentSessionId
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }
    }

    const userMessage = {
      content: content || "Please analyze the uploaded files.",
      role: "user",
      timestamp: new Date().toISOString(),
      session_id: currentSessionId,
      file_urls: fileUrls,
      file_names: fileNames,
      file_types: fileTypes
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      await base44.entities.ChatMessage.create(userMessage);

      const recentMessages = newMessages.slice(-6);
      const conversationContext = recentMessages
        .map(msg => {
          let msgText = `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`;
          if (msg.file_urls && msg.file_urls.length > 0) {
            msgText += ` [Attached ${msg.file_urls.length} file(s)]`;
          }
          return msgText;
        })
        .join('\n\n');

      let userContextStr = "";
      if (userPreferences?.remember_context && userPreferences?.user_context) {
        userContextStr = `\n\nUser Context: ${userPreferences.user_context}`;
      }

      const reasoningInstruction = reasoningMode === 'deep' 
        ? "\n\nUse deep reasoning: Think step-by-step, consider multiple perspectives, and provide detailed analysis with examples."
        : "\n\nProvide clear, concise, and direct responses.";

      const toneInstruction = userPreferences?.tone_preference 
        ? `\n\nTone: ${userPreferences.tone_preference}`
        : "";

      const personalityInstruction = `\n\nPersonality Mode: ${getPersonalityInstructions(personalityMode)}`;

      let emotionInstruction = "";
      if (userPreferences?.emotion_aware !== false) {
        const detectedEmotion = detectEmotion(content);
        if (detectedEmotion !== "neutral") {
          emotionInstruction = `\n\nDetected User Emotion: ${detectedEmotion}. Adjust your response tone and empathy accordingly.`;
        }
      }

      const biasFilterInstruction = userPreferences?.bias_filter !== false
        ? "\n\nBias Filter: Avoid politically sensitive or biased content. Provide balanced, neutral perspectives."
        : "";

      const showReasoningInstruction = userPreferences?.show_reasoning !== false
        ? "\n\nProvide your reasoning: After your main response, if asked for complex analysis, briefly explain your thought process."
        : "";

      let taskInstruction = "";
      if (isTaskRequest) {
        taskInstruction = `\n\nTask Management: The user wants to create a task. After responding, also extract the task details and provide them in JSON format at the end:
TASK_JSON: {"title": "task title", "description": "task description", "priority": "high/medium/low", "due_date": "YYYY-MM-DD or empty"}`;
      }

      let prompt;
      if (fileUrls.length > 0) {
        const fileTypeInfo = fileTypes.map((type, i) => 
          `File ${i + 1} (${fileNames[i]}): ${type}`
        ).join('\n');
        
        prompt = `You are Voya AI, an intelligent multimodal AI assistant. Analyze the uploaded files and provide helpful insights.

${fileTypeInfo}

Current conversation:
${conversationContext}${userContextStr}${personalityInstruction}${toneInstruction}${emotionInstruction}${reasoningInstruction}${biasFilterInstruction}${showReasoningInstruction}${taskInstruction}

Provide a detailed and helpful response based on the files and the user's question.`;
      } else {
        prompt = `You are Voya AI, a helpful AI assistant. Respond naturally to the user's question.

Current conversation:
${conversationContext}${userContextStr}${personalityInstruction}${toneInstruction}${emotionInstruction}${reasoningInstruction}${biasFilterInstruction}${showReasoningInstruction}${taskInstruction}

Provide a helpful and engaging response.`;
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 45000)
      );

      const aiPromise = base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: needsWebAccess,
        // Web search requires a model that supports it (gemini_3_flash / gemini_3_1_pro).
        // Passing add_context_from_internet=true with the default model raises an error.
        model: needsWebAccess ? "gemini_3_flash" : undefined,
        file_urls: fileUrls.length > 0 ? fileUrls : undefined
      });

      const response = await Promise.race([aiPromise, timeoutPromise]);

      if (!response || typeof response !== 'string' || response.trim().length === 0) {
        throw new Error("Empty response from AI");
      }

      // Check if AI created a task
      if (response.includes('TASK_JSON:')) {
        const [mainResponse, taskJsonPart] = response.split('TASK_JSON:');
        try {
          const taskData = JSON.parse(taskJsonPart.trim());
          await base44.entities.Task.create({
            ...taskData,
            created_by_ai: true,
            session_id: currentSessionId
          });
        } catch (e) {
          console.error("Failed to parse task JSON:", e);
        }
        
        const aiMessage = {
          content: mainResponse.trim() + "\n\n✅ Task created successfully! You can view it in the Tasks page.",
          role: "assistant",
          timestamp: new Date().toISOString(),
          session_id: currentSessionId
        };
        await base44.entities.ChatMessage.create(aiMessage);
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const aiMessage = {
          content: response,
          role: "assistant",
          timestamp: new Date().toISOString(),
          session_id: currentSessionId
        };
        await base44.entities.ChatMessage.create(aiMessage);
        setMessages(prev => [...prev, aiMessage]);
      }

      if (userPreferences?.voice_enabled && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(response.split('TASK_JSON:')[0]);
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      const errorMessage = {
        content: `I apologize, but I'm having trouble responding right now. Please try again.\n\n(Error: ${error?.message || String(error)})`,
        role: "assistant",
        timestamp: new Date().toISOString(),
        session_id: currentSessionId
      };
      setMessages(prev => [...prev, errorMessage]);
      await base44.entities.ChatMessage.create(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReasoningMode = () => {
    setReasoningMode(prev => prev === 'fast' ? 'deep' : 'fast');
  };

  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium">Loading Conversation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {messages.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {messages.length} messages
          </div>
          <div className="flex items-center gap-3">
            <PersonalitySelector
              value={personalityMode}
              onChange={setPersonalityMode}
              disabled={isLoading}
            />
            <ReasoningModeToggle 
              mode={reasoningMode}
              onToggle={toggleReasoningMode}
              disabled={isLoading}
            />
            <ExportChat messages={messages} sessionTitle={currentSession?.title} />
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={(prompt) => sendMessage(prompt, [])} />
        ) : (
          <div className="max-w-4xl mx-auto px-6 py-8">
            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.id || index}-${message.timestamp}`}
                message={message}
                isLast={index === messages.length - 1 && !isLoading}
              />
            ))}
            
            <AnimatePresence>
              {isLoading && <TypingIndicator isDeepMode={reasoningMode === 'deep'} />}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <ChatInput 
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}