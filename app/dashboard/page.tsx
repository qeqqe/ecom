"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardData {
  items: any[];
  cart: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({ items: [], cart: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const itemsResponse = await fetch("http://localhost:3001/items", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const itemsData = await itemsResponse.json();

        const cartResponse = await fetch("http://localhost:3001/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const cartData = await cartResponse.json();

        setData({
          items: itemsData.items || [],
          cart: cartData.cart,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      <nav className="relative border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
              Dashboard
            </h1>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-6 space-y-8 z-10 relative">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item: any) => (
            <div
              key={item._id}
              className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col space-y-2">
                <h3 className="text-2xl font-bold">{item.name}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                <p className="text-lg font-bold">${item.price}</p>
                <Button className="mt-4" onClick={() => {}}>
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>

        {data.items.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No items available</h2>
            <p className="text-muted-foreground">
              Check back later for new items.
            </p>
          </div>
        )}
      </main>

      <div className="absolute inset-0 -z-10 blur-3xl opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-y-0 right-1/2 -left-[40%] bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900 dark:to-cyan-900 transform rotate-12" />
        <div className="absolute inset-y-0 left-1/2 -right-[40%] bg-gradient-to-r from-rose-100 to-teal-100 dark:from-rose-900 dark:to-teal-900 transform -rotate-12" />
      </div>
    </div>
  );
}
