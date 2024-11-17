import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';

// Correct type definition for the route handler params
type RouteParams = {
  params: Promise<{
    path: string[]
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const imagePath = join(process.cwd(), 'content/images', ...(await params).path);
    const imageBuffer = await readFile(imagePath);
    
    // Determine content-type based on file extension
    const ext = imagePath.split('.').pop()?.toLowerCase();
    const contentType = ext === 'jpg' || ext === 'jpeg' 
      ? 'image/jpeg' 
      : ext === 'png' 
        ? 'image/png'
        : 'application/octet-stream';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return new NextResponse('Image not found', { status: 404 });
  }
} 