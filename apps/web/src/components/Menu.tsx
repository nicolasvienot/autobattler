import { useEffect } from "react";
import { audioManager } from "../utils/audio";

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  isMusicMuted: boolean;
  setIsMusicMuted: (muted: boolean) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  onRestart?: () => void;
  onBackToHome?: () => void;
}

export default function Menu({
  isOpen,
  onClose,
  isMusicPlaying,
  setIsMusicPlaying,
  isMusicMuted,
  setIsMusicMuted,
  musicVolume,
  setMusicVolume,
  onRestart,
  onBackToHome,
}: MenuProps) {
  // Handle ESC key to close menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Audio control functions
  const toggleMusic = async () => {
    if (isMusicPlaying) {
      audioManager.pause();
      setIsMusicPlaying(false);
    } else {
      await audioManager.play();
      setIsMusicPlaying(audioManager.getIsPlaying());
    }
  };

  const toggleMute = () => {
    const muted = audioManager.toggleMute();
    setIsMusicMuted(muted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setMusicVolume(newVolume);
    audioManager.setVolume(newVolume);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="menu-backdrop"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Menu Modal */}
        <div
          className="menu-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "var(--panel)",
            border: "2px solid #252a33",
            borderRadius: "10px",
            padding: "32px",
            minWidth: "320px",
            maxWidth: "400px",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h2 style={{ margin: 0, color: "var(--text)" }}>Settings</h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "var(--text)",
                padding: "4px",
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Game Controls */}
            {(onRestart || onBackToHome) && (
              <>
                <h3 style={{ margin: 0, color: "var(--text)" }}>🎮 Game</h3>
                <div className="game-controls">
                  {onRestart && (
                    <button className="secondary" onClick={onRestart}>
                      🔄 Restart Game
                    </button>
                  )}
                  {onBackToHome && (
                    <button className="secondary" onClick={onBackToHome}>
                      🏠 Back to Home
                    </button>
                  )}
                </div>
              </>
            )}

            <h3 style={{ margin: 0, color: "var(--text)" }}>🎵 Audio</h3>

            {/* Music Controls */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="secondary" onClick={toggleMusic}>
                {isMusicPlaying ? "⏸️ Pause Music" : "▶️ Play Music"}
              </button>
              <button className="secondary" onClick={toggleMute}>
                {isMusicMuted ? "🔊 Unmute" : "🔇 Mute"}
              </button>
            </div>

            {/* Volume Control */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <label style={{ minWidth: "60px", color: "var(--text)" }}>
                Volume
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={musicVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                disabled={isMusicMuted}
                style={{ flex: 1 }}
              />
              <span
                style={{
                  minWidth: "40px",
                  textAlign: "right",
                  color: "var(--text)",
                }}
              >
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
