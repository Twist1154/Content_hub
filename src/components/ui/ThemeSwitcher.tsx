// components/ui/ThemeSwitcher.tsx
'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
    const { setTheme, theme } = useTheme();

    // We need to wait for the component to mount to know the current theme
    // This avoids a hydration mismatch error.
    const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
    useEffect(() => setMounted(true), []);

    if (!mounted) {
    // Render a placeholder to prevent layout shift
    return <Button variant="outline" size="icon" disabled className="h-10 w-10" />;
    }

    return (
    <Button
      variant="ghost" // Using 'ghost' often looks better for icon-only buttons in a header
      size="icon"     // Using a dedicated 'icon' size is common and clean
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme" // More descriptive aria-label
    >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                 <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}