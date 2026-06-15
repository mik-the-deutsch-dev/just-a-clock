import { ClockStyle, ClockStyleId } from '../types';
import vintageBg from '@/src/assets/images/retro_clock_bg_1781190983613.jpg';

export const PREDEFINED_STYLES: ClockStyle[] = [
  {
    id: 'lcd-vintage',
    name: 'Classic Yellow LCD',
    activeColor: '#1a221f', // Dark gray liquid crystal
    inactiveColor: '#1a221f',
    bgClass: 'from-amber-900 via-amber-800 to-amber-700 text-slate-900 shadow-inner',
    glassOverlayClass: 'bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 mix-blend-overlay',
    lcdShadow: true,
  },
  {
    id: 'led-red',
    name: 'Vintage Ruby LED',
    activeColor: '#ff2222', // Intense glow red
    inactiveColor: '#330505', // Deep crimson inactive segment
    glowColor: '#ff2222',
    bgClass: 'from-zinc-950 via-neutral-950 to-zinc-950 text-red-500 shadow-2xl',
    glassOverlayClass: 'bg-gradient-to-b from-red-500/5 via-transparent to-transparent',
    lcdShadow: false,
  },
  {
    id: 'led-amber',
    name: 'Industrial Amber',
    activeColor: '#ff9900', // Neon warm orange
    inactiveColor: '#2b1400', // Warm brown inactive segment
    glowColor: '#ff9900',
    bgClass: 'from-stone-950 via-zinc-950 to-stone-950 text-amber-500 shadow-2xl',
    glassOverlayClass: 'bg-gradient-to-b from-amber-500/5 via-transparent to-transparent',
    lcdShadow: false,
  },
  {
    id: 'led-green',
    name: 'Radioactive Green',
    activeColor: '#00ff44', // Cyber green
    inactiveColor: '#002604', // Inactive segment dark forest green
    glowColor: '#00ff44',
    bgClass: 'from-zinc-950 via-black to-zinc-950 text-emerald-500 shadow-2xl',
    glassOverlayClass: 'bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent',
    lcdShadow: false,
  },
  {
    id: 'led-ice',
    name: 'Ice Cyberpunk',
    activeColor: '#00e5ff', // Neon cyan
    inactiveColor: '#002633', // Deep ocean teal inactive
    glowColor: '#00e5ff',
    bgClass: 'from-slate-950 via-zinc-950 to-slate-950 text-cyan-400 shadow-2xl',
    glassOverlayClass: 'bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent',
    lcdShadow: false,
  },
];

export const VINTAGE_BG_IMAGE_PATH = vintageBg;
export const FALLBACK_VINTAGE_BG_IMAGE = 'https://picsum.photos/seed/vintageclock/1920/1080?blur=1';
