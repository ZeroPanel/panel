import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('This endpoint is not available in production.', { status: 403 });
  }

  try {
    const { config } = await request.json();

    if (!config) {
      return new NextResponse('Invalid configuration provided.', { status: 400 });
    }

    const configContent = `export const firebaseConfig = ${JSON.stringify(config, null, 2)};\n`;
    
    // Unsafe: This is a simplified example. In a real-world scenario,
    // you would need to be very careful about writing to the file system.
    const configPath = path.join(process.cwd(), 'src/firebase/config.ts');
    await fs.writeFile(configPath, configContent, 'utf-8');

    return new NextResponse(JSON.stringify({ message: 'Configuration updated successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Failed to update config:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ message: 'Failed to update configuration.', error: errorMessage }), { status: 500 });
  }
}
