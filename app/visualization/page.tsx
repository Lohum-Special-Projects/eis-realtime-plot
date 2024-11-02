"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ScatterPlot from "@/components/scatter-plot";
import { ThemeToggle } from "@/components/themeToggle";

interface DataPoint {
  x: number;
  y: number;
  z: number;
  category: string;
}

export default function Visualization() {
  const router = useRouter();
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [pointSize, setPointSize] = useState(0.1);

  const { data = [], isLoading } = useQuery<DataPoint[]>({
    queryKey: ["scatterData"],
    queryFn: async () => {
      return Array.from({ length: 50 }, () => ({
        x: Math.random() * 10 - 5,
        y: Math.random() * 10 - 5,
        z: Math.random() * 10 - 5,
        category: Math.random() > 0.5 ? "A" : "B",
      }));
    },
    refetchInterval: 3000,
  });

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <ThemeToggle />
      </div>

      <div className="flex-grow relative">
        <div className="absolute inset-0 bg-muted rounded-lg">
          {!isLoading && (
            <ScatterPlot
              data={data}
              pointSize={pointSize}
              rotationSpeed={rotationSpeed}
              controls={{
                rotationSpeed,
                setRotationSpeed,
                pointSize,
                setPointSize,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
