import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
import HeroSlider from "@/components/hero-slider";

// Reusable component for feature sections
function FeatureSection({
  imageUrl,
  imageAlt,
  imageHint,
  badgeText,
  title,
  description,
  buttonText,
  imagePosition = "left",
}: {
  imageUrl: string;
  imageAlt: string;
  imageHint: string;
  badgeText: string;
  title: string;
  description: string;
  buttonText: string;
  imagePosition?: "left" | "right";
}) {
  const imageWidth = imageUrl.split("/")[imageUrl.split("/").length - 2];
  const imageHeight = imageUrl.split("/").pop();

  const imageEl = (
    <Image
      alt={imageAlt}
      className={`mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full ${
        imagePosition === "right" ? "lg:order-2" : "lg:order-1"
      }`}
      data-ai-hint={imageHint}
      height={imageHeight ? parseInt(imageHeight) : 400}
      src={imageUrl}
      width={imageWidth ? parseInt(imageWidth) : 600}
    />
  );

  const textEl = (
    <div
      className={`space-y-4 ${
        imagePosition === "right" ? "lg:order-1" : "lg:order-2"
      }`}
    >
      <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
        {badgeText}
      </div>
      <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
        {title}
      </h2>
      <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-justify">
        {description}
      </p>
      <Button>{buttonText}</Button>
    </div>
  );

  return (
    <section
      className={`w-full py-12 md:py-24 lg:py-32 ${
        imagePosition === "right" ? "bg-muted" : "bg-background"
      }`}
    >
      <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
        {imagePosition === "left" ? (
          <>
            {imageEl}
            {textEl}
          </>
        ) : (
          <>
            {textEl}
            {imageEl}
          </>
        )}
      </div>
    </section>
  );
}

// Reusable component for brand logos
function BrandLogos() {
  const logos = [
    "google",
    "spotify",
    "netflix",
    "amazon",
    "facebook",
    "samsung",
  ];
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Trusted by the world’s biggest brands
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-justify">
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
  );
}

export default function Home() {
  const featureImage1 = {
    imageUrl: "https://picsum.photos/seed/1/600/400",
    imageHint: "office creative team"
  };
  const featureImage2 = {
    imageUrl: "https://picsum.photos/seed/2/600/400",
    imageHint: "team working on laptops"
  };
  const featureImage3 = {
    imageUrl: "https://picsum.photos/seed/3/600/400",
    imageHint: "brand advertisement display"
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HeroSlider />

      <BrandLogos />

      <FeatureSection
        imageUrl={featureImage1.imageUrl}
        imageAlt="Creative Tools Feature"
        imageHint={featureImage1.imageHint}
        badgeText="Creative Tools"
        title="Showcase your work"
        description="Our platform offers a beautiful and intuitive way to present your creative projects. Customize layouts, add context, and bring your work to life."
        buttonText="Learn More"
        imagePosition="left"
      />

      <FeatureSection
        imageUrl={featureImage2.imageUrl}
        imageAlt="Collaboration Feature"
        imageHint={featureImage2.imageHint}
        badgeText="Collaboration"
        title="Work together, seamlessly"
        description="Invite team members, share feedback, and manage versions—all in one place. Streamline your creative workflow and get more done."
        buttonText="Learn More"
        imagePosition="right"
      />

      <FeatureSection
        imageUrl={featureImage3.imageUrl}
        imageAlt="Audience Engagement Feature"
        imageHint={featureImage3.imageHint}
        badgeText="Audience Engagement"
        title="Connect with your audience"
        description="Share your work with the world. Our platform makes it easy to distribute your content and track its performance."
        buttonText="Learn More"
        imagePosition="left"
      />

      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to get started?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-justify">
              Sign up today and start sharing your creative work with the
              world.
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
        {/*Footer section */}
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
    </main>
  );
}
