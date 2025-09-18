
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Mail, Lock, Chrome, Eye, EyeOff, Loader2, User, Smartphone } from 'lucide-react';
import { useAuthForm } from '@/hooks/useAuthForm';
import Link from 'next/link';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  userType?: 'client' | 'admin';
}

export function AuthForm({ mode, userType = 'client' }: AuthFormProps) {
  const {
    formData,
    errors,
    loading,
    googleLoading,
    handleInputChange,
    handleBlur,
    handleSubmit,
    signInWithGoogle,
  } = useAuthForm(mode, userType);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="space-y-4 mb-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={signInWithGoogle}
          disabled={googleLoading || loading}
        >
          <Chrome className="w-4 h-4 mr-2" />
          {googleLoading ? 'Connecting...' : `${mode === 'signin' ? 'Sign in' : 'Sign up'} with Google`}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
              </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" error={errors.fullName}>
              <Input
                name="fullName"
                placeholder="e.g., Jane Doe"
                value={formData.fullName || ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                required
              />
            </FormField>
             <FormField label="Username" error={errors.username}>
              <Input
                name="username"
                placeholder="e.g., jane_doe"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                required
              />
            </FormField>
          </div>
        )}

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
        
        {mode === 'signup' && (
          <FormField label="Phone Number" icon={Smartphone} error={errors.phoneNumber}>
            <Input
              name="phoneNumber"
              type="tel"
              placeholder="e.g., (123) 456-7890"
              value={formData.phoneNumber || ''}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              onBlur={() => handleBlur('phoneNumber')}
              required
              className="pl-10"
            />
          </FormField>
        )}

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
        
        {mode === 'signup' && (
          <FormField label="Confirm Password" icon={Lock} error={errors.confirmPassword}>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword || ''}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              required
              className="pl-10 pr-10"
            />
          </FormField>
        )}

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
            disabled={loading || googleLoading}
        >
            {loading && <Loader2 className="animate-spin mr-2" />}
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>
    </>
  );
}
