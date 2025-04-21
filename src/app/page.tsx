'use client';
import { useState, useEffect, useRef } from "react";

export default function AimTrainerApp() {
  const [mode, setMode] = useState("click");
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [startTime, setStartTime] = useState<any>(null);
  const [targets, setTargets] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [pendingHighScore, setPendingHighScore] = useState<any>(null);
  const canvasRef = useRef<any>(null);

  const generateTarget = () => {
    const size = 50;
    const x = Math.random() * (560 - size);
    const y = Math.random() * (400 - size);
    return { x, y, size, id: Date.now() };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aimTrainerHistory");
      if (stored) setHistory(JSON.parse(stored));
    }
  }, []);

  const endGame = () => {
    const finalScore = score;
    const finalMisses = misses;
        const duration = (Date.now() - startTime) / 1000;
        const totalAttempts = finalScore + finalMisses;
        const accuracy = totalAttempts > 0 ? Math.round((finalScore / totalAttempts) * 100) + "%" : "0%";
    const newEntry = {
      mode,
      score,
      misses,
      accuracy,
      duration,
      timestamp: new Date().toISOString(),
      username: "",
      hits: score,
      attempts: totalAttempts
    };
    const updatedHistory = [newEntry, ...history].sort((a, b) => b.score - a.score).slice(0, 10);
    const isHighScore = updatedHistory.findIndex(h => h.timestamp === newEntry.timestamp) > -1;
    if (isHighScore) {
      setPendingHighScore(newEntry);
    } else {
      setHistory(updatedHistory);
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

        {!started && !pendingHighScore && (
          <button
            className="bg-blue-500 px-4 py-2 rounded w-full mt-4"
            onClick={() => {
              setStarted(true);
              setScore(0);
              setMisses(0);
              setStartTime(Date.now());
              setTimeout(() => {
                setTargets([generateTarget()]);
              }, 100);
            }}
          >
            Start Training
          </button>
        )}

        {pendingHighScore && (
          <form
            className="mt-4 flex flex-col items-center gap-2 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              const namedScore = { ...pendingHighScore, username };
              const newHistory = [namedScore, ...history].sort((a, b) => b.score - a.score).slice(0, 10);
              setHistory(newHistory);
              localStorage.setItem("aimTrainerHistory", JSON.stringify(newHistory));
              setPendingHighScore(null);
              setUsername("");
            }}
          >
            <p className="text-green-400 text-center">New High Score! Enter your name:</p>
            <input
              className="text-black px-2 py-1 rounded w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Your name"
            />
            <button type="submit" className="bg-blue-500 px-3 py-1 rounded">Submit</button>
          </form>
        )}
      </div>

      {/* Main Play Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        {started ? (
          <div
            className="relative w-full max-w-[560px] h-[400px] bg-black overflow-hidden"
            onClick={() => setMisses(prev => prev + 1)}
          >
            <canvas
              ref={canvasRef}
              width={560}
              height={400}
              className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
            />
            {targets.map((t) => (
              <div
                key={t.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setScore(prev => prev + 1);
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
          <>
            <div className="text-center mb-4">
              <p>Last Score: {score}</p>
              <p>Misses: {misses}</p>
              <p>Accuracy: {(score + misses) > 0 ? Math.round((score / (score + misses)) * 100) + "%" : "0%"}</p>
            </div>

            {history.length > 0 && (
              <div className="mt-4 max-h-40 overflow-y-auto text-sm text-gray-300 w-full max-w-[560px]">
                <h3 className="text-white font-semibold mb-1">High Scores</h3>
                {history.map((entry, idx) => (
                  <div key={idx} className="mb-1">
                    {entry.username ? `[${entry.username}] ` : ""}Score: {entry.score}, Misses: {entry.misses}, Accuracy: {entry.accuracy}, Time: {entry.duration}s
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
