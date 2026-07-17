import React, { useState, useRef } from 'react';
import { Upload, File, X, AlertTriangle } from 'lucide-react';

export default function FileUpload({
  label = 'Upload Document / Media',
  onChange,
  maxDocSize = 5 * 1024 * 1024, // 5MB
  maxMediaSize = 40 * 1024 * 1024, // 40MB
  allowedDocTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  allowedMediaTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'video/mp4', 'video/mpeg', 'video/quicktime'],
  ...props
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    setError('');
    if (!file) return;

    const isDoc = allowedDocTypes.includes(file.type);
    const isMedia = allowedMediaTypes.includes(file.type) || file.type.startsWith('audio/') || file.type.startsWith('video/');

    if (!isDoc && !isMedia) {
      setError('Unsupported file type. Please upload JPEG, PNG, PDF, or common Audio/Video formats.');
      return;
    }

    if (isDoc && file.size > maxDocSize) {
      setError(`Document exceeds the maximum allowed size of ${maxDocSize / (1024 * 1024)}MB.`);
      return;
    }

    if (isMedia && file.size > maxMediaSize) {
      setError(`Media file exceeds the maximum allowed size of ${maxMediaSize / (1024 * 1024)}MB.`);
      return;
    }

    setSelectedFile(file);
    if (onChange) {
      onChange(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className="w-full text-left space-y-1 select-none">
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">{label}</label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
            : 'border-slate-300 dark:border-slate-750 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          {...props}
        />

        {selectedFile ? (
          <div className="flex items-center gap-3 w-full max-w-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
            <File className="h-8 w-8 text-indigo-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-500 font-medium">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              type="button"
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-550 dark:text-slate-400 hover:text-red-500 transition-colors cursor-pointer border-0 bg-transparent"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="flex justify-center text-slate-400">
              <Upload className="h-8 w-8 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-750 dark:text-slate-300">
                Drag and drop your file here, or <span className="text-indigo-600 hover:underline">browse</span>
              </p>
              <p className="text-[10px] text-slate-450 mt-1">
                Max Document size: 5MB (PDF, JPG, PNG). Max Media size: 40MB (Audio, Video).
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-650 dark:text-red-400 font-medium mt-1 animate-pulse">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
