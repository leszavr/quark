
// @ts-expect-error: external module may not have types
import SpaceTravel from "space-travel";
import { useEffect, useRef } from "react";




export default function WebGLBackground() {
  // SSR check for HTMLCanvasElement
  const isDOM = typeof window !== "undefined" && typeof document !== "undefined" && typeof HTMLCanvasElement !== "undefined";
  const canvasRef = useRef(null);
  const spaceTravelRef = useRef<unknown>(null);

  useEffect(() => {
    if (!isDOM || !canvasRef.current) return;
    // SpaceTravel is an external library, may not have types
    const instance = new SpaceTravel({
      canvas: canvasRef.current,
      throttle: 0.025,
      opacity: 1,
      backgroundColor: 0x08000f,
    });
    instance.start?.();
    spaceTravelRef.current = instance;

    return () => {
      if (spaceTravelRef.current && typeof (spaceTravelRef.current as unknown as { pause?: () => void }).pause === "function") {
        (spaceTravelRef.current as unknown as { pause: () => void }).pause();
      }
    };
  }, [isDOM]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        id="space-travel"
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}

