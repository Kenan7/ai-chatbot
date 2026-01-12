import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Script from 'next/script';

import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { APP_VERSION } from '@/lib/constants';
import { WhatsAppButton } from '@/components/whatsapp-button';

export const metadata: Metadata = {
  metadataBase: new URL('https://sellectad.com'),
  title: 'Sellectad',
  description: 'Sellectad',
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

const THEME_COLORS = {
  light: 'hsl(0 0% 100%)',
  dark: 'hsl(240deg 10% 3.92%)',
  forest: 'hsl(120 20% 97%)',
  sage: 'hsl(60 15% 97%)',
  emerald: 'hsl(160 25% 97%)',
  mint: 'hsl(180 30% 98%)',
  jade: 'hsl(150 22% 97%)',
  pine: 'hsl(140 18% 97%)',
  seafoam: 'hsl(165 35% 98%)',
  olive: 'hsl(80 15% 97%)',
  eucalyptus: 'hsl(155 20% 97%)',
};

const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  var themeColors = ${JSON.stringify(THEME_COLORS)};
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    if (isDark) {
      meta.setAttribute('content', themeColors.dark);
      return;
    }
    // Check for custom theme classes
    var classList = Array.from(html.classList);
    var themeClass = classList.find(function(cls) { return cls.startsWith('theme-'); });
    if (themeClass) {
      var themeName = themeClass.replace('theme-', '');
      if (themeColors[themeName]) {
        meta.setAttribute('content', themeColors[themeName]);
        return;
      }
    }
    // Default to light
    meta.setAttribute('content', themeColors.light);
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TGCXFDW5"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TGCXFDW5');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1076529024580635');
            fbq('track', 'PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1076529024580635&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        {/* Microsoft Clarity */}
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uza07roaql");`,
          }}
        />
        {/* End Microsoft Clarity */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <SessionProvider>{children}</SessionProvider>
          <WhatsAppButton />
          <div className="fixed bottom-2 right-2 z-50 text-s text-gray-400 select-none">
            {APP_VERSION}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
