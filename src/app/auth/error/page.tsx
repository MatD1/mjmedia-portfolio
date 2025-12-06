'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { IoWarning, IoRefresh, IoHome } from 'react-icons/io5';
import Link from 'next/link';
import { Suspense } from 'react';

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'SERVER MISCONFIGURED',
    description: 'There is a problem with the server configuration. Contact the administrator.',
  },
  AccessDenied: {
    title: 'ACCESS DENIED',
    description: 'You do not have permission to sign in. Your access level is insufficient.',
  },
  Verification: {
    title: 'TOKEN EXPIRED',
    description: 'The verification token has expired or has already been used.',
  },
  OAuthSignin: {
    title: 'OAUTH ERROR',
    description: 'Error in constructing an authorization URL.',
  },
  OAuthCallback: {
    title: 'CALLBACK FAILED',
    description: 'Error in handling the response from the OAuth provider.',
  },
  OAuthCreateAccount: {
    title: 'ACCOUNT ERROR',
    description: 'Could not create OAuth provider user in the database.',
  },
  EmailCreateAccount: {
    title: 'EMAIL ERROR',
    description: 'Could not create email provider user in the database.',
  },
  Callback: {
    title: 'CALLBACK ERROR',
    description: 'Error in the OAuth callback handler route.',
  },
  OAuthAccountNotLinked: {
    title: 'ACCOUNT NOT LINKED',
    description: 'Email on the account already exists with different provider.',
  },
  EmailSignin: {
    title: 'EMAIL FAILED',
    description: 'Check if your email address is correct and try again.',
  },
  CredentialsSignin: {
    title: 'INVALID CREDENTIALS',
    description: 'The credentials you entered are incorrect. Please try again.',
  },
  SessionRequired: {
    title: 'SESSION REQUIRED',
    description: 'You must be signed in to access this content.',
  },
  Default: {
    title: 'SYSTEM ERROR',
    description: 'An unexpected error occurred. Please try again later.',
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') ?? 'Default';
  const errorInfo = errorMessages[error] ?? {
    title: 'SYSTEM ERROR',
    description: 'An unexpected error occurred. Please try again later.',
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glitchy background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                var(--neon-red) 2px,
                var(--neon-red) 4px
              )
            `,
            animation: 'glitchBg 0.5s infinite',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Error card */}
        <div className="border-4 border-[var(--neon-red)] bg-[var(--bg-secondary)] p-8 relative">
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 border-4 border-[var(--neon-red)]"
            animate={{
              boxShadow: [
                '0 0 20px var(--neon-red), inset 0 0 20px rgba(255, 0, 64, 0.1)',
                '0 0 40px var(--neon-red), inset 0 0 40px rgba(255, 0, 64, 0.2)',
                '0 0 20px var(--neon-red), inset 0 0 20px rgba(255, 0, 64, 0.1)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ pointerEvents: 'none' }}
          />

          {/* Warning icon */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="inline-block"
            >
              <IoWarning className="text-7xl text-[var(--neon-red)]" />
            </motion.div>
          </div>

          {/* Error code */}
          <div className="text-center mb-4">
            <motion.p 
              className="pixel-text text-xs text-[var(--neon-red)] mb-2"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ERROR CODE: {error.toUpperCase()}
            </motion.p>
          </div>

          {/* Error title */}
          <h1 
            className="pixel-text text-2xl text-center text-[var(--neon-red)] mb-4 glitch"
            data-text={errorInfo.title}
          >
            {errorInfo.title}
          </h1>

          {/* Error description */}
          <p className="text-center text-[var(--text-secondary)] mb-8">
            {errorInfo.description}
          </p>

          {/* ASCII art decoration */}
          <pre className="text-[var(--neon-red)] text-xs text-center mb-8 opacity-50 font-mono">
{`╔════════════════════════════╗
║  AUTHENTICATION FAILED     ║
║  RETRY OR RETURN TO BASE   ║
╚════════════════════════════╝`}
          </pre>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth/signin"
              className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)] hover:text-[var(--bg-primary)] transition-all pixel-text text-sm"
            >
              <IoRefresh className="text-lg" />
              TRY AGAIN
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-[var(--neon-green)] hover:bg-[var(--neon-green)] hover:text-[var(--bg-primary)] transition-all pixel-text text-sm"
            >
              <IoHome className="text-lg" />
              GO HOME
            </Link>
          </div>
        </div>

        {/* Decorative scanlines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      </motion.div>

      <style jsx global>{`
        @keyframes glitchBg {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
      `}</style>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="retro-spinner w-12 h-12" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

