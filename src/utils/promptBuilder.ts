export type TaskType = 'blog-post' | 'code-review' | 'email-reply';
export type ToneType = 'formal' | 'casual' | 'friendly';
export type LengthType = 'short' | 'medium' | 'long';

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

export interface SavedPromptItem {
  id: string;
  createdAt: string;
  inputs: PromptFormInputs;
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

export const TONE_LABELS: Record<ToneType, { label: string; guidance: string }> = {
  formal: {
    label: 'Formal',
    guidance: 'Use a polished, authoritative, and objective tone with precise terminology and zero slang.',
  },
  casual: {
    label: 'Casual',
    guidance: 'Use a relaxed, conversational, and direct tone that reads naturally without stiff jargon.',
  },
  friendly: {
    label: 'Friendly',
    guidance: 'Use a warm, encouraging, and approachable tone that builds rapport while staying clear and helpful.',
  },
};

export const LENGTH_SPECS: Record<LengthType, Record<TaskType, { label: string; constraint: string }>> = {
  short: {
    'blog-post': {
      label: 'Short',
      constraint: 'Keep the post concise at roughly 350–500 words (a quick 2-minute read) focused on the core takeaway.',
    },
    'code-review': {
      label: 'Short',
      constraint: 'Keep the review concise (under 250 words), focusing strictly on the top 3 highest-impact issues and fixes.',
    },
    'email-reply': {
      label: 'Short',
      constraint: 'Keep the email brief at 75–125 words (3–5 short sentences) so it can be read in under 30 seconds.',
    },
  },
  medium: {
    'blog-post': {
      label: 'Medium',
      constraint: 'Target 700–1,000 words (a balanced 4–5 minute read) with practical examples for each main point.',
    },
    'code-review': {
      label: 'Medium',
      constraint: 'Provide a balanced review (350–500 words) covering critical bugs, refactoring suggestions, and corrected code snippets.',
    },
    'email-reply': {
      label: 'Medium',
      constraint: 'Target 150–225 words across 2–3 structured paragraphs with a clear summary of next steps.',
    },
  },
  long: {
    'blog-post': {
      label: 'Long',
      constraint: 'Write an in-depth guide of 1,300–1,800 words (7–8 minute read) with deep-dive sections, concrete examples, and common pitfalls.',
    },
    'code-review': {
      label: 'Long',
      constraint: 'Deliver a comprehensive, line-by-line architectural review (650–900 words) including edge cases, performance implications, test cases, and a full refactored implementation.',
    },
    'email-reply': {
      label: 'Long',
      constraint: 'Write a thorough, detailed email response (275–400 words) addressing context, options/trade-offs, timeline impact, and explicit action items.',
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
  id: string = `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
): SavedPromptItem[] {
  const normalizedInputs: PromptFormInputs = {
    ...inputs,
    topic: inputs.topic.trim() || TASK_TEMPLATES[inputs.taskType].defaultSample.topic,
    audience: inputs.audience.trim() || TASK_TEMPLATES[inputs.taskType].defaultSample.audience,
    extraKeywords: inputs.extraKeywords.trim(),
  };

  const promptText = buildStructuredPrompt(normalizedInputs);

  const newItem: SavedPromptItem = {
    id,
    createdAt: nowIso,
    inputs: normalizedInputs,
    promptText,
  };

  // Deduplicate if the exact same promptText already exists so we keep history fresh
  const filtered = existingHistory.filter((item) => item.promptText !== promptText);
  return [newItem, ...filtered].slice(0, MAX_SAVED_PROMPTS);
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

