
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { BackButton } from '@/components/ui/BackButton';
import { Breadcrumb } from '@/components/ui/Breadcrumb';


export default function AdminMagicLinkSignIn() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton href="/auth/admin/signin" label="Back to Sign In" />
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Admin Sign In', href: '/auth/admin/signin' },
              { label: 'Magic Link', current: true },
            ]}
            className="mt-2"
          />
        </div>
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-foreground">Passwordless Sign-In</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                    Enter your email to receive a magic link to sign in.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MagicLinkForm />
                 <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        Remembered your password?{' '}
                        <Link
                        href="/auth/admin/signin"
                        className="font-medium text-primary hover:underline"
                        >
                        Sign in here
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
