'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoGameController, IoHome, IoArrowBack } from 'react-icons/io5';

import Button from '~/components/ui/Button';
import Card from '~/components/ui/Card';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          {/* Game Over Style 404 */}
          <Card className="p-12">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <IoGameController className="text-8xl text-[var(--neon-red)] mx-auto mb-4" />
            </motion.div>

            <motion.h1 
              className="pixel-text text-6xl sm:text-8xl text-glow mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              GAME OVER
            </motion.h1>

            <motion.div
              className="pixel-text text-2xl sm:text-3xl text-[var(--neon-cyan)] mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              404 - Page Not Found
            </motion.div>

            <motion.p 
              className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Looks like you've wandered into uncharted territory! This page doesn't exist 
              in our digital universe. Don't worry, even the best players get lost sometimes.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Link href="/">
                <Button size="lg" className="group">
                  <IoHome className="mr-2 group-hover:scale-110 transition-transform" />
                  Return to Base
                </Button>
              </Link>
              
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => window.history.back()}
                className="group"
              >
                <IoArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Go Back
              </Button>
            </motion.div>

            {/* Easter Egg */}
            <motion.div
              className="mt-8 text-xs text-[var(--text-muted)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <p>💡 Pro tip: Try pressing ↑↑↓↓←→←→BA for a surprise!</p>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
