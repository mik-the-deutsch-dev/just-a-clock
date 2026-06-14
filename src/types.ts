export type ClockStyleId = 'lcd-vintage' | 'led-red' | 'led-amber' | 'led-green' | 'led-ice';

export interface ClockStyle {
  id: ClockStyleId;
  name: string;
  activeColor: string;
  inactiveColor: string;
  glowColor?: string;
  bgClass: string;
  glassOverlayClass: string;
  lcdShadow?: boolean;
}

export type ClockBgId = 'none' | 'vintage-glass' | 'brushed-metal' | 'carbon-fiber';

export type BurnInSpeed = 'slow' | 'medium' | 'fast';

export interface ClockSettings {
  styleId: ClockStyleId;
  backgroundId: ClockBgId;
  keepAlwaysOn: boolean;
  showSeconds: boolean;
  use24Hour: boolean;
  burnInProtection: boolean;
  burnInSpeed: BurnInSpeed;
  shiftIntensity: number;
  displayPositionX: number;
  displayPositionY: number;
  displayWidthPercent: number;
  displayHeightPercent: number;
  displayFontPercent: number;
}
