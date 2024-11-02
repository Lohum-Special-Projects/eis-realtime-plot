import { extend, type ThreeElements, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { type PropsWithChildren } from "react";
import { useTheme } from "next-themes";

type CustomAxesProps = PropsWithChildren<{
  size?: number;
  ticks?: number;
  tickSize?: number;
  labels?: {
    x?: string;
    y?: string;
    z?: string;
  };
}>;

function CustomAxes({
  size = 10,
  ticks = 5,
  tickSize = 0.2,
  labels = { x: "X", y: "Y", z: "Z" },
}: CustomAxesProps) {
  const { theme } = useTheme();

  // Colors for dark and light modes
  const xAxisColor =
    theme === "dark" ? new THREE.Color("#FF6666") : new THREE.Color("#FF4444");
  const yAxisColor =
    theme === "dark" ? new THREE.Color("#66FF66") : new THREE.Color("#44FF44");
  const zAxisColor =
    theme === "dark" ? new THREE.Color("#6666FF") : new THREE.Color("#4444FF");
  const tickColor =
    theme === "dark" ? new THREE.Color("#999999") : new THREE.Color("#666666");
  const textColor = theme === "dark" ? "#ffffff" : "#000000";

  const lineWidth = 2;

  const ticksArray = Array.from(
    { length: ticks + 1 },
    (_, i) => (i - ticks / 2) * (size / ticks)
  );

  return (
    <group>
      {/* X Axis */}
      <group>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-size / 2, 0, 0, size / 2, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={xAxisColor} linewidth={lineWidth} />
        </line>
      </group>

      {/* Y Axis */}
      <group>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, -size / 2, 0, 0, size / 2, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={yAxisColor} linewidth={lineWidth} />
        </line>
      </group>

      {/* Z Axis */}
      <group>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, -size / 2, 0, 0, size / 2])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={zAxisColor} linewidth={lineWidth} />
        </line>
      </group>

      {/* Tick marks and labels for X axis */}
      {ticksArray.map((tick) => (
        <group key={`x-${tick}`}>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([tick, 0, 0, tick, -tickSize, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={tickColor} linewidth={lineWidth} />
          </line>
          <Text
            position={[tick, -tickSize * 2, 0]}
            scale={[0.7, 0.7, 0.7]}
            color={textColor}
            anchorX="center"
            anchorY="top"
            fontSize={0.5}
          >
            {tick.toFixed(1)}
          </Text>
        </group>
      ))}

      {/* Tick marks and labels for Y axis */}
      {ticksArray.map((tick) => (
        <group key={`y-${tick}`}>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, tick, 0, -tickSize, tick, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={tickColor} linewidth={lineWidth} />
          </line>
          <Text
            position={[-tickSize * 2, tick, 0]}
            scale={[0.7, 0.7, 0.7]}
            color={textColor}
            anchorX="right"
            anchorY="middle"
            fontSize={0.5}
          >
            {tick.toFixed(1)}
          </Text>
        </group>
      ))}

      {/* Tick marks and labels for Z axis */}
      {ticksArray.map((tick) => (
        <group key={`z-${tick}`}>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, tick, -tickSize, 0, tick])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={tickColor} linewidth={lineWidth} />
          </line>
          <Text
            position={[-tickSize * 2, 0, tick]}
            scale={[0.7, 0.7, 0.7]}
            color={textColor}
            anchorX="right"
            anchorY="middle"
            fontSize={0.5}
          >
            {tick.toFixed(1)}
          </Text>
        </group>
      ))}

      {/* Axis labels */}
      <Text
        position={[size / 2 + 1, 0, 0]}
        scale={[1.2, 1.2, 1.2]}
        color={xAxisColor}
        fontSize={0.8}
      >
        {labels.x}
      </Text>
      <Text
        position={[0, size / 2 + 1, 0]}
        scale={[1.2, 1.2, 1.2]}
        color={yAxisColor}
        fontSize={0.8}
      >
        {labels.y}
      </Text>
      <Text
        position={[0, 0, size / 2 + 1]}
        scale={[1.2, 1.2, 1.2]}
        color={zAxisColor}
        fontSize={0.8}
      >
        {labels.z}
      </Text>
    </group>
  );
}

export default CustomAxes;
