import { FileDrop } from "@/components/file-drop";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background overflow-hidden">
      <Image
        src="https://picsum.photos/seed/1/1920/1080"
        alt="Background"
        fill
        className="object-cover -z-10"
        data-ai-hint="nature landscape"
      />
      <div className="w-full max-w-lg md:max-w-xl px-4">
        <FileDrop />
      </div>
    </main>
  );
}
