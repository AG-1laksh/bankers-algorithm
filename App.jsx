import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// --- STYLES ---
const GAME_STYLES = `
  /* (Same base styles as before...) */
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Press+Start+2P&display=swap');

  :root {
      --bg-dark: #2c3e50;
      --bg-medium: #34495e;
      --bg-light: #4a6572;
      --text-light: #ecf0f1;
      --text-dark: #34495e;
      --accent-green: #2ecc71;
      --accent-red: #e74c3c;
      --accent-blue: #3498db;
      --accent-yellow: #f1c40f;
      --matrix-cell-bg: #5a7585;
      --border-color: #5d6d7e;
  }
  
  /* ANIMATION: Style for the resource tokens that will fly across the screen */
  .resource-token {
      position: absolute;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      color: var(--text-dark);
      z-index: 1000;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  }

  body {
      font-family: 'Roboto', sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-light);
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow-x: hidden;
  }

  .game-container {
      background-color: var(--bg-medium);
      border-radius: 15px;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      max-width: 1400px;
      width: 95%;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      position: relative;
  }

  h1, h2, h3 {
      color: var(--accent-blue);
      text-align: center;
      margin-bottom: 1.5rem;
      font-family: 'Press Start 2P', cursive;
      font-size: 1.8rem;
  }

  h2 {
      font-size: 1.4rem;
      color: var(--accent-green);
  }
  h3 {
    font-size: 1.1rem;
    color: var(--accent-yellow);
  }

  .matrix-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
  }

  .matrix-section {
      background-color: var(--bg-light);
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .resource-matrix {
      display: grid;
      gap: 5px;
      margin-top: 10px;
  }
  .resource-matrix.alloc, .resource-matrix.max {
    grid-template-columns: auto repeat(var(--resources-count), 1fr);
  }
  .resource-matrix.available {
    grid-template-columns: auto repeat(var(--resources-count), 1fr);
  }


  .matrix-label {
      font-weight: bold;
      padding: 8px;
      text-align: center;
      color: var(--accent-yellow);
  }

  .matrix-cell, .resource-input {
      background-color: var(--matrix-cell-bg);
      border: 1px solid var(--border-color);
      padding: 8px;
      text-align: center;
      border-radius: 5px;
      color: var(--text-light);
      font-size: 1rem;
  }
  .resource-input {
      width: 100%;
      box-sizing: border-box;
  }
  .resource-input:focus {
      outline: none;
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.5);
  }

  .controls-sidebar {
      background-color: var(--bg-light);
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(18, 17, 17, 0.3);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
  }

  .game-button {
      background-color: var(--accent-blue);
      color: var(--text-light);
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.2s ease;
      font-weight: bold;
  }
  
  .game-button:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
  }

  .request-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
  }

  .request-inputs {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
  }

  .request-inputs label {
      font-weight: bold;
      color: var(--text-light);
  }

  .request-inputs input[type="number"],
  .request-inputs input[type="text"] {
      background-color: var(--matrix-cell-bg);
      border: 1px solid var(--border-color);
      padding: 0.5rem;
      border-radius: 5px;
      color: var(--text-light);
      font-size: 1rem;
      width: 60px; /* Adjust width */
  }

  .status-message {
      text-align: center;
      padding: 1rem;
      margin-top: 1.5rem;
      border-radius: 8px;
      font-weight: bold;
      font-size: 1.1rem;
  }
  .status-safe {
      background-color: rgba(46, 204, 113, 0.2);
      color: var(--accent-green);
  }
  .status-unsafe {
      background-color: rgba(231, 76, 60, 0.2);
      color: var(--accent-red);
  }
  .status-neutral {
      background-color: rgba(52, 152, 219, 0.2);
      color: var(--accent-blue);
  }

  .safe-sequence-display {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: var(--bg-light);
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      text-align: center;
  }
  .sequence-item {
      display: inline-block;
      padding: 0.5rem 1rem;
      margin: 5px;
      background-color: var(--accent-blue);
      border-radius: 20px;
      font-weight: bold;
  }

  .game-stats {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 1.2rem;
  }
  .game-stats span {
      font-weight: bold;
      color: var(--accent-yellow);
      font-family: 'Press Start 2P', cursive;
      margin: 0 10px;
  }

  .timer-display {
      text-align: center;
      font-size: 2.5rem;
      font-family: 'Press Start 2P', cursive;
      color: var(--accent-yellow);
      margin-bottom: 1rem;
  }

  .fade-in {
      opacity: 0;
      animation: fadeIn 0.5s forwards;
  }
  @keyframes fadeIn {
      to { opacity: 1; }
  }

  .process-highlight {
      border: 2px solid var(--accent-green);
      box-shadow: 0 0 15px var(--accent-green);
      position: relative;
      z-index: 10;
  }

  .process-row-highlight {
    background-color: rgba(46, 204, 113, 0.1);
  }


  @media (max-width: 1024px) {
    .game-container {
      grid-template-columns: 1fr;
      padding: 1.5rem;
    }
  }

  @media (max-width: 768px) {
    body {
      padding: 1rem;
    }
    .game-container {
      gap: 1.5rem;
    }
    h1 {
      font-size: 1.5rem;
    }
    h2 {
      font-size: 1.2rem;
    }
    
    .request-inputs input {
      width: 40px;
    }
  }
`;

// ... (Banker's Algorithm Core Logic remains the same) ...
const calculateNeedMatrix = (max, allocation) =>
  max.map((maxRow, pIdx) =>
    maxRow.map((maxVal, rIdx) => maxVal - allocation[pIdx][rIdx])
  );

const isSafeState = (available, max, allocation) => {
  const numProcesses = max.length;
  const numResources = available.length;
  const need = calculateNeedMatrix(max, allocation);

  let work = [...available];
  let finish = Array(numProcesses).fill(false);
  const safeSequence = [];

  let count = 0;
  while (count < numProcesses) {
    let found = false;
    for (let i = 0; i < numProcesses; i++) {
      if (!finish[i]) {
        let canExecute = true;
        for (let j = 0; j < numResources; j++) {
          if (need[i][j] > work[j]) {
            canExecute = false;
            break;
          }
        }
        if (canExecute) {
          for (let j = 0; j < numResources; j++) work[j] += allocation[i][j];
          finish[i] = true;
          safeSequence.push(i); // Store process index
          count++;
          found = true;
        }
      }
    }
    if (!found) return { safe: false, sequence: [] };
  }
  return { safe: true, sequence: safeSequence };
};


// ... (Game Logic and State Management remains the same) ...
const generateRandomState = (numProcesses, numResources, maxResourceVal = 10) => {
  const newMax = Array.from({ length: numProcesses }, () =>
    Array.from({ length: numResources }, () => Math.floor(Math.random() * maxResourceVal) + 1)
  );
  let newAllocation = Array.from({ length: numProcesses }, () =>
    Array.from({ length: numResources }, () => 0)
  );

  // Ensure allocation is always <= max
  newAllocation = newAllocation.map((allocRow, pIdx) =>
    allocRow.map((allocVal, rIdx) => Math.min(allocVal, newMax[pIdx][rIdx]))
  );

  const totalAllocated = newAllocation.reduce((acc, row) =>
    acc.map((val, i) => val + row[i]), Array(numResources).fill(0)
  );
  
  const totalResourcesInSystem = totalAllocated.map((val, i) => val + Math.floor(Math.random() * maxResourceVal) + 1);
  const newAvailable = totalResourcesInSystem.map((val, i) => val - totalAllocated[i]);

  // Adjust available if any resource count is negative after random generation (shouldn't happen with correct logic)
  for (let i = 0; i < numResources; i++) {
    if (newAvailable[i] < 0) newAvailable[i] = 0; // Fallback
  }


  // Ensure it starts in a safe state
  let attempts = 0;
  let result = isSafeState(newAvailable, newMax, newAllocation);
  while (!result.safe && attempts < 100) { // Try to generate a safe state
    const pIdx = Math.floor(Math.random() * numProcesses);
    const rIdx = Math.floor(Math.random() * numResources);
    
    // Try to increase available or decrease a max/allocation (carefully)
    if (Math.random() > 0.5 && newAvailable[rIdx] < maxResourceVal * numProcesses) {
        newAvailable[rIdx]++;
    } else if (newAllocation[pIdx][rIdx] > 0) {
        newAllocation[pIdx][rIdx]--;
        newAvailable[rIdx]++;
    } else if (newMax[pIdx][rIdx] > 1) {
      newMax[pIdx][rIdx]--;
    }
    result = isSafeState(newAvailable, newMax, newAllocation);
    attempts++;
  }


  return {
    max: newMax,
    allocation: newAllocation,
    available: newAvailable,
    processes: numProcesses,
    resources: numResources,
  };
};

function BankerGame() {
  // ... (State variables from previous version are mostly the same)
  const [numProcesses, setNumProcesses] = useState(3);
  const [numResources, setNumResources] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(60); // seconds per level
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const [allocation, setAllocation] = useState([]);
  const [max, setMax] = useState([]);
  const [available, setAvailable] = useState([]);

  const [requestProcessId, setRequestProcessId] = useState(0);
  const [requestResourcesInput, setRequestResourcesInput] = useState(''); // comma-separated string
  const [currentMessage, setCurrentMessage] = useState({ text: 'Welcome!', type: 'neutral' });
  const [safeSequenceAnimated, setSafeSequenceAnimated] = useState([]);
  const [animatingSequence, setAnimatingSequence] = useState(false);
  const [highlightedProcess, setHighlightedProcess] = useState(null);

  // ANIMATION: Add state for level transitions and flying tokens
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animatedTokens, setAnimatedTokens] = useState([]);
  
  // ANIMATION: Refs to get coordinates of matrix cells for animations
  const availableRefs = useRef([]);
  const allocationRefs = useRef([]);

  // ANIMATION: Control for timer pulse animation
  const timerControls = useAnimation();

  const need = calculateNeedMatrix(max, allocation);
  const currentSafety = isSafeState(available, max, allocation);

  const timerRef = useRef(null);

  useEffect(() => {
    resetGame(numProcesses, numResources);
  }, []); // Initial load

  useEffect(() => {
    // ANIMATION: Trigger timer pulse when time is low
    if (timeRemaining <= 10 && !gameEnded) {
      timerControls.start({
        scale: [1, 1.2, 1],
        color: ['#e74c3c', '#f1c40f', '#e74c3c'],
        transition: { duration: 1, repeat: Infinity },
      });
    } else {
      timerControls.stop();
      timerControls.set({ scale: 1, color: '#f1c40f' });
    }

    if (!isPlaying || gameEnded) {
      clearInterval(timerRef.current);
      return;
    }
    
    // ... (rest of timer logic is the same)
    timerRef.current = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          setGameEnded(true);
          setCurrentMessage({ text: `Time's Up! Game Over. Final Score: ${score}`, type: 'unsafe' });
          setIsPlaying(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, gameEnded, score, timeRemaining, timerControls]);

  const resetGame = (newP, newR) => {
    // ... (rest of reset logic is the same) ...
    setNumProcesses(newP);
    setNumResources(newR);
    const newState = generateRandomState(newP, newR);
    setAllocation(newState.allocation);
    setMax(newState.max);
    setAvailable(newState.available);
    setRequestProcessId(0);
    setRequestResourcesInput(Array(newR).fill(0).join(','));
    setCurrentMessage({ text: 'Level Start!', type: 'neutral' });
    setSafeSequenceAnimated([]);
    setAnimatingSequence(false);
    setHighlightedProcess(null);
    if (!isPlaying) { // Only reset score/level/timer if it's a full game restart
      setScore(0);
      setLevel(1);
      setTimeRemaining(60);
      setGameEnded(false);
    }
  };

  const handleNextLevel = () => {
    // ANIMATION: Trigger level transition
    setIsTransitioning(true);
    setTimeout(() => {
      setLevel(prev => prev + 1);
      const newP = numProcesses + (level % 2 === 0 ? 1 : 0); // Increase processes every 2 levels
      const newR = numResources + (level % 3 === 0 ? 1 : 0); // Increase resources every 3 levels
      resetGame(Math.min(newP, 8), Math.min(newR, 5)); // Cap max processes/resources
      setTimeRemaining(60 + level * 5); // More time for harder levels
      setCurrentMessage({ text: `Level ${level + 1} Activated!`, type: 'neutral' });
      setIsTransitioning(false);
    }, 500); // Wait for fade-out animation
  };
  
  const handleMatrixChange = (matrixType, pIdx, rIdx, value) => {
    const parsedValue = Math.max(0, parseInt(value, 10) || 0);
    let newMatrix;

    if (matrixType === 'allocation') {
      newMatrix = allocation.map((row, i) =>
        i === pIdx ? row.map((val, j) => (j === rIdx ? parsedValue : val)) : row
      );
      // Ensure allocation <= max
      if (newMatrix[pIdx][rIdx] > max[pIdx][rIdx]) {
          newMatrix[pIdx][rIdx] = max[pIdx][rIdx];
          setCurrentMessage({ text: "Allocation cannot exceed Max!", type: "unsafe" });
      }
      setAllocation(newMatrix);
    } else if (matrixType === 'max') {
      newMatrix = max.map((row, i) =>
        i === pIdx ? row.map((val, j) => (j === rIdx ? parsedValue : val)) : row
      );
      // Ensure max >= allocation
      if (newMatrix[pIdx][rIdx] < allocation[pIdx][rIdx]) {
          newMatrix[pIdx][rIdx] = allocation[pIdx][rIdx];
          setCurrentMessage({ text: "Max cannot be less than Allocation!", type: "unsafe" });
      }
      setMax(newMatrix);
    } else if (matrixType === 'available') {
      newMatrix = available.map((val, i) => (i === rIdx ? parsedValue : val));
      setAvailable(newMatrix);
    }
  };

  const handleRequest = () => {
    if (animatingSequence) return;
    const pId = requestProcessId;
    const reqVector = requestResourcesInput.split(',').map(Number);
    // ... (Input validation is the same)
    if (isNaN(pId) || pId < 0 || pId >= numProcesses || reqVector.some(isNaN) || reqVector.length !== numResources) {
      setCurrentMessage({ text: 'Invalid request: Check process ID and resource format (e.g., "1,2,0")', type: 'unsafe' });
      setScore(s => s - 5); // Penalty
      return;
    }
    // Check if Request <= Need
    if (reqVector.some((r, i) => r > need[pId][i])) {
      setCurrentMessage({ text: `P${pId}: Request exceeds its Max claim!`, type: 'unsafe' });
      setScore(s => s - 10); // Penalty
      return;
    }

    // Check if Request <= Available
    if (reqVector.some((r, i) => r > available[i])) {
      setCurrentMessage({ text: `P${pId}: Not enough resources available. Must wait.`, type: 'unsafe' });
      setScore(s => s - 10); // Penalty
      return;
    }

    const tempAvailable = available.map((val, i) => val - reqVector[i]);
    const tempAllocation = allocation.map((row, rPId) =>
      rPId === pId ? row.map((val, i) => val + reqVector[i]) : row
    );
    const { safe, sequence } = isSafeState(tempAvailable, max, tempAllocation);

    if (safe) {
      // ANIMATION: Trigger the flying tokens before updating state
      triggerTokenAnimation(pId, reqVector);
      setTimeout(() => {
        setAvailable(tempAvailable);
        setAllocation(tempAllocation);
        setCurrentMessage({ text: `P${pId} request granted! System remains SAFE.`, type: 'safe' });
        setScore(s => s + 20);
        animateSafeSequence(sequence);
      }, 1000); // Delay state update until animation is roughly done
    } else {
      setCurrentMessage({ text: `P${pId} request would lead to UNSAFE state. Denied.`, type: 'unsafe' });
      setScore(s => s - 15);
    }
  };

  const checkCurrentSafety = () => {
     // ... (logic is the same)
    const { safe, sequence } = currentSafety;
    if (safe) {
      setCurrentMessage({ text: `Current state is SAFE!`, type: 'safe' });
      animateSafeSequence(sequence);
      setScore(s => s + 10); // Reward for checking a safe state
    } else {
      setCurrentMessage({ text: `Current state is UNSAFE!`, type: 'unsafe' });
      setScore(s => s - 5); // Small penalty for an unsafe check (encourages careful management)
    }
  };
  
  const animateSafeSequence = (sequence) => {
     // ... (logic is the same)
    setAnimatingSequence(true);
    setSafeSequenceAnimated([]);
    let delay = 0;
    sequence.forEach((pId, index) => {
      setTimeout(() => {
        setHighlightedProcess(pId);
        setSafeSequenceAnimated(prev => [...prev, pId]);
        if (index === sequence.length - 1) {
          setTimeout(() => {
            setHighlightedProcess(null);
            setAnimatingSequence(false);
          }, 1000); // Keep last process highlighted briefly
        }
      }, delay);
      delay += 1000; // 1 second delay per process
    });
  };

  // ANIMATION: New function to create and manage the flying resource tokens
  const triggerTokenAnimation = (pId, reqVector) => {
    const newTokens = [];
    reqVector.forEach((count, rIdx) => {
      if (count > 0) {
        const fromRect = availableRefs.current[rIdx]?.getBoundingClientRect();
        const toRect = allocationRefs.current[pId]?.[rIdx]?.getBoundingClientRect();

        if (fromRect && toRect) {
          for (let i = 0; i < count; i++) {
            newTokens.push({
              id: `token-${pId}-${rIdx}-${i}-${Date.now()}`,
              from: {
                x: fromRect.left + fromRect.width / 2 + (Math.random() - 0.5) * 10,
                y: fromRect.top + fromRect.height / 2 + (Math.random() - 0.5) * 10,
              },
              to: {
                x: toRect.left + toRect.width / 2,
                y: toRect.top + toRect.height / 2,
              },
              resourceIndex: rIdx,
            });
          }
        }
      }
    });

    setAnimatedTokens(newTokens);
    setTimeout(() => setAnimatedTokens([]), 1000); // Clear tokens after 1s
  };

  // ... (JSX rendering follows) ...
  return (
    <>
      <style>{GAME_STYLES}</style>
      
      {/* ANIMATION: Render flying tokens in an overlay */}
      <AnimatePresence>
        {animatedTokens.map(token => (
          <motion.div
            key={token.id}
            className="resource-token"
            initial={{ x: token.from.x, y: token.from.y, scale: 0.5 }}
            animate={{ x: token.to.x, y: token.to.y, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15, duration: 0.8 }}
            style={{ 
              backgroundColor: `hsl(${token.resourceIndex * 120}, 70%, 60%)` // Give each resource type a different color
            }}
          >
            R{token.resourceIndex + 1}
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div
        className="game-container"
        style={{ '--resources-count': numResources }}
        // ANIMATION: Level transition fade
        initial={{ opacity: 1 }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="main-content">
          <h1>Banker's Algorithm Game</h1>
          <div className="game-stats">
            Score: <span>{score}</span> | Level: <span>{level}</span>
          </div>
          <div className="matrix-grid">
             {/* Allocation Matrix */}
            <motion.div layout className="matrix-section">
                <h2>Allocation Matrix</h2>
                <div className="resource-matrix alloc">
                    <div className="matrix-label">P/R</div>
                    {Array.from({ length: numResources }).map((_, i) => (
                    <div key={`rhead-alloc-${i}`} className="matrix-label">R{i + 1}</div>
                    ))}
                    {allocation.map((row, pIdx) => (
                    <React.Fragment key={`alloc-row-${pIdx}`}>
                        <div className="matrix-label" style={{backgroundColor: highlightedProcess === pIdx ? 'rgba(46, 204, 113, 0.2)' : 'transparent'}}>P{pIdx}</div>
                        {row.map((val, rIdx) => (
                        <input
                            // ANIMATION: Add ref for token animation destination
                            ref={el => {
                            if (!allocationRefs.current[pIdx]) allocationRefs.current[pIdx] = [];
                            allocationRefs.current[pIdx][rIdx] = el;
                            }}
                            key={`alloc-${pIdx}-${rIdx}`}
                            type="number"
                            min="0"
                            className="resource-input"
                            value={val}
                            onChange={(e) => handleMatrixChange('allocation', pIdx, rIdx, e.target.value)}
                            style={{backgroundColor: highlightedProcess === pIdx ? 'rgba(46, 204, 113, 0.2)' : 'var(--matrix-cell-bg)'}}
                        />
                        ))}
                    </React.Fragment>
                    ))}
                </div>
            </motion.div>
             {/* Max Matrix */}
             <motion.div layout className="matrix-section">
              <h2>Max Matrix</h2>
              <div className="resource-matrix max">
                <div className="matrix-label">P/R</div>
                {Array.from({ length: numResources }).map((_, i) => (
                  <div key={`rhead-max-${i}`} className="matrix-label">R{i + 1}</div>
                ))}
                {max.map((row, pIdx) => (
                  <React.Fragment key={`max-row-${pIdx}`}>
                    <div className="matrix-label" style={{backgroundColor: highlightedProcess === pIdx ? 'rgba(46, 204, 113, 0.2)' : 'transparent'}}>P{pIdx}</div>
                    {row.map((val, rIdx) => (
                      <input
                        key={`max-${pIdx}-${rIdx}`}
                        type="number"
                        min="0"
                        className="resource-input"
                        value={val}
                        onChange={(e) => handleMatrixChange('max', pIdx, rIdx, e.target.value)}
                        style={{backgroundColor: highlightedProcess === pIdx ? 'rgba(46, 204, 113, 0.2)' : 'var(--matrix-cell-bg)'}}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
            {/* Available Resources */}
            <motion.div layout className="matrix-section">
              <h2>Available Resources</h2>
              <div className="resource-matrix available">
                 <div className="matrix-label">R/Val</div>
                {Array.from({ length: numResources }).map((_, i) => (
                  <div key={`rhead-avail-${i}`} className="matrix-label">R{i + 1}</div>
                ))}
                <div className="matrix-label">Value</div>
                {available.map((val, rIdx) => (
                  <input
                    // ANIMATION: Add ref for token animation source
                    ref={el => availableRefs.current[rIdx] = el}
                    key={`avail-${rIdx}`}
                    type="number"
                    min="0"
                    className="resource-input"
                    value={val}
                    onChange={(e) => handleMatrixChange('available', null, rIdx, e.target.value)}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="controls-sidebar">
          <motion.div className="timer-display" animate={timerControls}>
            {isPlaying && !gameEnded ? timeRemaining : 'Ready?'}
          </motion.div>
            
          {/* ANIMATION: Add hover and tap animations to buttons */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsPlaying(true)} className="game-button" disabled={isPlaying || gameEnded}>
            Start Game
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={checkCurrentSafety} className="game-button" disabled={!isPlaying || animatingSequence}>
            Check Safety ({currentSafety.safe ? 'SAFE' : 'UNSAFE'})
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNextLevel} className="game-button" disabled={!isPlaying || animatingSequence}>
            Next Level ({level})
          </motion.button>

           <AnimatePresence>
            {currentMessage && (
              <motion.div
                key="message"
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`status-message status-${currentMessage.type}`}
              >
                {currentMessage.text}
              </motion.div>
            )}
          </AnimatePresence>
          {/* ... (Rest of the sidebar JSX is the same) ... */}
           <div className="request-section">
            <h3>Make Resource Request</h3>
            <div className="request-inputs">
              <label>P#:</label>
              <input
                type="number"
                min="0"
                max={numProcesses - 1}
                value={requestProcessId}
                onChange={(e) => setRequestProcessId(parseInt(e.target.value, 10) || 0)}
              />
              <label>Resources (e.g., 1,2,0):</label>
              <input
                type="text"
                value={requestResourcesInput}
                onChange={(e) => setRequestResourcesInput(e.target.value)}
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRequest} className="game-button" disabled={!isPlaying || animatingSequence}>
                Submit Request
              </motion.button>
            </div>
          </div>
          <div className="safe-sequence-display">
            <h3>Safe Sequence</h3>
            <AnimatePresence mode="wait">
                {safeSequenceAnimated.length > 0 ? (
                    <motion.div
                        key="sequence-display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {safeSequenceAnimated.map((pId, index) => (
                            <motion.span
                                key={`seq-${pId}-${index}`}
                                className="sequence-item"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 10, delay: index * 0.1 }}
                            >
                                P{pId} {index < safeSequenceAnimated.length - 1 && '->'}
                            </motion.span>
                        ))}
                    </motion.div>
                ) : (
                    <motion.p
                        key="no-sequence-msg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentSafety.safe ? "Run 'Check Safety' to see!" : "No safe sequence currently."}
                    </motion.p>
                )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default BankerGame;