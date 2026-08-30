import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Image, FileText, Video, Music } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FileUpload({ onFilesSelected, disabled }) {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleVideoUpload = () => {
    videoInputRef.current?.click();
  };

  const handleAudioUpload = () => {
    audioInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    event.target.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        multiple
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
          <DropdownMenuItem onClick={handleImageUpload} className="text-gray-900 dark:text-gray-100">
            <Image className="w-4 h-4 mr-2" />
            Upload Images
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleVideoUpload} className="text-gray-900 dark:text-gray-100">
            <Video className="w-4 h-4 mr-2" />
            Upload Videos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAudioUpload} className="text-gray-900 dark:text-gray-100">
            <Music className="w-4 h-4 mr-2" />
            Upload Audio
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFileUpload} className="text-gray-900 dark:text-gray-100">
            <FileText className="w-4 h-4 mr-2" />
            Upload Documents
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}