export type TaskType = 'blog-post' | 'code-review' | 'email-reply';
export type ToneType = 'formal' | 'casual' | 'friendly';
export type LengthType = 'short' | 'medium' | 'long';
export type VariationId = 'A' | 'B' | 'C';

export interface PromptFormInputs {
  taskType: TaskType;
  topic: string;
  tone: ToneType;
  audience: string;
  length: LengthType;
  extraKeywords: string;
}

export interface PromptSections {
  role: string;
  task: string;
  context: string;
  constraints: string;
  outputFormat: string;
}

export interface PromptVariation {
  id: VariationId;
  name: string;
  subtitle: string;
  strategySummary: string;
  promptText: string;
  words: number;
  characters: number;
}

export interface SavedPromptItem {
  id: string;
  createdAt: string;
  inputs: PromptFormInputs;
  variationId?: VariationId;
  promptText: string;
}

export interface TemplateMetadata {
  id: TaskType;
  label: string;
  shortDescription: string;
  topicLabel: string;
  topicPlaceholder: string;
  audiencePlaceholder: string;
  keywordsPlaceholder: string;
  defaultSample: PromptFormInputs;
}

export const MAX_SAVED_PROMPTS = 5;
export const STORAGE_KEY = 'promptcraft_recent_prompts_v1';

export const VARIATION_META: Record<
  VariationId,
  { id: VariationId; name: string; subtitle: string; strategySummary: string }
> = {
  A: {
    id: 'A',
    name: 'Variation A — Standard',
    subtitle: 'Balanced 5-pillar structure',
    strategySummary: 'Role · Task · Context · Constraints · Output Format',
  },
  B: {
    id: 'B',
    name: 'Variation B — Concise',
    subtitle: 'Shorter, fast-scan version',
    strategySummary: 'Compact, token-efficient direct instructions',
  },
  C: {
    id: 'C',
    name: 'Variation C — Step-by-Step',
    subtitle: 'Highly detailed execution plan',
    strategySummary: 'Phased workflow + quality checklist + deep structure',
  },
};

export const TASK_TEMPLATES: Record<TaskType, TemplateMetadata> = {
  'blog-post': {
    id: 'blog-post',
    label: 'Blog Post',
    shortDescription: 'Outline and draft an engaging, well-structured article with clear takeaways.',
    topicLabel: 'Topic / Subject',
    topicPlaceholder: 'e.g., How small teams can adopt async communication without losing momentum',
    audiencePlaceholder: 'e.g., Remote startup founders and product managers',
    keywordsPlaceholder: 'e.g., deep work, documentation, timezone overlap',
    defaultSample: {
      taskType: 'blog-post',
      topic: 'How small teams can adopt async communication without losing momentum',
      tone: 'friendly',
      audience: 'Remote startup founders and product managers',
      length: 'medium',
      extraKeywords: 'deep work, written handoffs, fewer status meetings',
    },
  },
  'code-review': {
    id: 'code-review',
    label: 'Code Review',
    shortDescription: 'Audit code for bugs, edge cases, readability, and maintainability improvements.',
    topicLabel: 'Topic / Code Subject',
    topicPlaceholder: 'e.g., React custom hook fetching paginated API data with abort controller',
    audiencePlaceholder: 'e.g., Mid-level TypeScript developers on my product team',
    keywordsPlaceholder: 'e.g., race conditions, error handling, memory leaks',
    defaultSample: {
      taskType: 'code-review',
      topic: 'React custom hook fetching paginated API data with an AbortController',
      tone: 'formal',
      audience: 'Mid-level TypeScript engineers on a web platform team',
      length: 'medium',
      extraKeywords: 'race conditions, stale closures, error recovery',
    },
  },
  'email-reply': {
    id: 'email-reply',
    label: 'Email Reply',
    shortDescription: 'Write a clear, tactful email response that answers questions and sets next steps.',
    topicLabel: 'Topic / Email Situation',
    topicPlaceholder: 'e.g., Replying to a client asking to move up the project launch deadline by two weeks',
    audiencePlaceholder: 'e.g., Enterprise client stakeholder and VP of Marketing',
    keywordsPlaceholder: 'e.g., scope trade-offs, phased rollout, Friday check-in',
    defaultSample: {
      taskType: 'email-reply',
      topic: 'Replying to a client asking to move up the project launch deadline by two weeks',
      tone: 'friendly',
      audience: 'Long-term client stakeholder and VP of Marketing',
      length: 'short',
      extraKeywords: 'scope trade-offs, phased rollout option, Friday sync',
    },
  },
};

export const TONE_LABELS: Record<ToneType, { label: string; guidance: string; shortAdjective: string }> = {
  formal: {
    label: 'Formal',
    guidance: 'Use a polished, authoritative, and objective tone with precise terminology and zero slang.',
    shortAdjective: 'formal, authoritative, and objective',
  },
  casual: {
    label: 'Casual',
    guidance: 'Use a relaxed, conversational, and direct tone that reads naturally without stiff jargon.',
    shortAdjective: 'casual, conversational, and direct',
  },
  friendly: {
    label: 'Friendly',
    guidance: 'Use a warm, encouraging, and approachable tone that builds rapport while staying clear and helpful.',
    shortAdjective: 'warm, friendly, and approachable',
  },
};

export const LENGTH_SPECS: Record<
  LengthType,
  Record<TaskType, { label: string; constraint: string; shortTarget: string }>
> = {
  short: {
    'blog-post': {
      label: 'Short',
      constraint: 'Keep the post concise at roughly 350–500 words (a quick 2-minute read) focused on the core takeaway.',
      shortTarget: '350–500 words',
    },
    'code-review': {
      label: 'Short',
      constraint: 'Keep the review concise (under 250 words), focusing strictly on the top 3 highest-impact issues and fixes.',
      shortTarget: 'under 250 words (top 3 issues)',
    },
    'email-reply': {
      label: 'Short',
      constraint: 'Keep the email brief at 75–125 words (3–5 short sentences) so it can be read in under 30 seconds.',
      shortTarget: '75–125 words (3–5 sentences)',
    },
  },
  medium: {
    'blog-post': {
      label: 'Medium',
      constraint: 'Target 700–1,000 words (a balanced 4–5 minute read) with practical examples for each main point.',
      shortTarget: '700–1,000 words',
    },
    'code-review': {
      label: 'Medium',
      constraint: 'Provide a balanced review (350–500 words) covering critical bugs, refactoring suggestions, and corrected code snippets.',
      shortTarget: '350–500 words with refactored snippets',
    },
    'email-reply': {
      label: 'Medium',
      constraint: 'Target 150–225 words across 2–3 structured paragraphs with a clear summary of next steps.',
      shortTarget: '150–225 words (2–3 paragraphs)',
    },
  },
  long: {
    'blog-post': {
      label: 'Long',
      constraint: 'Write an in-depth guide of 1,300–1,800 words (7–8 minute read) with deep-dive sections, concrete examples, and common pitfalls.',
      shortTarget: '1,300–1,800 words (in-depth guide)',
    },
    'code-review': {
      label: 'Long',
      constraint: 'Deliver a comprehensive, line-by-line architectural review (650–900 words) including edge cases, performance implications, test cases, and a full refactored implementation.',
      shortTarget: '650–900 words (comprehensive review + full refactor)',
    },
    'email-reply': {
      label: 'Long',
      constraint: 'Write a thorough, detailed email response (275–400 words) addressing context, options/trade-offs, timeline impact, and explicit action items.',
      shortTarget: '275–400 words (detailed options + action items)',
    },
  },
};

export function parseKeywords(raw: string): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

export function buildPromptSections(inputs: PromptFormInputs): PromptSections {
  const cleanTopic = inputs.topic.trim() || TASK_TEMPLATES[inputs.taskType].defaultSample.topic;
  const cleanAudience = inputs.audience.trim() || TASK_TEMPLATES[inputs.taskType].defaultSample.audience;
  const toneSpec = TONE_LABELS[inputs.tone];
  const lengthSpec = LENGTH_SPECS[inputs.length][inputs.taskType];
  const keywords = parseKeywords(inputs.extraKeywords);

  const keywordInstruction =
    keywords.length > 0
      ? ` Naturally incorporate or address these specific themes/keywords: ${keywords.join(', ')}.`
      : '';

  if (inputs.taskType === 'blog-post') {
    return {
      role: 'Act as a senior editorial strategist and subject-matter writer who turns complex ideas into clear, memorable articles.',
      task: `Write a complete, publication-ready blog post about: "${cleanTopic}".`,
      context: `The target audience is ${cleanAudience}. Tailor your examples, vocabulary, and depth of explanation directly to their day-to-day priorities and level of familiarity.`,
      constraints: `${toneSpec.guidance} ${lengthSpec.constraint} Avoid generic filler introductions, clichés, or vague platitudes.${keywordInstruction}`,
      outputFormat:
        'Provide: (1) 3 compelling headline options, (2) an engaging hook introduction, (3) structured body sections with descriptive H2/H3 subheadings and concrete examples, and (4) a concise conclusion with a practical takeaway.',
    };
  }

  if (inputs.taskType === 'code-review') {
    return {
      role: 'Act as a principal software engineer and constructive code reviewer focused on reliability, maintainability, and clean architecture.',
      task: `Perform a structured code review and refactoring analysis for: "${cleanTopic}".`,
      context: `The review feedback is written for ${cleanAudience}. Explain the reasoning ("the why") behind each recommendation so the developer can apply the pattern immediately.`,
      constraints: `${toneSpec.guidance} ${lengthSpec.constraint} Prioritize real correctness, edge cases, and readability over subjective style nitpicks.${keywordInstruction}`,
      outputFormat:
        'Organize the review into: (1) Executive Summary of strengths and risks, (2) Prioritized Issues categorized by Critical / Major / Minor, (3) Concrete Refactored Code Example with inline comments, and (4) Recommended Unit/Edge-Case Checks.',
    };
  }

  // email-reply
  return {
    role: 'Act as an executive communications advisor skilled at writing clear, tactful, and high-trust professional emails.',
    task: `Draft a ready-to-send email reply regarding: "${cleanTopic}".`,
    context: `The recipient is ${cleanAudience}. Frame the message so it respects their perspective, answers their core concern directly, and maintains strong working rapport.`,
    constraints: `${toneSpec.guidance} ${lengthSpec.constraint} Lead with clarity in the opening sentence, avoid passive-aggressive phrasing or unnecessary fluff, and end with an unambiguous next step.${keywordInstruction}`,
    outputFormat:
      'Include: (1) a clear Subject Line suggestion, (2) a complete, copy-paste-ready Email Body with greeting and sign-off, and (3) a 1-sentence note on key points to confirm before sending.',
  };
}

/**
 * Variation A: The standard 5-part structured prompt.
 */
export function buildStructuredPrompt(inputs: PromptFormInputs): string {
  const sections = buildPromptSections(inputs);

  return [
    `ROLE:\n${sections.role}`,
    `TASK:\n${sections.task}`,
    `CONTEXT & AUDIENCE:\n${sections.context}`,
    `CONSTRAINTS & TONE:\n${sections.constraints}`,
    `OUTPUT FORMAT:\n${sections.outputFormat}`,
  ].join('\n\n');
}

/**
 * Variation B: A shorter, more concise version that preserves all key parameters in a tight block.
 */
export function buildConcisePrompt(inputs: PromptFormInputs): string {
  const cleanTopic = inputs.topic.trim() || TASK_TEMPLATES[inputs.taskType].defaultSample.topic;
  const cleanAudience = inputs.audience.trim() || TASK_TEMPLATES[inputs.taskType].defaultSample.audience;
  const toneSpec = TONE_LABELS[inputs.tone];
  const lengthSpec = LENGTH_SPECS[inputs.length][inputs.taskType];
  const keywords = parseKeywords(inputs.extraKeywords);
  const keywordLine = keywords.length > 0 ? `\n- Must include: ${keywords.join(', ')}` : '';

  if (inputs.taskType === 'blog-post') {
    return [
      `Write a ${lengthSpec.shortTarget} blog post on "${cleanTopic}" for ${cleanAudience}.`,
      `Requirements:\n- Tone: ${toneSpec.shortAdjective}\n- Structure: 3 headline options, brief hook, H2 body sections with practical examples, and a 1-paragraph takeaway${keywordLine}\n- Skip generic filler and lead directly with actionable insight.`,
    ].join('\n\n');
  }

  if (inputs.taskType === 'code-review') {
    return [
      `Review code for "${cleanTopic}" tailored to ${cleanAudience} (${lengthSpec.shortTarget}).`,
      `Requirements:\n- Tone: ${toneSpec.shortAdjective}\n- Deliver: (1) Top bugs & edge cases by severity, (2) Refactored code snippet, (3) Key test cases${keywordLine}\n- Focus on correctness and maintainability over minor style nitpicks.`,
    ].join('\n\n');
  }

  return [
    `Draft a ${lengthSpec.shortTarget} email reply about "${cleanTopic}" to ${cleanAudience}.`,
    `Requirements:\n- Tone: ${toneSpec.shortAdjective}\n- Include: Subject line + ready-to-send email body ending with a clear next step${keywordLine}\n- Open directly and keep every sentence high-signal.`,
  ].join('\n\n');
}

/**
 * Variation C: A highly detailed, step-by-step version with explicit execution phases and quality verification.
 */
export function buildDetailedStepByStepPrompt(inputs: PromptFormInputs): string {
  const cleanTopic = inputs.topic.trim() || TASK_TEMPLATES[inputs.taskType].defaultSample.topic;
  const cleanAudience = inputs.audience.trim() || TASK_TEMPLATES[inputs.taskType].defaultSample.audience;
  const toneSpec = TONE_LABELS[inputs.tone];
  const lengthSpec = LENGTH_SPECS[inputs.length][inputs.taskType];
  const keywords = parseKeywords(inputs.extraKeywords);
  const keywordRequirement =
    keywords.length > 0
      ? `\n- Required Domain Keywords / Concepts: Weave in ${keywords.map((k) => `"${k}"`).join(', ')} with concrete context rather than superficial mention.`
      : '';

  if (inputs.taskType === 'blog-post') {
    return [
      `ROLE & OBJECTIVE:\nAct as a principal editorial strategist and domain expert. Your objective is to plan, structure, and write a definitive, high-retention blog post on: "${cleanTopic}".`,
      `TARGET AUDIENCE & CONTEXT:\nYou are writing specifically for ${cleanAudience}. Calibrate every explanation, mental model, and real-world example to their daily workflow, pain points, and decision-making level.`,
      `STEP-BY-STEP EXECUTION PLAN:\nFollow these steps sequentially in your response:\nStep 1 — Angle & Hook Thesis: Identify the #1 misconception or friction point ${cleanAudience} face regarding "${cleanTopic}" and state a sharp thesis.\nStep 2 — Headline Variations: Draft 3 distinct headlines (1 tactical how-to, 1 contrarian insight, 1 outcome-driven).\nStep 3 — Structured Article Draft: Write the full post using scannable H2/H3 subheadings, concrete before/after scenarios, and actionable implementation steps.\nStep 4 — Actionable Checklist: Conclude with a 3-bullet "Immediate Next Steps" summary the reader can apply today.`,
      `STRICT CONSTRAINTS & TONE:\n- Voice & Tone: ${toneSpec.guidance}\n- Target Length: ${lengthSpec.constraint}\n- Quality Bar: Eliminate throat-clearing openings, generic AI transitions ("In today's fast-paced world"), and vague platitudes.${keywordRequirement}`,
      `OUTPUT FORMAT:\nRender the final output in clean Markdown with explicit H1/H2/H3 hierarchy, bolded key takeaways, and a self-contained copy-ready layout.`,
    ].join('\n\n');
  }

  if (inputs.taskType === 'code-review') {
    return [
      `ROLE & OBJECTIVE:\nAct as a staff software architect and constructive code reviewer. Conduct a rigorous, systematic architectural and implementation review for: "${cleanTopic}".`,
      `TARGET AUDIENCE & CONTEXT:\nYour review is addressed to ${cleanAudience}. Pair every critique with clear engineering rationale ("the why") and concrete trade-offs so the team learns the underlying principle.`,
      `STEP-BY-STEP EXECUTION PLAN:\nExecute the review in four explicit phases:\nStep 1 — System & Failure-Mode Audit: Analyze the code/subject for correctness bugs, async race conditions, unhandled edge cases, and resource/memory leaks.\nStep 2 — Severity-Ranked Findings: Group issues into [CRITICAL], [MAJOR], and [MINOR], explaining the exact runtime impact of each.\nStep 3 — Production-Grade Refactoring: Provide a complete, idiomatic refactored implementation with inline comments highlighting what changed and why.\nStep 4 — Verification & Test Suite Plan: List the exact unit and edge-case test scenarios required to prevent regressions.`,
      `STRICT CONSTRAINTS & TONE:\n- Voice & Tone: ${toneSpec.guidance}\n- Target Depth & Length: ${lengthSpec.constraint}\n- Quality Bar: Focus on bug prevention, type safety, and long-term maintainability rather than cosmetic formatting nitpicks.${keywordRequirement}`,
      `OUTPUT FORMAT:\nUse structured Markdown sections with fenced code blocks, clear diff/rationale callouts, and a prioritized verification checklist at the end.`,
    ].join('\n\n');
  }

  // email-reply
  return [
    `ROLE & OBJECTIVE:\nAct as an executive communications partner and negotiation strategist. Draft a high-trust, decision-ready email reply addressing: "${cleanTopic}".`,
    `TARGET AUDIENCE & CONTEXT:\nThe recipient is ${cleanAudience}. Account for their priorities, time constraints, and stakeholder perspective so the reply builds alignment while protecting project clarity.`,
    `STEP-BY-STEP EXECUTION PLAN:\nFollow these steps to construct the response:\nStep 1 — Core Intent & Alignment: Open by acknowledging the recipient's message and stating the bottom-line answer in the very first sentence.\nStep 2 — Context & Structured Options: Present the key facts, trade-offs, or proposed path forward in scannable bullets or short paragraphs.\nStep 3 — Explicit Next Step & Call-to-Action: Close with a concrete, low-friction next step (with specific timing or ownership) so no follow-up clarification is needed.\nStep 4 — Pre-Send Check: Add a brief 2-bullet note below the email highlighting any assumptions or dates to verify before hitting send.`,
    `STRICT CONSTRAINTS & TONE:\n- Voice & Tone: ${toneSpec.guidance}\n- Target Length: ${lengthSpec.constraint}\n- Quality Bar: Avoid defensive language, vague hedging, or buried asks.${keywordRequirement}`,
    `OUTPUT FORMAT:\nProvide: (1) 2 crisp Subject Line options, (2) the complete copy-paste Email Body, and (3) the Pre-Send Verification Note.`,
  ].join('\n\n');
}

export function buildPromptVariation(inputs: PromptFormInputs, variationId: VariationId): string {
  if (variationId === 'B') {
    return buildConcisePrompt(inputs);
  }
  if (variationId === 'C') {
    return buildDetailedStepByStepPrompt(inputs);
  }
  return buildStructuredPrompt(inputs);
}

export function buildAllPromptVariations(
  inputs: PromptFormInputs
): Record<VariationId, PromptVariation> {
  const ids: VariationId[] = ['A', 'B', 'C'];
  const result = {} as Record<VariationId, PromptVariation>;

  for (const id of ids) {
    const promptText = buildPromptVariation(inputs, id);
    const metrics = countPromptMetrics(promptText);
    const meta = VARIATION_META[id];
    result[id] = {
      id,
      name: meta.name,
      subtitle: meta.subtitle,
      strategySummary: meta.strategySummary,
      promptText,
      words: metrics.words,
      characters: metrics.characters,
    };
  }

  return result;
}

export function countPromptMetrics(text: string): { words: number; characters: number } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { words: 0, characters: 0 };
  }
  const words = trimmed.split(/\s+/).length;
  return {
    words,
    characters: trimmed.length,
  };
}

export function addPromptToHistory(
  existingHistory: SavedPromptItem[],
  inputs: PromptFormInputs,
  nowIso: string = new Date().toISOString(),
  id: string = `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  variationId: VariationId = 'A'
): SavedPromptItem[] {
  const normalizedInputs: PromptFormInputs = {
    ...inputs,
    topic: inputs.topic.trim() || TASK_TEMPLATES[inputs.taskType].defaultSample.topic,
    audience: inputs.audience.trim() || TASK_TEMPLATES[inputs.taskType].defaultSample.audience,
    extraKeywords: inputs.extraKeywords.trim(),
  };

  const promptText = buildPromptVariation(normalizedInputs, variationId);

  const newItem: SavedPromptItem = {
    id,
    createdAt: nowIso,
    inputs: normalizedInputs,
    variationId,
    promptText,
  };

  // Deduplicate if the exact same promptText already exists so we keep history fresh
  const filtered = existingHistory.filter((item) => item.promptText !== promptText);
  return [newItem, ...filtered].slice(0, MAX_SAVED_PROMPTS);
}

export type ThemeMode = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'promptcraft_theme_v1';

export function parseThemeMode(raw: string | null): ThemeMode {
  return raw === 'dark' ? 'dark' : 'light';
}

export function parseSavedHistory(raw: string | null): SavedPromptItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is SavedPromptItem =>
          Boolean(
            item &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              typeof item.promptText === 'string' &&
              item.inputs &&
              typeof item.inputs.taskType === 'string'
          )
      )
      .slice(0, MAX_SAVED_PROMPTS);
  } catch {
    return [];
  }
}

