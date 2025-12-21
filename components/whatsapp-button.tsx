'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  return (
    <>
      {/* Desktop - Top Center */}
      <Link
        href="https://wa.me/994515676382"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-b-3xl px-8 py-4 items-center gap-3 shadow-lg transition-all duration-300"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="flex flex-col items-start">
          <span className="text-lg font-medium">Get in touch</span>
          <span className="text-sm">0554906099</span>
        </div>
      </Link>

      {/* Mobile - Right Side Vertical */}
      <Link
        href="https://wa.me/994515676382"
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-l-3xl py-8 px-4 flex flex-col items-center gap-2 shadow-lg transition-all duration-300"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="flex flex-col items-center [writing-mode:vertical-rl] rotate-180">
          <span className="text-base font-medium whitespace-nowrap">Get in touch</span>
          <span className="text-sm whitespace-nowrap">0554906099</span>
        </div>
      </Link>
    </>
  );
}
