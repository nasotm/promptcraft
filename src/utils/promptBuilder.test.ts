import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStructuredPrompt,
  buildConcisePrompt,
  buildDetailedStepByStepPrompt,
  buildAllPromptVariations,
  buildPromptSections,
  addPromptToHistory,
  countPromptMetrics,
  parseKeywords,
  parseSavedHistory,
  MAX_SAVED_PROMPTS,
  type PromptFormInputs,
  type SavedPromptItem,
} from './promptBuilder';

test('buildStructuredPrompt (Variation A) generates all 5 required structural sections for blog-post', () => {
  const inputs: PromptFormInputs = {
    taskType: 'blog-post',
    topic: 'Zero-downtime database migrations in PostgreSQL',
    tone: 'formal',
    audience: 'Senior backend engineers',
    length: 'long',
    extraKeywords: 'expand-and-contract, lock timeout',
  };

  const output = buildStructuredPrompt(inputs);

  assert.ok(output.includes('ROLE:'));
  assert.ok(output.includes('TASK:'));
  assert.ok(output.includes('CONTEXT & AUDIENCE:'));
  assert.ok(output.includes('CONSTRAINTS & TONE:'));
  assert.ok(output.includes('OUTPUT FORMAT:'));
  assert.ok(output.includes('Zero-downtime database migrations in PostgreSQL'));
  assert.ok(output.includes('Senior backend engineers'));
  assert.ok(output.includes('expand-and-contract, lock timeout'));
  assert.ok(output.includes('1,300–1,800 words'));
});

test('buildAllPromptVariations generates 3 distinct variations (A, B, C) where B is shorter than A and C is more detailed than A', () => {
  const taskTypes: PromptFormInputs['taskType'][] = ['blog-post', 'code-review', 'email-reply'];

  for (const taskType of taskTypes) {
    const inputs: PromptFormInputs = {
      taskType,
      topic: 'Improving API reliability under peak load',
      tone: 'friendly',
      audience: 'Full-stack product engineers',
      length: 'medium',
      extraKeywords: 'rate limiting, retries, observability',
    };

    const variations = buildAllPromptVariations(inputs);

    assert.ok(variations.A.promptText.length > 0);
    assert.ok(variations.B.promptText.length > 0);
    assert.ok(variations.C.promptText.length > 0);

    // Variation B is shorter & more concise than Variation A
    assert.ok(
      variations.B.words < variations.A.words,
      `Expected Variation B (${variations.B.words} words) to be shorter than Variation A (${variations.A.words} words) for ${taskType}`
    );

    // Variation C is a highly detailed step-by-step version, longer than Variation A
    assert.ok(
      variations.C.words > variations.A.words,
      `Expected Variation C (${variations.C.words} words) to be more detailed than Variation A (${variations.A.words} words) for ${taskType}`
    );

    // Variation C includes explicit step-by-step structure
    assert.ok(variations.C.promptText.includes('STEP-BY-STEP EXECUTION PLAN:'));
    assert.ok(variations.C.promptText.includes('Step 1'));
    assert.ok(variations.C.promptText.includes('Step 2'));
    assert.ok(variations.C.promptText.includes('Step 3'));
    assert.ok(variations.C.promptText.includes('Step 4'));
  }
});

test('buildPromptSections adapts correctly to code-review and email-reply templates', () => {
  const codeReviewSections = buildPromptSections({
    taskType: 'code-review',
    topic: 'Authentication middleware token refresh logic',
    tone: 'casual',
    audience: 'Junior full-stack developers',
    length: 'short',
    extraKeywords: '',
  });

  assert.ok(codeReviewSections.role.includes('principal software engineer'));
  assert.ok(codeReviewSections.task.includes('Authentication middleware token refresh logic'));
  assert.ok(codeReviewSections.constraints.includes('under 250 words'));

  const emailSections = buildPromptSections({
    taskType: 'email-reply',
    topic: 'Declining a vendor partnership proposal politely',
    tone: 'friendly',
    audience: 'External sales director',
    length: 'medium',
    extraKeywords: 'Q4 roadmap, future touchpoint',
  });

  assert.ok(emailSections.role.includes('executive communications advisor'));
  assert.ok(emailSections.outputFormat.includes('Subject Line suggestion'));
  assert.ok(emailSections.constraints.includes('Q4 roadmap, future touchpoint'));
});

test('all 3 variations never produce unfilled bracket placeholders when inputs are blank', () => {
  const emptyInputs: PromptFormInputs = {
    taskType: 'email-reply',
    topic: '   ',
    tone: 'friendly',
    audience: '',
    length: 'short',
    extraKeywords: '',
  };

  const outA = buildStructuredPrompt(emptyInputs);
  const outB = buildConcisePrompt(emptyInputs);
  const outC = buildDetailedStepByStepPrompt(emptyInputs);

  for (const out of [outA, outB, outC]) {
    assert.equal(out.includes('['), false);
    assert.equal(out.includes(']'), false);
    assert.ok(out.length > 100);
  }
});

test('addPromptToHistory records the selected variationId and caps saved prompts strictly at MAX_SAVED_PROMPTS (5)', () => {
  let history: SavedPromptItem[] = [];

  for (let i = 1; i <= 7; i++) {
    history = addPromptToHistory(
      history,
      {
        taskType: 'blog-post',
        topic: `Topic number ${i}`,
        tone: 'friendly',
        audience: 'Product designers',
        length: 'short',
        extraKeywords: '',
      },
      `2026-10-24T12:00:0${i}Z`,
      `id-${i}`,
      i % 2 === 0 ? 'B' : 'C'
    );
  }

  assert.equal(history.length, MAX_SAVED_PROMPTS);
  assert.equal(history[0].inputs.topic, 'Topic number 7');
  assert.equal(history[0].variationId, 'C');
  assert.equal(history[4].inputs.topic, 'Topic number 3');
});

test('parseKeywords, countPromptMetrics, and parseSavedHistory compute expected values', () => {
  assert.deepEqual(parseKeywords(' react, typescript ,  , hooks '), ['react', 'typescript', 'hooks']);
  assert.deepEqual(parseKeywords('   '), []);

  const metrics = countPromptMetrics('Hello world from PromptCraft');
  assert.equal(metrics.words, 4);
  assert.equal(metrics.characters, 28);

  assert.deepEqual(parseSavedHistory(null), []);
  assert.deepEqual(parseSavedHistory('invalid-json'), []);
});

test('parseThemeMode defaults to light and recognizes dark mode', async () => {
  const { parseThemeMode } = await import('./promptBuilder');
  assert.equal(parseThemeMode(null), 'light');
  assert.equal(parseThemeMode('light'), 'light');
  assert.equal(parseThemeMode('dark'), 'dark');
  assert.equal(parseThemeMode('unexpected'), 'light');
});

