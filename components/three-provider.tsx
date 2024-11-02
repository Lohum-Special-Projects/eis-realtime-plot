"use client";

import { type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

interface ThreeProviderProps {
  children: ReactNode;
  camera?: any;
  controls?: boolean;
  style?: React.CSSProperties;
}

export default function ThreeProvider({
  children,
  camera = { position: [10, 10, 10], fov: 60 },
  controls = true,
  style,
}: ThreeProviderProps) {
  return (
    <Canvas camera={camera} style={style}>
      {children}
      {controls && <OrbitControls />}
    </Canvas>
  );
}
