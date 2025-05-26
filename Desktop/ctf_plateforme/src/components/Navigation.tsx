'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#112240] border-b border-[#1d2d50]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={`ctf-heading ${isActive('/') ? 'text-[#64ffda]' : ''}`}
            >
              CTF Platform
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/challenges"
                className={`ctf-text hover:text-[#64ffda] transition-colors ${
                  isActive('/challenges') ? 'text-[#64ffda]' : ''
                }`}
              >
                Challenges
              </Link>
              <Link
                href="/teams"
                className={`ctf-text hover:text-[#64ffda] transition-colors ${
                  isActive('/teams') ? 'text-[#64ffda]' : ''
                }`}
              >
                Teams
              </Link>
              <Link
                href="/scoreboard"
                className={`ctf-text hover:text-[#64ffda] transition-colors ${
                  isActive('/scoreboard') ? 'text-[#64ffda]' : ''
                }`}
              >
                Scoreboard
              </Link>
              <Link
                href="/teams/manage"
                className={`ctf-text hover:text-[#64ffda] transition-colors ${
                  isActive('/teams/manage') ? 'text-[#64ffda]' : ''
                }`}
              >
                Team Management
              </Link>
              {session.user.role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin"
                    className={`ctf-text hover:text-[#64ffda] transition-colors ${
                      isActive('/admin') ? 'text-[#64ffda]' : ''
                    }`}
                  >
                    Admin
                  </Link>
                  <Link
                    href="/challenges/new"
                    className={`ctf-text hover:text-[#64ffda] transition-colors ${
                      isActive('/challenges/new') ? 'text-[#64ffda]' : ''
                    }`}
                  >
                    Create Challenge
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className={`ctf-text hover:text-[#64ffda] transition-colors ${
                isActive('/profile') ? 'text-[#64ffda]' : ''
              }`}
            >
              Profile
            </Link>
            <Link
              href="/api/auth/signout"
              className="ctf-button"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 