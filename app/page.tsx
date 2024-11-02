"use client";

import { ThemeToggle } from "@/components/themeToggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleNavigation = () => {
    try {
      router.push("/visualization");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold tracking-tight font-sans">
              Real-time Data Visualization
            </CardTitle>
            <CardDescription className="text-xl mt-4 font-sans">
              Interactive 3D scatter plot visualization with real-time updates
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <p className="text-muted-foreground text-center max-w-md font-sans">
              Explore your data in an interactive 3D environment with
              customizable controls and real-time updates.
            </p>
            <Button
              size="lg"
              className="w-full max-w-sm"
              onClick={handleNavigation}
            >
              Launch Visualization
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
