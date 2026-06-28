import { Navbar } from '@/components/navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-6 text-center">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight">CS2 Skin Pricer</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Find overvalued and undervalued CS2 skins using machine learning.
          </p>
        </div>
      </main>
    </>
  );
}
