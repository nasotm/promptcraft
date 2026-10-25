import React, { useState } from 'react';
import { Check, Copy, BookmarkPlus } from 'lucide-react';
import {
  TASK_TEMPLATES,
  TONE_LABELS,
  LENGTH_SPECS,
  buildPromptSections,
  countPromptMetrics,
  type PromptFormInputs,
} from '../utils/promptBuilder';

interface PromptPreviewProps {
  inputs: PromptFormInputs;
  promptText: string;
  onCopyPrompt: () => void;
  onSavePrompt: () => void;
  copiedRecently: boolean;
  savedRecently: boolean;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({
  inputs,
  promptText,
  onCopyPrompt,
  onSavePrompt,
  copiedRecently,
  savedRecently,
}) => {
  const [viewMode, setViewMode] = useState<'unified' | 'structured'>('unified');
  const sections = buildPromptSections(inputs);
  const metrics = countPromptMetrics(promptText);

  const sectionList = [
    { key: 'role', label: '01. Role', content: sections.role },
    { key: 'task', label: '02. Task', content: sections.task },
    { key: 'context', label: '03. Context & Audience', content: sections.context },
    { key: 'constraints', label: '04. Constraints & Tone', content: sections.constraints },
    { key: 'outputFormat', label: '05. Output Format', content: sections.outputFormat },
  ];

  return (
    <section
      aria-labelledby="live-preview-heading"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between h-full"
    >
      <div className="space-y-4 flex-1 flex flex-col">
        {/* Header & View Mode Toggle */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h2
              id="live-preview-heading"
              className="text-lg font-semibold tracking-tight text-slate-900"
            >
              2. Live Structured Prompt
            </h2>
            {/* Clean unboxed metadata with typographic separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5 tabular-nums">
              <span className="font-medium text-slate-700">
                {TASK_TEMPLATES[inputs.taskType].label}
              </span>
              <span aria-hidden="true">·</span>
              <span>{TONE_LABELS[inputs.tone].label} tone</span>
              <span aria-hidden="true">·</span>
              <span>{LENGTH_SPECS[inputs.length][inputs.taskType].label} length</span>
              <span aria-hidden="true">·</span>
              <span>{metrics.words} words</span>
              <span aria-hidden="true">·</span>
              <span>{metrics.characters} chars</span>
            </div>
          </div>

          {/* Interactive View Switcher */}
          <div
            role="group"
            aria-label="Preview display mode"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg"
          >
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              aria-pressed={viewMode === 'unified'}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'unified'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Copy-Paste Block
            </button>
            <button
              type="button"
              onClick={() => setViewMode('structured')}
              aria-pressed={viewMode === 'structured'}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'structured'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5-Pillar Anatomy
            </button>
          </div>
        </div>

        {/* Live Preview Content Surface */}
        {viewMode === 'unified' ? (
          <div className="flex-1 flex flex-col">
            <label htmlFor="generated-prompt-output" className="sr-only">
              Generated Structured Prompt
            </label>
            <textarea
              id="generated-prompt-output"
              readOnly
              value={promptText}
              rows={13}
              aria-live="polite"
              className="w-full flex-1 min-h-[260px] p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-900 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        ) : (
          <div
            aria-live="polite"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-y-auto"
          >
            {sectionList.map((item) => (
              <div key={item.key} className="p-3 sm:p-3.5 space-y-1">
                <div className="text-xs font-semibold text-slate-500">
                  {item.label}
                </div>
                <p className="font-mono text-xs sm:text-sm text-slate-900 leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Copy Action & Secondary Save Action */}
      <div className="mt-5 pt-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          {copiedRecently ? (
            <span className="font-medium text-emerald-700" role="status">
              Copied to clipboard and saved to Recent Prompts.
            </span>
          ) : savedRecently ? (
            <span className="font-medium text-blue-700" role="status">
              Saved to your last 5 prompts in this browser.
            </span>
          ) : (
            <span>Ready to paste into ChatGPT, Claude, or Gemini.</span>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onSavePrompt}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <BookmarkPlus className="w-4 h-4 text-slate-600" aria-hidden="true" />
            {savedRecently ? 'Saved' : 'Save to History'}
          </button>

          <button
            type="button"
            onClick={onCopyPrompt}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 ${
              copiedRecently
                ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600'
                : 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600'
            }`}
          >
            {copiedRecently ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" aria-hidden="true" />
                Copy Prompt
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
