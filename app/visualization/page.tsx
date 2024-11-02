"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
// import ScatterPlot from "@/components/ScatterPlot";
import { ThemeToggle } from "@/components/themeToggle";
import ScatterPlot from "@/components/scatter-plot";

interface DataPoint {
  x: number;
  y: number;
  z: number;
  category: string;
}

const generateRandomData = (length: number): DataPoint[] =>
  Array.from({ length }, () => ({
    x: Math.random() * 10 - 5,
    y: Math.random() * 10 - 5,
    z: Math.random() * 10 - 5,
    category: Math.random() > 0.5 ? "A" : "B",
  }));

export default function Visualization() {
  const router = useRouter();
  const [controls, setControls] = useState({
    rotationSpeed: 1,
    pointSize: 0.1,
  });
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [pointSize, setPointSize] = useState(0.1);

  const { data = [], isLoading } = useQuery<DataPoint[]>({
    queryKey: ["scatterData"],
    queryFn: async () => generateRandomData(50),
    refetchInterval: 3000,
    staleTime: 2000,
  });

  const handleRotationSpeedChange = useCallback((value: number) => {
    setControls((prev) => ({ ...prev, rotationSpeed: value }));
  }, []);

  const handlePointSizeChange = useCallback((value: number) => {
    setControls((prev) => ({ ...prev, pointSize: value }));
  }, []);

  const plotControls = useMemo(
    () => ({
      rotationSpeed: controls.rotationSpeed,
      setRotationSpeed: handleRotationSpeedChange,
      pointSize: controls.pointSize,
      setPointSize: handlePointSizeChange,
    }),
    [
      controls.rotationSpeed,
      controls.pointSize,
      handleRotationSpeedChange,
      handlePointSizeChange,
    ]
  );

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
            <Suspense fallback={<div>Loading 3D visualization...</div>}>
              <ScatterPlot
                data={data}
                pointSize={controls.pointSize}
                rotationSpeed={controls.rotationSpeed}
                controls={plotControls}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
