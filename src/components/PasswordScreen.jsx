import React, { useState, useEffect } from 'react';
import { Delete } from 'lucide-react';
import greetings from '../content/greetings.json';
import bgSrc from '../assets/bg.jpg';

const { code: correctPassword, title, subtitle, loading: loadingText } = greetings.password;

export default function PasswordScreen({ onCorrectPassword }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (num) => {
    if (loading || error) return;
    if (password.length < 4) {
      const newPassword = password + num;
      setPassword(newPassword);
    }
  };

  const handleDelete = () => {
    if (loading || error) return;
    setPassword(password.slice(0, -1));
  };

  useEffect(() => {
    if (password.length === 4) {
      if (password === correctPassword) {
        setLoading(true);
        setTimeout(() => {
          onCorrectPassword();
        }, 1500);
      } else {
        setError(true);
        // Play error feedback (shake)
        setTimeout(() => {
          setPassword('');
          setError(false);
        }, 800);
      }
    }
  }, [password, onCorrectPassword]);

  return (
    <div className={`password-container ${error ? 'shake' : ''}`}>
      <div className="password-glass-panel">
      {/* Peach & Goma cute cats container */}
      <div className="cats-avatar-container">
        <div className="cat-wrapper pink-cat">
          <svg viewBox="0 0 100 100" width="80" height="80">
            {/* Pink Cat (Peach) SVG */}
            <circle cx="50" cy="55" r="30" fill="#ffdce5" />
            <circle cx="50" cy="45" r="26" fill="#ffdce5" />
            {/* Ears */}
            <polygon points="28,26 40,36 26,42" fill="#ffb3c1" stroke="#ffdce5" strokeWidth="2" />
            <polygon points="72,26 60,36 74,42" fill="#ffb3c1" stroke="#ffdce5" strokeWidth="2" />
            {/* Eyes */}
            <circle cx="38" cy="45" r="3" fill="#3b111a" className="cat-eye" />
            <circle cx="62" cy="45" r="3" fill="#3b111a" className="cat-eye" />
            {/* Blush cheeks */}
            <circle cx="32" cy="52" r="4" fill="#ff4d6d" opacity="0.6" />
            <circle cx="68" cy="52" r="4" fill="#ff4d6d" opacity="0.6" />
            {/* Mouth */}
            <path d="M47,50 Q50,53 53,50" fill="none" stroke="#3b111a" strokeWidth="2" strokeLinecap="round" />
            {/* Paws */}
            <circle cx="40" cy="78" r="7" fill="#ffdce5" />
            <circle cx="60" cy="78" r="7" fill="#ffdce5" />
          </svg>
        </div>

        <div className="cat-wrapper brown-cat">
          <svg viewBox="0 0 100 100" width="80" height="80">
            {/* White/Brown Cat (Goma) SVG */}
            <circle cx="50" cy="55" r="30" fill="#fcfcfc" />
            <circle cx="50" cy="45" r="26" fill="#fcfcfc" />
            {/* Brown ears & spot */}
            <polygon points="28,26 40,36 26,42" fill="#ddb892" stroke="#fcfcfc" strokeWidth="2" />
            <polygon points="72,26 60,36 74,42" fill="#fcfcfc" stroke="#fcfcfc" strokeWidth="2" />
            <path d="M56,23 A26,26 0 0,1 74,38 Z" fill="#ddb892" />
            {/* Eyes */}
            <circle cx="38" cy="45" r="3" fill="#3b111a" className="cat-eye" />
            <circle cx="62" cy="45" r="3" fill="#3b111a" className="cat-eye" />
            {/* Blush cheeks */}
            <circle cx="32" cy="52" r="3" fill="#ffb3c1" opacity="0.6" />
            <circle cx="68" cy="52" r="3" fill="#ffb3c1" opacity="0.6" />
            {/* Mouth */}
            <path d="M47,50 Q50,52 53,50" fill="none" stroke="#3b111a" strokeWidth="2" strokeLinecap="round" />
            {/* Paws */}
            <circle cx="40" cy="78" r="7" fill="#fcfcfc" />
            <circle cx="60" cy="78" r="7" fill="#fcfcfc" />
          </svg>
        </div>
      </div>

      <div className="password-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {/* Dots display */}
      <div className="dots-container">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`dot ${password.length > index ? 'active' : ''} ${error ? 'error' : ''} ${
              loading ? 'success' : ''
            }`}
          />
        ))}
      </div>

      {loading ? (
        <div className="loading-text">{loadingText}</div>
      ) : (
        <div className="keypad-container">
          <div className="keypad-row">
            <button onClick={() => handleKeyPress('1')}>1</button>
            <button onClick={() => handleKeyPress('2')}>2</button>
            <button onClick={() => handleKeyPress('3')}>3</button>
          </div>
          <div className="keypad-row">
            <button onClick={() => handleKeyPress('4')}>4</button>
            <button onClick={() => handleKeyPress('5')}>5</button>
            <button onClick={() => handleKeyPress('6')}>6</button>
          </div>
          <div className="keypad-row">
            <button onClick={() => handleKeyPress('7')}>7</button>
            <button onClick={() => handleKeyPress('8')}>8</button>
            <button onClick={() => handleKeyPress('9')}>9</button>
          </div>
          <div className="keypad-row">
            <button className="empty-btn" disabled></button>
            <button onClick={() => handleKeyPress('0')}>0</button>
            <button className="del-btn" onClick={handleDelete}>
              <Delete size={20} />
            </button>
          </div>
        </div>
      )}
      </div>

      <style>{`
        .password-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100vh;
          position: relative;
          background-color: #20070c;
          background-image: url(${bgSrc});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .password-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(32, 7, 12, 0.15) 0%,
            rgba(20, 5, 10, 0.35) 100%
          );
          z-index: 0;
        }

        .password-glass-panel {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: min(92vw, 380px);
          padding: 2rem 1.5rem 1.75rem;
          border-radius: 36px;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.22) 0%,
            rgba(255, 255, 255, 0.08) 45%,
            rgba(255, 180, 200, 0.12) 100%
          );
          backdrop-filter: blur(28px) saturate(1.5);
          -webkit-backdrop-filter: blur(28px) saturate(1.5);
          border: 1px solid rgba(255, 255, 255, 0.38);
          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.28),
            inset 0 1px 1px rgba(255, 255, 255, 0.5),
            inset 0 -1px 1px rgba(255, 255, 255, 0.06),
            var(--glass-glow);
          overflow: hidden;
        }

        .password-glass-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.75),
            transparent
          );
          pointer-events: none;
        }

        .password-glass-panel::after {
          content: '';
          position: absolute;
          top: -40%;
          left: -20%;
          width: 60%;
          height: 80%;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.18) 0%,
            transparent 70%
          );
          pointer-events: none;
          animation: liquidShine 8s ease-in-out infinite;
        }

        @keyframes liquidShine {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(30%, 20%) scale(1.1); opacity: 1; }
        }

        .cats-avatar-container {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .cat-wrapper {
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
          animation: bounceSlow 3s ease-in-out infinite;
        }

        .pink-cat {
          animation-delay: 0s;
        }

        .brown-cat {
          animation-delay: 1.5s;
        }

        .password-header {
          text-align: center;
          margin-bottom: 30px;
          position: relative;
          z-index: 1;
        }

        .password-header h2 {
          font-size: 1.8rem;
          color: #fff;
          margin-bottom: 6px;
          letter-spacing: 1px;
          text-shadow: 0 1px 12px rgba(0, 0, 0, 0.35);
        }

        .password-header p {
          color: rgba(255, 255, 255, 0.92);
          font-size: 0.95rem;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
        }

        .dots-container {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          padding: 12px 28px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
          position: relative;
          z-index: 1;
        }

        .dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255, 77, 109, 0.85);
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2);
        }

        .dot.active {
          background: linear-gradient(145deg, #ff6b8a, #ff4d6d);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow:
            0 0 12px rgba(255, 77, 109, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }

        .dot.error {
          border-color: rgba(255, 100, 100, 0.9);
          background: linear-gradient(145deg, #ff5555, #e02828);
          box-shadow: 0 0 12px rgba(255, 51, 51, 0.6);
        }

        .dot.success {
          border-color: rgba(255, 255, 255, 0.45);
          background: linear-gradient(145deg, #3dd9cc, #2ec4b6);
          box-shadow: 0 0 12px rgba(46, 196, 182, 0.6);
        }

        .loading-text {
          font-size: 1.2rem;
          color: #fff;
          animation: pulse 1.5s infinite;
          margin-top: 24px;
          padding: 10px 24px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          position: relative;
          z-index: 1;
          font-weight: 500;
          text-shadow: 0 0 12px rgba(255, 159, 178, 0.8);
        }

        .keypad-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .keypad-row {
          display: flex;
          gap: 24px;
          justify-content: center;
        }

        .keypad-row button {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.32);
          background: linear-gradient(
            160deg,
            rgba(255, 255, 255, 0.28) 0%,
            rgba(255, 255, 255, 0.08) 100%
          );
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          color: #fff;
          font-size: 1.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            inset 0 -2px 4px rgba(0, 0, 0, 0.06);
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        .keypad-row button:active {
          background: linear-gradient(
            160deg,
            rgba(255, 77, 109, 0.75) 0%,
            rgba(255, 77, 109, 0.45) 100%
          );
          border-color: rgba(255, 255, 255, 0.5);
          transform: scale(0.92);
          box-shadow:
            0 0 20px rgba(255, 77, 109, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.35);
        }

        .keypad-row button:hover {
          background: linear-gradient(
            160deg,
            rgba(255, 255, 255, 0.38) 0%,
            rgba(255, 255, 255, 0.14) 100%
          );
          border-color: rgba(255, 255, 255, 0.45);
          transform: scale(1.04);
        }

        .keypad-row button.empty-btn {
          background: transparent;
          border-color: transparent;
          box-shadow: none;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          cursor: default;
          pointer-events: none;
        }

        .keypad-row button.del-btn {
          color: #ffe0e8;
        }

        .keypad-row button.del-btn:hover {
          background: linear-gradient(
            160deg,
            rgba(255, 77, 109, 0.35) 0%,
            rgba(255, 77, 109, 0.15) 100%
          );
          border-color: rgba(255, 159, 178, 0.5);
        }

        /* Shake animation for incorrect password */
        .shake {
          animation: shakeEffect 0.5s ease-in-out;
        }

        @keyframes shakeEffect {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }

        /* Subtle responsive design */
        @media (max-height: 700px) {
          .password-glass-panel {
            padding: 1.25rem 1.25rem 1rem;
            border-radius: 28px;
          }
          .cats-avatar-container {
            margin-bottom: 12px;
          }
          .password-header {
            margin-bottom: 15px;
          }
          .dots-container {
            margin-bottom: 25px;
            padding: 10px 22px;
          }
          .keypad-row {
            gap: 16px;
          }
          .keypad-row button {
            width: 60px;
            height: 60px;
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
}
