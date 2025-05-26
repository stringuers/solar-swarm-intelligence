import './globals.css';
import { Share_Tech_Mono } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { SessionProvider } from '@/components/providers/SessionProvider';
import Navbar from '@/components/ui/Navbar';

const hackerFont = Share_Tech_Mono({ subsets: ['latin'], weight: '400' });

export const metadata = {
  title: 'Bitwi$e - CTF Platform',
  description: 'Bitwi$e: A modern, cybersecurity-themed Capture The Flag platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${hackerFont.className} bg-[#0a192f] text-[#00ffea]`}>
        <SessionProvider session={session}>
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
