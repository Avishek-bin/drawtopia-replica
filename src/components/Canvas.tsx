
import React, { useRef, useEffect } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { toast } from 'sonner';

interface CanvasProps {
  toolType: string;
  color: string;
  strokeWidth: number;
}

export const Canvas = ({ toolType, color, strokeWidth }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    initCanvas, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp, 
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearCanvas
  } = useCanvas({ color, strokeWidth, toolType });

  useEffect(() => {
    if (!canvasRef.current) return;
    const cleanup = initCanvas(canvasRef.current);
    
    return cleanup;
  }, [initCanvas]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      // Save current drawing
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx?.drawImage(canvas, 0, 0);
      
      // Resize canvas
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Restore drawing
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(tempCanvas, 0, 0);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleClear = () => {
    if (clearCanvas) {
      clearCanvas();
      toast('Canvas cleared');
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-canvas-bg">
      <div className="absolute inset-0 canvas-grid"></div>
      <canvas
        ref={canvasRef}
        className="excalidraw-canvas absolute inset-0 h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      <button
        onClick={handleClear}
        className="absolute bottom-4 right-4 rounded-md bg-white/90 px-3 py-2 text-sm font-medium shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
      >
        Clear
      </button>
    </div>
  );
};

export default Canvas;
