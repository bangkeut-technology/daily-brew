"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LogoBrand } from "@/components/shared/Logo";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Support", href: "/support" },
  { label: "FAQ", href: "/faq" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <motion.nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream/75 backdrop-blur-2xl shadow-[0_1px_8px_rgba(107,66,38,0.06)]"
          : "bg-transparent backdrop-blur-none",
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(193,127,59,0.25), rgba(232,168,90,0.2), rgba(193,127,59,0.25), transparent)",
        }}
      />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="no-underline">
          <LogoBrand size={30} />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-text-secondary no-underline transition-colors duration-200 hover:text-coffee"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-4 w-px bg-cream-3" />
          <Link
            href="/sign-in"
            className="text-[15px] font-medium text-text-secondary no-underline transition-colors duration-200 hover:text-text-primary"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-coffee px-4 py-2 text-[15px] font-medium text-white no-underline transition-all duration-150 hover:-translate-y-px hover:bg-coffee-light hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="p-2 text-text-secondary md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="space-y-3 border-b border-cream-3/60 bg-cream/90 px-6 pb-4 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-1 text-[16px] font-medium text-text-secondary no-underline transition-colors hover:text-coffee"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-cream-3" />
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="block py-1 text-[16px] font-medium text-text-secondary no-underline"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white no-underline"
            >
              Get started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
