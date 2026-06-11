export type ClockStyleId = 'lcd-vintage' | 'led-red' | 'led-amber' | 'led-green' | 'led-ice';

export interface ClockStyle {
  id: ClockStyleId;
  name: string;
  activeColor: string;
  inactiveColor: string;
  glowColor?: string; // CSS shadow glow
  bgClass: string; // Tailwind background style
  glassOverlayClass: string;
  lcdShadow?: boolean; // For LCD, whether to add a subtle drop shadow to segments for 3D liquid crystal look
}

export type ClockBgId = 'none' | 'vintage-glass' | 'brushed-metal' | 'carbon-fiber';

export interface ClockSettings {
  styleId: ClockStyleId;
  backgroundId: ClockBgId;
  keepAlwaysOn: boolean;
  showSeconds: boolean;
  use24Hour: boolean;
  burnInProtection: boolean;
  burnInSpeed: 'slow' | 'medium' | 'fast'; // how often shift happens
  shiftIntensity: number; // custom shift pixel range e.g. 5px
}
