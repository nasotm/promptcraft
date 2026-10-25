import React from 'react';
import { Check, Copy, BookmarkPlus } from 'lucide-react';
import {
  TASK_TEMPLATES,
  TONE_LABELS,
  LENGTH_SPECS,
  buildAllPromptVariations,
  type PromptFormInputs,
  type VariationId,
} from '../utils/promptBuilder';

interface PromptPreviewProps {
  inputs: PromptFormInputs;
  onCopyVariation: (variationId: VariationId) => void;
  onSaveVariation: (variationId: VariationId) => void;
  copiedVariationId: VariationId | null;
  savedVariationId: VariationId | null;
}

const VARIATION_IDS: VariationId[] = ['A', 'B', 'C'];

export const PromptPreview: React.FC<PromptPreviewProps> = ({
  inputs,
  onCopyVariation,
  onSaveVariation,
  copiedVariationId,
  savedVariationId,
}) => {
  const variations = buildAllPromptVariations(inputs);

  return (
    <section
      aria-labelledby="live-preview-heading"
      className="space-y-4"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2
            id="live-preview-heading"
            className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
          >
            2. Compare &amp; Copy Prompt Variations (A / B / C)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Compare all three prompt styles side-by-side and copy the variation that best fits your workflow.
          </p>
        </div>

        {/* Unboxed active configuration summary */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {TASK_TEMPLATES[inputs.taskType].label}
          </span>
          <span aria-hidden="true">·</span>
          <span>{TONE_LABELS[inputs.tone].label} tone</span>
          <span aria-hidden="true">·</span>
          <span>{LENGTH_SPECS[inputs.length][inputs.taskType].label} length</span>
        </div>
      </div>

      {/* Three Separate Variation Boxes (Side-by-Side on Desktop, Stacked on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {VARIATION_IDS.map((variationId) => {
          const v = variations[variationId];
          const isCopied = copiedVariationId === variationId;
          const isSaved = savedVariationId === variationId;

          return (
            <article
              key={variationId}
              data-testid={`variation-box-${variationId}`}
              aria-labelledby={`variation-heading-${variationId}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between h-full transition-colors"
            >
              <div className="space-y-3.5 flex-1 flex flex-col">
                {/* Box Header */}
                <div className="pb-3.5 border-b border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      id={`variation-heading-${variationId}`}
                      className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100"
                    >
                      {v.name}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {v.words} words · {v.characters} chars
                    </span>
                  </div>

                  {/* Clean unboxed metadata with typographic separator */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{v.subtitle}</span>
                    <span aria-hidden="true">·</span>
                    <span>{v.strategySummary}</span>
                  </div>
                </div>

                {/* Read-only Live Prompt Textarea */}
                <div className="flex-1 flex flex-col">
                  <label
                    htmlFor={`prompt-output-${variationId}`}
                    className="sr-only"
                  >
                    {v.name} Generated Prompt
                  </label>
                  <textarea
                    id={`prompt-output-${variationId}`}
                    readOnly
                    value={v.promptText}
                    rows={12}
                    aria-live="polite"
                    className="w-full flex-1 min-h-[250px] p-3.5 font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                  />
                </div>
              </div>

              {/* Box Footer with Dedicated Copy Prompt Button */}
              <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSaveVariation(variationId)}
                  aria-label={`Save ${v.name} to history`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
                  {isSaved ? 'Saved!' : 'Save'}
                </button>

                <button
                  type="button"
                  onClick={() => onCopyVariation(variationId)}
                  aria-label={`Copy Prompt for ${v.name}`}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isCopied
                      ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600'
                      : 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600'
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
                      Copy Prompt
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
