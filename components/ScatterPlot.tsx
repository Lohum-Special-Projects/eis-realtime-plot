"use client";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import CustomAxes from "./customAxes";
import { useTheme } from "next-themes";
import { memo, useCallback, useMemo, useRef } from "react";
import CameraController from "./cameraController";
import { ScatterPlotProps, Points, Controls } from "./scatter-plot";

export const ScatterPlot = memo(function ScatterPlot({
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
          <Stats className="stats" />
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
