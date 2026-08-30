import React from "react";
import { motion } from "framer-motion";
import { Bot, Brain } from "lucide-react";

export default function TypingIndicator({ isDeepMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-4 mb-6"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center shadow-sm">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          {isDeepMode ? (
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          ) : (
            <Bot className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </motion.div>
      </div>
      
      <div className="message-bubble-ai px-6 py-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isDeepMode ? "Thinking deeply..." : "Voya AI is typing..."}
          </span>
        </div>
      </div>
    </motion.div>
  );
}