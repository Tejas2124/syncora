import { useAudio } from "@/hooks/useAudio";
import { EmotionBadge } from "@/components/ui/EmotionBadge";
import { ProgressSlider } from "./ProgressSlider";
import { VolumeControl } from "./VolumeControl";

export function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    seek,
    setVolume,
  } = useAudio();

  if (!currentSong) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-5xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        {/* Left: song info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{currentSong.title}</p>
            <p className="truncate text-xs text-muted">{currentSong.artist}</p>
          </div>
          <EmotionBadge emotion={currentSong.emotion} className="hidden sm:inline-flex" />
        </div>

        {/* Center: controls + progress */}
        <div className="flex w-full max-w-md flex-col items-center gap-1">
          <button
            onClick={togglePlayPause}
            className="rounded-full bg-white p-1.5 text-black transition-transform hover:scale-105"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="w-full">
            <ProgressSlider
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
            />
          </div>
        </div>

        {/* Right: volume */}
        <div className="hidden flex-1 justify-end sm:flex">
          <VolumeControl volume={volume} onVolumeChange={setVolume} />
        </div>
      </div>
    </div>
  );
}
