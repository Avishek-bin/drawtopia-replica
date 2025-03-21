
import React from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Pencil, Square, Circle, Eraser, Download, Undo, Redo, Hand } from 'lucide-react';

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
}

const tools = [
  { id: 'select', icon: Hand, label: 'Select & Move' },
  { id: 'pencil', icon: Pencil, label: 'Pencil' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

export const Toolbar = ({
  activeTool,
  setActiveTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
}: ToolbarProps) => {
  return (
    <div className="flex h-12 items-center justify-center space-x-1 rounded-lg bg-white p-1 shadow-md">
      {tools.map((tool) => (
        <Tooltip key={tool.id} content={tool.label}>
          <button
            className={`toolbar-button ${activeTool === tool.id ? 'active' : ''}`}
            onClick={() => setActiveTool(tool.id)}
            aria-label={tool.label}
          >
            <tool.icon size={20} />
          </button>
        </Tooltip>
      ))}

      <Separator orientation="vertical" className="mx-1 h-8" />

      <Tooltip content="Undo">
        <button
          className="toolbar-button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo"
        >
          <Undo size={20} className={!canUndo ? "opacity-30" : ""} />
        </button>
      </Tooltip>

      <Tooltip content="Redo">
        <button
          className="toolbar-button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo"
        >
          <Redo size={20} className={!canRedo ? "opacity-30" : ""} />
        </button>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-8" />

      <Tooltip content="Export">
        <button
          className="toolbar-button"
          onClick={onExport}
          aria-label="Export"
        >
          <Download size={20} />
        </button>
      </Tooltip>
    </div>
  );
};

export default Toolbar;
