import React from 'react';

const PILLARS = [
  {
    number: '01. Role',
    title: 'Establishes Domain Expertise',
    description:
      'Assigns a specific professional persona (editorial strategist, principal software engineer, or executive advisor) so the AI selects accurate vocabulary and mental models.',
  },
  {
    number: '02. Task',
    title: 'Defines the Core Deliverable',
    description:
      'States the exact objective around your topic without ambiguity, preventing generic summaries or off-topic tangents.',
  },
  {
    number: '03. Context & Audience',
    title: 'Calibrates Depth & Framing',
    description:
      'Tells the AI who will read the output so explanations match the reader’s technical familiarity and priorities.',
  },
  {
    number: '04. Constraints & Tone',
    title: 'Enforces Length, Voice & Keywords',
    description:
      'Sets explicit word-count boundaries, tone guidelines, and required keywords so you do not have to ask for rewrites.',
  },
  {
    number: '05. Output Format',
    title: 'Structures the Final Response',
    description:
      'Specifies headings, prioritized checklists, or email subject-and-body sections so the response is immediately usable.',
  },
];

export const StructureGuide: React.FC = () => {
  return (
    <section
      id="structure-guide"
      aria-labelledby="structure-guide-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors"
    >
      <div className="max-w-2xl pb-5 border-b border-slate-200 dark:border-slate-800">
        <h2
          id="structure-guide-heading"
          className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          Why Structured Prompts Work Better
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          One-sentence prompts force ChatGPT and Claude to guess your tone, audience, and format. Every PromptCraft template automatically assembles five proven building blocks into copy-paste variations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-5">
        {PILLARS.map((pillar) => (
          <div key={pillar.number} className="space-y-1.5">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
              {pillar.number}
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {pillar.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
