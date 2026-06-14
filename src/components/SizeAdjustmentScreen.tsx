import React from 'react';
import { motion } from 'motion/react';
import { X, Monitor, Check } from 'lucide-react';
import { ClockSettings, ClockStyle } from '../types';
import { ClockFace, getClockBackgroundStyles } from './ClockFace';

interface SizeAdjustmentScreenProps {
  settings: ClockSettings;
  activeStyle: ClockStyle;
  onChange: (settings: ClockSettings) => void;
  onClose: () => void;
  isOpen: boolean;
  currentShift: { x: number; y: number };
}

export const SizeAdjustmentScreen: React.FC<SizeAdjustmentScreenProps> = ({
  settings,
  activeStyle,
  onChange,
  onClose,
  isOpen,
  currentShift,
}) => {
  if (!isOpen) return null;

  const handleWidthChange = (value: number) => {
    onChange({
      ...settings,
      displayWidthPercent: value,
    });
  };

  const handleHeightChange = (value: number) => {
    onChange({
      ...settings,
      displayHeightPercent: value,
    });
  };

  const handleFontChange = (value: number) => {
    onChange({
      ...settings,
      displayFontPercent: value,
    });
  };

  const CLOCK_DISPLAY_SCALE = 0.82;

  const calculatePosition = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const xOffset = (settings.displayPositionX - 50) * (screenWidth / 100) * 0.3;
    const invertedY = 100 - settings.displayPositionY;
    const yOffset = (invertedY - 50) * (screenHeight / 100) * 0.75;
    return { x: xOffset, y: yOffset };
  };

  const positionOffset = calculatePosition();
  const widthScale = Math.max(0.35, settings.displayWidthPercent / 100);
  const heightScale = Math.max(0.35, settings.displayHeightPercent / 100);
  const shiftX = (settings.burnInProtection ? currentShift.x : 0) + positionOffset.x;
  const shiftY = (settings.burnInProtection ? currentShift.y : 0) + positionOffset.y;
  const displayScaleX = CLOCK_DISPLAY_SCALE * widthScale;
  const displayScaleY = CLOCK_DISPLAY_SCALE * heightScale;
  const wrapperTransform = `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px) scale(${displayScaleX}, ${displayScaleY})`;
  const isClassicLcd = activeStyle.id === 'lcd-vintage';
  const glassOverlayClass = isClassicLcd
    ? 'bg-gradient-to-b from-white/20 via-transparent to-black/10 mix-blend-overlay'
    : activeStyle.glassOverlayClass;

  const getBackgroundStyles = () => getClockBackgroundStyles(settings.backgroundId, settings.customBackgroundDataUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
      style={getBackgroundStyles()}
    >
      {settings.backgroundId === 'vintage-glass' && (
        <>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] z-20" />
          <div className="absolute inset-0 pointer-events-none border-[30px] border-black/10 blur-xl z-10" />
        </>
      )}

      <div
        id="adjustment-clock-display"
        className="relative w-[92%] sm:w-11/12 max-w-5xl flex flex-col items-center justify-center z-30 transition-transform duration-150 mx-auto"
      >
        <ClockFace
          settings={settings}
          activeStyle={activeStyle}
          wrapperStyle={{ transform: wrapperTransform }}
        />
      </div>

      <div className={`absolute inset-0 pointer-events-none ${glassOverlayClass} z-20`} />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3"
      >
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Vertical Size</div>
        <div className="flex items-center justify-center h-80 sm:h-96">
          <input
            type="range"
            min="20"
            max="200"
            value={settings.displayHeightPercent}
            onChange={(e) => handleHeightChange(Number(e.target.value))}
            className="vertical-slider-input"
          />
        </div>
        <div className="text-xs font-mono text-zinc-300 font-semibold">{Math.round(settings.displayHeightPercent)}%</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3"
      >
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Horizontal Size</div>
        <div className="w-64 sm:w-80 bg-zinc-900/80 border border-zinc-700 rounded-full px-3 py-2 flex items-center gap-3 backdrop-blur-sm">
          <input
            type="range"
            min="20"
            max="200"
            value={settings.displayWidthPercent}
            onChange={(e) => handleWidthChange(Number(e.target.value))}
            className="flex-1 h-2 appearance-none bg-zinc-800 rounded-full cursor-pointer slider accent-sky-400"
          />
        </div>
        <div className="text-xs font-mono text-zinc-300 font-semibold">{Math.round(settings.displayWidthPercent)}%</div>
      </motion.div>

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
            Save Size
          </span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute left-1/2 bottom-8 -translate-x-1/2 w-[calc(100%-10rem)] max-w-3xl flex flex-col items-center gap-3 z-40"
      >
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Font Size</div>
        <div className="w-full bg-zinc-900/80 border border-zinc-700 rounded-full px-3 py-3 flex items-center gap-3 backdrop-blur-sm">
          <input
            type="range"
            min="20"
            max="200"
            value={settings.displayFontPercent}
            onChange={(e) => handleFontChange(Number(e.target.value))}
            className="w-full h-2 appearance-none bg-zinc-800 rounded-full slider accent-sky-400"
          />
        </div>
        <div className="text-[11px] text-zinc-300">{Math.round(settings.displayFontPercent)}%</div>
      </motion.div>

      <div className="absolute left-1/2 bottom-2 -translate-x-1/2 text-xs text-zinc-400 text-center z-40">
        Preview uses the current clock style and background.
      </div>
  <style>{`
        .slider {
          appearance: none;
          border-radius: 999px;
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(56,189,248,0.35);
          border: 2px solid rgba(56,189,248,0.45);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(56,189,248,0.35);
          border: 2px solid rgba(56,189,248,0.45);
        }
        .vertical-slider-input {
          writing-mode: vertical-lr;
          direction: rtl;
          width: 20px;
          height: 100%;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        .vertical-slider-input::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(56,189,248,0.35);
          border: 2px solid rgba(56,189,248,0.45);
        }
        .vertical-slider-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(56,189,248,0.35);
          border: 2px solid rgba(56,189,248,0.45);
        }
        .vertical-slider-input::-moz-range-track {
          background: transparent;
          border: none;
        }
        .vertical-slider-input::-webkit-slider-runnable-track {
          background: linear-gradient(to bottom, #111827 0%, #1f2937 50%, #111827 100%);
          height: 100%;
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
};
