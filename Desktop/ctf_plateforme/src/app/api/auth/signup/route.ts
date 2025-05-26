import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  try {
    // Test database connection
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return new NextResponse(
        JSON.stringify({ 
          message: 'Database connection error',
          error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    console.log('Received signup request:', { ...body, password: '[REDACTED]' });

    const { name, email, password } = signUpSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return new NextResponse(
        JSON.stringify({ message: 'User already exists' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          hashedPassword,
          role: 'PLAYER',
        },
      });

      console.log('User created successfully:', { id: user.id, email: user.email });

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (createError) {
      console.error('Error creating user:', createError);
      
      if (createError instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors
        if (createError.code === 'P2002') {
          return new NextResponse(
            JSON.stringify({ message: 'Email already exists' }), 
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
      
      throw createError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error in signup:', error);

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
      JSON.stringify({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } finally {
    await prisma.$disconnect();
  }
} 