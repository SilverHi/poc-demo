import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '../../../../../lib/database';
import { parseFile } from '../../../../../lib/fileParser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'text/markdown', 'text/plain'];
    const allowedExtensions = ['.pdf', '.md', '.markdown', '.txt'];
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Only PDF, Markdown, and Text files are allowed.' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Determine file type based on extension
    let resourceType: 'pdf' | 'md' | 'text';
    if (fileExtension === '.pdf') {
      resourceType = 'pdf';
    } else if (fileExtension === '.md' || fileExtension === '.markdown') {
      resourceType = 'md';
    } else {
      resourceType = 'text';
    }

    // Parse file content - this will throw an error if parsing fails
    const parsedFile = await parseFile(buffer, file.name);
    
    // Validate that we have meaningful content
    if (!parsedFile.content || parsedFile.content.trim().length < 10) {
      return NextResponse.json(
        { error: `文件解析失败：提取的内容过少或为空。请确保文件包含有效的文本内容。` },
        { status: 400 }
      );
    }
    
    // Store in database only if parsing was successful
    await dbManager.initialize();
    
    const resourceId = await dbManager.createResource({
      title,
      description: description || '',
      type: resourceType,
      fileSize: file.size,
      fileName: file.name,
      originalContent: buffer.toString('base64'), // Store original file as base64
      parsedContent: parsedFile.content
    });
    
    return NextResponse.json({ 
      id: resourceId,
      message: `文件上传并解析成功${parsedFile.metadata?.pages ? `，共解析 ${parsedFile.metadata.pages} 页` : ''}`,
      metadata: parsedFile.metadata
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload and process file' },
      { status: 500 }
    );
  }
} 