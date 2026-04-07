export type AudioEventCallback = () => void;
export type TimeUpdateCallback = (currentTime: number, duration: number) => void;

export class AudioEngine {
  private playerA: HTMLAudioElement;
  private playerB: HTMLAudioElement;
  private activePlayer: "A" | "B" = "A";
  private fadeTimer: number | null = null;
  private volume = 1;

  onTimeUpdate: TimeUpdateCallback | null = null;
  onEnded: AudioEventCallback | null = null;
  onError: ((message: string) => void) | null = null;
  onPlayStateChange: ((playing: boolean) => void) | null = null;

  constructor() {
    this.playerA = new Audio();
    this.playerB = new Audio();
    this.playerA.preload = "auto";
    this.playerB.preload = "auto";

    const wireEvents = (player: HTMLAudioElement) => {
      player.addEventListener("timeupdate", () => {
        if (player === this.active) {
          this.onTimeUpdate?.(player.currentTime, player.duration || 0);
        }
      });
      player.addEventListener("ended", () => {
        if (player === this.active) {
          this.onPlayStateChange?.(false);
          this.onEnded?.();
        }
      });
      player.addEventListener("error", () => {
        if (player === this.active) {
          this.onError?.(player.error?.message ?? "Audio playback error");
        }
      });
      player.addEventListener("play", () => {
        if (player === this.active) this.onPlayStateChange?.(true);
      });
      player.addEventListener("pause", () => {
        if (player === this.active) this.onPlayStateChange?.(false);
      });
    };

    wireEvents(this.playerA);
    wireEvents(this.playerB);
  }

  private get active(): HTMLAudioElement {
    return this.activePlayer === "A" ? this.playerA : this.playerB;
  }

  private get inactive(): HTMLAudioElement {
    return this.activePlayer === "A" ? this.playerB : this.playerA;
  }

  async play(url: string, crossfadeDuration = 2000): Promise<void> {
    this.cancelFade();

    const outgoing = this.active;
    const incoming = this.inactive;

    incoming.src = url;
    incoming.volume = 0;

    try {
      await incoming.play();
    } catch {
      // Autoplay blocked — user gesture required
      this.onError?.("Tap play to start audio");
      return;
    }

    // If outgoing is playing, crossfade; otherwise just swap
    if (!outgoing.paused && outgoing.src) {
      this.crossfade(outgoing, incoming, crossfadeDuration);
    } else {
      incoming.volume = this.volume;
      outgoing.pause();
      outgoing.src = "";
    }

    this.activePlayer = this.activePlayer === "A" ? "B" : "A";
  }

  private crossfade(
    outgoing: HTMLAudioElement,
    incoming: HTMLAudioElement,
    duration: number,
  ): void {
    const steps = 30;
    const interval = duration / steps;
    const startVolume = outgoing.volume;
    let step = 0;

    this.fadeTimer = window.setInterval(() => {
      step++;
      const progress = step / steps;
      outgoing.volume = Math.max(0, startVolume * (1 - progress));
      incoming.volume = this.volume * progress;

      if (step >= steps) {
        this.cancelFade();
        outgoing.pause();
        outgoing.src = "";
        outgoing.volume = 0;
        incoming.volume = this.volume;
      }
    }, interval);
  }

  private cancelFade(): void {
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  pause(): void {
    this.active.pause();
  }

  resume(): void {
    this.active.play().catch(() => {
      this.onError?.("Tap play to start audio");
    });
  }

  togglePlayPause(): void {
    if (this.active.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  seek(time: number): void {
    this.active.currentTime = time;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (!this.fadeTimer) {
      this.active.volume = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  isPlaying(): boolean {
    return !this.active.paused;
  }

  getCurrentTime(): number {
    return this.active.currentTime;
  }

  getDuration(): number {
    return this.active.duration || 0;
  }

  destroy(): void {
    this.cancelFade();
    this.playerA.pause();
    this.playerB.pause();
    this.playerA.src = "";
    this.playerB.src = "";
  }
}
