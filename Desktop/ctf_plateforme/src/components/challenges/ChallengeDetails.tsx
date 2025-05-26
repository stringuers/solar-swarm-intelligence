'use client';

import { useState } from 'react';
import { Challenge, File, Hint, User } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';

type ChallengeWithRelations = Challenge & {
  hints: Hint[];
  files: File[];
};

type Props = {
  challenge: ChallengeWithRelations;
  user: User & {
    team: {
      id: string;
      name: string;
    } | null;
  };
  hasSolved: boolean;
};

const flagSchema = z.object({
  flag: z.string().min(1, 'Flag is required'),
});

type FlagForm = z.infer<typeof flagSchema>;

export default function ChallengeDetails({ challenge, user, hasSolved }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FlagForm>({
    resolver: zodResolver(flagSchema),
  });

  const onSubmit = async (data: FlagForm) => {
    try {
      console.log('Submitting flag for challenge:', challenge.id);
      const response = await fetch(`${window.location.origin}/api/challenges/${challenge.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flag: data.flag,
          teamId: user.team?.id,
        }),
      });

      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        setError('Server returned an invalid response. Please try again.');
        return;
      }

      if (!response.ok) {
        console.error('Submission error:', result);
        setError(result.message || 'Failed to submit flag');
        return;
      }

      setSuccess(true);
      reset();
    } catch (error) {
      console.error('Submission error:', error);
      setError('An error occurred while submitting the flag. Please try again.');
    }
  };

  const toggleHint = (hintId: string) => {
    setShowHints((prev) => ({
      ...prev,
      [hintId]: !prev[hintId],
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('challengeId', challenge.id);

    try {
      const response = await fetch('/api/challenges/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      // Refresh the page to show the new file
      window.location.reload();
    } catch (error) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#101c2c] shadow sm:rounded-lg border border-[#00ffea]/30">
        <div className="px-4 py-5 sm:p-6">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-2 ctf-heading">{challenge.title}</h2>
            <p className="ctf-text mb-2">Author: {challenge.author || 'Unknown'}</p>
            <p className="ctf-text mb-4">{challenge.description}</p>
          </div>

          {challenge.files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-base font-semibold leading-6 text-[#39ff14]">
                Files
              </h3>
              <div className="mt-2">
                <ul className="divide-y divide-[#00ffea]/20">
                  {challenge.files.map((file) => (
                    <li key={file.id} className="py-3">
                      <a
                        href={file.url}
                        className="text-sm font-medium text-[#00ffea] hover:text-[#39ff14]"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {user.role === 'ADMIN' && (
            <div className="mt-6">
              <h3 className="text-base font-semibold leading-6 text-[#39ff14]">
                Upload File
              </h3>
              <div className="mt-2">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-[#00ffea] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0a192f] file:text-[#00ffea] hover:file:bg-[#00ffea] hover:file:text-[#0a192f]"
                />
              </div>
            </div>
          )}

          {challenge.hints.length > 0 && (
            <div className="mt-6">
              <h3 className="text-base font-semibold leading-6 text-[#39ff14]">
                Hints
              </h3>
              <div className="mt-2">
                <ul className="divide-y divide-[#00ffea]/20">
                  {challenge.hints.map((hint) => (
                    <li key={hint.id} className="py-3">
                      <button
                        onClick={() => toggleHint(hint.id)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <span className="text-sm font-medium text-[#00ffea]">
                          Hint {hint.cost > 0 ? `(${hint.cost} points)` : ''}
                        </span>
                        <span className="text-sm text-[#00bfff]">
                          {showHints[hint.id] ? 'Hide' : 'Show'}
                        </span>
                      </button>
                      {showHints[hint.id] && (
                        <div className="mt-2 text-sm text-[#00ffea]">
                          {hint.content}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {!hasSolved && (
        <div className="bg-[#101c2c] shadow sm:rounded-lg border border-[#00ffea]/30">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-[#39ff14]">
              Submit Flag
            </h3>
            <div className="mt-2 max-w-xl text-sm text-[#00bfff]">
              <p>Enter the flag you found to solve this challenge.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
              <div className="flex gap-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    {...register('flag')}
                    className="block w-full rounded-md border-0 py-1.5 bg-[#0a192f] text-[#00ffea] shadow-sm ring-1 ring-inset ring-[#00ffea] placeholder:text-[#00bfff] focus:ring-2 focus:ring-inset focus:ring-[#39ff14] sm:text-sm sm:leading-6"
                    placeholder="Enter flag..."
                  />
                  {errors.flag && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.flag.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-shrink-0 rounded-md bg-[#0a192f] px-3 py-2 text-sm font-semibold text-[#00ffea] shadow-sm border border-[#00ffea] hover:bg-[#00ffea] hover:text-[#0a192f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39ff14] disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-4 rounded-md bg-red-900/50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-200">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            {success && (
              <div className="mt-4 rounded-md bg-green-900/50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-200">
                      Congratulations! You solved this challenge.
                    </h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hasSolved && (
        <div className="rounded-md bg-green-900/50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-200">
                You have already solved this challenge!
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 