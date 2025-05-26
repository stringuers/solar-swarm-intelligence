'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Team, User, Challenge, Submission } from '@prisma/client';

type TeamWithRelations = Team & {
  members: User[];
  submissions: (Submission & {
    challenge: Challenge;
  })[];
  score: number;
};

type Props = {
  teams: TeamWithRelations[];
};

export default function Scoreboard({ teams: initialTeams }: Props) {
  const [teams, setTeams] = useState(initialTeams);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');

    socket.on('scoreboard:update', (updatedTeams: TeamWithRelations[]) => {
      setTeams(updatedTeams);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {teams.map((team, index) => (
          <li key={team.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                      <span className="text-sm font-medium leading-none text-indigo-600">
                        {index + 1}
                      </span>
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {team.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="ml-2 flex flex-shrink-0">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {team.score} points
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    {team.submissions.length}
                  </span>{' '}
                  challenge{team.submissions.length !== 1 ? 's' : ''} solved
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 