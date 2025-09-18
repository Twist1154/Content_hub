'use client'; // --- NEW: This page must be a client component to use the hook ---

import { AuthForm } from '@/components/auth-form';
import { BackButton } from '@/components/ui/back-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useGoogleOneTap } from '@/hooks/use-google-one-tap'; // --- NEW: Import the hook ---
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Note: The ToastProvider should ideally be in your root layout (app/layout.tsx)
// to be available on all pages. If it's only needed here, this is fine.

export default function ClientSignIn() {
  // --- NEW: Call the hook to activate Google One Tap on this page ---
  useGoogleOneTap();

  return (
    // THEME: Use theme variables for the background.
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton href="/" label="Back to home" />
          <Breadcrumb 
            items={[
              // Breadcrumb is already themed, no changes needed here
              { label: 'Home', href: '/' },
              { label: 'Client Sign In', current: true }
            ]} 
            className="mt-2"
          />
        </div>
        
        <Card className="w-full">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Client Sign In</CardTitle>
                <CardDescription className="mt-2">Access your content management dashboard</CardDescription>
            </CardHeader>
            <CardContent>
                <AuthForm mode="signin" userType="client" />

                {/* Sign up link */}
                <div className="text-center mt-6">
                {/* THEME: Use theme text colors */}
                <p className="text-sm text-muted-foreground">
                    Don&#39;t have an account?{' '}
                    <Link
                    href="/auth/client/signup"
                    // THEME: Use theme primary color for the link
                    className="font-medium text-primary hover:underline"
                    >
                    Sign up here
                    </Link>
                </p>
                </div>

                {/* Or use magic link */}
                <div className="text-center mt-2">
                <p className="text-sm text-muted-foreground">
                    Prefer passwordless?{' '}
                    <Link
                    href="/auth/client/magic-link"
                    className="font-medium text-primary hover:underline"
                    >
                    Use a magic link
                    </Link>
                </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
