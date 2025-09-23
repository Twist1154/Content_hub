import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full p-6 md:px-8 md:py-12 bg-muted">
      <div className="container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
        <div className="grid gap-1">
          <h3 className="font-semibold">Company</h3>
          <Link href="#" prefetch={false} className="hover:underline">
            About Us
          </Link>
          <Link href="#" prefetch={false} className="hover:underline">
            Our Team
          </Link>
          <Link href="#" prefetch={false} className="hover:underline">
            Careers
          </Link>
          <Link href="#" prefetch={false} className="hover:underline">
            News
          </Link>
        </div>
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
          <h3 className="font-semibold">Community</h3>
          <Link href="#" prefetch={false} className="hover:underline">
            Forums
          </Link>
          <Link href="#" prefetch={false} className="hover:underline">
            Events
          </Link>
          <Link href="#" prefetch={false} className="hover:underline">
            Ambassadors
          </Link>
          <Link href="#" prefetch={false} className="hover:underline">
            Submit a project
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
            Dribbble
          </Link>
          <Link href="#" prefetch={false} className="hover:underline">
            LinkedIn
          </Link>
        </div>
      </div>
    </footer>
  );
}
