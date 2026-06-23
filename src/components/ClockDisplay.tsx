import React, { useEffect, useState, useRef } from 'react';
import { ClockSettings, ClockStyle } from '../types';
import { ClockFace, getClockBackgroundStyles } from './ClockFace';
import { Sun } from 'lucide-react';

interface ClockDisplayProps {
  settings: ClockSettings;
  activeStyle: ClockStyle;
  currentShift: { x: number; y: number };
  mode?: 'clock' | 'timer';
  timerSeconds?: number | null;
  timerRunning?: boolean;
  timerFinished?: boolean;
  onSetTimer?: (seconds: number) => void;
  onToggleStartPause?: () => void;
  isControlsVisible?: boolean;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  settings,
  activeStyle,
  currentShift,
  mode = 'clock',
  timerSeconds = null,
  timerRunning = false,
  timerFinished = false,
  onSetTimer,
  onToggleStartPause,
  isControlsVisible = true,
}) => {
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    async function requestWakeLock() {
      if (!settings.keepAlwaysOn) {
        if (wakeLockRef.current) {
          try {
            await wakeLockRef.current.release();
          } catch (e) {
            console.warn('Wake lock release error:', e);
          }
          wakeLockRef.current = null;
          setWakeLockActive(false);
        }
        return;
      }

      if ('wakeLock' in navigator) {
        try {
          const wl = await (navigator as any).wakeLock.request('screen');
          if (active) {
            wakeLockRef.current = wl;
            setWakeLockActive(true);
            wl.addEventListener('release', () => {
              if (active) setWakeLockActive(false);
            });
          }
        } catch (err: any) {
          console.warn(`Could not activate Wake Lock: ${err.message}`);
          setWakeLockActive(false);
        }
      }
    }

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        try {
          wakeLockRef.current.release();
        } catch (e) {}
      }
    };
  }, [settings.keepAlwaysOn]);

  const CLOCK_DISPLAY_SCALE = 0.82;

  const calculatePositionOffset = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const xOffset = (settings.displayPositionX - 50) * (screenWidth / 100) * 0.3;
    const invertedY = 100 - settings.displayPositionY;
    const yOffset = (invertedY - 50) * (screenHeight / 100) * 0.75;
    return { x: xOffset, y: yOffset };
  };

  const positionOffset = calculatePositionOffset();
  const widthScale = Math.max(0.35, settings.displayWidthPercent / 100);
  const heightScale = Math.max(0.35, settings.displayHeightPercent / 100);
  const shiftX = (settings.burnInProtection ? currentShift.x : 0) + positionOffset.x;
  const shiftY = (settings.burnInProtection ? currentShift.y : 0) + positionOffset.y;
  const displayScaleX = CLOCK_DISPLAY_SCALE * widthScale;
  const displayScaleY = CLOCK_DISPLAY_SCALE * heightScale;
  const wrapperTransform = `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px) scale(${displayScaleX}, ${displayScaleY})`;

  const getBackgroundStyles = () => getClockBackgroundStyles(settings.backgroundId, settings.customBackgroundDataUrl);

  const isClassicLcd = activeStyle.id === 'lcd-vintage';
  const glassOverlayClass = isClassicLcd
    ? 'bg-gradient-to-b from-white/20 via-transparent to-black/10 mix-blend-overlay'
    : activeStyle.glassOverlayClass;

  // play beep when timer finished
  useEffect(() => {
    if (!timerFinished) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      o.start();
      setTimeout(() => {
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.01);
        o.stop(ctx.currentTime + 0.02);
        try { ctx.close(); } catch (e) {}
      }, 600);
    } catch (e) {
      try {
        const a = new Audio();
        a.src = '';
        a.play().catch(() => {});
      } catch (err) {}
    }
  }, [timerFinished]);

  return (
    <div
      id="clock-stage"
      className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none transition-all duration-700"
      style={getBackgroundStyles()}
    >
      {settings.backgroundId === 'vintage-glass' && (
        <>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] z-20" />
          <div className="absolute inset-0 pointer-events-none border-[30px] border-black/10 blur-xl z-10" />
          <div
            className="absolute inset-0 pointer-events-none opacity-20 z-1 z-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(41deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0) 4px, rgba(255,255,255,0) 40px)',
            }}
          />
        </>
      )}

      <div className="absolute top-4 left-6 flex items-center gap-4 text-[10px] sm:text-xs font-mono tracking-wider opacity-60 z-30 transition-all duration-300">
        <Sun className={`w-3.5 h-3.5 ${wakeLockActive ? 'text-amber-500 animate-pulse' : 'text-zinc-500'}`} />
        <span className={`${wakeLockActive ? 'text-amber-500 font-semibold' : 'text-zinc-500'}`} style={{ color: wakeLockActive ? activeStyle.activeColor : undefined }}>
          {wakeLockActive ? 'Screen Locked On' : 'Screen Sleep Ready'}
        </span>
      </div>

      {mode === 'timer' && isControlsVisible && (
        <div className="absolute left-6 bottom-8 z-30 flex flex-col items-center gap-3">
          <button
            onClick={() => {
              const input = window.prompt('Enter timer duration as HH:MM:SS (e.g. 00:05:30)');
              if (!input) return;
              const parts = input.split(':').map((p) => Number(p));
              if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n < 0)) {
                alert('Invalid format. Use HH:MM:SS');
                return;
              }
              const seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
              onSetTimer && onSetTimer(seconds);
            }}
            className="px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-sm text-zinc-200 hover:bg-zinc-800 transition"
          >
            Set
          </button>

          <button
            onClick={() => onToggleStartPause && onToggleStartPause()}
            className="px-4 py-2 bg-amber-500/10 border border-amber-500 rounded-lg text-sm text-amber-300 hover:bg-amber-500/20 transition"
          >
            {timerRunning ? 'Pause' : timerSeconds && timerSeconds > 0 ? 'Start' : 'Start'}
          </button>
        </div>
      )}

      <div className="relative w-full h-full flex items-center justify-center">
        <ClockFace
          settings={settings}
          activeStyle={activeStyle}
          wrapperStyle={{ transform: wrapperTransform }}
          timerSeconds={mode === 'timer' ? timerSeconds ?? null : undefined}
          blink={!!timerFinished}
        />
      </div>

      <div className={`absolute inset-0 pointer-events-none ${glassOverlayClass} z-20`} />
    </div>
  );
};
