import React, { useState, useEffect, useCallback, useRef } from 'react';
import { COLORS, BubbleData, BubbleState } from './types';
import Bubble from './components/Bubble';
import GameHeader from './components/GameHeader';
import StartScreen from './components/StartScreen';
import { playPopSound, playSuccessSound, playErrorSound, initAudio } from './services/audioService';

// Phrase collections
const POSITIVE_PHRASES = [
  "¡Buen trabajo {name}!",
  "¡Muy bien {name}!",
  "¡Fantástico {name}!",
  "¡Eres genial {name}!",
  "¡Sigue así {name}!",
  "¡Increíble {name}!",
  "¡Lo lograste {name}!"
];

const ENCOURAGEMENT_PHRASES = [
  "¡Vamos {name}, puedes hacerlo!",
  "¡Inténtalo otra vez {name}!",
  "¡Busca bien {name}!",
  "¡Casi {name}, prueba otro!",
  "¡Tú puedes {name}!",
  "¡No te rindas {name}!"
];

// Generate numbers 1-20
const generateBubbles = (): BubbleData[] => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    value: i + 1,
    color: COLORS[i % COLORS.length],
  })).sort(() => Math.random() - 0.5); // Initial shuffle
};

const App: React.FC = () => {
  // Game State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  // Game Logic State
  const [bubbles, setBubbles] = useState<BubbleData[]>(generateBubbles());
  const [targetNumber, setTargetNumber] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [bubbleStates, setBubbleStates] = useState<Record<number, BubbleState>>({});
  
  // Feedback State
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // Helper to pick phrases
  const getRandomPhrase = (phrases: string[], name: string) => {
    const template = phrases[Math.floor(Math.random() * phrases.length)];
    return template.replace('{name}', name);
  };

  const showFeedback = (type: 'success' | 'error') => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    const phrase = type === 'success' 
      ? getRandomPhrase(POSITIVE_PHRASES, playerName)
      : getRandomPhrase(ENCOURAGEMENT_PHRASES, playerName);

    setFeedback(phrase);
    setFeedbackType(type);

    // Increased duration to 5 seconds for better readability
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback(null);
      setFeedbackType(null);
    }, 5000);
  };

  // Choose a random target number from existing bubbles
  const pickNewTarget = useCallback((currentBubbles: BubbleData[]) => {
    const availableNumbers = currentBubbles.map(b => b.value);
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    setTargetNumber(availableNumbers[randomIndex]);
  }, []);

  // Initialization
  useEffect(() => {
    const initialBubbles = generateBubbles();
    setBubbles(initialBubbles);
    pickNewTarget(initialBubbles);
  }, [pickNewTarget]);

  const handleStartGame = (name: string) => {
    initAudio();
    playPopSound(); // Interaction feedback
    setPlayerName(name);
    setIsPlaying(true);
  };

  const handleBubbleClick = (id: number, value: number) => {
    initAudio();

    if (value === targetNumber) {
      // Correct!
      playSuccessSound();
      playPopSound();
      showFeedback('success');
      
      setScore(prev => prev + 1);
      
      // Set popped state
      setBubbleStates(prev => ({ ...prev, [id]: BubbleState.POPPED }));

      // Wait for animation then reset game loop
      setTimeout(() => {
        // Shuffle and regenerate a bit to keep it fresh
        const newBubbles = generateBubbles();
        setBubbles(newBubbles);
        setBubbleStates({}); // Reset all states
        pickNewTarget(newBubbles);
      }, 600); // Wait for pop animation

    } else {
      // Incorrect
      playErrorSound();
      showFeedback('error');
      
      setBubbleStates(prev => ({ ...prev, [id]: BubbleState.ERROR }));
      
      // Reset error state after wiggle
      setTimeout(() => {
        setBubbleStates(prev => ({ ...prev, [id]: BubbleState.IDLE }));
      }, 400);
    }
  };

  const handleNewNumber = () => {
    initAudio();
    playPopSound();
    const newBubbles = generateBubbles();
    setBubbles(newBubbles);
    setBubbleStates({});
    pickNewTarget(newBubbles);
    setFeedback(null); // Clear feedback when skipping
  };

  if (!isPlaying) {
    return <StartScreen onStart={handleStartGame} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cyan-50">
      
      <GameHeader 
        score={score} 
        targetNumber={targetNumber} 
        onNewNumber={handleNewNumber}
        feedback={feedback}
        feedbackType={feedbackType}
      />

      <main className="flex-grow flex items-center justify-center p-4 pb-20 mt-8">
        <div className="flex flex-wrap justify-center gap-2 max-w-5xl">
          {bubbles.map((bubble) => (
            <Bubble
              key={bubble.id}
              id={bubble.id}
              value={bubble.value}
              color={bubble.color}
              state={bubbleStates[bubble.id] || BubbleState.IDLE}
              onClick={handleBubbleClick}
            />
          ))}
        </div>
      </main>

      <footer className="w-full text-center py-4 text-cyan-800/50 text-sm font-bold">
        Jugando como: {playerName} • Caza-Números © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;