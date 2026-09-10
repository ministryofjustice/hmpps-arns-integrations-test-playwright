#!/usr/bin/env node
import { execSync, spawnSync } from 'node:child_process';

// Configuration
const CLI_TOOL = process.env.AI_CLI; // Undefined by default

const SYSTEM_PROMPT = `
You are an automated Git pre-commit reviewer for playwright test automation.
Analyze the provided git diff using playwright skill before committing.
`;

// 1. Get Staged Git Diff
let diff = '';
try {
  diff = execSync('git diff --cached --diff-filter=d', { encoding: 'utf-8' });
} catch (err) {
  process.exit(0);
}

if (!diff.trim()) {
  process.exit(0);
}

const fullPrompt = `${SYSTEM_PROMPT}\n\nHere is the Git Diff:\n${diff}`;

// --- MAIN EXECUTION ROUTER ---
if (CLI_TOOL) {
  runViaCLI(CLI_TOOL, fullPrompt);
} else {
  console.log(`🤖 Set your AI CLI TOOL as environment variable: AI_CLI`);
}

// --- MODE 1: External CLI Tool (If AI_CLI is set) ---
function runViaCLI(tool, promptText) {
  const toolName = tool.toLowerCase();
  console.log(`🤖 Running AI review via user CLI session [${toolName.toUpperCase()}]...`);

  try {
    const config = {
      cmd: toolName,
      args: ['-p', promptText],
      timeout: 30000,
    };

    const result = spawnSync(config.cmd, config.args, {
      input: config.input,
      encoding: 'utf-8',
      timeout: config.timeout,
    });

    if (result.error) throw result.error;
    handleAiResponse(result.stdout || '');
  } catch (error) {
    console.warn(`⚠️ CLI execution failed: ${error.message}`);
    process.exit(0);
  }
}

// --- Output Handler ---
function handleAiResponse(rawOutput) {
  const aiResponse = rawOutput.trim();

  console.log('\n--- AI Review Result ---');
  console.log(aiResponse || '(No response received)');
  console.log('------------------------\n');

  console.warn('⚠️ Output format ambiguous. Passing commit by default.');
  process.exit(0);
}
