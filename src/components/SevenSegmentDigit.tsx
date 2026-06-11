import React from 'react';
import { ClockStyle } from '../types';

interface SevenSegmentDigitProps {
  char: string;
  style: ClockStyle;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SEGMENT_PATHS = {
  a: 'M 18,10 L 82,10 L 72,21 L 28,21 Z',
  b: 'M 74,23 L 85,12 L 85,77 L 74,88 L 74,23 Z',
  c: 'M 74,96 L 85,107 L 85,168 L 74,157 L 74,96 Z',
  d: 'M 18,170 L 82,170 L 72,159 L 28,159 Z',
  e: 'M 15,96 L 26,107 L 26,157 L 15,168 L 15,96 Z',
  f: 'M 15,23 L 26,34 L 26,77 L 15,88 L 15,23 Z',
  g: 'M 22,85 L 78,85 L 83,90 L 78,95 L 22,95 L 17,90 Z',
};

type SegmentKey = keyof typeof SEGMENT_PATHS;

// Digital mappings for characters
const CHAR_MAP: Record<string, SegmentKey[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'd', 'c'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
  '-': ['g'],
  'E': ['a', 'd', 'e', 'f', 'g'],
  'H': ['b', 'c', 'e', 'f', 'g'],
  'L': ['d', 'e', 'f'],
  'P': ['a', 'b', 'e', 'f', 'g'],
  'o': ['c', 'd', 'e', 'g'],
  'n': ['c', 'e', 'g'],
  ' ': [],
};

export const SevenSegmentDigit: React.FC<SevenSegmentDigitProps> = ({
  char,
  style,
  className = '',
  size = 'md',
}) => {
  const activeSegments = CHAR_MAP[char] || [];

  // Determine size classes
  const sizeClasses = {
    sm: 'w-10 h-16 sm:w-12 sm:h-20',
    md: 'w-16 h-28 sm:w-20 sm:h-36',
    lg: 'w-24 h-40 sm:w-28 sm:h-48 md:w-32 md:h-56',
    xl: 'w-28 h-48 sm:w-36 sm:h-60 md:w-44 md:h-72 lg:w-48 lg:h-80',
  }[size];

  // Italic skew look to mimic classic hardware slant
  const skewStyle: React.CSSProperties = {
    transform: 'skewX(-6deg)',
    transformOrigin: 'center',
    filter: style.glowColor && activeSegments.length > 0 ? `drop-shadow(0 0 10px ${style.glowColor})` : undefined,
    transition: 'filter 0.3s ease',
  };

  return (
    <svg
      id={`digit-${char}-${Math.random().toString(36).substring(2, 6)}`}
      viewBox="0 0 100 180"
      className={`${sizeClasses} ${className} fill-current select-none duration-150 ease-out`}
      style={skewStyle}
    >
      {/* Background segments (inactive placeholders) */}
      {(Object.keys(SEGMENT_PATHS) as SegmentKey[]).map((seg) => {
        const isActive = activeSegments.includes(seg);
        const path = SEGMENT_PATHS[seg];

        // Custom segment-specific 3D drop shadow for LCD look
        const filterId = style.lcdShadow ? `url(#lcd-shadow-${seg})` : undefined;

        return (
          <g key={seg}>
            {style.lcdShadow && (
              <defs>
                <filter id={`lcd-shadow-${seg}`} x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="1.5" dy="1.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.45" />
                </filter>
              </defs>
            )}
            <path
              id={`segment-${seg}`}
              d={path}
              style={{
                color: isActive ? style.activeColor : style.inactiveColor,
                opacity: isActive ? 1.0 : (style.id === 'lcd-vintage' ? 0.05 : 0.035),
                filter: isActive ? filterId : undefined,
                transition: 'color 0.15s ease, opacity 0.15s ease',
              }}
            />
          </g>
        );
      })}
    </svg>
  );
};

interface ColonSeparatorProps {
  style: ClockStyle;
  active: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ColonSeparator: React.FC<ColonSeparatorProps> = ({
  style,
  active,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-16 sm:w-6 sm:h-20',
    md: 'w-6 h-28 sm:w-8 sm:h-36',
    lg: 'w-8 h-40 sm:w-10 sm:h-48 md:w-12 md:h-56',
    xl: 'w-10 h-48 sm:w-12 sm:h-60 md:w-14 md:h-72 lg:w-16 lg:h-80',
  }[size];

  const glowStyle: React.CSSProperties = {
    transform: 'skewX(-6deg)',
    transformOrigin: 'center',
    filter: style.glowColor && active ? `drop-shadow(0 0 10px ${style.glowColor})` : undefined,
    transition: 'filter 0.3s ease',
  };

  const activeOpacity = active ? 1.0 : (style.id === 'lcd-vintage' ? 0.05 : 0.035);

  return (
    <svg
      id="colon-separator"
      viewBox="0 0 40 180"
      className={`${sizeClasses} ${className} fill-current select-none duration-150`}
      style={glowStyle}
    >
      {/* Top Dot */}
      <circle
        id="colon-dot-top"
        cx="20"
        cy="55"
        r="8"
        style={{
          color: active ? style.activeColor : style.inactiveColor,
          opacity: activeOpacity,
          transition: 'color 0.15s ease, opacity 0.15s ease',
        }}
      />
      {/* Bottom Dot */}
      <circle
        id="colon-dot-bottom"
        cx="20"
        cy="125"
        r="8"
        style={{
          color: active ? style.activeColor : style.inactiveColor,
          opacity: activeOpacity,
          transition: 'color 0.15s ease, opacity 0.15s ease',
        }}
      />
    </svg>
  );
};
