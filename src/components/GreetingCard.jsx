import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import greetings from '../content/greetings.json';

const { envelopeHint, header, messages, footer } = greetings.greetingCard;
const text1 = messages.paragraph1;
const text2 = messages.paragraph2;

export default function GreetingCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [typedText1, setTypedText1] = useState('');
  const [typedText2, setTypedText2] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTypedText1('');
      setTypedText2('');
      return;
    }

    let cancelled = false;
    const timers = [];

    const schedule = (fn, ms) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    setTypedText1('');
    setTypedText2('');

    let index1 = 0;
    const typeText1 = () => {
      if (cancelled) return;
      index1 += 1;
      setTypedText1(text1.slice(0, index1));
      if (index1 < text1.length) {
        schedule(typeText1, 55);
      } else {
        schedule(typeText2, 450);
      }
    };

    let index2 = 0;
    const typeText2 = () => {
      if (cancelled) return;
      index2 += 1;
      setTypedText2(text2.slice(0, index2));
      if (index2 < text2.length) {
        schedule(typeText2, 55);
      }
    };

    schedule(typeText1, 900);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [isOpen]);

  const handleOpenLetter = () => {
    setIsOpen(true);
  };

  return (
    <div className="greeting-container">
      {!isOpen ? (
        // 1. Envelope Flying Screen
        <div className="envelope-wrapper" onClick={handleOpenLetter}>
          <div className="wings left-wing">
            <svg viewBox="0 0 100 100" width="80" height="80">
              <path d="M90 60 C50 40, 20 20, 10 50 C20 70, 50 60, 90 60 Z" fill="#ffdce5" opacity="0.8" />
              <path d="M80 60 C50 45, 30 35, 20 50 C30 65, 50 60, 80 60 Z" fill="#ffb3c1" opacity="0.6" />
            </svg>
          </div>
          
          <div className="envelope">
            <div className="envelope-front">
              <div className="heart-seal">
                <Heart fill="#ff4d6d" stroke="none" className="pulse-heart" size={32} />
              </div>
            </div>
          </div>

          <div className="wings right-wing">
            <svg viewBox="0 0 100 100" width="80" height="80">
              <path d="M10 60 C50 40, 80 20, 90 50 C80 70, 50 60, 10 60 Z" fill="#ffdce5" opacity="0.8" />
              <path d="M20 60 C50 45, 70 35, 80 50 C70 65, 50 60, 20 60 Z" fill="#ffb3c1" opacity="0.6" />
            </svg>
          </div>
          
          <div className="click-me-text">{envelopeHint}</div>
        </div>
      ) : (
        // 2. Greeting Card Popup
        <div className="card-wrapper-modal">
          <div className="gift-card">
            {/* Header decoration */}
            <div className="card-decor-butterfly">
              <svg viewBox="0 0 100 100" width="50" height="50">
                <path d="M50 50 C20 20, 10 40, 45 60 C15 70, 20 90, 48 70 C49 72, 51 72, 52 70 C80 90, 85 70, 55 60 C90 40, 80 20, 50 50 Z" fill="#ff4d6d" opacity="0.8" />
                <circle cx="50" cy="58" r="2.5" fill="#fff" />
              </svg>
            </div>

            <div className="card-header">
              <h3>{header.title}</h3>
              <div className="date-badge">{header.date}</div>
              <h4>{header.subtitle}</h4>
            </div>

            <div className="card-body">
              <p className="typed-paragraph text-highlight" aria-label={text1}>
                {typedText1}
              </p>
              <p
                className={`typed-paragraph text-standard${typedText2.length > 0 || typedText1.length >= text1.length ? ' is-active' : ''}`}
                aria-label={text2}
              >
                {typedText2}
              </p>
            </div>

            <div className="card-footer">
              <p>{footer}</p>
              <Heart fill="#ff4d6d" stroke="none" size={16} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .greeting-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d0104;
          z-index: 10;
        }

        /* 1. Envelope styles */
        .envelope-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
          animation: float 4s ease-in-out infinite;
          z-index: 15;
        }

        .envelope {
          width: 160px;
          height: 110px;
          background-color: #ffdce5;
          border-radius: 8px;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          border: 2px solid #ff4d6d;
        }

        .envelope-front::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 55px 80px 0 80px;
          border-color: #ffb3c1 transparent transparent transparent;
          z-index: 2;
          border-radius: 6px;
        }

        .envelope-front::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 110px 160px;
          border-color: transparent transparent #ffdce5 transparent;
          z-index: 1;
          border-radius: 6px;
        }

        .heart-seal {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -40%);
          z-index: 5;
        }

        .pulse-heart {
          animation: heartBeat 1.4s infinite ease-in-out;
          filter: drop-shadow(0 0 6px rgba(255, 77, 109, 0.8));
        }

        .wings {
          position: absolute;
          top: -20px;
          z-index: -1;
        }

        .left-wing {
          left: -80px;
          transform-origin: right bottom;
          animation: wingFlapLeft 1.2s ease-in-out infinite;
        }

        .right-wing {
          right: -80px;
          transform-origin: left bottom;
          animation: wingFlapRight 1.2s ease-in-out infinite;
        }

        @keyframes wingFlapLeft {
          0%, 100% { transform: rotateY(0deg) rotate(0deg); }
          50% { transform: rotateY(45deg) rotate(-15deg); }
        }

        @keyframes wingFlapRight {
          0%, 100% { transform: rotateY(0deg) rotate(0deg); }
          50% { transform: rotateY(-45deg) rotate(15deg); }
        }

        .click-me-text {
          position: absolute;
          bottom: -45px;
          font-size: 1.05rem;
          color: #ff9fb2;
          letter-spacing: 1px;
          white-space: nowrap;
          text-shadow: 0 0 10px rgba(255,77,109,0.3);
        }

        /* 2. Card popup styles */
        .card-wrapper-modal {
          width: 90%;
          max-width: 440px;
          z-index: 20;
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .gift-card {
          background: rgba(43, 8, 16, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid #ff4d6d;
          border-radius: 24px;
          padding: 35px 28px 30px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.6), inset 0 0 15px rgba(255, 77, 109, 0.1);
          text-align: center;
          position: relative;
          color: #fff;
          max-height: 85vh;
          overflow-y: auto;
        }

        .card-decor-butterfly {
          position: absolute;
          top: 14px;
          right: 14px;
          left: auto;
          opacity: 0.85;
          animation: float 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        .card-header h3 {
          font-size: 1.6rem;
          color: #ff9fb2;
          font-weight: 300;
          margin-bottom: 8px;
        }

        .date-badge {
          display: inline-block;
          background: var(--pink-accent);
          color: #fff;
          font-size: 1.3rem;
          font-weight: 600;
          padding: 6px 20px;
          border-radius: 50px;
          box-shadow: 0 0 15px rgba(255, 77, 109, 0.4);
          margin-bottom: 12px;
          letter-spacing: 1px;
        }

        .card-header h4 {
          font-size: 1.45rem;
          color: #fff;
          font-weight: 500;
          margin-bottom: 24px;
          letter-spacing: 0.5px;
        }

        .card-body {
          position: relative;
          z-index: 1;
          text-align: left;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          padding: 20px 22px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 25px;
          line-height: 1.65;
          overflow: visible;
        }

        .typed-paragraph {
          margin: 0 0 16px;
          padding: 0 2px;
          font-size: 1rem;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: break-word;
          font-family: inherit;
          min-height: 1.65em;
        }

        .typed-paragraph:last-child {
          margin-bottom: 0;
        }

        .text-standard {
          margin-top: 0;
          min-height: 0;
          opacity: 0.35;
          transition: opacity 0.35s ease;
        }

        .text-highlight {
          color: #ffdce5;
          font-weight: 500;
        }

        .text-standard.is-active {
          opacity: 1;
          color: rgba(255, 255, 255, 0.85);
          border-top: 1px dashed rgba(255, 77, 109, 0.25);
          padding-top: 12px;
          min-height: 1.65em;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #ff9fb2;
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .card-footer p {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
