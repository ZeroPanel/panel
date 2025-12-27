import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(JSON.stringify({ message: 'This endpoint is not available in production.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const configPath = path.join(process.cwd(), 'src/lib/admin-config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);
    return new NextResponse(JSON.stringify(config), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Failed to read admin config:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ message: 'Failed to read admin configuration.', error: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
