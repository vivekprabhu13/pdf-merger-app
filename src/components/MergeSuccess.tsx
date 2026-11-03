import React, { useState } from 'react';
import { Download, CheckCircle2, RotateCcw, FileText, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import { formatBytes } from '../utils/fileSize.ts';
import { motion } from 'motion/react';

interface MergeSuccessProps {
  pdfBytes: Uint8Array;
  fileName: string;
  totalSize: number;
  totalPages: number;
  onReset: () => void;
}

export default function MergeSuccess({
  pdfBytes,
  fileName,
  totalSize,
  totalPages,
  onReset,
}: MergeSuccessProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [downloadCount, setDownloadCount] = useState(0);

  // Generate URL for download and preview
  const fileUrl = React.useMemo(() => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }, [pdfBytes]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fileUrl;
    // Add extension if missing
    const suffix = fileName.toLowerCase().endsWith('.pdf') ? '' : '.pdf';
    a.download = `${fileName}${suffix}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadCount(prev => prev + 1);
  };

  return (
    <div id="merge-success-view" className="w-full max-w-2xl mx-auto space-y-6">
      {/* Visual Header */}
      <div className="text-center space-y-3 py-6 flex flex-col items-center">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2 border border-emerald-100/50 dark:border-emerald-900/35">
          <CheckCircle2 className="w-8 h-8" id="success-icon" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-tight">
            Merged Successfully!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your single consolidated PDF is ready for export and sandboxed preview
          </p>
        </div>
      </div>

      {/* Merged Document Stats Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">Merged File Name</p>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate" title={fileName}>
              {fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`}
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="font-mono">{formatBytes(totalSize)}</span>
              <span>•</span>
              <span className="font-medium">{totalPages} {totalPages === 1 ? 'Page' : 'Pages'}</span>
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownload}
            id="btn-download-pdf"
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Consolidated PDF
          </button>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            id="btn-toggle-preview"
            className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Preview Panel
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview Document
              </>
            )}
          </button>
        </div>

        {/* Warning hint for iframe contexts */}
        {downloadCount > 0 && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center italic">
            File downloaded! Check your computer's download files.
          </p>
        )}
      </div>

      {/* Embedded PDF Viewer Frame (Collapsible) */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          id="pdf-preview-pane"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs"
        >
          <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" /> Embedded Preview
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-150 dark:bg-slate-800 px-2.5 py-0.5 rounded font-mono">
              In-Browser Sandbox
            </span>
          </div>
          
          <div className="aspect-[4/5] sm:aspect-[4/3] w-full bg-slate-100 dark:bg-slate-950 relative">
            <iframe
              src={`${fileUrl}#toolbar=0`}
              title="Merged PDF Preview"
              width="100%"
              height="100%"
              className="border-0 bg-slate-100 dark:bg-slate-950"
            />
          </div>
        </motion.div>
      )}

      {/* Restart Button wrapper */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onReset}
          id="btn-restart-merge"
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5 px-4 py-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/25 rounded-xl border border-transparent hover:border-indigo-100/40 dark:hover:border-indigo-900/30 transition-all cursor-pointer font-sans"
        >
          <RotateCcw className="w-4 h-4" />
          Merge another batch of files
        </button>
      </div>
    </div>
  );
}
