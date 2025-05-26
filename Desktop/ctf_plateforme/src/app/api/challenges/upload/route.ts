import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const challengeId = formData.get('challengeId') as string;

    if (!file || !challengeId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });
    }

    // Generate a unique filename using crypto
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${crypto.randomBytes(16).toString('hex')}.${fileExtension}`;
    const filePath = join(process.cwd(), 'public', 'uploads', 'challenges', uniqueFilename);

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create file record in database
    const fileRecord = await prisma.file.create({
      data: {
        name: file.name,
        url: `/uploads/challenges/${uniqueFilename}`,
        challengeId,
      },
    });

    return NextResponse.json(fileRecord);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 