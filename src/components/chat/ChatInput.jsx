import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import FileUpload from "./FileUpload";
import FilePreview from "./FilePreview";
import VoiceInput from "./VoiceInput";

export default function ChatInput({ onSendMessage, isLoading, voiceEnabled }) {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || attachedFiles.length > 0) && !isLoading) {
      onSendMessage(message.trim(), attachedFiles);
      setMessage("");
      setAttachedFiles([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFilesSelected = (newFiles) => {
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove) => {
    setAttachedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleVoiceTranscript = (transcript) => {
    setMessage(prev => prev + (prev ? " " : "") + transcript);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 glass-morphism sticky bottom-0">
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {attachedFiles.length > 0 && (
            <FilePreview files={attachedFiles} onRemoveFile={handleRemoveFile} />
          )}
          
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={attachedFiles.length > 0 ? "Ask about your files..." : "Ask Voya AI anything..."}
                className="min-h-[60px] max-h-[200px] resize-none border-gray-300 dark:border-gray-600 rounded-2xl px-6 py-4 text-[15px] font-medium bg-white dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 backdrop-blur-sm shadow-sm focus:shadow-md transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                disabled={isLoading}
              />
              
              {!message.trim() && attachedFiles.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute right-4 top-4 text-gray-300 dark:text-gray-600"
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              )}
            </div>
            
            <div className="flex gap-2 items-end">
              {voiceEnabled && (
                <VoiceInput 
                  onTranscript={handleVoiceTranscript}
                  disabled={isLoading}
                />
              )}
              
              <FileUpload onFilesSelected={handleFilesSelected} disabled={isLoading} />
              
              <Button
                type="submit"
                disabled={(!message.trim() && attachedFiles.length === 0) || isLoading}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </form>
        
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          Voya AI can analyze images, documents, audio, video, and files. Upload anything you'd like to discuss!
        </p>
      </div>
    </div>
  );
}