
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { BackButton } from '@/components/ui/back-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';


export default function ClientMagicLinkSignIn() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton href="/auth/client/signin" label="Back to Sign In" />
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Client Sign In', href: '/auth/client/signin' },
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
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
