'use client';

import { signIn, getProviders } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { IoLogoGithub, IoGameController, IoShield } from 'react-icons/io5';
import Link from 'next/link';

type Providers = Awaited<ReturnType<typeof getProviders>>;

function SignInContent() {
  const [providers, setProviders] = useState<Providers>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const error = searchParams.get('error');

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  const handleSignIn = async (providerId: string) => {
    setIsLoading(providerId);
    await signIn(providerId, { callbackUrl });
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId.toLowerCase()) {
      case 'github':
        return <IoLogoGithub className="text-2xl" />;
      default:
        return <IoShield className="text-2xl" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(var(--neon-cyan) 1px, transparent 1px),
              linear-gradient(90deg, var(--neon-cyan) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
      </div>

      {/* Floating pixels decoration */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[var(--neon-cyan)]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Main card */}
        <div className="retro-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 mb-4 border-4 border-[var(--neon-cyan)] bg-[var(--bg-secondary)]"
              animate={{ 
                boxShadow: [
                  '0 0 20px var(--neon-cyan)',
                  '0 0 40px var(--neon-cyan)',
                  '0 0 20px var(--neon-cyan)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <IoGameController className="text-4xl text-[var(--neon-cyan)]" />
            </motion.div>
            
            <h1 
              className="pixel-text text-2xl text-glow mb-2"
              data-text="PLAYER LOGIN"
            >
              PLAYER LOGIN
            </h1>
            
            <p className="text-[var(--text-muted)] text-sm">
              Insert credentials to continue
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 border-2 border-[var(--neon-red)] bg-[var(--neon-red)]/10"
            >
              <p className="pixel-text text-xs text-[var(--neon-red)]">
                {error === 'OAuthSignin' && '⚠ Error starting sign in'}
                {error === 'OAuthCallback' && '⚠ Error during callback'}
                {error === 'OAuthCreateAccount' && '⚠ Could not create account'}
                {error === 'Callback' && '⚠ Callback error'}
                {error === 'AccessDenied' && '⚠ Access denied'}
                {error === 'Verification' && '⚠ Token expired'}
                {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'Callback', 'AccessDenied', 'Verification'].includes(error) && '⚠ Sign in failed'}
              </p>
            </motion.div>
          )}

          {/* Providers */}
          <div className="space-y-4">
            {providers ? (
              Object.values(providers).map((provider, index) => (
                <motion.button
                  key={provider.id}
                  onClick={() => handleSignIn(provider.id)}
                  disabled={isLoading !== null}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full p-4 flex items-center gap-4
                    border-2 border-[var(--neon-cyan)] bg-[var(--bg-secondary)]
                    hover:bg-[var(--neon-cyan)] hover:text-[var(--bg-primary)]
                    transition-all duration-200 group
                    ${isLoading === provider.id ? 'opacity-50 cursor-wait' : ''}
                    ${isLoading && isLoading !== provider.id ? 'opacity-30' : ''}
                  `}
                >
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-current">
                    {isLoading === provider.id ? (
                      <div className="retro-spinner w-5 h-5" />
                    ) : (
                      getProviderIcon(provider.id)
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="pixel-text text-sm">
                      {isLoading === provider.id ? 'CONNECTING...' : `SIGN IN WITH ${provider.name.toUpperCase()}`}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] group-hover:text-[var(--bg-tertiary)]">
                      Press to authenticate
                    </p>
                  </div>
                  <div className="text-2xl">▶</div>
                </motion.button>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="retro-spinner w-8 h-8 mx-auto mb-4" />
                <p className="pixel-text text-xs text-[var(--text-muted)]">
                  LOADING PROVIDERS...
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-[var(--bg-tertiary)]">
            <p className="text-center text-xs text-[var(--text-muted)]">
              By signing in, you agree to our{' '}
              <span className="text-[var(--neon-cyan)]">terms of service</span>
            </p>
          </div>
        </div>

        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link 
            href="/"
            className="pixel-text text-xs text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors"
          >
            ← RETURN TO HOME BASE
          </Link>
        </motion.div>

        {/* Decorative corners */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[var(--neon-pink)]" />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[var(--neon-pink)]" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[var(--neon-pink)]" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[var(--neon-pink)]" />
      </motion.div>

      <style jsx global>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="retro-spinner w-12 h-12" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}

