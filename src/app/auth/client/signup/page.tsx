
'use client';

import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { BackButton } from '@/components/ui/back-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import Link from 'next/link';

export default function ClientSignUp() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg mx-auto">
          <div className="mb-6">
            <BackButton href="/" label="Back to home" />
            <Breadcrumb 
              items={[
              { label: 'Home', href: '/' },
              { label: 'Client Sign Up', current: true }
              ]} 
              className="mt-2"
            />
          </div>
          
          <RegistrationForm userType="client" />

          <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                  href="/auth/client/signin"
                  className="font-medium text-primary hover:underline"
                  >
                  Sign in here
                  </Link>
              </p>
          </div>
      </div>
    </div>
  );
}
