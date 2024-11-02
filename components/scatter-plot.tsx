"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CustomAxes from "./customAxes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import THREE from "three";
import CameraController from "./cameraController";

interface DataPoint {
  x: number;
  y: number;
  z: number;
  category: string;
}

interface ScatterPlotProps {
  data: DataPoint[];
  pointSize: number;
  rotationSpeed: number;
  controls: {
    rotationSpeed: number;
    setRotationSpeed: (value: number) => void;
    pointSize: number;
    setPointSize: (value: number) => void;
  };
}

function Points({
  data,
  pointSize,
  isDark,
}: {
  data: DataPoint[];
  pointSize: number;
  isDark: boolean;
}) {
  // Adjust colors based on dark mode
  const categoryAColor = isDark ? [0.8, 0.2, 0.2] : [1, 0, 0]; // Lighter red in dark mode
  const categoryBColor = isDark ? [0.2, 0.2, 0.8] : [0, 0, 1]; // Lighter blue in dark mode

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={data.length}
          array={new Float32Array(data.flatMap((d) => [d.x, d.y, d.z]))}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={data.length}
          array={
            new Float32Array(
              data.flatMap((d) =>
                d.category === "A" ? categoryAColor : categoryBColor
              )
            )
          }
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial vertexColors size={pointSize} sizeAttenuation={true} />
    </points>
  );
}

export default function ScatterPlot({
  data,
  pointSize,
  rotationSpeed,
  controls,
}: ScatterPlotProps) {
  const { theme } = useTheme();

  const cameraControllerRef = useRef<any>(null);

  const handleReset = () => {
    // Reset controls state first
    controls.setRotationSpeed(1);
    controls.setPointSize(0.1);

    // Reset camera position after a short delay
    requestAnimationFrame(() => {
      if (cameraControllerRef.current) {
        cameraControllerRef.current.resetCamera();
      }
    });
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 rounded-lg border border-border">
        {" "}
        {/* Add border */}
        <Canvas
          camera={{ position: [10, 10, 10], fov: 60 }}
          style={{
            background:
              theme === "dark"
                ? "hsl(var(--background))"
                : "hsl(var(--background))",
            borderRadius: "0.5rem",
            width: "100%",
            height: "100%",
          }}
        >
          <ambientLight intensity={theme === "dark" ? 0.7 : 0.5} />
          <pointLight
            position={[10, 10, 10]}
            intensity={theme === "dark" ? 1.2 : 1}
          />

          <Points data={data} pointSize={pointSize} isDark={theme === "dark"} />

          <CustomAxes
            size={10}
            ticks={5}
            tickSize={0.2}
            labels={{
              x: "X Axis",
              y: "Y Axis",
              z: "Z Axis",
            }}
          />

          <CameraController
            ref={cameraControllerRef}
            onReset={handleReset}
            rotationSpeed={rotationSpeed}
            autoRotateSpeed={rotationSpeed * 2}
          />
        </Canvas>
      </div>

      {/* Overlay Controls */}
      <Card className="absolute top-4 right-4 w-64 bg-background/80 backdrop-blur-sm">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rotation Speed</label>
            <Slider
              value={[controls.rotationSpeed]}
              onValueChange={(value) => controls.setRotationSpeed(value[0])}
              min={0}
              max={2}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Point Size</label>
            <Slider
              value={[controls.pointSize]}
              onValueChange={(value) => controls.setPointSize(value[0])}
              min={0.05}
              max={0.3}
              step={0.01}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => controls.setRotationSpeed(0)}
              variant="outline"
              className="flex-1"
            >
              Stop Rotation
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
