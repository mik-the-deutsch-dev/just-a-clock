import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Settings, Info } from 'lucide-react';
import { ClockSettings } from './types';
import { PREDEFINED_STYLES } from './constants/clockStyles';
import { ClockDisplay } from './components/ClockDisplay';
import { SettingsScreen } from './components/SettingsScreen';
import { PositionAdjustmentScreen } from './components/PositionAdjustmentScreen';
import { SizeAdjustmentScreen } from './components/SizeAdjustmentScreen';

const STORAGE_KEY = 'retro_segment_clock_settings';

const DEFAULT_SETTINGS: ClockSettings = {
  styleId: 'led-red',
  backgroundId: 'vintage-glass',
  keepAlwaysOn: true,
  showSeconds: true,
  use24Hour: false,
  burnInProtection: true,
  burnInSpeed: 'medium',
  shiftIntensity: 4.5,
  displayPositionX: 50,
  displayPositionY: 70,
  displayWidthPercent: 80,
  displayHeightPercent: 80,
  displayFontPercent: 80,
};

export default function App() {
  const [settings, setSettings] = useState<ClockSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Could not parse localStorage settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPositionAdjustmentOpen, setIsPositionAdjustmentOpen] = useState(false);
  const [isSizeAdjustmentOpen, setIsSizeAdjustmentOpen] = useState(false);
  const [isSettingsBtnVisible, setIsSettingsBtnVisible] = useState(true);
  const [currentShift, setCurrentShift] = useState({ x: 0, y: 0 });
  const [showGuide, setShowGuide] = useState(true);

  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveSettings = (newSettings: ClockSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  const resetHideTimer = () => {
    setIsSettingsBtnVisible(true);

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      if (!isSettingsOpen && !isPositionAdjustmentOpen && !isSizeAdjustmentOpen) {
        setIsSettingsBtnVisible(false);
      }
    }, 15000);
  };

  const handleStageInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('#settings-card') ||
      target.closest('#position-card') ||
      target.closest('#size-card')
    ) {
      return;
    }
    resetHideTimer();
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isSettingsOpen, isPositionAdjustmentOpen, isSizeAdjustmentOpen]);

  useEffect(() => {
    if (!settings.burnInProtection) {
      setCurrentShift({ x: 0, y: 0 });
      return;
    }

    let angleIndex = 0;
    const interval = setInterval(() => {
      angleIndex = (angleIndex + 10) % 360;
      const radians = (angleIndex * Math.PI) / 180;
      const intensity = settings.shiftIntensity;

      const dx = Math.cos(radians) * intensity;
      const dy = Math.sin(radians) * intensity;

      setCurrentShift({ x: dx, y: dy });
    }, 8000);

    return () => clearInterval(interval);
  }, [settings.burnInProtection, settings.shiftIntensity]);

  const activeStyle = PREDEFINED_STYLES.find((s) => s.id === settings.styleId) || PREDEFINED_STYLES[0];

  return (
    <div
      id="app-container"
      onClick={handleStageInteraction}
      onTouchStart={handleStageInteraction}
      className="relative w-screen h-screen bg-black overflow-hidden flex flex-col font-sans select-none"
    >
      <ClockDisplay
        settings={settings}
        activeStyle={activeStyle}
        currentShift={currentShift}
      />

      <AnimatePresence>
        {isSettingsBtnVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-4 right-6 z-40 flex items-center gap-2"
          >
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center gap-2 bg-zinc-900/90 text-zinc-300 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs backdrop-blur-md"
              >
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Tap screen to show settings again</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGuide(false);
                  }}
                  className="hover:text-white ml-1 font-bold font-mono text-[10px]"
                >
                  [OK]
                </button>
              </motion.div>
            )}

            <button
              id="settings-trigger-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(true);
              }}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-full shadow-lg transition-all active:scale-95 duration-100 cursor-pointer backdrop-blur-sm"
              title="Open Clock Settings"
            >
              <Settings className="w-5 h-5 animate-[spin_25s_linear_infinite]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsScreen
            settings={settings}
            onChange={saveSettings}
            onClose={() => {
              setIsSettingsOpen(false);
              resetHideTimer();
            }}
            isOpen={isSettingsOpen}
            currentShift={currentShift}
            onAdjustPosition={() => {
              setIsSettingsOpen(false);
              setIsPositionAdjustmentOpen(true);
            }}
            onAdjustSize={() => {
              setIsSettingsOpen(false);
              setIsSizeAdjustmentOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPositionAdjustmentOpen && (
          <PositionAdjustmentScreen
            settings={settings}
            activeStyle={activeStyle}
            onChange={saveSettings}
            onClose={() => {
              setIsPositionAdjustmentOpen(false);
              resetHideTimer();
            }}
            isOpen={isPositionAdjustmentOpen}
            currentShift={currentShift}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSizeAdjustmentOpen && (
          <SizeAdjustmentScreen
            settings={settings}
            activeStyle={activeStyle}
            onChange={saveSettings}
            onClose={() => {
              setIsSizeAdjustmentOpen(false);
              resetHideTimer();
            }}
            isOpen={isSizeAdjustmentOpen}
            currentShift={currentShift}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
