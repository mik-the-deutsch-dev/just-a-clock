import React, { useEffect, useState, useRef } from 'react';
import { ClockSettings, ClockStyle } from '../types';
import { SevenSegmentDigit, ColonSeparator } from './SevenSegmentDigit';
import { PREDEFINED_STYLES, VINTAGE_BG_IMAGE_PATH, FALLBACK_VINTAGE_BG_IMAGE } from '../constants/clockStyles';
import { Battery, ShieldCheck, Sun, EyeOff } from 'lucide-react';

interface ClockDisplayProps {
  settings: ClockSettings;
  activeStyle: ClockStyle;
  currentShift: { x: number; y: number };
  onSettingsClick: () => void;
  isSettingsBtnVisible: boolean;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  settings,
  activeStyle,
  currentShift,
  onSettingsClick,
  isSettingsBtnVisible,
}) => {
  const [time, setTime] = useState(new Date());
  const [isColonActive, setIsColonActive] = useState(true);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Update time and colon pulse
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      // Colon blinks every second
      setIsColonActive(now.getSeconds() % 2 === 0);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Browser Wake Lock implementation (Always-On)
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

    // Re-acquire on window focus / visibility change
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

  // Format the clock digits
  const getClockDigits = () => {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const isPm = hours >= 12;

    if (!settings.use24Hour) {
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
    }

    // Leader characters
    let hStr = hours.toString();
    if (!settings.use24Hour) {
      // Traditional 12H clocks usually blank out the leading zero (e.g., ' 9:45' instead of '09:45')
      hStr = hours < 10 ? ' ' + hStr : hStr;
    } else {
      hStr = hours < 10 ? '0' + hStr : hStr;
    }

    const mStr = minutes < 10 ? '0' + minutes : minutes.toString();
    const sStr = seconds < 10 ? '0' + seconds : seconds.toString();

    return {
      h1: hStr[0],
      h2: hStr[1],
      m1: mStr[0],
      m2: mStr[1],
      s1: sStr[0],
      s2: sStr[1],
      isPm,
    };
  };

  const digits = getClockDigits();

  // Developer-friendly clock sizing + position controls
  const CLOCK_DIGIT_SIZE: 'sm' | 'md' | 'lg' | 'xl' = 'sm';
  const CLOCK_DISPLAY_SCALE = 0.82;
  const CLOCK_DISPLAY_POSITION = { x: 0, y: 0 };

  // Determine dynamic background styling
  const getBackgroundStyles = () => {
    switch (settings.backgroundId) {
      case 'vintage-glass':
        return {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.65)), url(${VINTAGE_BG_IMAGE_PATH})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'brushed-metal':
        return {
          backgroundImage: `
            radial-gradient(ellipse at center, rgba(30, 30, 30, 0.4) 0%, rgba(10, 10, 10, 0.9) 100%),
            repeating-linear-gradient(90deg, #18181b 0px, #202023 1px, #27272a 2px, #1c1c1f 3px, #18181b 4px)
          `,
          backgroundSize: '100% 100%, 8px 100%',
        };
      case 'none':
      default:
        return {
          backgroundColor: '#000000',
        };
    }
  };

  // Screen shift vector mapping for Burn-in Prevention + global scale + manual offset
  const positionOffset = CLOCK_DISPLAY_POSITION;
  const shiftX = (settings.burnInProtection ? currentShift.x : 0) + positionOffset.x;
  const shiftY = (settings.burnInProtection ? currentShift.y : 0) + positionOffset.y;
  const wrapperTransform = `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px) scale(${CLOCK_DISPLAY_SCALE})`;

  const isClassicLcd = activeStyle.id === 'lcd-vintage';
  const clockDigitWrapperClass = isClassicLcd
    ? 'from-amber-900 via-amber-800 to-amber-700 text-slate-900'
    : activeStyle.bgClass;
  const glassOverlayClass = isClassicLcd
    ? 'bg-gradient-to-b from-white/20 via-transparent to-black/10 mix-blend-overlay'
    : activeStyle.glassOverlayClass;

  return (
    <div
      id="clock-stage"
      className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none transition-all duration-700"
      style={getBackgroundStyles()}
    >
      {/* Glare and scratches glass overlay for true retro realism */}
      {settings.backgroundId === 'vintage-glass' && (
        <>
          {/* Glass Glossy Glare */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] z-20 pointer-events-none" />
          {/* Subtle dirty glass ring borders */}
          <div className="absolute inset-0 pointer-events-none border-[30px] border-black/10 blur-xl pointer-events-none z-10" />
          {/* Fine scratch lines simulation with CSS */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20 z-1 z-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(41deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0) 4px, rgba(255,255,255,0) 40px)',
            }}
          />
        </>
      )}

      {/* Top Notification Status Bar (Simulating high technology micro indicators) */}
      <div className="absolute top-4 left-6 flex items-center gap-4 text-[10px] sm:text-xs font-mono tracking-wider opacity-60 z-30 transition-all duration-300">
        {/* Status indicator: Screen state Always-On */}
        <div className="flex items-center gap-1.5 transition-all">
          <Sun className={`w-3.5 h-3.5 ${wakeLockActive ? 'text-amber-500 animate-pulse' : 'text-zinc-500'}`} />
          <span 
            className={`${wakeLockActive ? 'text-amber-500 font-semibold' : 'text-zinc-500'}`}
            style={{ color: wakeLockActive ? activeStyle.activeColor : undefined }}
          >
            {wakeLockActive ? 'SCREEN: ALWAYS-ON' : 'SCREEN: STDBY'}
          </span>
        </div>

        {/* Status indicator: Pixel shift burn-in */}
        {settings.burnInProtection && (
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden xs:inline text-zinc-500">OLED SAFE</span>
          </div>
        )}
      </div>

      {/* Main Responsive Clock Container */}
      <div
        id="clock-display-frame"
        className="relative w-[92%] sm:w-11/12 max-w-5xl flex flex-col items-center justify-center z-10 transition-transform duration-300 mx-auto"
        style={{ transform: wrapperTransform }}
      >
        {/* Inner shadow/framing wrap */}
        <div
          id="clock-digit-wrapper"
          className={`w-full flex items-center justify-center gap-1.5 sm:gap-3 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl transition-all duration-550 border-2 border-zinc-950/20 bg-gradient-to-b ${clockDigitWrapperClass}`}
        >
          {/* Digits Block */}
          <div className="relative flex items-center justify-center gap-1 sm:gap-2">
            
            {/* Hour digits */}
            <SevenSegmentDigit char={digits.h1} style={activeStyle} size={CLOCK_DIGIT_SIZE} />
            <SevenSegmentDigit char={digits.h2} style={activeStyle} size={CLOCK_DIGIT_SIZE} />

            {/* Pulsing separator */}
            <ColonSeparator style={activeStyle} active={isColonActive} size={CLOCK_DIGIT_SIZE} />

            {/* Minute digits */}
            <SevenSegmentDigit char={digits.m1} style={activeStyle} size={CLOCK_DIGIT_SIZE} />
            <SevenSegmentDigit char={digits.m2} style={activeStyle} size={CLOCK_DIGIT_SIZE} />

            {/* Seconds digits block */}
            {settings.showSeconds && (
              <>
                <ColonSeparator id="seconds-colon" style={activeStyle} active={isColonActive} size={CLOCK_DIGIT_SIZE} className="opacity-95" />
                <SevenSegmentDigit char={digits.s1} style={activeStyle} size={CLOCK_DIGIT_SIZE} />
                <SevenSegmentDigit char={digits.s2} style={activeStyle} size={CLOCK_DIGIT_SIZE} />
              </>
            )}

            {/* AM/PM Indicator light bulbs */}
            {!settings.use24Hour && (
              <div 
                id="ampm-indicator-box"
                className="absolute right-[-2.5rem] bottom-[15%] sm:right-[-3rem] flex flex-col gap-2 font-mono font-bold text-[8px] sm:text-[10px] tracking-tighter"
                style={{ 
                  color: activeStyle.activeColor,
                  filter: activeStyle.glowColor ? `drop-shadow(0 0 6px ${activeStyle.glowColor})` : undefined
                }}
              >
                <div 
                  className="flex items-center gap-1 transition-opacity duration-200"
                  style={{ opacity: !digits.isPm ? 1.0 : 0.08 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                  <span>AM</span>
                </div>
                <div 
                  className="flex items-center gap-1 transition-opacity duration-200"
                  style={{ opacity: digits.isPm ? 1.0 : 0.08 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                  <span>PM</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instruction cue when settings button is sleeping */}
        {!isSettingsBtnVisible && (
          <div className="absolute bottom-[-2.5rem] text-center text-[10px] sm:text-xs font-mono tracking-widest text-zinc-500/40 animate-pulse uppercase pointer-events-none">
            Tap anywhere to show settings
          </div>
        )}
      </div>

      {/* Floating Scratched Gloss Layer */}
      <div className={`absolute inset-0 pointer-events-none ${glassOverlayClass} z-20 pointer-events-none`} />
    </div>
  );
};
