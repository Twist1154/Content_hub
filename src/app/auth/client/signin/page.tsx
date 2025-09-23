'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import { BackButton } from '@/components/ui/back-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';


export default function ClientSignIn() {

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton href="/" label="Back to home" />
          <Breadcrumb 
            items={[
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

                <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link
                    href="/auth/client/signup"
                    className="font-medium text-primary hover:underline"
                    >
                    Sign up here
                    </Link>
                </p>
                </div>

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
