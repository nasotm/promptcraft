/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { PromptForm } from './components/PromptForm';
import { PromptPreview } from './components/PromptPreview';
import { RecentPrompts } from './components/RecentPrompts';
import { StructureGuide } from './components/StructureGuide';
import {
  TASK_TEMPLATES,
  STORAGE_KEY,
  THEME_STORAGE_KEY,
  MAX_SAVED_PROMPTS,
  buildPromptVariation,
  addPromptToHistory,
  parseSavedHistory,
  parseThemeMode,
  type PromptFormInputs,
  type SavedPromptItem,
  type TaskType,
  type VariationId,
  type ThemeMode,
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

function loadInitialTheme(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return parseThemeMode(stored);
  } catch {
    return 'light';
  }
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(loadInitialTheme);
  const [inputs, setInputs] = useState<PromptFormInputs>(
    TASK_TEMPLATES['blog-post'].defaultSample
  );
  const [history, setHistory] = useState<SavedPromptItem[]>(loadInitialHistory);
  const [copiedVariationId, setCopiedVariationId] = useState<VariationId | null>(null);
  const [savedVariationId, setSavedVariationId] = useState<VariationId | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    persistHistory(history);
  }, [history]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;
      if (next === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage errors
      }
      return next;
    });
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

  const handleSaveVariation = useCallback(
    (variationId: VariationId) => {
      updateHistory((prev) =>
        addPromptToHistory(
          prev,
          inputs,
          new Date().toISOString(),
          `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          variationId
        )
      );
      setSavedVariationId(variationId);
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => {
        setSavedVariationId(null);
      }, 2000);
    },
    [inputs, updateHistory]
  );

  const handleCopyVariation = useCallback(
    async (variationId: VariationId) => {
      const textToCopy = buildPromptVariation(inputs, variationId);
      try {
        await navigator.clipboard.writeText(textToCopy);
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      updateHistory((prev) =>
        addPromptToHistory(
          prev,
          inputs,
          new Date().toISOString(),
          `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          variationId
        )
      );
      setCopiedVariationId(variationId);
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedVariationId(null);
      }, 2000);
    },
    [inputs, updateHistory]
  );

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

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#workspace"
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
          >
            PromptCraft
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            <a
              href="#workspace"
              className="hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              A/B/C Tester
            </a>
            <a
              href="#recent-prompts"
              className="hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Recent Prompts ({history.length}/{MAX_SAVED_PROMPTS})
            </a>
            <a
              href="#structure-guide"
              className="hover:text-slate-900 dark:hover:text-slate-100 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              5-Pillar Structure
            </a>
          </nav>

          {/* Zone 3: Dark Mode / Light Mode Toggle Switch */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              aria-label="Toggle dark mode"
              onClick={handleToggleTheme}
              className="inline-flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {isDark ? (
                <Moon className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              )}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              <span
                aria-hidden="true"
                className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                  isDark ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Intro Header */}
        <div id="workspace" className="max-w-3xl space-y-1">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            Prompt A/B Tester · Standard (A) · Concise (B) · Step-by-Step (C)
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
            style={{ textWrap: 'balance' }}
          >
            Generate and compare three structured prompt variations side-by-side.
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Configure your topic, tone, audience, and length once—then test Variation A (Standard), Variation B (Concise), or Variation C (Detailed Step-by-Step) with one click.
          </p>
        </div>

        {/* Step 1: Configuration Form */}
        <PromptForm
          inputs={inputs}
          onChange={setInputs}
          onTaskTypeSelect={handleTaskTypeSelect}
          onLoadSample={handleLoadSample}
          onClearFields={handleClearFields}
        />

        {/* Step 2: 3 Side-by-Side Live Preview Boxes (A, B, C) */}
        <PromptPreview
          inputs={inputs}
          onCopyVariation={handleCopyVariation}
          onSaveVariation={handleSaveVariation}
          copiedVariationId={copiedVariationId}
          savedVariationId={savedVariationId}
        />

        {/* Last 5 Generated Prompts (localStorage) */}
        <RecentPrompts
          history={history}
          onLoadPrompt={handleLoadFromHistory}
          onDeletePrompt={handleDeleteFromHistory}
          onClearAll={handleClearHistory}
          onSaveCurrent={() => handleSaveVariation('A')}
        />

        {/* 5-Pillar Structure Guide */}
        <StructureGuide />
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>PromptCraft — Structured Prompt A/B Tester for ChatGPT &amp; Claude</span>
          <span>Templates run locally in your browser · Last 5 prompts saved in localStorage</span>
        </div>
      </footer>
    </div>
  );
}
