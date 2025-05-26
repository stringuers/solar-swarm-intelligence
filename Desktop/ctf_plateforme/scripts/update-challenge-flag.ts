import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updateFlag(challengeId: string, plainFlag: string) {
  try {
    // Hash the flag
    const hashedFlag = await bcrypt.hash(plainFlag, 10);
    
    // Update the challenge
    const updatedChallenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: { flag: hashedFlag }
    });

    console.log('Flag updated successfully for challenge:', updatedChallenge.title);
    console.log('Original flag:', plainFlag);
    console.log('Hashed flag:', hashedFlag);
  } catch (error) {
    console.error('Error updating flag:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const challengeId = process.argv[2];
const plainFlag = process.argv[3];

if (!challengeId || !plainFlag) {
  console.error('Usage: npx tsx scripts/update-challenge-flag.ts <challengeId> <plainFlag>');
  process.exit(1);
}

updateFlag(challengeId, plainFlag); 