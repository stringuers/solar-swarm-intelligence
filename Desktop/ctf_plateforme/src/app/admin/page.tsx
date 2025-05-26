import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const userCount = await prisma.user.count();
  const teamCount = await prisma.team.count();
  const challengeCount = await prisma.challenge.count();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-[#39ff14] glitch">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-[#101c2c] border-2 border-[#00ffea] rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-[#00ffea] mb-2">Users</h2>
          <p className="text-3xl font-extrabold text-[#39ff14]">{userCount}</p>
        </div>
        <div className="bg-[#101c2c] border-2 border-[#00ffea] rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-[#00ffea] mb-2">Teams</h2>
          <p className="text-3xl font-extrabold text-[#39ff14]">{teamCount}</p>
        </div>
        <div className="bg-[#101c2c] border-2 border-[#00ffea] rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-[#00ffea] mb-2">Challenges</h2>
          <p className="text-3xl font-extrabold text-[#39ff14]">{challengeCount}</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-6">
        <Link href="/users" className="btn-neon text-center">Manage Users</Link>
        <Link href="/teams" className="btn-neon text-center">Manage Teams</Link>
        <Link href="/challenges" className="btn-neon text-center">Manage Challenges</Link>
      </div>
    </div>
  );
} 