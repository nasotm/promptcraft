import React from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import {
  TASK_TEMPLATES,
  TONE_LABELS,
  LENGTH_SPECS,
  type PromptFormInputs,
  type TaskType,
  type ToneType,
  type LengthType,
} from '../utils/promptBuilder';

interface PromptFormProps {
  inputs: PromptFormInputs;
  onChange: (updated: PromptFormInputs) => void;
  onTaskTypeSelect: (taskType: TaskType) => void;
  onLoadSample: () => void;
  onClearFields: () => void;
}

export const PromptForm: React.FC<PromptFormProps> = ({
  inputs,
  onChange,
  onTaskTypeSelect,
  onLoadSample,
  onClearFields,
}) => {
  const currentTemplate = TASK_TEMPLATES[inputs.taskType];

  const handleFieldChange = <K extends keyof PromptFormInputs>(
    field: K,
    value: PromptFormInputs[K]
  ) => {
    onChange({
      ...inputs,
      [field]: value,
    });
  };

  return (
    <section
      aria-labelledby="builder-form-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors"
    >
      {/* Header & Quick Actions */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2
            id="builder-form-heading"
            className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
          >
            1. Configure Prompt Inputs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Pick a template and fill in your parameters. All three prompt variations (A, B, and C) update live below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Fill Sample
          </button>
          <button
            type="button"
            onClick={onClearFields}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset Fields
          </button>
        </div>
      </div>

      {/* Responsive Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4">
        {/* Left Half: Task Type + Topic */}
        <div className="lg:col-span-6 space-y-4">
          {/* Task Type Dropdown + Quick Switcher */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="task-type-select"
                className="block text-sm font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap"
              >
                Task Type
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentTemplate.shortDescription}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-5">
                <select
                  id="task-type-select"
                  aria-label="Task type"
                  value={inputs.taskType}
                  onChange={(e) => onTaskTypeSelect(e.target.value as TaskType)}
                  className="w-full h-10 px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                >
                  {(Object.keys(TASK_TEMPLATES) as TaskType[]).map((key) => (
                    <option key={key} value={key}>
                      {TASK_TEMPLATES[key].label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                role="group"
                aria-label="Quick template selector"
                className="sm:col-span-7 grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                {(Object.keys(TASK_TEMPLATES) as TaskType[]).map((key) => {
                  const template = TASK_TEMPLATES[key];
                  const isSelected = inputs.taskType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onTaskTypeSelect(key)}
                      aria-pressed={isSelected}
                      className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {template.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Topic / Subject Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="topic-input"
                className="block text-sm font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap"
              >
                {currentTemplate.topicLabel}
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Core subject</span>
            </div>
            <input
              id="topic-input"
              type="text"
              value={inputs.topic}
              onChange={(e) => handleFieldChange('topic', e.target.value)}
              placeholder={currentTemplate.topicPlaceholder}
              className="w-full h-10 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            />
            {!inputs.topic.trim() && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Using template default topic in preview until you type your own subject.
              </p>
            )}
          </div>
        </div>

        {/* Right Half: Audience + Tone/Length/Keywords */}
        <div className="lg:col-span-6 space-y-4">
          {/* Audience Text Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="audience-input"
                className="block text-sm font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap"
              >
                Target Audience
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Who reads the output?</span>
            </div>
            <input
              id="audience-input"
              type="text"
              value={inputs.audience}
              onChange={(e) => handleFieldChange('audience', e.target.value)}
              placeholder={currentTemplate.audiencePlaceholder}
              className="w-full h-10 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            />
            {!inputs.audience.trim() && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Using template default audience in preview until you specify a reader.
              </p>
            )}
          </div>

          {/* Tone, Length & Extra Keywords Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Tone Dropdown */}
            <div className="sm:col-span-3 space-y-1.5">
              <label
                htmlFor="tone-select"
                className="block text-sm font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap"
              >
                Tone
              </label>
              <select
                id="tone-select"
                value={inputs.tone}
                onChange={(e) => handleFieldChange('tone', e.target.value as ToneType)}
                className="w-full h-10 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              >
                {(Object.keys(TONE_LABELS) as ToneType[]).map((toneKey) => (
                  <option key={toneKey} value={toneKey}>
                    {TONE_LABELS[toneKey].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Length Dropdown */}
            <div className="sm:col-span-3 space-y-1.5">
              <label
                htmlFor="length-select"
                className="block text-sm font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap"
              >
                Length
              </label>
              <select
                id="length-select"
                value={inputs.length}
                onChange={(e) => handleFieldChange('length', e.target.value as LengthType)}
                className="w-full h-10 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              >
                {(['short', 'medium', 'long'] as LengthType[]).map((lenKey) => (
                  <option key={lenKey} value={lenKey}>
                    {LENGTH_SPECS[lenKey][inputs.taskType].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Extra Keywords */}
            <div className="sm:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="keywords-input"
                  className="block text-sm font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap"
                >
                  Extra Keywords
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Optional</span>
              </div>
              <input
                id="keywords-input"
                type="text"
                value={inputs.extraKeywords}
                onChange={(e) => handleFieldChange('extraKeywords', e.target.value)}
                placeholder={currentTemplate.keywordsPlaceholder}
                className="w-full h-10 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
