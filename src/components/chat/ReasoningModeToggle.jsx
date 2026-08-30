import React from "react";
import { Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ReasoningModeToggle({ mode, onToggle, disabled }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            disabled={disabled}
            className={`flex items-center gap-2 ${
              mode === 'deep' 
                ? 'text-purple-600 dark:text-purple-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {mode === 'fast' ? (
              <>
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium">Fast Mode</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span className="text-xs font-medium">Deep Mode</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {mode === 'fast' 
              ? 'Fast Mode: Quick responses for simple questions' 
              : 'Deep Mode: Detailed analysis and reasoning'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}