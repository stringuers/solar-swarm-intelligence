import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

async function promoteDemoteUser(userId: string, newRole: string) {
  'use server';
  await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
}

async function removeFromTeam(userId: string) {
  'use server';
  await prisma.user.update({ where: { id: userId }, data: { teamId: null } });
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }
  const users = await prisma.user.findMany({
    include: { team: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-[#39ff14] glitch">User Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#101c2c] border-2 border-[#00ffea] rounded-xl shadow-lg">
          <thead>
            <tr className="text-[#00ffea] text-lg">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Team</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-[#64ffda] text-center border-b border-[#00ffea]/20">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2">{user.team ? user.team.name : '-'}</td>
                <td className="px-4 py-2 space-x-2">
                  {user.role === 'PLAYER' ? (
                    <form action={promoteDemoteUser.bind(null, user.id, 'ADMIN')} style={{ display: 'inline' }}>
                      <button type="submit" className="btn-neon">Promote</button>
                    </form>
                  ) : (
                    <form action={promoteDemoteUser.bind(null, user.id, 'PLAYER')} style={{ display: 'inline' }}>
                      <button type="submit" className="btn-neon-outline">Demote</button>
                    </form>
                  )}
                  {user.team && (
                    <form action={removeFromTeam.bind(null, user.id)} style={{ display: 'inline' }}>
                      <button type="submit" className="btn-neon-outline">Remove from Team</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 