// app/components/layout/Footer.tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Github, Twitter, Globe, ChevronUp, Zap, ExternalLink } from 'lucide-react';
import { KazistackLogo } from '../KazistackLogo';
import { cn } from '.././utils';
import { useState } from 'react';

interface FooterProps {
  className?: string;
  onViewChange?: (view: string) => void;
}

export function Footer({ className, onViewChange }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show scroll to top button after scrolling down
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowScrollTop(window.scrollY > 400);
    });
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Dashboard',     view: 'dashboard' },
    { label: 'Tasks',         view: 'tasks' },
    { label: 'Board',         view: 'board' },
    { label: 'Calendar',      view: 'calendar' },
    { label: 'Notifications', view: 'notifications' },
    { label: 'Settings',      view: 'settings' },
  ];

  const socialLinks = [
    { icon: Github,  href: 'https://github.com/allankiprop/kazistack', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/kazistack',            label: 'Twitter' },
    { icon: Globe,   href: 'https://kazistack.vercel.com',             label: 'Website' },
  ];

  return (
    <>
      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "border-t border-border bg-gradient-to-b from-background to-secondary/5",
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <KazistackLogo size={40} showText={false} />
                <div>
                  <span className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    KAZISTACK
                  </span>
                  <p className="text-[10px] text-muted-foreground tracking-wider">TASK MANAGEMENT</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Streamline your workflow, boost productivity, and never miss a deadline with Kazistack's intuitive task management system.
              </p>

              <div className="mt-6 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Built by</span>
                <a
                  href="https://allan-k.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 text-sm font-semibold hover:text-primary transition-colors"
                >
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Allan Kiprop
                  </span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onViewChange?.(link.view)}
                      className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 inline-block transition-all text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div className="col-span-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                Connect
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                        aria-label={social.label}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="font-mono text-muted-foreground">v1.0.0</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{currentYear}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-muted-foreground">
              © {currentYear} Kazistack. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms"   className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="/cookies" className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </motion.footer>
    </>
  );
}