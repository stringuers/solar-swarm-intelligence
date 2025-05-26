import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ChallengesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const challenges = await prisma.challenge.findMany({
    include: {
      submissions: {
        where: {
          userId: session.user.id,
          correct: true,
        },
      },
    },
  });

  // Group challenges by category
  const challengesByCategory = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = [];
    }
    acc[challenge.category].push(challenge);
    return acc;
  }, {} as Record<string, typeof challenges>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(challengesByCategory).sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#39ff14] glitch">Challenges</h1>

      <div className="space-y-8">
        {sortedCategories.map((category) => (
          <div key={category} className="bg-[#101c2c] border-2 border-[#00ffea] rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-[#00ffea] tracking-wider ctf-heading">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challengesByCategory[category].map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="bg-[#0a192f] border border-[#39ff14] rounded-lg p-6 shadow-md hover:scale-105 transition flex flex-col justify-between"
                >
                  <h3 className="text-xl font-bold mb-2 text-[#39ff14] ctf-heading">{challenge.title}</h3>
                  <p className="ctf-text mb-4">{challenge.description}</p>
                  <p className="ctf-text mb-2">Author: {challenge.author || 'Unknown'}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="ctf-accent">{challenge.points} points</span>
                    {challenge.submissions.length > 0 && (
                      <span className="text-green-400 font-bold">Completed</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 