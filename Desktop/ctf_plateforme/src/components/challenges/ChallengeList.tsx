'use client';

import { useState } from 'react';
import { Category, Challenge } from '@prisma/client';
import Link from 'next/link';

type ChallengeWithSolves = Challenge & {
  _count: {
    submissions: number;
  };
};

type Props = {
  challenges: ChallengeWithSolves[];
  categories: Category[];
};

export default function ChallengeList({ challenges, categories }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch = challenge.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || challenge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-[#00ffea] bg-[#101c2c] py-1.5 text-[#00ffea] placeholder:text-[#00bfff] focus:ring-2 focus:ring-inset focus:ring-[#39ff14] sm:text-sm sm:leading-6"
          />
        </div>
        <div className="flex-shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category | 'ALL')}
            className="block w-full rounded-md border border-[#00ffea] bg-[#101c2c] py-1.5 pl-3 pr-10 text-[#00ffea] focus:ring-2 focus:ring-[#39ff14] sm:text-sm sm:leading-6"
          >
            <option value="ALL">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden bg-[#101c2c] shadow sm:rounded-md border border-[#00ffea]">
        <ul role="list" className="divide-y divide-[#00ffea]/20">
          {filteredChallenges.map((challenge) => (
            <li key={challenge.id}>
              <Link
                href={`/challenges/${challenge.id}`}
                className="block hover:bg-[#0a192f] transition-colors"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <div className="flex items-center">
                        <p className="truncate text-lg font-bold text-[#00ffea]">
                          {challenge.title}
                        </p>
                        <div className="ml-2 flex flex-shrink-0">
                          <p className="inline-flex rounded-full bg-[#39ff14]/10 border border-[#39ff14] px-2 text-xs font-bold leading-5 text-[#39ff14]">
                            {challenge.category}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-[#00bfff]">
                          <p>
                            {challenge._count.submissions} solve
                            {challenge._count.submissions !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex flex-shrink-0">
                      <p className="text-lg font-bold text-[#39ff14]">
                        {challenge.points} points
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 