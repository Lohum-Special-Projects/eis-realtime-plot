"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/themeToggle";
import { VisualizationComponent } from "@/components/VisualizationComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Visualization() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId");
  const channelId = searchParams.get("channelId");

  if (!testId || !channelId) {
    return (
      <div className="container mx-auto p-4">
        <Card className="w-full">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-700">Invalid Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Missing testId or channelId</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="text-sm text-muted-foreground">
            Visualizing Test ID: <span className="font-mono">{testId}</span>,
            Channel ID: <span className="font-mono">{channelId}</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <VisualizationComponent testId={testId} channelId={channelId} />
    </div>
  );
}
