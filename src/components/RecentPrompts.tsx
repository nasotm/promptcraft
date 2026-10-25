import React, { useState } from 'react';
import { Copy, Check, Trash2, ArrowUpRight, BookmarkPlus } from 'lucide-react';
import {
  TASK_TEMPLATES,
  TONE_LABELS,
  LENGTH_SPECS,
  MAX_SAVED_PROMPTS,
  type SavedPromptItem,
  type PromptFormInputs,
} from '../utils/promptBuilder';

interface RecentPromptsProps {
  history: SavedPromptItem[];
  onLoadPrompt: (inputs: PromptFormInputs) => void;
  onDeletePrompt: (id: string) => void;
  onClearAll: () => void;
  onSaveCurrent: () => void;
}

export const RecentPrompts: React.FC<RecentPromptsProps> = ({
  history,
  onLoadPrompt,
  onDeletePrompt,
  onClearAll,
  onSaveCurrent,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyItem = async (item: SavedPromptItem) => {
    try {
      await navigator.clipboard.writeText(item.promptText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = item.promptText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedId(item.id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === item.id ? null : prev));
    }, 2000);
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <section
      id="recent-prompts"
      aria-labelledby="recent-prompts-heading"
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h2
            id="recent-prompts-heading"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            Recent Prompts
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Automatically stores your last {MAX_SAVED_PROMPTS} copied or saved prompts in this browser (<span className="tabular-nums">{history.length}/{MAX_SAVED_PROMPTS}</span> used).
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-10 text-center max-w-md mx-auto space-y-3">
          <p className="text-sm font-medium text-slate-900">
            No saved prompts in your browser yet
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Whenever you click &ldquo;Copy Prompt&rdquo; or &ldquo;Save to History&rdquo;, PromptCraft saves up to {MAX_SAVED_PROMPTS} recent prompts right here in localStorage so you can reuse or tweak them later.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onSaveCurrent}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4 text-blue-600" aria-hidden="true" />
              Save Current Prompt to History
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {history.map((item, index) => {
            const templateLabel = TASK_TEMPLATES[item.inputs.taskType]?.label ?? 'Prompt';
            const toneLabel = TONE_LABELS[item.inputs.tone]?.label ?? item.inputs.tone;
            const lengthLabel =
              LENGTH_SPECS[item.inputs.length]?.[item.inputs.taskType]?.label ??
              item.inputs.length;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="py-4 first:pt-5 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors rounded-lg px-2 -mx-2"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  {/* Unboxed metadata row with typographic separators */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                    <span className="font-semibold text-slate-800">
                      0{index + 1}. {templateLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{toneLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{lengthLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>Audience: {item.inputs.audience}</span>
                    <span aria-hidden="true">·</span>
                    <span>Saved {formatTimestamp(item.createdAt)}</span>
                  </div>

                  <p className="text-sm font-medium text-slate-900 truncate">
                    {item.inputs.topic}
                  </p>

                  {item.inputs.extraKeywords && (
                    <p className="text-xs text-slate-500 truncate">
                      Keywords: {item.inputs.extraKeywords}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onLoadPrompt(item.inputs)}
                    aria-label={`Load "${item.inputs.topic}" into builder`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    Load in Builder
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyItem(item)}
                    aria-label={`Copy prompt for "${item.inputs.topic}"`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isCopied
                        ? 'text-white bg-emerald-600 hover:bg-emerald-700'
                        : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        Copy
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeletePrompt(item.id)}
                    aria-label={`Delete prompt for "${item.inputs.topic}"`}
                    className="inline-flex items-center justify-center p-1.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
