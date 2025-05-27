import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '../../../../../../lib/database';
import { openaiService } from '../../../../../../lib/openai';

// Initialize database on first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await dbManager.initialize();
    dbInitialized = true;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    // Get agent configuration from database
    const agent = await dbManager.getAgentById(params.id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if OpenAI is configured
    if (!openaiService.isConfigured()) {
      return NextResponse.json(
        { error: 'OpenAI is not configured. Please check your API key in config/openai.json' },
        { status: 503 }
      );
    }

    // Execute agent using OpenAI
    const result = await openaiService.executeAgent({
      systemPrompt: agent.systemPrompt,
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
    }, input);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error executing agent:', error);
    return NextResponse.json(
      { error: `Failed to execute agent: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 