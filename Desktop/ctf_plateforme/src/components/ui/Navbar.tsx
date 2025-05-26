'use client';

import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

const navigation = [
  { name: 'Challenges', href: '/challenges' },
  { name: 'Scoreboard', href: '/scoreboard' },
  { name: 'Teams', href: '/teams' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-[#101c2c] border-b border-[#00ffea]/30 shadow-lg font-mono">
      {/* Logo/Brand */}
      <div className="flex items-center space-x-2">
        <Link href="/" className="text-3xl font-extrabold tracking-widest glitch" style={{ letterSpacing: '0.1em' }}>
          Bitwi<span className="text-[#39ff14]">$</span>e
        </Link>
      </div>
      {/* Navigation */}
      <nav className="flex items-center space-x-8 text-lg">
        {/* Only show Users and Admin links for admins */}
        {session?.user?.role === 'ADMIN' && (
          <>
            <Link href="/users" className="nav-link">Users</Link>
            <Link href="/admin" className="nav-link">Admin</Link>
          </>
        )}
        <Link href="/teams" className="nav-link">Teams</Link>
        <Link href="/scoreboard" className="nav-link">Scoreboard</Link>
        <Link href="/challenges" className="nav-link">Challenges</Link>
      </nav>
      {/* Auth Buttons */}
      <div className="flex items-center space-x-3">
        {!session ? (
          <>
            <Link href="/auth/signin" className="btn-neon">Sign In</Link>
            <Link href="/auth/signup" className="btn-neon-outline">Sign Up</Link>
          </>
        ) : (
          <>
            <Link href="/profile" className="btn-neon">Profile</Link>
            <button onClick={() => signOut()} className="btn-neon-outline">Sign Out</button>
          </>
        )}
      </div>
      <style jsx>{`
        .glitch {
          text-shadow: 2px 0 #39ff14, -2px 0 #00bfff, 0 2px #00ffea, 0 -2px #39ff14;
          animation: glitch 1.5s infinite alternate-reverse;
        }
        @keyframes glitch {
          0% { text-shadow: 2px 0 #39ff14, -2px 0 #00bfff; }
          20% { text-shadow: -2px 0 #00bfff, 2px 0 #39ff14; }
          40% { text-shadow: 2px 2px #00ffea, -2px -2px #39ff14; }
          60% { text-shadow: -2px 2px #00bfff, 2px -2px #39ff14; }
          100% { text-shadow: 2px 0 #39ff14, -2px 0 #00bfff; }
        }
        .nav-link {
          color: #00ffea;
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: #39ff14;
        }
        .btn-neon {
          background: #00ffea;
          color: #0a192f;
          border: none;
          padding: 0.5em 1.5em;
          border-radius: 0.375rem;
          font-weight: bold;
          box-shadow: 0 0 8px #00ffea, 0 0 2px #39ff14;
          transition: background 0.2s, color 0.2s;
        }
        .btn-neon:hover {
          background: #39ff14;
          color: #0a192f;
        }
        .btn-neon-outline {
          background: transparent;
          color: #00ffea;
          border: 2px solid #00ffea;
          padding: 0.5em 1.5em;
          border-radius: 0.375rem;
          font-weight: bold;
          box-shadow: 0 0 8px #00ffea;
          transition: background 0.2s, color 0.2s;
        }
        .btn-neon-outline:hover {
          background: #00ffea;
          color: #0a192f;
        }
      `}</style>
    </header>
  );
} 