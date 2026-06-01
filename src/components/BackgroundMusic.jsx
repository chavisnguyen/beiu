import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Music, VolumeX } from 'lucide-react';
import musicSrc from '../assets/audio/music.mp3';
import greetings from '../content/greetings.json';

const { play: musicPlayLabel, pause: musicPauseLabel } = greetings.music;

export default function BackgroundMusic() {
  const audioRef = useRef(null);
  const userPausedRef = useRef(false);
  const [playing, setPlaying] = useState(true);

  const tryPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve(false);

    audio.volume = 0.55;
    return audio
      .play()
      .then(() => {
        setPlaying(true);
        return true;
      })
      .catch(() => false);
  }, []);

  const pauseMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    userPausedRef.current = true;
    audio.pause();
    setPlaying(false);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncPlaying = () => setPlaying(!audio.paused);
    audio.addEventListener('play', syncPlaying);
    audio.addEventListener('pause', syncPlaying);

    tryPlay();

    const resumeIfAllowed = () => {
      if (!userPausedRef.current && audio.paused) {
        tryPlay();
      }
    };

    window.addEventListener('pointerdown', resumeIfAllowed);

    return () => {
      audio.removeEventListener('play', syncPlaying);
      audio.removeEventListener('pause', syncPlaying);
      window.removeEventListener('pointerdown', resumeIfAllowed);
    };
  }, [tryPlay]);

  const toggleMusic = () => {
    if (playing) {
      pauseMusic();
    } else {
      userPausedRef.current = false;
      tryPlay();
    }
  };

  return (
    <>
      <audio ref={audioRef} src={musicSrc} loop preload="auto" autoPlay />
      <button
        type="button"
        className="bg-music-toggle"
        onClick={toggleMusic}
        aria-label={playing ? musicPauseLabel : musicPlayLabel}
      >
        {playing ? <Music size={20} className="bg-music-spin" /> : <VolumeX size={20} />}
      </button>
      <style>{`
        .bg-music-toggle {
          position: fixed;
          top: 24px;
          right: 24px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 200;
          backdrop-filter: blur(8px);
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .bg-music-toggle:hover {
          background: rgba(255, 77, 109, 0.2);
          border-color: var(--pink-accent);
          transform: scale(1.06);
        }

        .bg-music-spin {
          animation: bgMusicSpin 4s linear infinite;
        }

        @keyframes bgMusicSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
