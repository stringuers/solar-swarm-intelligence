import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      team: {
        include: {
          members: true,
        },
      },
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

  if (!user) {
    redirect('/auth/signin');
  }

  const totalPoints = user.submissions.reduce(
    (sum, sub) => sum + sub.challenge.points,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-10 text-center tracking-widest text-[#39ff14] glitch">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Information */}
        <div className="bg-[#101c2c] border-2 border-[#00ffea] rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-extrabold mb-6 text-[#00ffea] tracking-wider flex items-center gap-2">
            <span>👤</span> User Information
          </h2>
          <div className="space-y-4 text-lg">
            <p className="text-[#64ffda]"><span className="font-bold text-[#39ff14]">Name:</span> {user.name}</p>
            <p className="text-[#64ffda]"><span className="font-bold text-[#39ff14]">Email:</span> {user.email}</p>
            <p className="text-[#64ffda]"><span className="font-bold text-[#39ff14]">Role:</span> {user.role}</p>
            <p className="text-[#64ffda]"><span className="font-bold text-[#39ff14]">Total Points:</span> <span className="inline-flex items-center gap-1">{totalPoints} <span className="text-[#ffcb6b]">★</span></span></p>
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-[#101c2c] border-2 border-[#00ffea] rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-extrabold mb-6 text-[#00ffea] tracking-wider flex items-center gap-2">
            <span>👥</span> Team Information
          </h2>
          {user.team ? (
            <div className="space-y-4 text-lg">
              <p className="text-[#64ffda]"><span className="font-bold text-[#39ff14]">Team Name:</span> {user.team.name}</p>
              <p className="text-[#64ffda]"><span className="font-bold text-[#39ff14]">Team Role:</span> {user.id === user.team.leaderId ? 'Leader' : 'Member'}</p>
              <div>
                <p className="text-[#64ffda] mb-2"><span className="font-bold text-[#39ff14]">Team Members:</span></p>
                <ul className="space-y-1">
                  {user.team.members.map((member) => (
                    <li key={member.id} className="text-[#00ffea]">
                      {member.name} {member.id === user.team?.leaderId ? <span className="text-[#ff5370]">(Leader)</span> : ''}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[#ff5370] font-semibold">You are not currently in a team.</p>
              <Link
                href="/teams"
                className="inline-block w-full py-2 rounded-md font-bold text-lg bg-gradient-to-r from-[#00ffea] to-[#39ff14] text-[#0a192f] shadow-md hover:from-[#39ff14] hover:to-[#00ffea] transition text-center"
              >
                Join or Create Team
              </Link>
            </div>
          )}
        </div>

        {/* Solved Challenges */}
        <div className="bg-[#101c2c] border-2 border-[#00ffea] rounded-xl shadow-lg p-8 md:col-span-2">
          <h2 className="text-2xl font-extrabold mb-6 text-[#00ffea] tracking-wider flex items-center gap-2">
            <span>🏆</span> Solved Challenges
          </h2>
          {user.submissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.submissions.map((submission) => (
                <div key={submission.id} className="bg-[#0a192f] border border-[#39ff14] rounded-lg p-4 shadow-md hover:scale-105 transition">
                  <h3 className="text-xl font-bold mb-2 text-[#39ff14]">{submission.challenge.title}</h3>
                  <p className="text-[#64ffda] mb-2"><span className="font-bold text-[#00ffea]">Points:</span> {submission.challenge.points}</p>
                  <p className="text-[#64ffda]"><span className="font-bold text-[#00ffea]">Category:</span> {submission.challenge.category}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#ff5370] font-semibold">You haven't solved any challenges yet.</p>
          )}
        </div>
      </div>
    </div>
  );
} 