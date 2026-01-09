import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { put, del } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const oldUrl = formData.get('oldUrl') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `landing/hero-${timestamp}.${extension}`;

    const blob = await put(filename, file, {
      access: 'public',
    });

    if (oldUrl && oldUrl.includes('blob.vercel-storage.com')) {
      try {
        await del(oldUrl);
      } catch (error) {
        console.error('Error deleting old blob:', error);
      }
    }

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
