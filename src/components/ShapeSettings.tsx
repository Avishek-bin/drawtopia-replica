
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ShapeSettingsProps {
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}

export const ShapeSettings = ({ strokeWidth, setStrokeWidth }: ShapeSettingsProps) => {
  return (
    <div className="flex flex-col space-y-3 rounded-lg bg-white p-3 shadow-md">
      <div className="flex items-center justify-between">
        <Label htmlFor="stroke-width" className="text-sm font-medium">
          Stroke Width
        </Label>
        <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
      </div>
      <Slider
        id="stroke-width"
        min={1}
        max={20}
        step={1}
        value={[strokeWidth]}
        onValueChange={(value) => setStrokeWidth(value[0])}
        className="w-40"
      />
    </div>
  );
};

export default ShapeSettings;
