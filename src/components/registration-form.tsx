'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions/auth-actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface RegistrationFormProps {
  userType: 'client' | 'admin';
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 animate-spin" />}
      Sign Up
    </Button>
  );
}

export function RegistrationForm({ userType }: RegistrationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [state, formAction] = useActionState(registerUser, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast({ title: 'Success', description: 'Registration successful! Please sign in.' });
      router.push(`/auth/${userType}/signin`);
    } else {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, router, toast, userType]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder={userType === 'admin' ? "admin@example.com" : "m@example.com"} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <input type="hidden" name="role" value={userType} />
      <SubmitButton />
    </form>
  );
}
