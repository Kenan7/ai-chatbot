'use client';

import { Check, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const themes = [
  {
    name: 'Default Light',
    value: 'light',
    description: 'Clean white theme',
    colors: {
      primary: 'hsl(240, 5.9%, 10%)',
      secondary: 'hsl(240, 4.8%, 95.9%)',
      background: 'hsl(0, 0%, 100%)',
      accent: 'hsl(240, 4.8%, 95.9%)',
    },
  },
  {
    name: 'Forest Green',
    value: 'forest',
    description: 'Deep forest vibes',
    colors: {
      primary: 'hsl(120, 35%, 25%)',
      secondary: 'hsl(120, 15%, 90%)',
      background: 'hsl(120, 20%, 97%)',
      accent: 'hsl(120, 25%, 85%)',
    },
  },
  {
    name: 'Sage Green',
    value: 'sage',
    description: 'Calming sage tones',
    colors: {
      primary: 'hsl(75, 25%, 35%)',
      secondary: 'hsl(60, 12%, 88%)',
      background: 'hsl(60, 15%, 97%)',
      accent: 'hsl(60, 20%, 83%)',
    },
  },
  {
    name: 'Emerald',
    value: 'emerald',
    description: 'Vibrant emerald green',
    colors: {
      primary: 'hsl(160, 65%, 30%)',
      secondary: 'hsl(160, 20%, 88%)',
      background: 'hsl(160, 25%, 97%)',
      accent: 'hsl(160, 30%, 82%)',
    },
  },
  {
    name: 'Mint',
    value: 'mint',
    description: 'Fresh mint green',
    colors: {
      primary: 'hsl(170, 45%, 32%)',
      secondary: 'hsl(180, 25%, 90%)',
      background: 'hsl(180, 30%, 98%)',
      accent: 'hsl(180, 35%, 85%)',
    },
  },
  {
    name: 'Jade',
    value: 'jade',
    description: 'Elegant jade green',
    colors: {
      primary: 'hsl(150, 55%, 28%)',
      secondary: 'hsl(150, 18%, 89%)',
      background: 'hsl(150, 22%, 97%)',
      accent: 'hsl(150, 28%, 84%)',
    },
  },
  {
    name: 'Pine',
    value: 'pine',
    description: 'Natural pine green',
    colors: {
      primary: 'hsl(140, 60%, 20%)',
      secondary: 'hsl(140, 15%, 88%)',
      background: 'hsl(140, 18%, 97%)',
      accent: 'hsl(140, 22%, 83%)',
    },
  },
  {
    name: 'Seafoam',
    value: 'seafoam',
    description: 'Ocean seafoam green',
    colors: {
      primary: 'hsl(165, 50%, 30%)',
      secondary: 'hsl(165, 25%, 91%)',
      background: 'hsl(165, 35%, 98%)',
      accent: 'hsl(165, 40%, 86%)',
    },
  },
  {
    name: 'Olive',
    value: 'olive',
    description: 'Earthy olive green',
    colors: {
      primary: 'hsl(85, 35%, 28%)',
      secondary: 'hsl(80, 12%, 89%)',
      background: 'hsl(80, 15%, 97%)',
      accent: 'hsl(80, 18%, 84%)',
    },
  },
  {
    name: 'Eucalyptus',
    value: 'eucalyptus',
    description: 'Soothing eucalyptus',
    colors: {
      primary: 'hsl(155, 40%, 26%)',
      secondary: 'hsl(155, 15%, 88%)',
      background: 'hsl(155, 20%, 97%)',
      accent: 'hsl(155, 25%, 83%)',
    },
  },
  {
    name: 'Dark Mode',
    value: 'dark',
    description: 'Classic dark theme',
    colors: {
      primary: 'hsl(0, 0%, 98%)',
      secondary: 'hsl(240, 3.7%, 15.9%)',
      background: 'hsl(240, 10%, 3.9%)',
      accent: 'hsl(240, 3.7%, 15.9%)',
    },
  },
];

interface ThemeSelectorProps {
  variant?: 'button' | 'menuItem';
}

export function ThemeSelector({ variant = 'button' }: ThemeSelectorProps) {
  const { setTheme, theme: currentTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (themeValue: string) => {
    if (themeValue === 'light' || themeValue === 'dark') {
      // For default themes, remove any theme classes and use default
      document.documentElement.className = document.documentElement.className
        .replace(/theme-\w+/g, '')
        .trim();
      setTheme(themeValue);
    } else {
      // For custom themes, add theme class and set to light mode
      document.documentElement.className = document.documentElement.className
        .replace(/theme-\w+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      document.documentElement.classList.add(`theme-${themeValue}`);
      setTheme('light'); // Use light as base for all custom themes
    }
  };

  if (!mounted) {
    return null;
  }

  const getCurrentThemeValue = () => {
    if (document.documentElement.classList.contains('theme-forest')) return 'forest';
    if (document.documentElement.classList.contains('theme-sage')) return 'sage';
    if (document.documentElement.classList.contains('theme-emerald')) return 'emerald';
    if (document.documentElement.classList.contains('theme-mint')) return 'mint';
    if (document.documentElement.classList.contains('theme-jade')) return 'jade';
    if (document.documentElement.classList.contains('theme-pine')) return 'pine';
    if (document.documentElement.classList.contains('theme-seafoam')) return 'seafoam';
    if (document.documentElement.classList.contains('theme-olive')) return 'olive';
    if (document.documentElement.classList.contains('theme-eucalyptus')) return 'eucalyptus';
    return currentTheme || 'light';
  };

  const currentThemeValue = getCurrentThemeValue();

  if (variant === 'menuItem') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground px-2 py-1.5 text-sm outline-none transition-colors rounded-sm">
            <Palette className="w-4 h-4 mr-2" />
            Change theme
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-80">
          <DropdownMenuLabel>Choose a theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="grid grid-cols-2 gap-1 p-1">
            {themes.map((theme) => (
              <DropdownMenuItem
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                className="flex flex-col items-start p-3 cursor-pointer relative"
              >
                {currentThemeValue === theme.value && (
                  <Check className="w-4 h-4 absolute top-2 right-2 text-primary" />
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                  <span className="font-medium text-sm">{theme.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {theme.description}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="w-4 h-4" />
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Choose a theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-2 gap-1 p-1">
          {themes.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              className="flex flex-col items-start p-3 cursor-pointer relative"
            >
              {currentThemeValue === theme.value && (
                <Check className="w-4 h-4 absolute top-2 right-2 text-primary" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                <span className="font-medium text-sm">{theme.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {theme.description}
              </span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
