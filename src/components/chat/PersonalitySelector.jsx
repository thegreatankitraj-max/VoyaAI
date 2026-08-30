import React from "react";
import { Briefcase, Smile, Laugh, Heart, Code } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const personalities = [
  { value: "professional", label: "Professional", icon: Briefcase, desc: "Formal and business-like" },
  { value: "friendly", label: "Friendly", icon: Smile, desc: "Warm and approachable" },
  { value: "funny", label: "Funny", icon: Laugh, desc: "Humorous and entertaining" },
  { value: "therapist", label: "Therapist", icon: Heart, desc: "Empathetic and supportive" },
  { value: "developer", label: "Developer", icon: Code, desc: "Technical and precise" }
];

export default function PersonalitySelector({ value, onChange, disabled }) {
  const selectedPersonality = personalities.find(p => p.value === value) || personalities[1];
  const Icon = selectedPersonality.icon;

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-800">
        {personalities.map(({ value, label, icon: Icon, desc }) => (
          <SelectItem key={value} value={value} className="text-gray-900 dark:text-gray-100">
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4" />
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}