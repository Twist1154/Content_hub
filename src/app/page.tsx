import { FileDrop } from "@/components/file-drop";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl px-4">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary font-headline">File Drop</h1>
          <p className="text-muted-foreground mt-2">Securely share your files with anyone, anywhere.</p>
        </header>
        <FileDrop />
      </div>
    </main>
  );
}
