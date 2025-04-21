'use client';
import { useState, useEffect, useRef } from "react";

export default function AimTrainerApp() {
  const [mode, setMode] = useState("click");
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [startTime, setStartTime] = useState<any>(null);
  const [targets, setTargets] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const canvasRef = useRef<any>(null);

  const generateTarget = () => {
    const size = 50;
    const x = Math.random() * (700 - size);
    const y = Math.random() * (500 - size);
    return { x, y, size, id: Date.now() };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aimTrainerHistory");
      if (stored) setHistory(JSON.parse(stored));
    }
  }, []);

  const endGame = () => {
    const duration = (Date.now() - startTime) / 1000;
    const accuracy = shots > 0 ? ((score / shots) * 100).toFixed(1) : 0;
    const newEntry = { mode, score, shots, accuracy, duration, timestamp: new Date().toISOString() };
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    setHistory(updatedHistory);
    if (typeof window !== "undefined") {
      localStorage.setItem("aimTrainerHistory", JSON.stringify(updatedHistory));
    }
    setStarted(false);
    setTargets([]);
  };

  useEffect(() => {
    let timer;
    if (started) {
      timer = setTimeout(endGame, 20000);
    }
    return () => clearTimeout(timer);
  }, [started]);

  const getButtonClass = (current: string) => {
    return mode === current
      ? "px-4 py-2 rounded border bg-white text-black"
      : "px-4 py-2 rounded border bg-gray-800 border-gray-700";
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-row overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[250px] flex flex-col items-center justify-center gap-4 p-4 bg-gray-900">
        <h1 className="text-3xl font-bold">Aim Trainer</h1>
        <p className="text-sm text-gray-400 text-center">Train your aim across multiple modes</p>

        <nav className="flex flex-col gap-2 items-center w-full">
          {['click', 'tracking', 'flick', 'precision'].map((m) => (
            <button
              key={m}
              className={getButtonClass(m) + ' w-full'}
              onClick={() => setMode(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </nav>

        {!started && (
          <button
            className="bg-blue-500 px-4 py-2 rounded w-full mt-4"
            onClick={() => {
              setStarted(true);
              setScore(0);
              setShots(0);
              setStartTime(Date.now());
              setTimeout(() => {
                setTargets([generateTarget()]);
              }, 100);
            }}
          >
            Start Training
          </button>
        )}
      </div>

      {/* Main Play Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        {started ? (
          <div className="relative w-[700px] h-[500px] bg-black overflow-hidden">
            <canvas
              ref={canvasRef}
              width={700}
              height={500}
              className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
            />
            {targets.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setScore(prev => prev + 1);
                  setShots(prev => prev + 1);
                  setTargets([generateTarget()]);
                }}
                className="absolute bg-red-500 rounded-full z-10 cursor-pointer"
                style={{
                  width: `${t.size}px`,
                  height: `${t.size}px`,
                  left: `${t.x}px`,
                  top: `${t.y}px`
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 mt-8">Click "Start Training" to begin</p>
        )}

        {/* Stats */}
        <section className="p-4 text-center bg-black w-full max-w-[700px] mt-4">
          <h2 className="text-xl font-semibold">Stats</h2>
          <p className="text-gray-400 text-sm">Accuracy, Reaction Time, Score History</p>
          <p className="text-red-500 text-sm">Targets count: {targets.length}</p>
          {started && (
            <div className="mt-2">
              <p>Score: {score}</p>
              <p>Shots: {shots}</p>
              <p>Accuracy: {shots > 0 ? ((score / shots) * 100).toFixed(1) : 0}%</p>
            </div>
          )}
          {!started && history.length > 0 && (
            <div className="mt-4 max-h-32 overflow-y-auto text-sm text-gray-300">
              {history.map((entry, idx) => (
                <div key={idx} className="mb-1">
                  [{new Date(entry.timestamp).toLocaleTimeString()}] {entry.mode.toUpperCase()} - Score: {entry.score}, Accuracy: {entry.accuracy}%, Time: {entry.duration}s
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
