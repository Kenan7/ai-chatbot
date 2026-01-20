'use client';

import dynamic from 'next/dynamic';
import { GoogleTagManager } from '@/components/google-tag-manager';
import { GoogleAnalytics } from '@/components/google-analytics';

const ClarityAnalytics = dynamic(
  () => import('@/components/clarity-analytics').then(mod => ({ default: mod.ClarityAnalytics })),
  { ssr: false }
);

const MetaPixel = dynamic(
  () => import('@/components/meta-pixel').then(mod => ({ default: mod.MetaPixel })),
  { ssr: false }
);

const LinkedInInsight = dynamic(
  () => import('@/components/linkedin-insight').then(mod => ({ default: mod.LinkedInInsight })),
  { ssr: false }
);

export function Analytics() {
  return (
    <>
      <GoogleTagManager />
      <GoogleAnalytics />
      <MetaPixel />
      <LinkedInInsight />
      <ClarityAnalytics />
    </>
  );
}
