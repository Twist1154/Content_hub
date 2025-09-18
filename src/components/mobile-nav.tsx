
"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "@/app/actions/auth-actions";
import { Logo } from "./logo";
import { ThemeSwitcher } from "./ui/ThemeSwitcher";

interface MobileNavProps {
  user: User | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open main menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader className="flex flex-row justify-between items-center">
          <SheetTitle>
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <Logo className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground">HapoHub</span>
            </Link>
          </SheetTitle>
           <ThemeSwitcher />
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-4">
          {user ? (
            <>
              <Link
                href={
                  user.user_metadata?.role === "admin" ? "/admin" : "/dashboard"
                }
                onClick={() => setIsOpen(false)}
              >
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Profile
                </Button>
              </Link>
              <Link href="/settings" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Settings
                </Button>
              </Link>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start"
                >
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/client/signin" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/client/signup" onClick={() => setIsOpen(false)}>
                <Button className="w-full justify-start">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
