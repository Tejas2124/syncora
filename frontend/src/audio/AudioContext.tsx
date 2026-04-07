import {
  createContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Song } from "@/types";
import { AudioEngine } from "./AudioEngine";

interface AudioState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

interface AudioContextValue extends AudioState {
  playSong: (song: Song) => Promise<void>;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
}

const VOLUME_KEY = "moodread_volume";

function loadVolume(): number {
  try {
    const v = localStorage.getItem(VOLUME_KEY);
    return v ? Number(v) : 0.8;
  } catch {
    return 0.8;
  }
}

export const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null);

  const [state, setState] = useState<AudioState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: loadVolume(),
  });

  // Initialize engine once
  if (!engineRef.current) {
    const engine = new AudioEngine();
    engine.setVolume(state.volume);
    engine.onTimeUpdate = (currentTime, duration) => {
      setState((s) => ({ ...s, currentTime, duration }));
    };
    engine.onPlayStateChange = (playing) => {
      setState((s) => ({ ...s, isPlaying: playing }));
    };
    engine.onEnded = () => {
      setState((s) => ({ ...s, isPlaying: false }));
    };
    engineRef.current = engine;
  }

  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  const playSong = useCallback(async (song: Song) => {
    setState((s) => ({ ...s, currentSong: song, currentTime: 0, duration: 0 }));
    await engineRef.current?.play(song.audioUrl);
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const togglePlayPause = useCallback(() => {
    engineRef.current?.togglePlayPause();
  }, []);

  const seek = useCallback((time: number) => {
    engineRef.current?.seek(time);
  }, []);

  const setVolume = useCallback((v: number) => {
    engineRef.current?.setVolume(v);
    localStorage.setItem(VOLUME_KEY, String(v));
    setState((s) => ({ ...s, volume: v }));
  }, []);

  return (
    <AudioCtx.Provider
      value={{
        ...state,
        playSong,
        pause,
        resume,
        togglePlayPause,
        seek,
        setVolume,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}
