import * as React from 'react';
import { cn } from '../../lib/utils';

const Slider = React.forwardRef(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleChange = (e) => {
      const newValue = parseFloat(e.target.value);
      if (onValueChange) {
        onValueChange([newValue]);
      }
    };

    return (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Array.isArray(value) ? value[0] : value}
        onChange={handleChange}
        className={cn(
          'w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer',
          'accent-emerald-500 hover:accent-emerald-400',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };

