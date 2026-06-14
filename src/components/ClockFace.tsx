import React, { useEffect, useState } from 'react';
import { ClockSettings, ClockStyle } from '../types';
import { SevenSegmentDigit, ColonSeparator } from './SevenSegmentDigit';
import { VINTAGE_BG_IMAGE_PATH } from '../constants/clockStyles';

interface ClockFaceProps {
  settings: ClockSettings;
  activeStyle: ClockStyle;
  wrapperStyle?: React.CSSProperties;
  className?: string;
}

export const getClockBackgroundStyles = (
  backgroundId: ClockSettings['backgroundId'],
  customDataUrl?: string
) => {
  if (backgroundId === 'custom' && customDataUrl) {
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.6)), url(${customDataUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  switch (backgroundId) {
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

const getClockDigits = (time: Date, use24Hour: boolean) => {
  let hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const isPm = hours >= 12;

  if (!use24Hour) {
    hours = hours % 12;
    hours = hours ? hours : 12;
  }

  let hStr = hours.toString();
  if (!use24Hour) {
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

// Allow font scaling from 20% up to 200% (0.2 - 2.0)
const getFontScale = (settings: ClockSettings) => Math.min(2.0, Math.max(0.2, settings.displayFontPercent / 100));

export const ClockFace: React.FC<ClockFaceProps> = ({ settings, activeStyle, wrapperStyle, className }) => {
  const [time, setTime] = useState(new Date());
  const [isColonActive, setIsColonActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);
      setIsColonActive(now.getSeconds() % 2 === 0);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const digits = getClockDigits(time, settings.use24Hour);
  const isClassicLcd = activeStyle.id === 'lcd-vintage';
  const clockDigitWrapperClass = isClassicLcd
    ? 'from-amber-900 via-amber-800 to-amber-700 text-slate-900'
    : activeStyle.bgClass;

  const digitScaleStyle = { transform: `scale(${getFontScale(settings)})` };

  return (
    <div className={`relative flex items-center justify-center ${className ?? ''}`} style={wrapperStyle}>
      <div
        className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl transition-all duration-550 border-2 border-zinc-950/20 bg-gradient-to-b ${clockDigitWrapperClass}`}
      >
        <div className="relative flex items-center justify-center gap-1 sm:gap-2" style={digitScaleStyle}>
          <SevenSegmentDigit char={digits.h1} style={activeStyle} />
          <SevenSegmentDigit char={digits.h2} style={activeStyle} />
          <ColonSeparator style={activeStyle} active={isColonActive} />
          <SevenSegmentDigit char={digits.m1} style={activeStyle} />
          <SevenSegmentDigit char={digits.m2} style={activeStyle} />
          {settings.showSeconds && (
            <>
              <ColonSeparator style={activeStyle} active={isColonActive} className="opacity-95" />
              <SevenSegmentDigit char={digits.s1} style={activeStyle} />
              <SevenSegmentDigit char={digits.s2} style={activeStyle} />
            </>
          )}
          {!settings.use24Hour && (
            <div
              id="ampm-indicator-box"
              className="absolute right-[-2.5rem] bottom-[15%] sm:right-[-3rem] flex flex-col gap-2 font-mono font-bold text-[8px] sm:text-[10px] tracking-tighter"
              style={{
                color: activeStyle.activeColor,
                filter: activeStyle.glowColor ? `drop-shadow(0 0 6px ${activeStyle.glowColor})` : undefined,
              }}
            >
              <div className="flex items-center gap-1 transition-opacity duration-200" style={{ opacity: !digits.isPm ? 1.0 : 0.08 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                <span>AM</span>
              </div>
              <div className="flex items-center gap-1 transition-opacity duration-200" style={{ opacity: digits.isPm ? 1.0 : 0.08 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                <span>PM</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
