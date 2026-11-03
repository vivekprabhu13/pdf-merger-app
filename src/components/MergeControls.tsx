import React from 'react';
import { Sparkles, Trash2, Loader2, ArrowUpDown, Settings } from 'lucide-react';
import { formatBytes } from '../utils/fileSize.ts';

interface MergeControlsProps {
  filesCount: number;
  totalPages: number | undefined;
  totalSize: number;
  outputName: string;
  onOutputNameChange: (name: string) => void;
  onClearAll: () => void;
  onMerge: () => void;
  isMerging: boolean;
  onSort: (type: 'name' | 'size' | 'reset') => void;
  hasErrors: boolean;
}

export default function MergeControls({
  filesCount,
  totalPages,
  totalSize,
  outputName,
  onOutputNameChange,
  onClearAll,
  onMerge,
  isMerging,
  onSort,
  hasErrors,
}: MergeControlsProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Strip trailing space or characters if needed, but standard text input with fallback
    onOutputNameChange(value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMerging && filesCount > 1 && !hasErrors) {
      onMerge();
    }
  };

  return (
    <div id="merge-controls-card" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
      {/* Top Header Panel */}
      <div className="px-6 py-4 border-b border-rose-100/10 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex justify-between items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
          Merge Settings
        </span>
        <button
          type="button"
          onClick={onClearAll}
          disabled={isMerging}
          id="btn-clear-all"
          className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Summary Metrics Area */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/85 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase block tracking-wider">Files</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">{filesCount}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/85 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase block tracking-wider">Pages</span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
              {totalPages !== undefined ? totalPages : '...'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/85 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase block tracking-wider">Size</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono mt-1.5 block truncate" title={`${totalSize} bytes`}>
              {formatBytes(totalSize)}
            </span>
          </div>
        </div>

        {/* Control Actions & Custom Filename Input */}
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="merged-filename-input" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
              Output Document Name
            </label>
            <div className="relative rounded-2xl">
              <input
                type="text"
                id="merged-filename-input"
                value={outputName}
                onChange={handleNameChange}
                disabled={isMerging}
                placeholder="e.g. combined-document"
                className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition-all pr-12"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 font-mono text-xs font-medium select-none">
                .pdf
              </div>
            </div>
          </div>

          {/* Quick List sorting pill actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" /> Quick Sort List:
              </span>
              <button
                type="button"
                onClick={() => onSort('name')}
                disabled={isMerging}
                className="text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900 font-medium transition-colors cursor-pointer"
              >
                Name
              </button>
              <button
                type="button"
                onClick={() => onSort('size')}
                disabled={isMerging}
                className="text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-900 font-medium transition-colors cursor-pointer"
              >
                Size
              </button>
            </div>
          </div>

          <div className="pt-2">
            {/* Core Merge Button */}
            <button
              type="submit"
              disabled={isMerging || filesCount < 2 || hasErrors}
              id="btn-merge-submit"
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg cursor-pointer
                ${isMerging
                  ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-none animate-pulse cursor-not-allowed'
                  : filesCount < 2
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-none cursor-not-allowed'
                    : hasErrors
                      ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-500 dark:text-rose-400 shadow-none cursor-not-allowed'
                      : 'bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 dark:shadow-none'
                }`}
            >
              {isMerging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Consolidated Document...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Merge into 1 PDF
                </>
              )}
            </button>
          </div>

          {filesCount === 1 && (
            <p className="text-center text-[10.5px] text-slate-400 dark:text-slate-500 font-medium">
              Please upload at least one more PDF to merge
            </p>
          )}
          {hasErrors && (
            <p className="text-center text-[10.5px] text-rose-500 dark:text-rose-400 font-medium">
              Please remove invalid or unreadable PDFs before continuing
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
