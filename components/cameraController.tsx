import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
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
    const initialCameraPos = useRef(new THREE.Vector3(3, 3, 3));

    // Enhanced smooth camera movement
    useEffect(() => {
      if (controlsRef.current) {
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
        controlsRef.current.rotateSpeed = 0.8;
        controlsRef.current.zoomSpeed = 1.2;
        controlsRef.current.panSpeed = 0.8;
        controlsRef.current.minDistance = 0.5;
        controlsRef.current.maxDistance = 20;
        controlsRef.current.enableZoom = true;
        controlsRef.current.enablePan = true;
        controlsRef.current.target = new THREE.Vector3(0, 0, 0);
      }
    }, []);

    const resetCamera = useCallback(() => {
      if (controlsRef.current && camera) {
        const wasAutoRotating = controlsRef.current.autoRotate;
        controlsRef.current.autoRotate = false;

        // Smooth camera reset animation
        const startPos = camera.position.clone();
        const endPos = initialCameraPos.current.clone();
        const startRot = camera.quaternion.clone();
        const endRot = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, 0, 0)
        );

        let frame = 0;
        const animate = () => {
          frame++;
          const progress = Math.min(frame / 60, 1); // 60 frames for animation
          const easeProgress = easeOutCubic(progress);

          camera.position.lerpVectors(startPos, endPos, easeProgress);
          camera.quaternion.slerpQuaternions(startRot, endRot, easeProgress);
          camera.updateMatrixWorld();

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            controlsRef.current.autoRotate = wasAutoRotating;
          }
        };

        animate();
      }
    }, [camera]);

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
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={20}
        zoomSpeed={1.2} // Faster zoom
        makeDefault
        minPolarAngle={0} // Allow full vertical rotation
        maxPolarAngle={Math.PI}
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

// Easing function for smooth animations
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

CameraController.displayName = "CameraController";

export default CameraController;
