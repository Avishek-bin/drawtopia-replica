
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface Position {
  x: number;
  y: number;
}

interface UseCanvasProps {
  color: string;
  strokeWidth: number;
  toolType: string;
}

interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  snapshot: ImageData | null;
}

export const useCanvas = ({ color, strokeWidth, toolType }: UseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawingState = useRef<DrawingState>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    snapshot: null,
  });
  
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  const history = useRef<ImageData[]>([]);
  const historyStep = useRef(-1);
  
  const saveCurrentState = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    // Save current state to history
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // If we're not at the end of the history, remove all future states
    if (historyStep.current < history.current.length - 1) {
      history.current = history.current.slice(0, historyStep.current + 1);
    }
    
    history.current.push(currentState);
    historyStep.current = history.current.length - 1;
    
    setCanUndo(historyStep.current > 0);
    setCanRedo(false);
  }, []);
  
  const undo = useCallback(() => {
    if (historyStep.current <= 0) return;
    
    historyStep.current -= 1;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    ctx.putImageData(history.current[historyStep.current], 0, 0);
    
    setCanUndo(historyStep.current > 0);
    setCanRedo(historyStep.current < history.current.length - 1);
  }, []);
  
  const redo = useCallback(() => {
    if (historyStep.current >= history.current.length - 1) return;
    
    historyStep.current += 1;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    ctx.putImageData(history.current[historyStep.current], 0, 0);
    
    setCanUndo(historyStep.current > 0);
    setCanRedo(historyStep.current < history.current.length - 1);
  }, []);
  
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCurrentState();
  }, [saveCurrentState]);
  
  const exportToImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      // Create a white background
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const exportCtx = exportCanvas.getContext('2d');
      if (!exportCtx) return;
      
      exportCtx.fillStyle = '#ffffff';
      exportCtx.fillRect(0, 0, canvas.width, canvas.height);
      exportCtx.drawImage(canvas, 0, 0);
      
      // Convert to image and download
      const dataUrl = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `excalidraw-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast('Drawing exported successfully');
    } catch (error) {
      console.error('Export failed', error);
      toast.error('Failed to export drawing');
    }
  }, []);
  
  const initCanvas = useCallback((canvas: HTMLCanvasElement) => {
    if (!canvas) return () => {};
    
    canvasRef.current = canvas;
    
    // Set canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Set up context
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};
    ctxRef.current = ctx;
    
    // Initial history state
    saveCurrentState();
    
    return () => {
      canvasRef.current = null;
      ctxRef.current = null;
    };
  }, [saveCurrentState]);
  
  // Get position relative to canvas
  const getCoordinates = (event: MouseEvent | Touch): Position => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };
  
  // Start drawing
  const startDrawing = useCallback((position: Position) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    ctx.strokeStyle = toolType === 'eraser' ? '#f8f9fa' : color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (toolType === 'pencil' || toolType === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(position.x, position.y);
    } else {
      // Take a snapshot for shape drawing
      drawingState.current.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      drawingState.current.startX = position.x;
      drawingState.current.startY = position.y;
    }
    
    drawingState.current.isDrawing = true;
  }, [color, strokeWidth, toolType]);
  
  // Continue drawing
  const draw = useCallback((position: Position) => {
    if (!drawingState.current.isDrawing) return;
    
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    
    if (toolType === 'pencil' || toolType === 'eraser') {
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
    } else if (drawingState.current.snapshot) {
      // Restore the canvas to its state before drawing the shape
      ctx.putImageData(drawingState.current.snapshot, 0, 0);
      
      const startX = drawingState.current.startX;
      const startY = drawingState.current.startY;
      
      if (toolType === 'rectangle') {
        const width = position.x - startX;
        const height = position.y - startY;
        ctx.strokeRect(startX, startY, width, height);
      } else if (toolType === 'circle') {
        const radius = Math.sqrt(
          Math.pow(position.x - startX, 2) + Math.pow(position.y - startY, 2)
        );
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [toolType]);
  
  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (drawingState.current.isDrawing) {
      drawingState.current.isDrawing = false;
      saveCurrentState();
    }
  }, [saveCurrentState]);
  
  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const position = getCoordinates(e.nativeEvent);
    startDrawing(position);
  }, [startDrawing]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const position = getCoordinates(e.nativeEvent);
    draw(position);
  }, [draw]);
  
  const handleMouseUp = useCallback(() => {
    stopDrawing();
  }, [stopDrawing]);
  
  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling
    if (e.touches.length > 0) {
      const position = getCoordinates(e.touches[0]);
      startDrawing(position);
    }
  }, [startDrawing]);
  
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling
    if (e.touches.length > 0) {
      const position = getCoordinates(e.touches[0]);
      draw(position);
    }
  }, [draw]);
  
  const handleTouchEnd = useCallback(() => {
    stopDrawing();
  }, [stopDrawing]);
  
  return {
    initCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearCanvas,
    undo,
    redo,
    exportToImage,
    canUndo,
    canRedo,
  };
};

export default useCanvas;
