import React from 'react';
import { ArrowUp, ArrowDown, Trash2, FileText, Loader2, AlertTriangle, Check } from 'lucide-react';
import { PDFFileItem } from '../types.ts';
import { formatBytes } from '../utils/fileSize.ts';

interface PDFListItemProps {
  key?: string;
  item: PDFFileItem;
  index: number;
  totalItems: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (id: string) => void;
}

export default function PDFListItem({
  item,
  index,
  totalItems,
  onMoveUp,
  onMoveDown,
  onRemove,
}: PDFListItemProps) {
  const isFirst = index === 0;
  const isLast = index === totalItems - 1;

  return (
    <div
      id={`pdf-item-${item.id}`}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200
        ${item.error 
          ? 'border-rose-200 bg-rose-50/20 dark:border-rose-900/40 dark:bg-rose-950/5' 
          : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
        }`}
    >
      {/* File Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div 
          className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-xl text-xs font-mono font-bold uppercase tracking-wider
            ${item.error 
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
              : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/35 transition-colors'
            }`}
        >
          {index + 1}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={item.name}>
              {item.name}
            </h4>
          </div>
          
          <div className="flex items-center flex-wrap gap-x-2 text-xs text-slate-400 dark:text-slate-500">
            <span>{formatBytes(item.size)}</span>
            <span>•</span>
            {item.loadingPageCount ? (
              <span className="flex items-center gap-1 text-indigo-500 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Reading...
              </span>
            ) : item.error ? (
              <span className="flex items-center gap-1 text-rose-500 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Unreadable
              </span>
            ) : (
              <span>
                {item.pageCount === 1 ? '1 Page' : `${item.pageCount} Pages`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Item States & Sorting controls */}
      <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/20 sm:bg-transparent -mx-4 -mb-4 sm:m-0 p-2 sm:p-0 rounded-b-2xl border-t sm:border-0 border-slate-100 dark:border-slate-800/85 shrink-0">
        {/* Error/Warning message inline on mobile */}
        {item.error ? (
          <span className="text-[11px] text-rose-600 dark:text-rose-400 pl-2 pr-1 font-medium select-none truncate max-w-[200px]" title={item.error}>
            {item.error}
          </span>
        ) : (
          <div className="sm:hidden text-[11px] text-emerald-600 dark:text-emerald-400 pl-2 font-mono flex items-center gap-0.5 select-none font-medium">
            <Check className="w-3.5 h-3.5" /> Ready
          </div>
        )}

        <div className="flex items-center gap-0.5 ml-auto">
          {/* Move Up */}
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            id={`btn-move-up-${item.id}`}
            title="Move PDF Up"
            className={`p-2 rounded-lg text-slate-400 dark:text-slate-500 transition-all focus:outline-none
              ${isFirst 
                ? 'opacity-20 cursor-not-allowed' 
                : 'hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 active:scale-95'
              }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            id={`btn-move-down-${item.id}`}
            title="Move PDF Down"
            className={`p-2 rounded-lg text-slate-400 dark:text-slate-500 transition-all focus:outline-none
              ${isLast 
                ? 'opacity-20 cursor-not-allowed' 
                : 'hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 active:scale-95'
              }`}
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1.5"></span>

          {/* Delete Icon */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            id={`btn-remove-${item.id}`}
            title="Remove from merging list"
            className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95 focus:outline-none"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
