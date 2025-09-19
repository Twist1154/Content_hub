
'use client';

import { usePasswordResetFlow } from '@/hooks/usePasswordResetFlow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { PasswordForm } from '@/components/auth/PasswordForm';

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
                            Your password has been changed successfully. You will be redirected to sign in.
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
                    <PasswordForm
                        isNewUser={false}
                        onSubmit={handleSubmit}
                        password={{ value: password, set: setPassword }}
                        confirmPassword={{ value: confirmPassword, set: setConfirmPassword }}
                        isLoading={status === 'submitting'}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
