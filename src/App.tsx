/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PromptForm } from './components/PromptForm';
import { PromptPreview } from './components/PromptPreview';
import { RecentPrompts } from './components/RecentPrompts';
import { StructureGuide } from './components/StructureGuide';
import {
  TASK_TEMPLATES,
  STORAGE_KEY,
  MAX_SAVED_PROMPTS,
  buildStructuredPrompt,
  addPromptToHistory,
  parseSavedHistory,
  type PromptFormInputs,
  type SavedPromptItem,
  type TaskType,
} from './utils/promptBuilder';

function loadInitialHistory(): SavedPromptItem[] {
  try {
    return parseSavedHistory(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function persistHistory(items: SavedPromptItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors in restricted browsing modes
  }
}

export default function App() {
  const [inputs, setInputs] = useState<PromptFormInputs>(
    TASK_TEMPLATES['blog-post'].defaultSample
  );
  const [history, setHistory] = useState<SavedPromptItem[]>(loadInitialHistory);
  const [copiedRecently, setCopiedRecently] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const promptText = buildStructuredPrompt(inputs);

  useEffect(() => {
    persistHistory(history);
  }, [history]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const updateHistory = useCallback(
    (updater: (prev: SavedPromptItem[]) => SavedPromptItem[]) => {
      setHistory((prev) => {
        const next = updater(prev);
        persistHistory(next);
        return next;
      });
    },
    []
  );

  const handleTaskTypeSelect = useCallback((newTaskType: TaskType) => {
    setInputs((prev) => {
      const prevDefault = TASK_TEMPLATES[prev.taskType].defaultSample;
      const nextDefault = TASK_TEMPLATES[newTaskType].defaultSample;

      const isUsingDefaultTopic =
        !prev.topic.trim() || prev.topic === prevDefault.topic;
      const isUsingDefaultAudience =
        !prev.audience.trim() || prev.audience === prevDefault.audience;
      const isUsingDefaultKeywords =
        prev.extraKeywords === prevDefault.extraKeywords;

      return {
        taskType: newTaskType,
        topic: isUsingDefaultTopic ? nextDefault.topic : prev.topic,
        tone: prev.tone,
        audience: isUsingDefaultAudience ? nextDefault.audience : prev.audience,
        length: prev.length,
        extraKeywords: isUsingDefaultKeywords
          ? nextDefault.extraKeywords
          : prev.extraKeywords,
      };
    });
  }, []);

  const handleLoadSample = useCallback(() => {
    setInputs(TASK_TEMPLATES[inputs.taskType].defaultSample);
  }, [inputs.taskType]);

  const handleClearFields = useCallback(() => {
    setInputs((prev) => ({
      ...prev,
      topic: '',
      audience: '',
      extraKeywords: '',
    }));
  }, []);

  const handleSavePrompt = useCallback(() => {
    updateHistory((prev) => addPromptToHistory(prev, inputs));
    setSavedRecently(true);
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      setSavedRecently(false);
    }, 2000);
  }, [inputs, updateHistory]);

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = promptText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    updateHistory((prev) => addPromptToHistory(prev, inputs));
    setCopiedRecently(true);
    if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = window.setTimeout(() => {
      setCopiedRecently(false);
    }, 2000);
  }, [promptText, inputs, updateHistory]);

  const handleLoadFromHistory = useCallback((savedInputs: PromptFormInputs) => {
    setInputs(savedInputs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteFromHistory = useCallback(
    (id: string) => {
      updateHistory((prev) => prev.filter((item) => item.id !== id));
    },
    [updateHistory]
  );

  const handleClearHistory = useCallback(() => {
    updateHistory(() => []);
  }, [updateHistory]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#workspace"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            PromptCraft
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <a
              href="#workspace"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Prompt Builder
            </a>
            <a
              href="#recent-prompts"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Recent Prompts ({history.length}/{MAX_SAVED_PROMPTS})
            </a>
            <a
              href="#structure-guide"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              5-Pillar Structure
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 ${
                copiedRecently
                  ? 'text-white bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 focus-visible:outline-blue-600'
              }`}
            >
              {copiedRecently ? 'Copied!' : 'Copy Prompt'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Intro Header */}
        <div id="workspace" className="max-w-3xl space-y-1.5">
          <p className="text-xs font-semibold text-blue-600">
            Structured Prompt Builder · Blog Post · Code Review · Email Reply
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
            style={{ textWrap: 'balance' }}
          >
            Turn simple inputs into clear, structured prompts for ChatGPT and Claude.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pick a task template, fill in your topic, tone, audience, and length, and copy a ready-to-paste prompt with role, context, constraints, and output formatting built in.
          </p>
        </div>

        {/* 2-Column Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 flex flex-col">
            <PromptForm
              inputs={inputs}
              onChange={setInputs}
              onTaskTypeSelect={handleTaskTypeSelect}
              onLoadSample={handleLoadSample}
              onClearFields={handleClearFields}
            />
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <PromptPreview
              inputs={inputs}
              promptText={promptText}
              onCopyPrompt={handleCopyPrompt}
              onSavePrompt={handleSavePrompt}
              copiedRecently={copiedRecently}
              savedRecently={savedRecently}
            />
          </div>
        </div>

        {/* Last 5 Generated Prompts (localStorage) */}
        <RecentPrompts
          history={history}
          onLoadPrompt={handleLoadFromHistory}
          onDeletePrompt={handleDeleteFromHistory}
          onClearAll={handleClearHistory}
          onSaveCurrent={handleSavePrompt}
        />

        {/* 5-Pillar Structure Guide */}
        <StructureGuide />
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>PromptCraft — Structured Prompt Builder for ChatGPT &amp; Claude</span>
          <span>Templates run locally in your browser · Last 5 prompts saved in localStorage</span>
        </div>
      </footer>
    </div>
  );
}
