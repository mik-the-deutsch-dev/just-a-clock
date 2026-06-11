import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Tv, Eye, Sparkles, ShieldAlert, Monitor, Check, Compass, Moon } from 'lucide-react';
import { ClockSettings, ClockStyle, ClockBgId } from '../types';
import { PREDEFINED_STYLES } from '../constants/clockStyles';

interface SettingsScreenProps {
  settings: ClockSettings;
  onChange: (settings: ClockSettings) => void;
  onClose: () => void;
  isOpen: boolean;
  currentShift: { x: number; y: number };
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onChange,
  onClose,
  isOpen,
  currentShift,
}) => {
  const [isWakeLockSupported, setIsWakeLockSupported] = useState(false);

  useEffect(() => {
    setIsWakeLockSupported('wakeLock' in navigator);
  }, []);

  if (!isOpen) return null;

  const toggleSetting = (key: keyof ClockSettings) => {
    onChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  const setStyle = (styleId: ClockSettings['styleId']) => {
    onChange({
      ...settings,
      styleId,
    });
  };

  const setBackground = (backgroundId: ClockBgId) => {
    onChange({
      ...settings,
      backgroundId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      {/* Settings Dialog Card */}
      <motion.div
        id="settings-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Clock Settings</h2>
              <p className="text-xs text-zinc-400">Customize retro dials & safety behaviors</p>
            </div>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-zinc-300">
          {/* Group 1: Predefined Styles */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Display Style Preset</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PREDEFINED_STYLES.map((style) => {
                const isSelected = settings.styleId === style.id;
                return (
                  <button
                    key={style.id}
                    id={`style-btn-${style.id}`}
                    onClick={() => setStyle(style.id)}
                    className={`group relative flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/5 text-zinc-100'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? 'border-amber-500 bg-amber-500' : 'border-zinc-650'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-200 text-sm group-hover:text-zinc-100">
                        {style.name}
                      </p>
                      <p className="text-xs text-zinc-400 flex items-center gap-1">
                        Segment color: 
                        <span 
                          className="inline-block w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{
                            backgroundColor: style.activeColor,
                            boxShadow: style.glowColor ? `0 0 4px ${style.glowColor}` : 'none'
                          }}
                        />
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Glass / Backplate Textures */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              <Eye className="w-3.5 h-3.5 text-amber-500" />
              <span>Background & Glass Overlay</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'Solid Black', desc: 'Saves power' },
                { id: 'vintage-glass', label: 'Vintage Lens', desc: 'Old clock plate' },
                { id: 'brushed-metal', label: 'Dark Metal', desc: 'Clean metallic' },
              ].map((bgOption) => {
                const isSelected = settings.backgroundId === bgOption.id;
                return (
                  <button
                    key={bgOption.id}
                    id={`bg-btn-${bgOption.id}`}
                    onClick={() => setBackground(bgOption.id as ClockBgId)}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/5 text-zinc-100'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="font-semibold text-xs text-zinc-200">{bgOption.label}</span>
                    <span className="text-[10px] text-zinc-400 leading-none">{bgOption.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 3: System Options (Wake lock, Seconds, 12h/24h) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              <Monitor className="w-3.5 h-3.5 text-amber-500" />
              <span>Display Preferences</span>
            </div>

            <div className="space-y-2">
              {/* Keep screen always on */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/20 border border-zinc-800/80">
                <div className="flex flex-col gap-0.5 max-w-[75%]">
                  <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    Keep Screen Always On
                    {isWakeLockSupported ? (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded-md font-mono">
                        NATIVE OK
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded-md font-mono">
                        SIMULATED
                      </span>
                    )}
                  </span>
                  <p className="text-xs text-zinc-400 leading-tight">
                    Prevents screen dims or lockouts while running the clock. Ideal for table clock stands.
                  </p>
                </div>
                <button
                  id="toggle-always-on"
                  type="button"
                  onClick={() => toggleSetting('keepAlwaysOn')}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    settings.keepAlwaysOn ? 'bg-amber-500' : 'bg-zinc-750'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      settings.keepAlwaysOn ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle Seconds */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/20 border border-zinc-800/80">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-zinc-200">Show Seconds</span>
                  <p className="text-xs text-zinc-400 leading-tight">
                    Display seconds digits. Disable for a simpler, calmer clock aspect.
                  </p>
                </div>
                <button
                  id="toggle-show-seconds"
                  type="button"
                  onClick={() => toggleSetting('showSeconds')}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    settings.showSeconds ? 'bg-amber-500' : 'bg-zinc-750'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      settings.showSeconds ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Time Format */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/20 border border-zinc-800/80">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-zinc-200">Use 24-Hour Military Format</span>
                  <p className="text-xs text-zinc-400 leading-tight">
                    Toggle between standard 12-Hour (AM/PM indicator) and 24-Hour layouts.
                  </p>
                </div>
                <button
                  id="toggle-use-24hr"
                  type="button"
                  onClick={() => toggleSetting('use24Hour')}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    settings.use24Hour ? 'bg-amber-500' : 'bg-zinc-750'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      settings.use24Hour ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Group 4: OLED Burn-in Protection */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>OLED Prevent Pixel Burn-Out</span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5 max-w-[75%]">
                  <span className="font-semibold text-zinc-200">Anti-Burn Shift Engine</span>
                  <p className="text-xs text-zinc-400 leading-tight">
                    Slightly drifts the clock face position to redistribute glowing subpixel wearing.
                  </p>
                </div>
                <button
                  id="toggle-pixel-shift"
                  type="button"
                  onClick={() => toggleSetting('burnInProtection')}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    settings.burnInProtection ? 'bg-amber-500' : 'bg-zinc-750'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      settings.burnInProtection ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.burnInProtection && (
                <div className="pt-2 border-t border-zinc-800/60 leading-normal flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Compass className="w-4 h-4 text-amber-500 animate-[spin_8s_linear_infinite]" />
                    <span>
                      Live Shift Offset: 
                      <strong className="font-mono text-zinc-200 ml-1">
                        dx={currentShift.x.toFixed(1)}px, dy={currentShift.y.toFixed(1)}px
                      </strong>
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-lg">
                    Smooth orbit shift active
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1">
            <Moon className="w-3.5 h-3.5 text-zinc-500" />
            <span>Close Settings to resume clock standby</span>
          </div>
          <button
            id="apply-settings-btn"
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-all shadow-md active:shadow-none"
          >
            Apply Active Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};
