import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const submitSchema = z.object({
  flag: z.string().min(1, 'Flag is required'),
  teamId: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { flag, teamId } = submitSchema.parse(body);

    const challenge = await prisma.challenge.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!challenge) {
      return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });
    }

    // Fetch the user from the database using email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if user has already submitted this challenge
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        challengeId: challenge.id,
        userId: user.id,
      },
    });

    if (existingSubmission) {
      if (existingSubmission.correct) {
        return NextResponse.json({ message: 'Challenge already solved' }, { status: 400 });
      }
      // Update existing incorrect submission
      const isCorrect = await bcrypt.compare(flag, challenge.flag);
      const submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          flag,
          correct: isCorrect,
          teamId: user.teamId || user.id,
        },
      });

      if (!isCorrect) {
        return NextResponse.json({ message: 'Incorrect flag' }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Flag submitted successfully',
        submission,
      });
    }

    // Compare the submitted flag with the hashed flag
    console.log('Comparing flags:');
    console.log('Submitted flag:', flag);
    console.log('Stored hashed flag:', challenge.flag);
    const isCorrect = await bcrypt.compare(flag, challenge.flag);
    console.log('Is correct:', isCorrect);

    // Create new submission record
    const submission = await prisma.submission.create({
      data: {
        flag,
        correct: isCorrect,
        userId: user.id,
        challengeId: challenge.id,
        teamId: user.teamId || user.id,
      },
    });

    if (!isCorrect) {
      return NextResponse.json({ message: 'Incorrect flag' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Flag submitted successfully',
      submission,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: 'Invalid request data',
        errors: error.errors
      }, { status: 400 });
    }

    console.error('Error submitting flag:', error);
    
    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json({
        message: 'You have already submitted a flag for this challenge'
      }, { status: 400 });
    }

    if (error.code === 'P2025') {
      return NextResponse.json({
        message: 'Challenge or user not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
} 