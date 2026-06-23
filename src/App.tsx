import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Settings, Info, Clock } from 'lucide-react';
import { ClockSettings } from './types';
import { PREDEFINED_STYLES } from './constants/clockStyles';
import { ClockDisplay } from './components/ClockDisplay';
import { SettingsScreen } from './components/SettingsScreen';
import { PositionAdjustmentScreen } from './components/PositionAdjustmentScreen';
import { SizeAdjustmentScreen } from './components/SizeAdjustmentScreen';

const STORAGE_KEY = 'retro_segment_clock_settings';
const PRESETS_STORAGE_KEY = 'retro_segment_clock_presets';
const MAX_PRESETS = 3;

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

  const [presets, setPresets] = useState<ClockSettings[]>(() => {
    try {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse localStorage presets:', e);
    }
    return [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPositionAdjustmentOpen, setIsPositionAdjustmentOpen] = useState(false);
  const [isSizeAdjustmentOpen, setIsSizeAdjustmentOpen] = useState(false);
  const [isSettingsBtnVisible, setIsSettingsBtnVisible] = useState(true);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
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

  // Timer state
  const [mode, setMode] = useState<'clock' | 'timer'>('clock');
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          setTimerRunning(false);
          setTimerFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const setTimerDuration = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerInitialSeconds(seconds);
    setTimerFinished(false);
    setTimerRunning(false);
  };

  const toggleStartPauseTimer = () => {
    if (timerSeconds === null) return;
    if (timerFinished && timerInitialSeconds) {
      setTimerSeconds(timerInitialSeconds);
      setTimerFinished(false);
      setTimerRunning(true);
      return;
    }
    setTimerRunning((s) => !s);
  };

  const savePresets = (nextPresets: ClockSettings[]) => {
    setPresets(nextPresets);
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(nextPresets));
    } catch (e) {
      console.warn('Could not save presets to localStorage:', e);
    }
  };

  const handleSavePreset = () => {
    const uniquePresets = presets.filter((preset) => JSON.stringify(preset) !== JSON.stringify(settings));
    uniquePresets.push(settings);
    savePresets(uniquePresets.slice(-MAX_PRESETS));
  };

  const handleLoadPreset = (preset: ClockSettings) => {
    saveSettings(preset);
  };

  const resetHideTimer = () => {
    setIsSettingsBtnVisible(true);
    setIsControlsVisible(true);

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
        mode={mode}
        timerSeconds={timerSeconds}
        timerRunning={timerRunning}
        timerFinished={timerFinished}
        onSetTimer={setTimerDuration}
        onToggleStartPause={toggleStartPauseTimer}
        isControlsVisible={isControlsVisible}
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

      {/* Bottom-right toggle: Clock <-> Timer */}
      <AnimatePresence>
        {isControlsVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-6 right-6 z-40"
          >
            <button
              id="mode-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMode((m) => (m === 'clock' ? 'timer' : 'clock'));
                resetHideTimer();
              }}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-full shadow-lg transition-all active:scale-95 duration-100 cursor-pointer backdrop-blur-sm"
              title="Switch Clock/Timer"
            >
              <Clock className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsScreen
            settings={settings}
            presets={presets}
            onSavePreset={handleSavePreset}
            onLoadPreset={handleLoadPreset}
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
