import Link from "next/link";
import {Logo} from "./Logo";

export function Footer() {
    return (
        <footer className="w-full p-6 md:px-8 md:py-12 bg-muted border-t">
            <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-4 md:col-span-1">
                    <Link href="/" className="flex items-center gap-3">
                        <Logo className="h-8 w-8 text-primary"/>
                        <span className="text-xl font-bold text-foreground">HapoHub</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        A centralized content management platform for digital marketing materials.
                    </p>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
                    <div className="grid gap-1">
                        <h3 className="font-semibold">Products</h3>
                        <Link href="#" prefetch={false} className="hover:underline">
                            Creative Tools
                        </Link>
                        <Link href="#" prefetch={false} className="hover:underline">
                            Collaboration
                        </Link>
                        <Link href="#" prefetch={false} className="hover:underline">
                            Analytics
                        </Link>
                        <Link href="#" prefetch={false} className="hover:underline">
                            Pricing
                        </Link>
                    </div>
                    <div className="grid gap-1">
                        <h3 className="font-semibold">Company</h3>
                        <Link href="#" prefetch={false} className="hover:underline">
                            About Us
                        </Link>
                        <Link href="#" prefetch={false} className="hover:underline">
                            Careers
                        </Link>
                        <Link href="#" prefetch={false} className="hover:underline">
                            News
                        </Link>
                    </div>
                    <div className="grid gap-1">
                        <h3 className="font-semibold">Resources</h3>
                        <Link href="#" prefetch={false} className="hover:underline">
                            Blog
                        </Link>
                        <Link href="#" prefetch={false} className="hover:underline">
                            Help Center
                        </Link>
                        <Link href="/privacy" prefetch={false} className="hover:underline">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" prefetch={false} className="hover:underline">
                            Terms of Service
                        </Link>
                    </div>
                    <div className="grid gap-1">
                        <h3 className="font-semibold">Social</h3>
                        <Link href="#" prefetch={false} className="hover:underline">
                            Twitter
                        </Link>
                        <Link href="#" prefetch={false} className="hover:underline">
                            Instagram
                        </Link>
                        <Link href="#" prefetch={false} className="hover:underline">
                            LinkedIn
                        </Link>
                    </div>
                </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-8" >
                © {new Date().getFullYear()} HapoHub. All rights reserved.
            </p>
        </footer>
    );
}
