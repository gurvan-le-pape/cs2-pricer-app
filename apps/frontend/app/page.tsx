import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">CS2 Skin Pricer</h1>
      <p className="text-muted-foreground">Find overvalued and undervalued CS2 skins using machine learning.</p>
      <Button className="bg-[#1b2838] hover:bg-[#2a475e] text-white">
        Sign in with Steam
      </Button>
    </main>
  );
}