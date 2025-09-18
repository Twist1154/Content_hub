
'use client';

import { usePasswordResetFlow } from '@/hooks/usePasswordResetFlow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function ResetPasswordPage() {
    const {
        status,
        userEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        handleSubmit,
    } = usePasswordResetFlow();
    
    const [showPassword, setShowPassword] = useState(false);

    if (status === 'validating') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8">
                        <LoadingSpinner size="lg" text="Validating link..." />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (status === 'error') {
         return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
                        <CardTitle>Link Invalid or Expired</CardTitle>
                        <CardDescription>
                            The password reset link is not valid. Please request a new one.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => window.location.href = '/auth/client/signin'}>
                            Back to Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (status === 'success') {
         return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CheckCircle className="w-12 h-12 mx-auto text-chart-2" />
                        <CardTitle>Password Updated!</CardTitle>
                        <CardDescription>
                            Your password has been changed successfully. Redirecting you to the dashboard...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <LoadingSpinner size="md" />
                    </CardContent>
                </Card>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Reset Your Password</CardTitle>
                    <CardDescription>
                        Enter a new password for {userEmail}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField label="New Password" icon={Lock}>
                           <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pl-10 pr-10"
                            />
                             <button
                                type="button"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </FormField>
                        
                         <FormField label="Confirm New Password" icon={Lock}>
                           <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="pl-10 pr-10"
                            />
                        </FormField>

                        <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                            {status === 'submitting' ? <LoadingSpinner size="sm" text="Updating..." /> : 'Set New Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
