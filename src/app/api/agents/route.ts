import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '../../../../lib/database';

// Initialize database on first request
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await dbManager.initialize();
    dbInitialized = true;
  }
}

export async function GET() {
  try {
    await ensureDbInitialized();
    const agents = await dbManager.getAllAgents();
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    
    // Validate required fields
    const { name, description, icon, category, color, systemPrompt, model, temperature, maxTokens } = body;
    
    if (!name || !description || !icon || !category || !color || !systemPrompt || !model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const agentData = {
      name,
      description,
      icon,
      category,
      color,
      systemPrompt,
      model,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 1000,
    };

    const id = await dbManager.createAgent(agentData);
    const createdAgent = await dbManager.getAgentById(id);
    
    return NextResponse.json(createdAgent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
} 