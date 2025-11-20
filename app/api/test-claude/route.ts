import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude/client';

export async function GET(request: NextRequest) {
  try {
    // Test the Claude API connection with a simple hello
    const response = await callClaude(
      'You are a helpful assistant.',
      'Say hello and confirm you are working!',
      { maxTokens: 100 }
    );

    // Extract the text response
    const textContent = response.content.find(
      (block) => block.type === 'text'
    );
    const message = textContent && 'text' in textContent ? textContent.text : 'No response';

    return NextResponse.json({
      success: true,
      message: message,
      model: response.model,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error('Claude API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect to Claude API',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
