
import React from 'react';
import { Tooltip } from '@/components/ui/tooltip';

interface ColorPaletteProps {
  activeColor: string;
  setActiveColor: (color: string) => void;
}

const colors = [
  { id: 'black', value: '#1e1e1e', label: 'Black' },
  { id: 'gray', value: '#8f8f8f', label: 'Gray' },
  { id: 'red', value: '#e03131', label: 'Red' },
  { id: 'orange', value: '#ff922b', label: 'Orange' },
  { id: 'yellow', value: '#ffd43b', label: 'Yellow' },
  { id: 'green', value: '#40c057', label: 'Green' },
  { id: 'blue', value: '#4dabf7', label: 'Blue' },
  { id: 'purple', value: '#ae3ec9', label: 'Purple' },
];

export const ColorPalette = ({ activeColor, setActiveColor }: ColorPaletteProps) => {
  return (
    <div className="flex items-center space-x-2 rounded-lg bg-white p-2 shadow-md">
      {colors.map((color) => (
        <Tooltip key={color.id} content={color.label}>
          <button
            className={`color-swatch ${activeColor === color.value ? 'active' : ''}`}
            style={{ backgroundColor: color.value }}
            onClick={() => setActiveColor(color.value)}
            aria-label={`${color.label} color`}
          />
        </Tooltip>
      ))}
    </div>
  );
};

export default ColorPalette;
