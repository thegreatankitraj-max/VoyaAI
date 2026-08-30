import React, { useState } from "react";
import { Download, FileText, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function ExportChat({ messages, sessionTitle }) {
  const [exported, setExported] = useState(false);

  const exportAsText = () => {
    const text = messages
      .map(msg => `[${msg.role.toUpperCase()}] ${format(new Date(msg.timestamp), 'HH:mm')}\n${msg.content}\n`)
      .join('\n');
    
    downloadFile(text, `${sessionTitle || 'conversation'}.txt`, 'text/plain');
  };

  const exportAsMarkdown = () => {
    const markdown = `# ${sessionTitle || 'Conversation'}\n\n${messages
      .map(msg => {
        const role = msg.role === 'user' ? '**You**' : '**Voya AI**';
        const time = format(new Date(msg.timestamp), 'HH:mm');
        return `### ${role} - ${time}\n\n${msg.content}\n`;
      })
      .join('\n---\n\n')}`;
    
    downloadFile(markdown, `${sessionTitle || 'conversation'}.md`, 'text/markdown');
  };

  const exportAsJSON = () => {
    const data = {
      title: sessionTitle || 'Conversation',
      exportDate: new Date().toISOString(),
      messages: messages
    };
    
    downloadFile(JSON.stringify(data, null, 2), `${sessionTitle || 'conversation'}.json`, 'application/json');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const shareChat = async () => {
    const text = messages
      .map(msg => `[${msg.role.toUpperCase()}]\n${msg.content}`)
      .join('\n\n');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: sessionTitle || 'Conversation with Voya AI',
          text: text
        });
      } catch (error) {
        console.log("Share cancelled or failed");
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Conversation copied to clipboard!");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {exported ? (
            <>
              <Check className="w-4 h-4" />
              Exported!
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
        <DropdownMenuItem onClick={exportAsText} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2" />
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsMarkdown} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2" />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareChat} className="cursor-pointer">
          <Share2 className="w-4 h-4 mr-2" />
          Share Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}