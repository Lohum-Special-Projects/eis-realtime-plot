import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CameraControllerProps {
  onReset: () => void;
  rotationSpeed: number;
  autoRotateSpeed: number;
}

const CameraController = forwardRef<any, CameraControllerProps>(
  ({ onReset, rotationSpeed, autoRotateSpeed }, ref) => {
    const { camera } = useThree();
    const controlsRef = useRef<any>(null);
    const initialCameraPos = useRef(new THREE.Vector3(10, 10, 10));

    const resetCamera = () => {
      if (controlsRef.current && camera) {
        // Disable auto-rotation temporarily
        const wasAutoRotating = controlsRef.current.autoRotate;
        controlsRef.current.autoRotate = false;

        // Reset camera
        camera.position.copy(initialCameraPos.current);
        camera.up.set(0, 1, 0);

        // Reset controls
        controlsRef.current.target.set(0, 0, 0);

        // Update camera
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld();

        // Re-enable auto-rotation if it was enabled
        controlsRef.current.autoRotate = wasAutoRotating;

        // Force a single update
        requestAnimationFrame(() => {
          if (controlsRef.current) {
            controlsRef.current.update();
          }
        });
      }
    };

    // Expose resetCamera method to parent
    useImperativeHandle(ref, () => ({
      resetCamera,
    }));

    // Handle rotation speed changes
    useEffect(() => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = rotationSpeed > 0;
        controlsRef.current.autoRotateSpeed = autoRotateSpeed;
      }
    }, [rotationSpeed, autoRotateSpeed]);

    return (
      <OrbitControls
        ref={controlsRef}
        autoRotate={rotationSpeed > 0}
        autoRotateSpeed={autoRotateSpeed}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={100}
        makeDefault
        onChange={() => {
          // Prevent infinite loops by not calling update here
          if (controlsRef.current) {
            camera.updateMatrixWorld();
          }
        }}
      />
    );
  }
);

CameraController.displayName = "CameraController";

export default CameraController;
