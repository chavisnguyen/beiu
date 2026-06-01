import React, { useState, useEffect } from 'react';
import { Delete } from 'lucide-react';
import greetings from '../content/greetings.json';

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

      <style>{`
        .password-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100vh;
          position: relative;
          background-color: #3b111a;
          background-image: radial-gradient(circle at center, #4d1823 0%, #20070c 100%);
        }

        .cats-avatar-container {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          z-index: 1;
        }

        .cat-wrapper {
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
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
          z-index: 1;
        }

        .password-header h2 {
          font-size: 1.8rem;
          color: #fff;
          margin-bottom: 6px;
          letter-spacing: 1px;
        }

        .password-header p {
          color: #fff;
          font-size: 0.95rem;
          opacity: 0.8;
        }

        .dots-container {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          z-index: 1;
        }

        .dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #ff4d6d;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background: transparent;
        }

        .dot.active {
          background-color: #ff4d6d;
          box-shadow: 0 0 10px #ff4d6d, 0 0 20px rgba(255, 77, 109, 0.5);
          transform: scale(1.1);
        }

        .dot.error {
          border-color: #ff3333;
          background-color: #ff3333;
          box-shadow: 0 0 10px #ff3333;
        }

        .dot.success {
          border-color: #2ec4b6;
          background-color: #2ec4b6;
          box-shadow: 0 0 10px #2ec4b6;
        }

        .loading-text {
          font-size: 1.2rem;
          color: #ff9fb2;
          animation: pulse 1.5s infinite;
          margin-top: 50px;
          z-index: 1;
          font-weight: 500;
        }

        .keypad-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
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
          border: none;
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          font-size: 1.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
        }

        .keypad-row button:active {
          background: #ff4d6d;
          transform: scale(0.92);
          box-shadow: 0 0 15px rgba(255, 77, 109, 0.4);
        }

        .keypad-row button:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .keypad-row button.empty-btn {
          background: transparent;
          cursor: default;
          pointer-events: none;
        }

        .keypad-row button.del-btn {
          color: #ff9fb2;
        }

        .keypad-row button.del-btn:hover {
          background: rgba(255, 77, 109, 0.1);
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
          .cats-avatar-container {
            margin-bottom: 12px;
          }
          .password-header {
            margin-bottom: 15px;
          }
          .dots-container {
            margin-bottom: 25px;
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
