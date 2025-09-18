'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MagicLinkPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Passwordless Sign-In</CardTitle>
          <CardDescription>
            Enter your email to receive a magic link to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send Magic Link
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
                <Link href="/auth/client/signin" className="underline">
                Back to Sign In
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
