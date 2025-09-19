'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import { BackButton } from '@/components/ui/back-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminSignInPage() {
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
            <BackButton href="/" label="Back to Home" />
            <Breadcrumb
                items={[
                    { label: 'Home', href: '/' },
                    { label: 'Admin Sign In', current: true },
                ]}
                className="mt-2"
            />
        </div>
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Admin Sign In</CardTitle>
                <CardDescription>Enter your credentials to access the admin console.</CardDescription>
            </CardHeader>
            <CardContent>
                <AuthForm mode="signin" userType="admin" />
                 <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                        Need an admin account?{' '}
                        <Link
                        href="/auth/admin/signup"
                        className="font-medium text-primary hover:underline"
                        >
                        Sign up here
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
