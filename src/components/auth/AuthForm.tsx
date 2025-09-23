// src/components/auth/AuthForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthForm } from '@/hooks/useAuthForm';
import Link from 'next/link';
import { RegistrationForm } from './RegistrationForm';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  userType?: 'client' | 'admin';
}

export function AuthForm({ mode, userType = 'client' }: AuthFormProps) {
  const {
    formData,
    errors,
    loading,
    handleInputChange,
    handleBlur,
    handleSubmit,
  } = useAuthForm(mode, userType);

  const [showPassword, setShowPassword] = useState(false);

  if (mode === 'signup') {
    return <RegistrationForm userType={userType} />;
  }

  return (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
            </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email" icon={Mail} error={errors.email}>
        <Input
          type="email"
              name="email"
              placeholder="Email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
          required
          className="pl-10"
        />
        </FormField>
        
        <FormField label="Password" icon={Lock} error={errors.password}>
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password || ''}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            required
            className="pl-10 pr-10"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </FormField>
        
        {mode === 'signin' && (
          <div className="text-right">
            <Link href="/auth/reset-password" className="text-sm text-muted-foreground hover:underline">
              Forgot your password?
            </Link>
          </div>
        )}
        
        <Button
            type="submit"
            className="w-full"
            disabled={loading}
        >
            {loading && <Loader2 className="animate-spin mr-2" />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </Button>
      </form>
    </>
  );
}
