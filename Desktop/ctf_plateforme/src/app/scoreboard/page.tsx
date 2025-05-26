import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ScoreboardChart from '@/components/scoreboard/ScoreboardChart';

export default async function ScoreboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const teams = await prisma.team.findMany({
    include: {
      members: true,
      submissions: {
        where: { correct: true },
        include: { challenge: true },
      },
    },
  });

  // Calculate team points
  const teamsWithPoints = teams.map(team => ({
    ...team,
    points: team.submissions.reduce((sum, sub) => sum + sub.challenge.points, 0),
  }));

  // Sort teams by points
  const sortedTeams = teamsWithPoints.sort((a, b) => b.points - a.points);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center ctf-heading">Scoreboard</h1>
      <div className="ctf-card p-6 mb-8">
        <ScoreboardChart teams={sortedTeams} />
      </div>
      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTeams.map((team) => (
          <div
            key={team.id}
            className="ctf-card p-6 transform transition-all duration-300 hover:scale-105"
            style={{ borderTop: `4px solid #64ffda` }}
          >
            <h2 className="text-xl font-bold mb-4 ctf-heading">{team.name}</h2>
            <div className="space-y-2">
              <p className="ctf-text">
                <span className="ctf-accent">Points:</span> {team.points}
              </p>
              <p className="ctf-text">
                <span className="ctf-accent">Members:</span> {team.members.length}
              </p>
              <p className="ctf-text">
                <span className="ctf-accent">Solved Challenges:</span>{' '}
                {team.submissions.length}
              </p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2 ctf-heading">Members:</h3>
                <ul className="space-y-1">
                  {team.members.map((member) => (
                    <li key={member.id} className="ctf-text">
                      {member.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 