'use client';

import { useRouter } from 'next/navigation';
import { Button } from './button';
import { ArrowLeft } from 'lucide-react';
import { Tooltip } from './tooltip';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label = 'Go back', className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Tooltip content={label}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleBack}
        className={cn(className)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
    </Tooltip>
  );
}
