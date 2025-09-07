class AudioManager {
  public audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private volume = 0.5;
  private isMuted = false;

  constructor() {
    // Initialize audio when the class is created
    this.initAudio();
  }

  private initAudio() {
    try {
      this.audio = new Audio("/audio/menu.mp3");
      this.audio.loop = true;
      this.audio.volume = this.volume;

      // Handle audio events
      this.audio.addEventListener("canplaythrough", () => {
        console.log("Audio loaded and ready to play");
      });

      this.audio.addEventListener("error", (e) => {
        console.error("Audio loading error:", e);
      });

      // Preload the audio
      this.audio.preload = "auto";
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }

  async play() {
    if (!this.audio || this.isPlaying) return;

    try {
      // Reset audio to beginning
      this.audio.currentTime = 0;
      await this.audio.play();
      this.isPlaying = true;
      console.log("Background music started");
    } catch (error) {
      console.error("Failed to play audio:", error);
      // Handle autoplay restrictions
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        console.log("Autoplay blocked - music will start on user interaction");
      }
    }
  }

  pause() {
    if (!this.audio || !this.isPlaying) return;

    this.audio.pause();
    this.isPlaying = false;
    console.log("Background music paused");
  }

  stop() {
    if (!this.audio) return;

    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    console.log("Background music stopped");
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
  }

  getVolume() {
    return this.volume;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getIsMuted() {
    return this.isMuted;
  }

  // Method to handle user interaction requirement for autoplay
  async tryPlay() {
    if (!this.isPlaying) {
      await this.play();
    }
  }
}

// Create a singleton instance
export const audioManager = new AudioManager();

// Helper function to prepare audio for user-controlled playback
export const enableAudioOnUserInteraction = () => {
  // Just prepare audio context, don't auto-play
  // This ensures audio can be played when user explicitly requests it
  const handleUserInteraction = () => {
    // Create an audio context to unlock audio on iOS/mobile browsers
    // but don't actually play anything
    if (audioManager.audio) {
      // Just ensure audio is ready, don't play
      audioManager.audio.load();
    }
    // Remove listeners after first interaction
    document.removeEventListener("click", handleUserInteraction);
    document.removeEventListener("keydown", handleUserInteraction);
    document.removeEventListener("touchstart", handleUserInteraction);
  };

  document.addEventListener("click", handleUserInteraction);
  document.addEventListener("keydown", handleUserInteraction);
  document.addEventListener("touchstart", handleUserInteraction);
};
