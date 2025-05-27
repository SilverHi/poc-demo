import { NextRequest, NextResponse } from 'next/server';
import { openaiService } from '../../../../lib/openai';

export async function GET() {
  try {
    const config = openaiService.getConfig();
    
    if (!config) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    // Don't expose the API key in the response
    const { apiKey, ...safeConfig } = config;
    return NextResponse.json({
      ...safeConfig,
      isConfigured: openaiService.isConfigured(),
      hasApiKey: !!apiKey && apiKey !== 'your-openai-api-key-here'
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    openaiService.updateConfig(body);
    
    return NextResponse.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
} 