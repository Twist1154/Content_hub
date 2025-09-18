import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">FileDrop</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost">Features</Button>
          <Button variant="ghost">Pricing</Button>
          <Button variant="ghost">Help</Button>
          <Button variant="ghost">Sign in</Button>
          <Button>Sign up</Button>
        </nav>
        <Button variant="outline" className="md:hidden">Menu</Button>
      </div>
    </header>
  );
}
