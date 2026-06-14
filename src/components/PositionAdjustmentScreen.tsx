import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { ClockSettings, ClockStyle } from '../types';
import { ClockFace, getClockBackgroundStyles } from './ClockFace';

interface PositionAdjustmentScreenProps {
  settings: ClockSettings;
  activeStyle: ClockStyle;
  onChange: (settings: ClockSettings) => void;
  onClose: () => void;
  isOpen: boolean;
  currentShift: { x: number; y: number };
}

export const PositionAdjustmentScreen: React.FC<PositionAdjustmentScreenProps> = ({
  settings,
  activeStyle,
  onChange,
  onClose,
  isOpen,
  currentShift,
}) => {
  if (!isOpen) return null;

  const handlePositionXChange = (value: number) => {
    onChange({
      ...settings,
      displayPositionX: value,
    });
  };

  const handlePositionYChange = (value: number) => {
    onChange({
      ...settings,
      displayPositionY: value,
    });
  };

  const calculatePosition = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const xOffset = (settings.displayPositionX - 50) * (screenWidth / 100) * 0.3;
    const invertedY = 100 - settings.displayPositionY;
    const yOffset = (invertedY - 50) * (screenHeight / 100) * 0.75;
    
    return { x: xOffset, y: yOffset };
  };

  const position = calculatePosition();
  const CLOCK_DISPLAY_SCALE = 0.82;
  const glassOverlayClass = activeStyle.id === 'lcd-vintage'
    ? 'bg-gradient-to-b from-white/20 via-transparent to-black/10 mix-blend-overlay'
    : activeStyle.glassOverlayClass;

  const getBackgroundStyles = () => getClockBackgroundStyles(settings.backgroundId, settings.customBackgroundDataUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
      style={getBackgroundStyles()}
    >
      {/* Glass overlay effects */}
      {settings.backgroundId === 'vintage-glass' && (
        <>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] z-20" />
          <div className="absolute inset-0 pointer-events-none border-[30px] border-black/10 blur-xl z-10" />
        </>
      )}

      {/* Clock Display Preview */}
      <div
        id="adjustment-clock-display"
        className="relative w-[92%] sm:w-11/12 max-w-5xl flex flex-col items-center justify-center z-30 transition-transform duration-150 mx-auto"
      >
        <ClockFace
          settings={settings}
          activeStyle={activeStyle}
          wrapperStyle={{ transform: `translate(${position.x}px, ${position.y}px) scale(${CLOCK_DISPLAY_SCALE})` }}
        />
      </div>

      {/* Glass overlay */}
      <div className={`absolute inset-0 pointer-events-none ${glassOverlayClass} z-20`} />

      {/* Left Vertical Slider (Y Position) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3"
      >
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Y</div>
        <div className="flex items-center justify-center h-80 sm:h-96">
          <input
            type="range"
            min="0"
            max="100"
            value={settings.displayPositionY}
            onChange={(e) => handlePositionYChange(Number(e.target.value))}
            className="vertical-slider-input"
          />
        </div>
        <div className="text-xs font-mono text-zinc-300 font-semibold">{Math.round(settings.displayPositionY)}%</div>
      </motion.div>

      {/* Top Horizontal Slider (X Position) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3"
      >
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">X Position</div>
        <div className="w-64 sm:w-80 bg-zinc-900/80 border border-zinc-700 rounded-full px-3 py-2 flex items-center gap-3 backdrop-blur-sm">
          <input
            type="range"
            min="0"
            max="100"
            value={settings.displayPositionX}
            onChange={(e) => handlePositionXChange(Number(e.target.value))}
            className="flex-1 h-2 appearance-none bg-zinc-800 rounded-full cursor-pointer slider accent-amber-500"
          />
        </div>
        <div className="text-xs font-mono text-zinc-300 font-semibold">{Math.round(settings.displayPositionX)}%</div>
      </motion.div>

      {/* Right Save Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40"
      >
        <button
          onClick={onClose}
          className="group flex flex-col items-center gap-3 p-4 sm:p-6 bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500/50 hover:border-emerald-500 rounded-3xl transition-all duration-200 backdrop-blur-sm"
        >
          <Check className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 uppercase tracking-wider text-center">
            Save<br />Position
          </span>
        </button>
      </motion.div>

      {/* Instruction text */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 text-center text-xs text-zinc-400 font-mono">
        <div>Adjust sliders to reposition clock on screen</div>
        <div className="text-zinc-500 text-[10px] mt-1">Position: X {Math.round(settings.displayPositionX)}% / Y {Math.round(settings.displayPositionY)}%</div>
      </div>

      <style>{`
        /* Horizontal X slider styling */
        .slider {
          appearance: none;
          border-radius: 5px;
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
          border: 2px solid #92400e;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
          border: 2px solid #92400e;
        }

        /* Vertical Y slider styling using standardized approach */
        .vertical-slider-input {
          writing-mode: vertical-lr;
          direction: rtl;
          width: 20px;
          height: 100%;
          border-radius: 10px;
          outline: none;
          cursor: pointer;
        }
        .vertical-slider-input::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
          border: 2px solid #92400e;
        }
        .vertical-slider-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
          border: 2px solid #92400e;
        }
        .vertical-slider-input::-moz-range-track {
          background: transparent;
          border: none;
        }
        .vertical-slider-input::-webkit-slider-runnable-track {
          background: linear-gradient(to bottom, #18181b 0%, #27272a 50%, #18181b 100%);
          height: 100%;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
