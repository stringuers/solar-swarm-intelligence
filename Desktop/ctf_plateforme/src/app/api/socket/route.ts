import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get updated team scores
    const teams = await prisma.team.findMany({
      include: {
        members: true,
        submissions: {
          where: {
            correct: true,
          },
          include: {
            challenge: true,
          },
        },
      },
    });

    // Calculate team scores
    const teamsWithScores = teams.map((team) => {
      const score = team.submissions.reduce((total, submission) => {
        return total + submission.challenge.points;
      }, 0);

      return {
        ...team,
        score,
      };
    });

    // Sort teams by score (descending)
    const sortedTeams = teamsWithScores.sort((a, b) => b.score - a.score);

    return NextResponse.json(sortedTeams);
  } catch (error) {
    console.error('Error fetching scoreboard data:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 