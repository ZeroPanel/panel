import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(JSON.stringify({ message: 'This endpoint is not available in production.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { path: filePath, content } = await request.json();

    if (!filePath || typeof content === 'undefined') {
      return new NextResponse(JSON.stringify({ message: 'Invalid file path or content provided.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Basic path sanitization to prevent directory traversal
    const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    const absolutePath = path.join(process.cwd(), safePath);

    // Ensure the path is within the project directory
    if (!absolutePath.startsWith(process.cwd())) {
        return new NextResponse(JSON.stringify({ message: 'Access denied: Path is outside of the project directory.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    await fs.writeFile(absolutePath, content, 'utf-8');

    return new NextResponse(JSON.stringify({ message: 'File updated successfully.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Failed to write file:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ message: 'Failed to write file.', error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
