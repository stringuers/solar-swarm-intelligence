import TeamsManager from '@/components/teams/TeamsManager';

export default function TeamsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center ctf-heading">Team Management</h1>
      <TeamsManager />
    </div>
  );
} 