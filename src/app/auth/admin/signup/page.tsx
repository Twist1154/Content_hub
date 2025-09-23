
'use client';

import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { BackButton } from '@/components/ui/BackButton';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import Link from 'next/link';

export default function AdminSignUp() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg mx-auto">
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
      </div>
    </div>
  );
}

