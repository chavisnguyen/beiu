import React, { useCallback, useEffect, useRef } from 'react';
import musicSrc from '../assets/audio/music.mp3';

export default function BackgroundMusic() {
  const audioRef = useRef(null);

  const tryPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve(false);

    audio.volume = 0.55;
    return audio.play().then(() => true).catch(() => false);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    tryPlay();

    const resume = () => {
      if (audio.paused) tryPlay();
    };

    window.addEventListener('pointerdown', resume);

    return () => {
      window.removeEventListener('pointerdown', resume);
    };
  }, [tryPlay]);

  return <audio ref={audioRef} src={musicSrc} loop preload="auto" autoPlay />;
}
