import React from "react";
import { X, FileText, Image as ImageIcon, File, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FilePreview({ files, onRemoveFile }) {
  if (!files || files.length === 0) return null;

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-4 h-4" />;
    } else if (file.type.startsWith('audio/')) {
      return <Music className="w-4 h-4" />;
    } else if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/') && file instanceof File) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-16 h-16 object-cover rounded-lg"
        />
      );
    } else if (file.type.startsWith('video/') && file instanceof File) {
      return (
        <video
          src={URL.createObjectURL(file)}
          className="w-16 h-16 object-cover rounded-lg"
        />
      );
    }
    return (
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        {getFileIcon(file)}
      </div>
    );
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border dark:border-gray-700">
      {files.map((file, index) => (
        <div key={index} className="relative group">
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded-lg border dark:border-gray-600 shadow-sm">
            {getFilePreview(file)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium dark:text-gray-200 truncate max-w-32">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemoveFile(index)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}