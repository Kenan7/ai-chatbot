'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function WhatsAppButton({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className={className}
          asChild
        >
          <Link
            href="https://wa.me/994515676382"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact us on WhatsApp"
          >
            <Image
              src={isDark ? '/images/Digital_Glyph_White.svg' : '/images/Digital_Glyph_Dark_Green.svg'}
              alt="WhatsApp"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="sr-only">WhatsApp</span>
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Contact on WhatsApp</TooltipContent>
    </Tooltip>
  );
}
