import React, { useRef, useState } from 'react';
import { FileUp, Files, Plus, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export default function Dropzone({ onFilesAdded }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    setErrorMessage(null);
    const pdfFiles: File[] = [];
    const ignoredFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        pdfFiles.push(file);
      } else {
        ignoredFiles.push(file.name);
      }
    }

    if (ignoredFiles.length > 0) {
      setErrorMessage(
        `Ignored ${ignoredFiles.length} non-PDF file(s): ${ignoredFiles.join(', ')}`
      );
    }

    if (pdfFiles.length > 0) {
      onFilesAdded(pdfFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset file input value so user can upload the same file again if desired
    if (e.target) {
      e.target.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        id="pdf-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 md:p-14 text-center cursor-pointer transition-all duration-300 outline-none
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-lg scale-[1.01]' 
            : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-900/40 hover:shadow-md'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="pdf-file-input"
        />

        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
          {isDragActive ? (
            <FileUp className="w-8 h-8 text-indigo-500 animate-bounce" id="drag-active-icon" />
          ) : (
            <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path>
            </svg>
          )}
        </div>

        <div className="space-y-1.5 max-w-sm">
          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
            {isDragActive ? 'Drop your PDFs here' : 'Click or drag files here'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supports multiple standard PDF documents
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pt-1">
            Max 50MB per document • Browser compiled
          </p>
          
          <div className="pt-4">
            <button
              type="button"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-full text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-95"
            >
              Select Files
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          id="dropzone-error-box"
          className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </motion.div>
      )}
    </div>
  );
}
