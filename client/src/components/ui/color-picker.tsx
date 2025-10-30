import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (/^#([0-9A-F]{3}){1,2}$/i.test(inputValue)) {
      onChange(inputValue);
    } else {
      setInputValue(color); // Reverte se o formato for inválido
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setInputValue(newColor);
    onChange(newColor);
  };

  const swatches = [
    "#2E8B57", // Sea Green (Primária do tema)
    "#FF6B35", // Orange (Secundária do tema)
    "#1A1A2E", // Dark (Fundo do tema)
    "#F8F9FA", // Light (Claro do tema)
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            className
          )}
        >
          <div
            className="w-4 h-4 rounded mr-2 border"
            style={{ backgroundColor: color }}
          />
          {color}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2 space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-10 h-10 p-0 border-none cursor-pointer"
          />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="grid grid-cols-4 gap-1">
          {swatches.map((swatchColor) => (
            <div
              key={swatchColor}
              className="w-full h-8 rounded cursor-pointer border hover:scale-105 transition-transform"
              style={{ backgroundColor: swatchColor }}
              onClick={() => {
                onChange(swatchColor);
                setInputValue(swatchColor);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
