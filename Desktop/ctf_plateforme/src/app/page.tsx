'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

function Typewriter({ texts, speed = 80, pause = 1200 }: { texts: string[]; speed?: number; pause?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let i = 0, j = 0, forward = true;
    let timeout: ReturnType<typeof setTimeout>;
    function type() {
      if (!ref.current) return;
      if (forward) {
        ref.current.textContent = texts[i].slice(0, j++);
        if (j > texts[i].length) {
          forward = false;
          timeout = setTimeout(type, pause);
        } else {
          timeout = setTimeout(type, speed);
        }
      } else {
        ref.current.textContent = texts[i].slice(0, j--);
        if (j < 0) {
          forward = true;
          i = (i + 1) % texts.length;
          timeout = setTimeout(type, speed);
        } else {
          timeout = setTimeout(type, speed / 2);
        }
      }
    }
    type();
    return () => clearTimeout(timeout);
  }, [texts, speed, pause]);
  return <span ref={ref} />;
}

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a192f] text-[#00ffea] font-mono flex flex-col items-center justify-center">
      {/* Moving Bits Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <BitsBackground />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-6xl font-extrabold mb-4 glitch tracking-widest">
          Bitwi<span className="text-[#39ff14]">$</span>e
        </h1>
        <h2 className="text-2xl mb-8 text-[#00bfff] h-8">
          <Typewriter
            texts={[
              'Welcome to the Cyber Arena.',
              'Hack the Planet. Capture the Flag.',
              'Compete. Learn. Win. Bitwi$e.',
            ]}
          />
        </h2>
        <div className="flex space-x-4">
          {!session ? (
            <>
              <Link href="/auth/signup" className="btn-neon">Sign Up</Link>
              <Link href="/auth/signin" className="btn-neon-outline">Sign In</Link>
            </>
          ) : (
            <Link href="/challenges" className="btn-neon">Enter Platform</Link>
          )}
        </div>
      </div>

      {/* Neon/Glitch effect style */}
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
        .btn-neon {
          background: #00ffea;
          color: #0a192f;
          border: none;
          padding: 0.75em 2em;
          border-radius: 0.375rem;
          font-weight: bold;
          font-size: 1.2rem;
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
          padding: 0.75em 2em;
          border-radius: 0.375rem;
          font-weight: bold;
          font-size: 1.2rem;
          box-shadow: 0 0 8px #00ffea;
          transition: background 0.2s, color 0.2s;
        }
        .btn-neon-outline:hover {
          background: #00ffea;
          color: #0a192f;
        }
      `}</style>
    </div>
  );
}

// Moving Bits Background Component
function BitsBackground() {
  const [mounted, setMounted] = useState(false);
  const [columns, setColumns] = useState<number[][]>([]);
  useEffect(() => {
    setMounted(true);
    // Generate random bits for each column only on client
    const cols = Array.from({ length: 32 }, () =>
      Array.from({ length: 20 }, () => (Math.random() > 0.5 ? 1 : 0))
    );
    setColumns(cols);
  }, []);
  if (!mounted) return null;
  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden">
      <div className="w-full h-full absolute animate-bits-move" style={{
        backgroundImage: `repeating-linear-gradient(
          to bottom,
          transparent 0px, transparent 10px, #00ffea22 10px, #00ffea22 12px
        )`
      }}>
        {columns.map((bits, col) => (
          <BitsColumn key={col} delay={col * 0.15} bits={bits} />
        ))}
      </div>
      <style jsx>{`
        @keyframes bits-move {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100px); }
        }
        .animate-bits-move {
          animation: bits-move 3s linear infinite alternate;
        }
      `}</style>
    </div>
  );
}

function BitsColumn({ delay = 0, bits }: { delay?: number; bits: number[] }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${Math.random() * 100}%`,
        top: 0,
        animation: `bits-fall 2.5s linear infinite`,
        animationDelay: `${delay}s`,
        width: '1.5vw',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {bits.map((bit, i) => (
        <div
          key={i}
          style={{
            color: i % 2 === 0 ? '#00ffea' : '#39ff14',
            opacity: Math.random() * 0.7 + 0.3,
            fontSize: '1.1vw',
            fontFamily: 'monospace',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          {bit}
        </div>
      ))}
      <style jsx>{`
        @keyframes bits-fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
