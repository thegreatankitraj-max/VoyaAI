import React from "react";
import { FileText, Image as ImageIcon, File, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AttachedFiles({ fileUrls, fileNames, fileTypes }) {
  if (!fileUrls || fileUrls.length === 0) return null;

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (fileType?.includes('pdf') || fileType?.includes('document') || fileType?.includes('text')) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const getFilePreview = (fileUrl, fileType, fileName) => {
    if (fileType?.startsWith('image/')) {
      return (
        <img
          src={fileUrl}
          alt={fileName}
          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => window.open(fileUrl, '_blank')}
        />
      );
    }
    return (
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        {getFileIcon(fileType)}
      </div>
    );
  };

  return (
    <div className="mt-3 space-y-2">
      {fileUrls.map((fileUrl, index) => {
        const fileName = fileNames?.[index] || `File ${index + 1}`;
        const fileType = fileTypes?.[index];
        
        return (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg border border-gray-100 dark:border-gray-700">
            {getFilePreview(fileUrl, fileType, fileName)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {fileName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {fileType || 'Unknown type'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}