'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { FormField } from '../ui/form-field';

interface PasswordFormProps {
    isNewUser: boolean;
    onSubmit: (e: React.FormEvent) => void;
    password: { value: string; set: (value: string) => void };
    confirmPassword: { value: string; set: (value: string) => void };
    isLoading: boolean;
}

export function PasswordForm({ isNewUser, onSubmit, password, confirmPassword, isLoading }: PasswordFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <FormField label={isNewUser ? 'Create Password' : 'New Password'} icon={Lock}>
                <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password.value}
                    onChange={(e) => password.set(e.target.value)}
                    required
                    className="pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </FormField>
            <p className="text-xs text-muted-foreground -mt-2">
                At least 8 characters with one letter and one number.
            </p>

            <FormField label="Confirm Password" icon={Lock}>
                <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword.value}
                    onChange={(e) => confirmPassword.set(e.target.value)}
                    required
                    className="pl-10 pr-10"
                />
            </FormField>
            
            <Button type="submit" className="w-full" disabled={isLoading || !password.value || !confirmPassword.value}>
                {isLoading ? (
                    <LoadingSpinner size="sm" text={isNewUser ? "Setting Password..." : "Updating..."} />
                ) : (
                    isNewUser ? 'Set Password & Continue' : 'Update Password'
                )}
            </Button>

            {isNewUser && (
                <div className="mt-6 p-4 bg-accent/50 border border-accent rounded-lg flex items-start gap-3">
                    <Shield className="w-5 h-5 text-accent-foreground mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-medium text-accent-foreground">Next Steps</h4>
                        <p className="text-sm text-accent-foreground/90 mt-1">
                            You&apos;ll be guided to set up your store information to complete your account.
                        </p>
                    </div>
                </div>
            )}
        </form>
    );
}
