import { useContext } from "react";
import { AudioCtx } from "@/audio/AudioContext";

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return ctx;
}
