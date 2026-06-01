import React, { useCallback, useState } from 'react';
import PasswordScreen from './components/PasswordScreen';
import TextExplosion from './components/TextExplosion';
import ThreeSphere from './components/ThreeSphere';
import GreetingCard from './components/GreetingCard';
import BackgroundMusic from './components/BackgroundMusic';
import './App.css';

function App() {
  const [stage, setStage] = useState('password'); // 'password', 'text-explosion', 'three-sphere', 'greeting-card'

  const goToTextExplosion = useCallback(() => setStage('text-explosion'), []);
  const goToThreeSphere = useCallback(() => setStage('three-sphere'), []);
  const goToGreetingCard = useCallback(() => setStage('greeting-card'), []);

  return (
    <div className="app-main-wrapper">
      <BackgroundMusic />
      {stage === 'password' && (
        <PasswordScreen onCorrectPassword={goToTextExplosion} />
      )}
      {stage === 'text-explosion' && (
        <TextExplosion onComplete={goToThreeSphere} />
      )}
      {stage === 'three-sphere' && (
        <ThreeSphere onTriggerLetter={goToGreetingCard} />
      )}
      {stage === 'greeting-card' && (
        <GreetingCard />
      )}
    </div>
  );
}

export default App;
