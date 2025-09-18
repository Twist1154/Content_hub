
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { sendMagicLink } from '@/app/actions/auth-actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 animate-spin" />}
      Send Magic Link
    </Button>
  );
}

export function MagicLinkForm() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(sendMagicLink, null);

  useEffect(() => {
    if (!state) return;
    
    if (state.success) {
      toast({
        title: 'Check your email',
        description: state.message,
      });
    } else {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" required />
      </div>
      <SubmitButton />
    </form>
  );
}
