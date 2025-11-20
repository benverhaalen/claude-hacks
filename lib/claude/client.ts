import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Use the latest Claude model
export const MODEL = 'claude-sonnet-4-5-20250929';

// Simple wrapper for Claude API calls
export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: options?.maxTokens || 4096,
    temperature: options?.temperature || 1,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  return response;
}

// Claude API call with tool support
export async function callClaudeWithTools(
  systemPrompt: string,
  userMessage: string,
  tools: any[],
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: options?.maxTokens || 4096,
    temperature: options?.temperature || 1,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
    tools: tools,
  });

  return response;
}
