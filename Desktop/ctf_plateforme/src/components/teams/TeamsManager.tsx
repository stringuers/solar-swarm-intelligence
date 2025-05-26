'use client';

import { useEffect, useState } from 'react';

export default function TeamsManager() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTeamForm, setAddTeamForm] = useState({ name: '', password: '' });
  const [joinTeamForm, setJoinTeamForm] = useState({ teamId: '', password: '' });
  const [addTeamMsg, setAddTeamMsg] = useState<string | null>(null);
  const [joinTeamMsg, setJoinTeamMsg] = useState<string | null>(null);
  const [addTeamLoading, setAddTeamLoading] = useState(false);
  const [joinTeamLoading, setJoinTeamLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    setLoading(true);
    const res = await fetch('/api/teams');
    if (res.ok) {
      setTeams(await res.json());
    }
    setLoading(false);
  }

  async function handleAddTeam(e: React.FormEvent) {
    e.preventDefault();
    setAddTeamMsg(null);
    setAddTeamLoading(true);
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addTeamForm),
    });
    const data = await res.json();
    setAddTeamLoading(false);
    if (res.ok) {
      setAddTeamMsg('✅ Team created successfully!');
      setAddTeamForm({ name: '', password: '' });
      fetchTeams();
    } else {
      setAddTeamMsg(`❌ ${data.message || 'Failed to create team'}`);
    }
  }

  async function handleJoinTeam(e: React.FormEvent) {
    e.preventDefault();
    setJoinTeamMsg(null);
    setJoinTeamLoading(true);
    const res = await fetch(`/api/teams/${joinTeamForm.teamId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: joinTeamForm.password }),
    });
    const data = await res.json();
    setJoinTeamLoading(false);
    if (res.ok) {
      setJoinTeamMsg('✅ Joined team successfully!');
      setJoinTeamForm({ teamId: '', password: '' });
      fetchTeams();
    } else {
      setJoinTeamMsg(`❌ ${data.message || 'Failed to join team'}`);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      {/* Add Team Form */}
      <div className="flex-1 bg-[#101c2c] border-2 border-[#00ffea] rounded-xl shadow-lg p-8 mb-8 md:mb-0">
        <h2 className="text-2xl font-extrabold mb-6 text-[#39ff14] tracking-wider">Add Team</h2>
        <form onSubmit={handleAddTeam} className="space-y-6">
          <div>
            <label className="block mb-2 text-[#00ffea] font-semibold">Team Name</label>
            <input
              type="text"
              className="w-full rounded-md border-2 border-[#00ffea] bg-[#0a192f] px-4 py-2 text-[#00ffea] focus:outline-none focus:border-[#39ff14] placeholder:text-[#00bfff] transition"
              value={addTeamForm.name}
              onChange={e => setAddTeamForm(f => ({ ...f, name: e.target.value }))}
              required
              placeholder="Enter team name"
            />
          </div>
          <div>
            <label className="block mb-2 text-[#00ffea] font-semibold">Password</label>
            <input
              type="password"
              className="w-full rounded-md border-2 border-[#00ffea] bg-[#0a192f] px-4 py-2 text-[#00ffea] focus:outline-none focus:border-[#39ff14] placeholder:text-[#00bfff] transition"
              value={addTeamForm.password}
              onChange={e => setAddTeamForm(f => ({ ...f, password: e.target.value }))}
              required
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-md font-bold text-lg bg-gradient-to-r from-[#00ffea] to-[#39ff14] text-[#0a192f] shadow-md hover:from-[#39ff14] hover:to-[#00ffea] transition flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={addTeamLoading}
          >
            {addTeamLoading ? <span className="animate-spin mr-2">⏳</span> : null}
            Create Team
          </button>
          {addTeamMsg && <div className={`mt-2 text-sm font-semibold ${addTeamMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{addTeamMsg}</div>}
        </form>
      </div>

      {/* Join Team Form */}
      <div className="flex-1 bg-[#101c2c] border-2 border-[#00ffea] rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-extrabold mb-6 text-[#39ff14] tracking-wider">Join Team</h2>
        <form onSubmit={handleJoinTeam} className="space-y-6">
          <div>
            <label className="block mb-2 text-[#00ffea] font-semibold">Select Team</label>
            <select
              className="w-full rounded-md border-2 border-[#00ffea] bg-[#0a192f] px-4 py-2 text-[#00ffea] focus:outline-none focus:border-[#39ff14] transition"
              value={joinTeamForm.teamId}
              onChange={e => setJoinTeamForm(f => ({ ...f, teamId: e.target.value }))}
              required
            >
              <option value="">-- Select a team --</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-[#00ffea] font-semibold">Password</label>
            <input
              type="password"
              className="w-full rounded-md border-2 border-[#00ffea] bg-[#0a192f] px-4 py-2 text-[#00ffea] focus:outline-none focus:border-[#39ff14] placeholder:text-[#00bfff] transition"
              value={joinTeamForm.password}
              onChange={e => setJoinTeamForm(f => ({ ...f, password: e.target.value }))}
              required
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-md font-bold text-lg bg-gradient-to-r from-[#00ffea] to-[#39ff14] text-[#0a192f] shadow-md hover:from-[#39ff14] hover:to-[#00ffea] transition flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={joinTeamLoading}
          >
            {joinTeamLoading ? <span className="animate-spin mr-2">⏳</span> : null}
            Join Team
          </button>
          {joinTeamMsg && <div className={`mt-2 text-sm font-semibold ${joinTeamMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{joinTeamMsg}</div>}
        </form>
      </div>
    </div>
  );
} 