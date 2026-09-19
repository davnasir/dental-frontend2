import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Menu,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ t, onOpenAppointment }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Clean navigation links with Reviews, Cost Estimator, FAQ, and Transformations removed
  const navLinks = [
    { href: '#home', label: t.nav.home },
    { href: '#about', label: t.nav.about },
    { href: '#problem', label: t.nav.problem },
    { href: '#services', label: t.nav.services },
    { href: '#journey', label: t.nav.journey },
    { href: '#contact', label: t.nav.contact }
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-[#D6E8F7]/95 backdrop-blur-md shadow-lg py-3 border-b border-[#B8D8EE]'
          : 'bg-transparent py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center gap-3 group"
          >
            <img
              src="/logo.jpg"
              alt="Nahol Dental Care Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-[#2299D6] shadow-glow-teal group-hover:scale-105 transition-transform bg-white"
            />
            <div>
              <div className="text-xl sm:text-2xl text-[14px] font-bold tracking-tight text-[#0A2255] font-display flex items-center gap-1.5">
                <span>Nahol</span>
                <span className="text-[#2299D6]">Dental Care</span>
              </div>
              <p className="text-[8px] sm:text-xs text-[#5A7A9A] tracking-wider uppercase font-semibold">
                Specialist Oral Clinic
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-[#0A2255] hover:text-[#14357B] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#2299D6] hover:after:w-full after:transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">

            {/* Primary Appointment CTA */}
            <button
              type="button"
              onClick={onOpenAppointment}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#14357B] to-[#2299D6] hover:from-[#0F2A5E] hover:to-[#1A7DB3] rounded-xl shadow-md hover:shadow-glow-teal transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.nav.bookCta}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#0A2255] hover:bg-[#F0F7FD] rounded-lg transition-colors"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Slide-Out Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-50 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:hidden border-l border-[#B8D8EE] ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div>
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#B8D8EE]">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.jpg"
                alt="Nahol Dental Care Logo"
                className="w-9 h-9 rounded-full object-cover border border-[#2299D6] bg-white"
              />
              <span className="font-display font-bold text-lg text-[#0A2255]">
                Nahol Dental Care
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-[#5A7A9A] hover:text-[#0A2255] rounded-md"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nav List */}
          <div className="py-4 space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-[#0A2255] hover:bg-[#F0F7FD] hover:text-[#14357B] transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-[#5A7A9A]" />
              </a>
            ))}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-[#B8D8EE] space-y-3">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAppointment();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#14357B] to-[#2299D6] text-white font-semibold shadow-md active:scale-95 transition-all"
          >
            <Calendar className="w-5 h-5" />
            <span>{t.nav.bookCta}</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-[#5A7A9A] pt-1">
            <ShieldCheck className="w-4 h-4 text-[#2299D6]" />
            <span>{t.hero.trustBadge}</span>
          </div>
        </div>
      </div>
    </>
  );
}
