'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  IoLogoGithub, 
  IoLogoLinkedin, 
  IoLogoTwitter, 
  IoMail,
  IoCodeSlash,
  IoHeart
} from 'react-icons/io5';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: IoLogoGithub },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: IoLogoLinkedin },
    { name: 'Twitter', href: 'https://twitter.com', icon: IoLogoTwitter },
    { name: 'Email', href: 'mailto:contact@example.com', icon: IoMail },
  ];

  const quickLinks = [
    { name: 'Projects', href: '/projects' },
    { name: 'Blog', href: '/blog' },
    { name: 'Stories', href: '/stories' },
    { name: 'About', href: '/about' },
  ];

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <IoCodeSlash className="text-2xl text-[var(--neon-cyan)]" />
              <span className="pixel-text text-lg text-glow">MJ MEDIA</span>
            </motion.div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Building digital experiences with retro gaming aesthetics. 
              Full-stack developer passionate about pixel art and modern web technologies.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-[var(--neon-cyan)] hover:text-[var(--bg-primary)] rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="pixel-text text-sm text-[var(--neon-cyan)] uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="pixel-text text-sm text-[var(--neon-cyan)] uppercase tracking-wider">
              Get In Touch
            </h3>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p>Available for freelance work</p>
              <p>Open to collaboration</p>
              <p>Always learning new tech</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border-primary)] mt-8 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[var(--text-muted)] text-sm flex items-center gap-2">
              © {currentYear} MJ Media. Made with 
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <IoHeart className="text-[var(--neon-red)]" />
              </motion.span>
              and lots of coffee.
            </p>
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span>Powered by Next.js</span>
              <span>•</span>
              <span>Styled with Tailwind</span>
              <span>•</span>
              <span>Deployed on Vercel</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
