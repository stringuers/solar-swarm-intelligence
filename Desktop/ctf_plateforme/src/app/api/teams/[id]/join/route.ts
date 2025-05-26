import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { password } = await request.json();

    // Check if user is already in a team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { team: true },
    });

    if (user?.team) {
      return NextResponse.json(
        { message: 'You are already in a team' },
        { status: 400 }
      );
    }

    // Get the team
    const team = await prisma.team.findUnique({
      where: { id: params.id },
    });

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, team.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid team password' },
        { status: 400 }
      );
    }

    // Add user to team
    const updatedTeam = await prisma.team.update({
      where: { id: params.id },
      data: {
        members: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 