'use client';

import Link from 'next/link';
import Image from 'next/image';

export function WhatsAppButton() {
  return (
    <>
      {/* Desktop - Top Center */}
      <Link
        href="https://wa.me/994515676382"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-[#38C682] hover:bg-[#2FB874] text-white rounded-b-[24px] px-9 pt-2 pb-3 items-center gap-4 shadow-lg transition-all duration-300"
        aria-label="Contact us on WhatsApp"
      >
        <Image src="/images/whatsapp-figma.svg" alt="WhatsApp" width={25} height={24} className="w-6 h-6" />
        <div className="flex flex-col items-start">
          <span className="text-[20px] leading-6 font-medium">Get in touch</span>
          <span className="text-[14px] leading-3">0554906099</span>
        </div>
      </Link>

      {/* Mobile - Right Side Vertical */}
      <Link
        href="https://wa.me/994515676382"
        target="_blank"
        rel="noopener noreferrer"
        className="md:hidden fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-[#38C682] hover:bg-[#2FB874] text-white rounded-l-[24px] py-8 px-4 flex flex-col items-center gap-2 shadow-lg transition-all duration-300"
        aria-label="Contact us on WhatsApp"
      >
        <Image src="/images/whatsapp-figma.svg" alt="WhatsApp" width={25} height={24} className="w-6 h-6" />
        <div className="flex flex-col items-center [writing-mode:vertical-rl] rotate-180">
          <span className="text-base font-medium whitespace-nowrap">Get in touch</span>
          <span className="text-sm whitespace-nowrap">0554906099</span>
        </div>
      </Link>
    </>
  );
}
