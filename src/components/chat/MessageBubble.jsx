import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, MoreVertical, Copy, RefreshCw, FileText, Check } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AttachedFiles from "./AttachedFiles";
import { base44 } from "@/api/base44Client";

export default function MessageBubble({ message, isLast, onRegenerate }) {
  const isUser = message.role === "user";
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [summary, setSummary] = useState("");
  const [rephrasedText, setRephrasedText] = useState("");
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSummarize = async () => {
    if (summary) {
      setSummary("");
      return;
    }
    
    setIsSummarizing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this text in 1-2 concise sentences:\n\n${message.content}`
      });
      setSummary(result);
    } catch (error) {
      console.error("Error summarizing:", error);
    }
    setIsSummarizing(false);
  };

  const handleRephrase = async () => {
    if (rephrasedText) {
      setRephrasedText("");
      return;
    }
    
    setIsRephrasing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Rephrase this text in a different way while keeping the same meaning:\n\n${message.content}`
      });
      setRephrasedText(result);
    } catch (error) {
      console.error("Error rephrasing:", error);
    }
    setIsRephrasing(false);
  };

  const isLongMessage = message.content.length > 300;
  const displayContent = isExpanded || !isLongMessage ? message.content : message.content.substring(0, 300) + "...";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} ${isLast ? "mb-8" : "mb-6"} group`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
        isUser 
          ? "bg-gradient-to-br from-purple-500 to-blue-600" 
          : "bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600"
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </div>
      
      <div className={`flex flex-col max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`relative px-6 py-4 rounded-3xl shadow-sm ${
          isUser 
            ? "message-bubble-user text-white" 
            : "message-bubble-ai text-gray-800 dark:text-gray-100"
        }`}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
            {displayContent}
          </p>
          
          {isLongMessage && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs mt-2 underline opacity-70 hover:opacity-100"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
          
          {message.file_urls && message.file_urls.length > 0 && (
            <AttachedFiles 
              fileUrls={message.file_urls}
              fileNames={message.file_names}
              fileTypes={message.file_types}
            />
          )}

          {!isUser && (
            <div className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white dark:bg-gray-800 shadow-md">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
                  <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSummarize} disabled={isSummarizing} className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    {summary ? "Hide Summary" : isSummarizing ? "Summarizing..." : "Summarize"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRephrase} disabled={isRephrasing} className="cursor-pointer">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {rephrasedText ? "Hide Rephrase" : isRephrasing ? "Rephrasing..." : "Rephrase"}
                  </DropdownMenuItem>
                  {onRegenerate && (
                    <DropdownMenuItem onClick={() => onRegenerate(message)} className="cursor-pointer">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-full"
            >
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">📝 Summary</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{summary}</p>
            </motion.div>
          )}

          {rephrasedText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 max-w-full"
            >
              <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">✨ Rephrased</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{rephrasedText}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {message.timestamp && (
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 px-2">
            {format(new Date(message.timestamp), "HH:mm")}
          </span>
        )}
      </div>
    </motion.div>
  );
}