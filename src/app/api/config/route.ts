import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('This endpoint is not available in production.', { status: 403 });
  }

  try {
    const adminConfig = await request.json();

    if (!adminConfig || !adminConfig.config) {
      return new NextResponse('Invalid configuration provided.', { status: 400 });
    }

    const adminConfigPath = path.join(process.cwd(), 'src/lib/admin-config.json');
    await fs.writeFile(adminConfigPath, JSON.stringify(adminConfig, null, 2), 'utf-8');
    
    // Also update the firebase config if it's the selected backend and enabled
    if (adminConfig.backend === 'firebase') {
        const firebaseConfigContent = `export const firebaseConfig = ${JSON.stringify(adminConfig.config.firebase, null, 2)};\n`;
        const firebaseConfigPath = path.join(process.cwd(), 'src/firebase/config.ts');
        await fs.writeFile(firebaseConfigPath, firebaseConfigContent, 'utf-8');
    }

    return new NextResponse(JSON.stringify({ message: 'Configuration updated successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Failed to update config:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new NextResponse(JSON.stringify({ message: 'Failed to update configuration.', error: errorMessage }), { status: 500 });
  }
}
