import React, { useState, useEffect } from 'react';
import { Files, Moon, Sun, Sliders, Sparkles, FileUp, ShieldAlert, Check, Plus } from 'lucide-react';
import { PDFFileItem, Theme } from './types.ts';
import { getPdfPageCount, mergePDFs } from './utils/pdfHelper.ts';

import Dropzone from './components/Dropzone.tsx';
import PDFListItem from './components/PDFListItem.tsx';
import MergeControls from './components/MergeControls.tsx';
import MergeSuccess from './components/MergeSuccess.tsx';

export default function App() {
  const [files, setFiles] = useState<PDFFileItem[]>([]);
  const [outputName, setOutputName] = useState('merged-document');
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfBytes, setMergedPdfBytes] = useState<Uint8Array | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('light');

  // Handle system dark mode preferences on initial mount
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Process files dropped or selected
  const handleFilesAdded = (newFiles: File[]) => {
    setGlobalError(null);
    const updatedItems: PDFFileItem[] = newFiles.map((file) => {
      const id = Math.random().toString(36).slice(2, 11) + '-' + Date.now();
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        loadingPageCount: true,
      };
    });

    setFiles((prev) => [...prev, ...updatedItems]);

    // Async loader for page counts
    updatedItems.forEach(async (item) => {
      try {
        const pages = await getPdfPageCount(item.file);
        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, pageCount: pages, loadingPageCount: false } : f))
        );
      } catch (error: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, error: error?.message || 'Unreadable PDF file', loadingPageCount: false }
              : f
          )
        );
      }
    });
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
      return list;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const list = [...prev];
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
      return list;
    });
  };

  const handleSort = (type: 'name' | 'size' | 'reset') => {
    setFiles((prev) => {
      const list = [...prev];
      if (type === 'name') {
        return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
      } else if (type === 'size') {
        return list.sort((a, b) => b.size - a.size); // Sort from largest to smallest
      }
      return list;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setGlobalError(null);
  };

  const handleMerge = async () => {
    setIsMerging(true);
    setGlobalError(null);

    const checkErrors = files.some((f) => f.error);
    if (checkErrors) {
      setGlobalError('Please remove files loaded with errors before merging.');
      setIsMerging(false);
      return;
    }

    const docList = files.map((f) => f.file);
    try {
      // Trigger CPU-intensive PDF merging operation
      const mergedBytes = await mergePDFs(docList);
      setMergedPdfBytes(mergedBytes);
    } catch (err: any) {
      setGlobalError(err?.message || 'An unexpected error occurred during merging. Try again.');
    } finally {
      setIsMerging(false);
    }
  };

  const resetMerge = () => {
    setMergedPdfBytes(null);
    clearAll();
  };

  // Derived Values
  const filesCount = files.length;
  const isAnyFileLoading = files.some((f) => f.loadingPageCount);
  const totalPages = isAnyFileLoading
    ? undefined
    : files.reduce((acc, f) => acc + (f.pageCount || 0), 0);
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const hasErrors = files.some((f) => f.error !== undefined);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between">
        
        {/* Navigation / Header */}
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 pr-5 pl-5 sm:px-8 py-3.5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-black select-none">
                <div className="w-4 h-4 border-2 border-white rounded-xs"></div>
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-1.5 leading-none">
                  MergeFlow
                </h1>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono font-bold mt-1">
                  Secure PDF Console
                </p>
              </div>
            </div>

            {/* Simulated Clean Navigation tabs */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span className="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 py-4 px-1">Merge</span>
              <span className="py-4 cursor-not-allowed opacity-50">Split</span>
              <span className="py-4 cursor-not-allowed opacity-50">Compress</span>
            </div>

            {/* Theme Toggle & User Avatar look */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                id="theme-toggler-btn"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>
              
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-xs font-semibold text-slate-500">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Global Error Banner */}
        {globalError && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-900/40 p-4">
            <div className="max-w-5xl mx-auto flex items-start gap-3 text-rose-700 dark:text-rose-400 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Merging Interrupted</p>
                <p>{globalError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Core Workspace Canvas */}
        <main className="max-w-5xl mx-auto px-4 py-10 sm:py-14 md:py-18 w-full flex-1">
          {mergedPdfBytes ? (
            /* Success & Download Dashboard */
            <MergeSuccess
              pdfBytes={mergedPdfBytes}
              fileName={outputName}
              totalSize={totalSize}
              totalPages={totalPages || 0}
              onReset={resetMerge}
            />
          ) : (
            /* Editing Workspace */
            <div className="space-y-10">
              {/* Info Introductory Title */}
              <div className="text-center space-y-2.5 max-w-xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tracking-tight">
                  Merge PDF Documents
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-light">
                  Combine multiple PDF documents into one single secure file in seconds. All files are compiled locally in-memory within your browser.
                </p>
              </div>

              {/* Upload Interface - Dynamic view */}
              {filesCount === 0 ? (
                <div className="max-w-2xl mx-auto">
                  <Dropzone onFilesAdded={handleFilesAdded} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  
                  {/* File List / Reorder Column */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                          Upload Queue
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                          {filesCount} {filesCount === 1 ? 'file' : 'files'}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.getElementById('pdf-file-input') as HTMLInputElement;
                          fileInput?.click();
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Files
                      </button>
                    </div>

                    <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                      {files.map((item, index) => (
                        <PDFListItem
                          key={item.id}
                          item={item}
                          index={index}
                          totalItems={filesCount}
                          onMoveUp={moveUp}
                          onMoveDown={moveDown}
                          onRemove={removeFile}
                        />
                      ))}
                    </div>

                    {/* Quick drag & drop surface for appending */}
                    <div className="border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900/10 rounded-2xl p-4 text-center text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 cursor-pointer relative transition-all"
                         onClick={() => {
                           const fileInput = document.getElementById('pdf-file-input') as HTMLInputElement;
                           fileInput?.click();
                         }}
                    >
                      <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={(e) => {
                          if (e.target.files) handleFilesAdded(Array.from(e.target.files));
                          if (e.target) e.target.value = '';
                        }}
                        className="hidden animate-none"
                      />
                      <span className="inline-flex items-center gap-1.5 font-medium font-sans">
                        <FileUp className="w-4 h-4 text-indigo-505 dark:text-indigo-400" />
                        Click here or drop additional PDF files to append
                      </span>
                    </div>
                  </div>

                  {/* Summary / Controls Panel */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="flex items-center gap-1.5 h-6">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                        Output Config
                      </span>
                    </div>
                    
                    <MergeControls
                      filesCount={filesCount}
                      totalPages={totalPages}
                      totalSize={totalSize}
                      outputName={outputName}
                      onOutputNameChange={setOutputName}
                      onClearAll={clearAll}
                      onMerge={handleMerge}
                      isMerging={isMerging}
                      onSort={handleSort}
                      hasErrors={hasErrors}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Clean and Minimalist Footer Status */}
        <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-[#090d16] py-5 px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium gap-3">
          <div className="flex items-center space-x-5 flex-wrap justify-center">
            <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div> Local sandbox compiler</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-800">•</span>
            <span>Secure In-Browser compilation</span>
          </div>
          <div className="flex space-x-4">
            <span>© 2026 MergeFlow. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
