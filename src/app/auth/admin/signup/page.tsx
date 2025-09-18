
'use client';

import { RegistrationForm } from '@/components/registration-form';
import { BackButton } from '@/components/ui/back-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function AdminSignUp() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md mx-auto">
          <div className="mb-6">
            <BackButton href="/" label="Back to home" />
            <Breadcrumb 
              items={[
              { label: 'Home', href: '/' },
              { label: 'Admin Sign Up', current: true }
              ]} 
              className="mt-2"
            />
          </div>
          <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-foreground">Create an Admin Account</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">Join the administrative team</CardDescription>
            </CardHeader>
            <CardContent>
                <RegistrationForm userType="admin" />
                <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
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
