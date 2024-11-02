import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

export default function FPSCounter() {
  const [fps, setFps] = useState(0);
  let frameCount = 0;
  let lastTime = performance.now();

  useFrame(() => {
    frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;

    if (deltaTime >= 1000) {
      setFps(Math.round((frameCount * 1000) / deltaTime));
      frameCount = 0;
      lastTime = currentTime;
    }
  });

  return (
    <Text
      position={[-4.5, 4.5, 0] as const}
      fontSize={0.3}
      color="#00ff00"
      anchorX="left"
      anchorY="top"
    >
      {`FPS: ${fps}`}
    </Text>
  );
}
