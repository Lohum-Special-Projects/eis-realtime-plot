"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Stats,
  OrbitControls,
} from "@react-three/drei";
import CustomAxes from "./customAxes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "next-themes";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import CameraController from "./cameraController";
import FPSCounter from "./fpsCounter";
import { Legend } from "./ScatterPlotLegend";
import { Point3D, ProcessedPoint } from "@/types";

export interface ScatterPlotProps {
  data: (Point3D | ProcessedPoint)[];
  pointSize: number;
  rotationSpeed: number;
  controls: {
    rotationSpeed: number;
    setRotationSpeed: (value: number) => void;
    pointSize: number;
    setPointSize: (value: number) => void;
  };
}

// First part of Points.tsx
export const Points = memo(function Points({
  data,
  pointSize,
  isDark,
}: {
  data: (Point3D | ProcessedPoint)[];
  pointSize: number;
  isDark: boolean;
}) {
  const categoryColors = {
    A: isDark ? [1, 0.4, 0.4] : [1, 0.2, 0.2],
    B: isDark ? [0.4, 1, 0.4] : [0.2, 1, 0.2],
    C: isDark ? [0.4, 0.4, 1] : [0.2, 0.2, 1],
  } as const;

  const highlightedColors = {
    A: [1, 0.9, 0],
    B: [1, 0.9, 0],
    C: [1, 0.9, 0],
  } as const;

  type Category = keyof typeof categoryColors;

  const [geometry, sizes] = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(data.length * 3);
    const colors = new Float32Array(data.length * 3);
    const sizes = new Float32Array(data.length);

    data.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;

      const color = point.isHighlighted
        ? highlightedColors[point.category as Category]
        : categoryColors[point.category as Category];

      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];

      // Make points more visible when zoomed
      sizes[i] = point.isHighlighted ? pointSize * 8 : pointSize * 3;
    });

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return [geometry, sizes];
  }, [data, categoryColors, highlightedColors, pointSize]);

  const pointTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = "white";
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <points>
      <primitive object={geometry} />
      <pointsMaterial
        vertexColors
        size={pointSize}
        sizeAttenuation={true}
        map={pointTexture}
        alphaTest={0.5}
        transparent={true}
        depthWrite={false}
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </points>
  );
});

export const Controls = memo(function Controls({
  controls,
  onReset,
}: {
  controls: ScatterPlotProps["controls"];
  onReset: () => void;
}) {
  return (
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
            min={0.01}
            max={0.5}
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
          <Button onClick={onReset} variant="outline" className="flex-1">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

const ScatterPlot = memo(function ScatterPlot({
  data,
  pointSize,
  rotationSpeed,
  controls,
}: ScatterPlotProps) {
  const { theme } = useTheme();
  const cameraControllerRef = useRef<any>(null);

  const handleReset = useCallback(() => {
    controls.setRotationSpeed(1);
    controls.setPointSize(0.1);
    requestAnimationFrame(() => {
      if (cameraControllerRef.current) {
        cameraControllerRef.current.resetCamera();
      }
    });
  }, [controls]);

  // Memoize canvas style
  const canvasStyle = useMemo(
    () => ({
      background:
        theme === "dark" ? "hsl(var(--background))" : "hsl(var(--background))",
      borderRadius: "0.5rem",
      width: "100%",
      height: "100%",
    }),
    [theme]
  );

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 rounded-lg border border-border">
        <Canvas
          camera={{ position: [3, 3, 3], fov: 45, near: 0.01, far: 100 }}
          style={canvasStyle}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
          dpr={[1, 2]} // Adaptive DPR for better performance
          frameloop="demand"
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />

          <Stats />
          <FPSCounter />

          <ambientLight intensity={theme === "dark" ? 0.7 : 0.5} />
          <pointLight
            position={[10, 10, 10]}
            intensity={theme === "dark" ? 1.2 : 1}
          />

          <CustomAxes
            size={1}
            ticks={5}
            tickSize={0.02}
            labels={{
              x: "X Axis",
              y: "Y Axis",
              z: "Z Axis",
            }}
          />

          <Points data={data} pointSize={pointSize} isDark={theme === "dark"} />

          <CameraController
            ref={cameraControllerRef}
            onReset={handleReset}
            rotationSpeed={rotationSpeed}
            autoRotateSpeed={rotationSpeed * 2}
          />
        </Canvas>
      </div>

      {data.some((point) => point.isHighlighted) && (
        <div className="absolute top-4 left-4 bg-yellow-500/90 text-black p-3 rounded-md animate-pulse">
          New data point added!
        </div>
      )}

      <Controls controls={controls} onReset={handleReset} />
      <Legend isDark={theme === "dark"} />
    </div>
  );
});

export default ScatterPlot;
