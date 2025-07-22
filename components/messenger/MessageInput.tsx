"use client";

import React, { useRef, forwardRef } from "react";
import { SendHorizontal, X, Paperclip, Image, FileText, FileVideo, FileAudio, Archive, File } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Message } from "@/lib/models/message";
import { useTranslations } from "next-intl";

interface MessageInputProps {
  input: string;
  setInput: (value: string) => void;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isUploading: boolean;
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
  onSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
}

const MessageInput = forwardRef<HTMLInputElement, MessageInputProps>(({
  input,
  setInput,
  selectedFiles,
  setSelectedFiles,
  isUploading,
  replyingTo,
  setReplyingTo,
  onSendMessage
}, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('Messenger.input');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return <Archive className="h-4 w-4" />;
    if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('txt') || fileType.includes('xls') || fileType.includes('ppt')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="border-t bg-card p-3 md:p-4 flex-shrink-0">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-3 p-3 bg-muted rounded-lg border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary">{t('replyingTo')}</p>
              <p className="text-sm truncate">{replyingTo.content || t('fileAttachment')}</p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setReplyingTo(null)}
              className="h-8 w-8 md:h-6 md:w-6 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Hiển thị files đã chọn */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 space-y-2 max-h-32 overflow-y-auto">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 rounded-lg bg-muted p-2">
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeFile(index)}
                className="h-8 w-8 md:h-6 md:w-6 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={onSendMessage} className="flex items-center gap-2">
        {/* Nút đính kèm file */}
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="flex-shrink-0 w-10 h-10 md:w-8 md:h-8"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground" />
        </Button>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.mp4,.mp3,.wav,.avi,.mov,.wmv,.flv,.webm,.ogg"
        />

        {/* Input container with responsive sizing */}
        <div className="relative flex-1 min-w-0">
          <Input
            ref={ref}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('typeMessage')}
            className="w-full rounded-full border bg-muted py-2 pl-4 pr-4 text-base md:text-sm focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        {/* Nút gửi */}
        <Button 
          type="submit" 
          size="icon" 
          variant="ghost" 
          className="flex-shrink-0 w-10 h-10 md:w-8 md:h-8" 
          disabled={(!input.trim() && selectedFiles.length === 0) || isUploading}
        >
          <SendHorizontal className={`h-5 w-5 md:h-4 md:w-4 transition-colors ${(input.trim() || selectedFiles.length > 0) && !isUploading ? "text-primary" : "text-muted-foreground"}`} />
        </Button>
      </form>
    </div>
  );
});

MessageInput.displayName = "MessageInput";

export default MessageInput;