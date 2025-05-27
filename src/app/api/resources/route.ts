import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '../../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    await dbManager.initialize();
    
    let resources;
    if (query) {
      resources = await dbManager.searchResources(query);
    } else {
      resources = await dbManager.getAllResources();
    }
    
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, description, type, fileSize, fileName, originalContent, parsedContent } = data;
    
    if (!title || !type || !fileName || !originalContent || !parsedContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await dbManager.initialize();
    
    const resourceId = await dbManager.createResource({
      title,
      description: description || '',
      type,
      fileSize: fileSize || 0,
      fileName,
      originalContent,
      parsedContent
    });
    
    return NextResponse.json({ id: resourceId }, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
} 