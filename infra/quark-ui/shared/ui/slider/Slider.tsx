"use client";

import * as RadixSlider from "@radix-ui/react-slider";

export interface SliderProps {
  readonly value?: number[];
  readonly defaultValue?: number[];
  readonly onValueChange?: (value: number[]) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
}: SliderProps) {
  return (
    <RadixSlider.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={`relative flex items-center select-none touch-none w-full h-5 ${className || ""}`}
    >
      <RadixSlider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-1">
        <RadixSlider.Range className="absolute bg-blue-500 rounded-full h-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        aria-label="Value"
      />
    </RadixSlider.Root>
  );
}
