
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Lightbulb, MessageCircle, Zap } from "lucide-react";

const suggestions = [
  {
    icon: Lightbulb,
    title: "Explain concepts",
    description: "Help me understand complex topics",
    prompt: "Explain quantum computing in simple terms"
  },
  {
    icon: MessageCircle,
    title: "Creative writing",
    description: "Write stories, poems, or content",
    prompt: "Write a short story about a robot discovering emotions"
  },
  {
    icon: Zap,
    title: "Problem solving",
    description: "Get help with coding or math",
    prompt: "Help me debug this JavaScript function"
  },
  {
    icon: Sparkles,
    title: "Brainstorming",
    description: "Generate ideas and solutions",
    prompt: "Give me 10 creative business ideas for 2024"
  }
];

export default function WelcomeScreen({ onSuggestionClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-4xl mx-auto px-6 py-12"
    >
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-block"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4 tracking-tight">
          Welcome to Voya AI
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
          Your intelligent conversation partner. Ask me anything, and let's explore ideas together.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="group p-6 rounded-2xl bg-white dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all duration-300 text-left border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <suggestion.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:gradient-text transition-all duration-200">
                  {suggestion.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                  {suggestion.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 group-hover:bg-gray-100 dark:group-hover:bg-gray-700/50 transition-colors duration-200">
                  "{suggestion.prompt}"
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
