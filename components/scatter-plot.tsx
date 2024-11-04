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

interface DataPoint {
  x: number;
  y: number;
  z: number;
  category: string;
}

export interface ScatterPlotProps {
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

export const Points = memo(function Points({
  data,
  pointSize,
  isDark,
}: {
  data: DataPoint[];
  pointSize: number;
  isDark: boolean;
}) {
  // Original colors
  const categoryAColor = isDark ? [0.8, 0.2, 0.2] : [1, 0, 0]; // Lighter red in dark mode
  const categoryBColor = isDark ? [0.2, 0.2, 0.8] : [0, 0, 1]; // Lighter blue in dark mode

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

  // Memoize positions and colors to prevent recalculation on every render
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(data.flatMap((d) => [d.x, d.y, d.z]));
    const colors = new Float32Array(
      data.flatMap((d) =>
        d.category === "A" ? categoryAColor : categoryBColor
      )
    );
    return [positions, colors];
  }, [data, categoryAColor, categoryBColor]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={data.length}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={data.length}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={pointSize}
        sizeAttenuation={true}
        map={pointTexture}
        alphaTest={0.5}
        transparent={true}
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
          camera={{ position: [10, 10, 10], fov: 60 }}
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

      <Controls controls={controls} onReset={handleReset} />
    </div>
  );
});

export default ScatterPlot;
