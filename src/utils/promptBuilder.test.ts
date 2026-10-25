import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStructuredPrompt,
  buildPromptSections,
  addPromptToHistory,
  countPromptMetrics,
  parseKeywords,
  MAX_SAVED_PROMPTS,
  type PromptFormInputs,
  type SavedPromptItem,
} from './promptBuilder';

test('buildStructuredPrompt generates all 5 required structural sections for blog-post', () => {
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

test('buildStructuredPrompt never produces unfilled bracket placeholders when inputs are blank', () => {
  const emptyInputs: PromptFormInputs = {
    taskType: 'email-reply',
    topic: '   ',
    tone: 'friendly',
    audience: '',
    length: 'short',
    extraKeywords: '',
  };

  const output = buildStructuredPrompt(emptyInputs);
  assert.equal(output.includes('['), false);
  assert.equal(output.includes(']'), false);
  assert.ok(output.length > 200);
});

test('addPromptToHistory caps saved prompts strictly at MAX_SAVED_PROMPTS (5) and deduplicates identical prompts', () => {
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
      `id-${i}`
    );
  }

  assert.equal(history.length, MAX_SAVED_PROMPTS);
  assert.equal(history[0].inputs.topic, 'Topic number 7');
  assert.equal(history[4].inputs.topic, 'Topic number 3');

  // Re-adding Topic number 5 moves it to index 0 without increasing length beyond 5
  history = addPromptToHistory(
    history,
    {
      taskType: 'blog-post',
      topic: 'Topic number 5',
      tone: 'friendly',
      audience: 'Product designers',
      length: 'short',
      extraKeywords: '',
    },
    '2026-10-24T12:05:00Z',
    'id-5-repeat'
  );

  assert.equal(history.length, MAX_SAVED_PROMPTS);
  assert.equal(history[0].inputs.topic, 'Topic number 5');
});

test('parseKeywords and countPromptMetrics compute expected values', () => {
  assert.deepEqual(parseKeywords(' react, typescript ,  , hooks '), ['react', 'typescript', 'hooks']);
  assert.deepEqual(parseKeywords('   '), []);

  const metrics = countPromptMetrics('Hello world from PromptCraft');
  assert.equal(metrics.words, 4);
  assert.equal(metrics.characters, 28);
});

test('parseSavedHistory safely parses valid entries and ignores malformed data', async () => {
  const { parseSavedHistory } = await import('./promptBuilder');
  assert.deepEqual(parseSavedHistory(null), []);
  assert.deepEqual(parseSavedHistory('invalid-json'), []);
  assert.deepEqual(parseSavedHistory('{"not":"an-array"}'), []);

  const validHistory = addPromptToHistory(
    [],
    {
      taskType: 'code-review',
      topic: 'Memory leak in WebSocket listener',
      tone: 'formal',
      audience: 'Senior Node.js engineers',
      length: 'medium',
      extraKeywords: 'cleanup, event emitter',
    },
    '2026-10-24T18:00:00Z',
    'test-id-1'
  );

  const roundTrip = parseSavedHistory(JSON.stringify(validHistory));
  assert.equal(roundTrip.length, 1);
  assert.equal(roundTrip[0].id, 'test-id-1');
  assert.equal(roundTrip[0].inputs.topic, 'Memory leak in WebSocket listener');
});

