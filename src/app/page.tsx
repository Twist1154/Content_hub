import { Button } from "@/components/ui/button";
import { FileDrop } from "@/components/file-drop";
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Logo } from "@/components/logo";

export default function Home() {
  const logos = [
    "google",
    "spotify",
    "netflix",
    "amazon",
    "facebook",
    "samsung",
  ];
  const featureImage1 = PlaceHolderImages[0];
  const featureImage2 = PlaceHolderImages[1];
  const featureImage3 = PlaceHolderImages[2];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="relative w-full h-screen flex items-center justify-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover -z-10"
          src="https://assets.mixkit.co/videos/preview/mixkit-a-girl-looking-at-the-ocean-from-a-cliff-4527-large.mp4"
        />
        <div className="w-full max-w-lg mx-auto p-4 md:max-w-2xl">
          <FileDrop />
        </div>
      </div>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Trusted by the world’s biggest brands
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform helps creatives and brands of all sizes to connect
                with a global audience.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-2 items-center gap-6 py-12 sm:grid-cols-3 lg:grid-cols-6 lg:gap-12">
            {logos.map((logo) => (
              <div key={logo} className="flex justify-center">
                <Logo className="h-9 w-24 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <Image
            alt="Image"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
            data-ai-hint="office creative team"
            height={featureImage1.imageUrl.split("/").pop()!}
            src={featureImage1.imageUrl}
            width={featureImage1.imageUrl.split("/")[
              featureImage1.imageUrl.split("/").length - 2
            ]!}
          />
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Creative Tools
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Showcase your work
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform offers a beautiful and intuitive way to present your
              creative projects. Customize layouts, add context, and bring your
              work to life.
            </p>
            <Button>Learn More</Button>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-4 lg:order-2">
            <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">
              Collaboration
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Work together, seamlessly
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Invite team members, share feedback, and manage versions—all in
              one place. Streamline your creative workflow and get more done.
            </p>
            <Button>Learn More</Button>
          </div>
          <Image
            alt="Image"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-1"
            data-ai-hint="team working on laptops"
            height={featureImage2.imageUrl.split("/").pop()!}
            src={featureImage2.imageUrl}
            width={featureImage2.imageUrl.split("/")[
              featureImage2.imageUrl.split("/").length - 2
            ]!}
          />
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <Image
            alt="Image"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
            data-ai-hint="brand advertisement display"
            height={featureImage3.imageUrl.split("/").pop()!}
            src={featureImage3.imageUrl}
            width={featureImage3.imageUrl.split("/")[
              featureImage3.imageUrl.split("/").length - 2
            ]!}
          />
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Audience Engagement
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Connect with your audience
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Share your work with the world. Our platform makes it easy to
              distribute your content and track its performance.
            </p>
            <Button>Learn More</Button>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to get started?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Sign up today and start sharing your creative work with the world.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-x-2 flex">
            <Link href="/auth/client/signup" className="w-full">
              <Button className="w-full">Sign Up</Button>
            </Link>
            <Link href="/auth/client/signin" className="w-full">
              <Button variant="secondary" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
            <Link href="#" prefetch={false} className="hover-underline">
              API Documentation
            </Link>
            <Link href="#" prefetch={false} className="hover:underline">
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
    </main>
  );
}
