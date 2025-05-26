'use client';

import { useState } from 'react';
import { File } from '@prisma/client';

type Props = {
  challengeId: string;
  onFileUploaded: (file: File) => void;
};

export default function FileUpload({ challengeId, onFileUploaded }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('challengeId', challengeId);

    try {
      const response = await fetch('/api/challenges/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to upload file');
      }

      const uploadedFile = await response.json();
      onFileUploaded(uploadedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-[#00ffea]">
        Upload File
      </label>
      <div className="mt-1 flex items-center">
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-[#00ffea] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#0a192f] file:text-[#00ffea] hover:file:bg-[#00ffea] hover:file:text-[#0a192f]"
        />
      </div>
      {isUploading && (
        <p className="mt-2 text-sm text-[#00bfff]">Uploading...</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
} 