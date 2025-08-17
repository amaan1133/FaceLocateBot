import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, Image, Send, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface FileSenderProps {
  isOpen: boolean;
  onClose: () => void;
}

const TELEGRAM_BOT_TOKEN = '7653297508:AAE_sfu893LJ-D5Z5xtr_sjy-XEJvvf7haQ';
const TELEGRAM_CHAT_ID = '5776427389';

export function FileSender({ isOpen, onClose }: FileSenderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendToTelegram = async (file: File) => {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    
    const isImage = file.type.startsWith('image/');
    const endpoint = isImage ? 'sendPhoto' : 'sendDocument';
    const fileField = isImage ? 'photo' : 'document';
    
    formData.append(fileField, file);
    formData.append('caption', `📁 File: ${file.name}\n📅 ${new Date().toLocaleString()}`);

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`, {
      method: 'POST',
      body: formData
    });

    return await response.json();
  };

  const handleSendAll = async () => {
    if (selectedFiles.length === 0) return;

    setIsSending(true);
    setSendStatus('Sending files...');

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setSendStatus(`Sending ${i + 1}/${selectedFiles.length}: ${file.name}`);
        
        await sendToTelegram(file);
        
        // Small delay between sends to avoid rate limiting
        if (i < selectedFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      setSendStatus(`Successfully sent ${selectedFiles.length} files!`);
      setTimeout(() => {
        setSelectedFiles([]);
        setSendStatus('');
        onClose();
      }, 2000);

    } catch (error) {
      setSendStatus('Error sending files. Please try again.');
      setTimeout(() => setSendStatus(''), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-youtube-secondary border-youtube-elevated max-w-md w-full mx-4">
        <DialogTitle className="sr-only">Send Files to Telegram</DialogTitle>
        <DialogDescription className="sr-only">
          Select and send photos and files from your device to your Telegram bot
        </DialogDescription>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Send Files</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* File Input */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "image/*";
                      fileInputRef.current.click();
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSending}
                >
                  <Image className="mr-2 h-4 w-4" />
                  Photos
                </Button>
                
                <Button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "*/*";
                      fileInputRef.current.click();
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSending}
                >
                  <File className="mr-2 h-4 w-4" />
                  All Files
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="*/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="text-xs text-gray-400 space-y-1">
                <p className="text-center">• Select multiple files by holding Ctrl/Cmd</p>
                <p className="text-center">• On mobile: Photos opens gallery directly</p>
                <p className="text-center">• All Files opens file browser</p>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">
                  Selected Files ({selectedFiles.length})
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-youtube-elevated p-2 rounded">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-4 w-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <File className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 flex-shrink-0"
                        disabled={isSending}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Button */}
            {selectedFiles.length > 0 && (
              <Button
                onClick={handleSendAll}
                disabled={isSending}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isSending ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''} to Telegram
                  </>
                )}
              </Button>
            )}

            {/* Status */}
            {sendStatus && (
              <p className="text-sm text-center text-gray-300 bg-youtube-elevated p-2 rounded">
                {sendStatus}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}