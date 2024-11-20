import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      <div className="relative w-full max-w-4xl space-y-12 px-4 text-center z-10">
        <div className="space-y-6">
          <h1 className="text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 sm:text-7xl">
            Welcome vro
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-gray-600 dark:text-gray-400">
            Discover cool ass stuff and put your own shit that you can sell
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto min-w-[200px] text-lg h-12"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-w-[200px] text-lg h-12"
          >
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
      <div className="absolute inset-0 blur-3xl opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute z-[-50] inset-y-0 right-1/2 -left-[40%] bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900 dark:to-cyan-900 transform rotate-12" />
        <div className="absolute z-[-50] inset-y-0 left-1/2 -right-[40%] bg-gradient-to-r from-rose-100 to-teal-100 dark:from-rose-900 dark:to-teal-900 transform -rotate-12" />
      </div>
    </div>
  );
}
