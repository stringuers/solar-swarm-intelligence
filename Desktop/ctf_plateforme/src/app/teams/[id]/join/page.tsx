'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const joinTeamSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type JoinTeamForm = z.infer<typeof joinTeamSchema>;

export default function JoinTeamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinTeamForm>({
    resolver: zodResolver(joinTeamSchema),
  });

  const onSubmit = async (data: JoinTeamForm) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/teams/${params.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to join team');
        return;
      }

      router.push('/teams/manage');
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center ctf-heading">Join Team</h1>

      {error && (
        <div className="ctf-card p-4 mb-8 bg-red-900/20 border border-red-500">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <div className="ctf-card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 ctf-heading">Team Password</label>
              <input
                type="password"
                {...register('password')}
                className="ctf-input w-full"
              />
              {errors.password && (
                <p className="mt-1 text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="ctf-button w-full"
            >
              {isSubmitting ? 'Joining...' : 'Join Team'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 