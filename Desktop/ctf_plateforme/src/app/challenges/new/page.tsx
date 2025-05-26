'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category, File } from '@prisma/client';

const challengeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.nativeEnum(Category),
  points: z.number().min(1, 'Points must be at least 1'),
  flag: z.string().min(1, 'Flag is required'),
});

type ChallengeForm = z.infer<typeof challengeSchema>;

export default function NewChallengePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChallengeForm>({
    resolver: zodResolver(challengeSchema),
  });

  const onSubmit = async (data: ChallengeForm) => {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to create challenge');
      }

      router.push('/challenges');
    } catch (error) {
      console.error('Error creating challenge:', error);
      setError(error instanceof Error ? error.message : 'Failed to create challenge');
    }
  };

  return (
    <div className="py-10 bg-[#0a192f] text-[#00ffea] font-mono min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#39ff14]">
          Create New Challenge
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#00ffea]">
                Title
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                className="mt-1 block w-full rounded-md border-0 py-1.5 bg-[#0a192f] text-[#00ffea] shadow-sm ring-1 ring-inset ring-[#00ffea] placeholder:text-[#00bfff] focus:ring-2 focus:ring-inset focus:ring-[#39ff14] sm:text-sm sm:leading-6"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#00ffea]">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className="mt-1 block w-full rounded-md border-0 py-1.5 bg-[#0a192f] text-[#00ffea] shadow-sm ring-1 ring-inset ring-[#00ffea] placeholder:text-[#00bfff] focus:ring-2 focus:ring-inset focus:ring-[#39ff14] sm:text-sm sm:leading-6"
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#00ffea]">
                Category
              </label>
              <select
                id="category"
                {...register('category')}
                className="mt-1 block w-full rounded-md border-0 py-1.5 bg-[#0a192f] text-[#00ffea] shadow-sm ring-1 ring-inset ring-[#00ffea] focus:ring-2 focus:ring-inset focus:ring-[#39ff14] sm:text-sm sm:leading-6"
              >
                {Object.values(Category).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-400">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="points" className="block text-sm font-medium text-[#00ffea]">
                Points
              </label>
              <input
                type="number"
                id="points"
                {...register('points', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-0 py-1.5 bg-[#0a192f] text-[#00ffea] shadow-sm ring-1 ring-inset ring-[#00ffea] placeholder:text-[#00bfff] focus:ring-2 focus:ring-inset focus:ring-[#39ff14] sm:text-sm sm:leading-6"
              />
              {errors.points && (
                <p className="mt-2 text-sm text-red-400">{errors.points.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="flag" className="block text-sm font-medium text-[#00ffea]">
                Flag
              </label>
              <input
                type="text"
                id="flag"
                {...register('flag')}
                className="mt-1 block w-full rounded-md border-0 py-1.5 bg-[#0a192f] text-[#00ffea] shadow-sm ring-1 ring-inset ring-[#00ffea] placeholder:text-[#00bfff] focus:ring-2 focus:ring-inset focus:ring-[#39ff14] sm:text-sm sm:leading-6"
              />
              {errors.flag && (
                <p className="mt-2 text-sm text-red-400">{errors.flag.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/50 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#0a192f] px-4 py-2 text-sm font-semibold text-[#00ffea] shadow-sm border border-[#00ffea] hover:bg-[#00ffea] hover:text-[#0a192f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39ff14] disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 