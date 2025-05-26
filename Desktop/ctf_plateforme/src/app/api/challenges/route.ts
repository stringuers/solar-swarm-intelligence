import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const challengeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['WEB', 'CRYPTO', 'FORENSICS', 'REVERSE', 'PWN', 'MISC']),
  points: z.number().min(1, 'Points must be at least 1'),
  flag: z.string().min(1, 'Flag is required'),
});

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

    const body = await request.json();
    const data = challengeSchema.parse(body);

    // Hash the flag
    const hashedFlag = await bcrypt.hash(data.flag, 10);

    // Create the challenge
    const challenge = await prisma.challenge.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        points: data.points,
        flag: hashedFlag,
      },
    });

    return NextResponse.json(challenge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: 'Invalid request data',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error creating challenge:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 