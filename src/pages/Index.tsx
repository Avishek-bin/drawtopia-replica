
import React, { useState } from 'react';
import Canvas from '@/components/Canvas';
import Toolbar from '@/components/Toolbar';
import ColorPalette from '@/components/ColorPalette';
import ShapeSettings from '@/components/ShapeSettings';
import { useCanvas } from '@/hooks/useCanvas';
import { toast } from 'sonner';

const Index = () => {
  const [activeTool, setActiveTool] = useState('pencil');
  const [activeColor, setActiveColor] = useState('#1e1e1e');
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  const {
    undo,
    redo,
    exportToImage,
    canUndo,
    canRedo,
  } = useCanvas({
    color: activeColor,
    strokeWidth,
    toolType: activeTool,
  });

  const handleExport = () => {
    exportToImage();
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-50 p-4">
      <header className="mb-4 flex items-center justify-between">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-semibold tracking-tight">Excalidraw Clone</h1>
          <p className="text-sm text-muted-foreground">A minimalist drawing application</p>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 transform animate-slide-down">
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onExport={handleExport}
          />
        </div>
        
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 transform items-center space-x-4 animate-slide-up">
          <ColorPalette activeColor={activeColor} setActiveColor={setActiveColor} />
          <ShapeSettings strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth} />
        </div>
        
        <div className="relative flex-1">
          <Canvas toolType={activeTool} color={activeColor} strokeWidth={strokeWidth} />
        </div>
      </div>
    </div>
  );
};

export default Index;
