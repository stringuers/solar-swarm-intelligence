import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const joinTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ message: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { name, password } = joinTeamSchema.parse(body);

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { name },
    });

    if (!team) {
      return new NextResponse(
        JSON.stringify({ message: 'Team not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify team password
    const isValidPassword = await bcrypt.compare(password, team.password);

    if (!isValidPassword) {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid team password' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is already in a team
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { team: true },
    });

    if (user?.team) {
      return new NextResponse(
        JSON.stringify({ message: 'You are already in a team' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add user to team
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        team: {
          connect: { id: team.id },
        },
      },
    });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
      },
    });
  } catch (error) {
    console.error('Error joining team:', error);

    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Invalid request data', 
          errors: error.errors 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 