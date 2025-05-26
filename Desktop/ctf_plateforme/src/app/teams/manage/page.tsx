'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const joinTeamSchema = z.object({
  teamId: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type CreateTeamForm = z.infer<typeof createTeamSchema>;
type JoinTeamForm = z.infer<typeof joinTeamSchema>;

type Team = {
  id: string;
  name: string;
  members: { id: string; name: string }[];
  leaderId: string;
};

type UserTeam = {
  id: string;
  name: string;
  members: { id: string; name: string }[];
  leaderId: string;
};

export default function TeamManagementPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [userTeam, setUserTeam] = useState<UserTeam | null>(null);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    formState: { errors: createErrors },
  } = useForm<CreateTeamForm>({
    resolver: zodResolver(createTeamSchema),
  });

  const {
    register: registerJoin,
    handleSubmit: handleJoinSubmit,
    formState: { errors: joinErrors },
  } = useForm<JoinTeamForm>({
    resolver: zodResolver(joinTeamSchema),
  });

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const [teamResponse, teamsResponse] = await Promise.all([
          fetch('/api/teams/current'),
          fetch('/api/teams'),
        ]);

        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setUserTeam(teamData);
        }

        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setAvailableTeams(teamsData);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchTeamData();
    }
  }, [session]);

  const onCreateTeam = async (data: CreateTeamForm) => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to create team');
        return;
      }

      setSuccess('Team created successfully!');
      router.refresh();
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const onJoinTeam = async (data: JoinTeamForm) => {
    try {
      setIsJoining(true);
      setError(null);
      const response = await fetch(`/api/teams/${data.teamId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to join team');
        return;
      }

      setSuccess('Successfully joined team!');
      router.refresh();
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="ctf-card p-6 text-center">
          <p className="ctf-text">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center ctf-heading">Team Management</h1>

      {error && (
        <div className="ctf-card p-4 mb-8 bg-red-900/20 border border-red-500">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="ctf-card p-4 mb-8 bg-green-900/20 border border-green-500">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {/* Current Team Section */}
      <div className="ctf-card p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 ctf-heading">Your Team</h2>
        {userTeam ? (
          <div>
            <h3 className="text-xl font-bold mb-2 ctf-heading">{userTeam.name}</h3>
            <div className="space-y-2">
              <p className="ctf-text">
                <span className="ctf-accent">Members:</span>
              </p>
              <ul className="space-y-1">
                {userTeam.members.map((member) => (
                  <li key={member.id} className="ctf-text">
                    {member.name} {member.id === userTeam.leaderId ? '(Leader)' : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="ctf-text">You are not currently in a team.</p>
        )}
      </div>

      {!userTeam && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Create Team Form */}
            <div className="ctf-card p-6">
              <h2 className="text-2xl font-bold mb-6 ctf-heading">Create Team</h2>
              <form onSubmit={handleCreateSubmit(onCreateTeam)} className="space-y-4">
                <div>
                  <label className="block mb-2 ctf-heading">Team Name</label>
                  <input
                    type="text"
                    {...registerCreate('name')}
                    className="ctf-input w-full"
                  />
                  {createErrors.name && (
                    <p className="mt-1 text-red-400">{createErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 ctf-heading">Team Password</label>
                  <input
                    type="password"
                    {...registerCreate('password')}
                    className="ctf-input w-full"
                  />
                  {createErrors.password && (
                    <p className="mt-1 text-red-400">{createErrors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="ctf-button w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Team'}
                </button>
              </form>
            </div>

            {/* Join Team Form */}
            <div className="ctf-card p-6">
              <h2 className="text-2xl font-bold mb-6 ctf-heading">Join Team</h2>
              <form onSubmit={handleJoinSubmit(onJoinTeam)} className="space-y-4">
                <div>
                  <label className="block mb-2 ctf-heading">Team ID</label>
                  <input
                    type="text"
                    {...registerJoin('teamId')}
                    className="ctf-input w-full"
                  />
                  {joinErrors.teamId && (
                    <p className="mt-1 text-red-400">{joinErrors.teamId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 ctf-heading">Team Password</label>
                  <input
                    type="password"
                    {...registerJoin('password')}
                    className="ctf-input w-full"
                  />
                  {joinErrors.password && (
                    <p className="mt-1 text-red-400">{joinErrors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isJoining}
                  className="ctf-button w-full"
                >
                  {isJoining ? 'Joining...' : 'Join Team'}
                </button>
              </form>
            </div>
          </div>

          {/* Available Teams Section */}
          <div className="ctf-card p-6">
            <h2 className="text-2xl font-bold mb-6 ctf-heading">Available Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTeams.map((team) => (
                <div key={team.id} className="ctf-card p-4">
                  <h3 className="text-xl font-bold mb-2 ctf-heading">{team.name}</h3>
                  <p className="ctf-text mb-4">
                    Members: {team.members.length}
                  </p>
                  <button
                    onClick={() => {
                      const teamIdInput = document.querySelector('input[name="teamId"]') as HTMLInputElement;
                      if (teamIdInput) {
                        teamIdInput.value = team.id;
                      }
                    }}
                    className="ctf-button w-full"
                  >
                    Select Team
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 