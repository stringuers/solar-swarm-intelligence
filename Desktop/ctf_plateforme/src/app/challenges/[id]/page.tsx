import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import ChallengeDetails from '@/components/challenges/ChallengeDetails';
import Link from 'next/link';

export default async function ChallengePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const challengeId = params.id;

  const challenge = await prisma.challenge.findUnique({
    where: {
      id: challengeId,
    },
    include: {
      hints: true,
      files: true,
      submissions: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!challenge) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      team: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="py-10 bg-[#0a192f] text-[#00ffea] font-mono min-h-screen">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#39ff14]">
              {challenge.title}
            </h1>
            <Link
              href="/challenges"
              className="inline-flex items-center px-4 py-2 border border-[#00ffea] text-[#00ffea] rounded-md hover:bg-[#00ffea] hover:text-[#0a192f] transition-colors"
            >
              ← Back to Challenges
            </Link>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <ChallengeDetails
              challenge={challenge}
              user={user}
              hasSolved={challenge.submissions.some((s) => s.correct)}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 