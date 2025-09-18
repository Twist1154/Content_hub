'use client';

import { useRouter } from 'next/navigation';
import { Button } from './button';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
    href?: string;
    label: string;
}

export function BackButton({ href, label }: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button variant="ghost" onClick={handleClick} className="p-0 h-auto">
      <ChevronLeft className="mr-2" />
      {label}
    </Button>
  );
}
