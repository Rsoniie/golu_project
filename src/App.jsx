import { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Heart,
  Lock,
  RefreshCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';

const storageKey = 'garden-of-love-games-progress';
const wheelOptions = [
  { label: 'Tulip Bracelet', icon: '🌷' },
  { label: 'YSL Heel', icon: '👠' },
  { label: 'Bangle', icon: '✨' },
  { label: 'Kay Beauty', icon: '💄' },
  { label: 'Soya Chaap', icon: '🍢' },
  { label: 'Chatpata Food', icon: '🌶️' },
  { label: 'Dyson', icon: '💨' },
  { label: 'Mystery Date', icon: '🍫' }
];

const games = [
  {
    id: 1,
    title: 'Heart Match',
    icon: '❤️',
    short: 'Match 4 romantic pairs.',
    quote: 'Love is the game we never want to end.',
    win: 'You connected our hearts! 💞'
  },
  {
    id: 2,
    title: 'Tap the Love Letter',
    icon: '💌',
    short: 'Tap the flying love letter 6 times.',
    quote: 'Catch the message before it flutters away.',
    win: 'You caught my love letter! Now read it slowly... 💌'
  },
  {
    id: 3,
    title: 'Romantic Puzzle',
    icon: '🧩',
    short: 'Solve the 3x3 forever-love puzzle.',
    quote: 'Piece by piece, it still comes back to us.',
    win: 'You pieced us together! Perfect fit. 🧩❤️'
  },
  {
    id: 4,
    title: 'Catch the Falling Roses',
    icon: '🌹',
    short: 'Catch 10 roses before 3 misses.',
    quote: 'Every falling rose is trying to reach you.',
    win: 'Every rose is a promise. You caught them all! 🌹'
  },
  {
    id: 5,
    title: 'Love Meter',
    icon: '💕',
    short: 'Fill romance to 100%.',
    quote: 'This bar was doomed to overflow anyway.',
    win: "100% love? That's us every single day. 💯💕"
  },
  {
    id: 6,
    title: 'Find Your Soulmate',
    icon: '🐻',
    short: 'Pick the one sending love letters.',
    quote: 'In every crowd, I would still choose you.',
    win: 'You found me. In every universe. 🌌'
  }
];

const petals = ['💗', '🌸', '💕', '✨', '🌷', '💮', '🎀', '💖'];
const rewardRain = ['🌷', '💖', '🌸', '✨', '🍬', '💝', '🎀', '🌹'];

function App() {
  const [clearedGames, setClearedGames] = useState(Array(games.length).fill(false));
  const [activeGame, setActiveGame] = useState(null);
  const [gameResetKey, setGameResetKey] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rewardWon, setRewardWon] = useState(false);

  const completedCount = clearedGames.filter(Boolean).length;
  const allCleared = completedCount === games.length;

  const floatingPetals = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: `petal-${index}`,
        emoji: petals[index % petals.length],
        left: `${(index * 11) % 100}%`,
        top: `${(index * 17) % 100}%`,
        size: 0.85 + (index % 4) * 0.4,
        duration: 6.5 + (index % 5),
        delay: (index % 6) * 0.45
      })),
    [],
  );

  const finalePieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        id: `reward-${index}`,
        emoji: rewardRain[index % rewardRain.length],
        left: `${(index * 13) % 100}%`,
        size: 1.1 + (index % 4) * 0.35,
        duration: 3.2 + (index % 5) * 0.35,
        delay: (index % 7) * 0.16
      })),
    [],
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) {
        return;
      }
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.clearedGames) && parsed.clearedGames.length === games.length) {
        setClearedGames(parsed.clearedGames);
      }
      if (parsed.rewardWon) {
        setRewardWon(true);
        setShowSpinner(true);
      }
      if (typeof parsed.wheelRotation === 'number') {
        setWheelRotation(parsed.wheelRotation);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ clearedGames, rewardWon, wheelRotation }),
    );
  }, [clearedGames, rewardWon, wheelRotation]);

  const handleGameWin = (gameId) => {
    setClearedGames((current) => current.map((value, index) => (index === gameId - 1 ? true : value)));
    setActiveGame(null);
    setGameResetKey(0);
  };

  const openGame = (index) => {
    const unlocked = index === 0 || clearedGames[index - 1] || clearedGames[index];
    if (!unlocked) {
      return;
    }
    setActiveGame(index);
    setGameResetKey(0);
  };

  const resetCurrentGame = () => {
    setGameResetKey((current) => current + 1);
  };

  const spinWheel = () => {
    if (isSpinning || rewardWon) {
      return;
    }

    const tulipIndex = 0;
    const sliceAngle = 360 / wheelOptions.length;
    const centerAngle = tulipIndex * sliceAngle + sliceAngle / 2;
    const targetRotation = wheelRotation + 360 * 6 + (270 - centerAngle - (wheelRotation % 360));

    setIsSpinning(true);
    setWheelRotation(targetRotation);

    window.setTimeout(() => {
      setIsSpinning(false);
      setRewardWon(true);
      launchRewardCelebration();
    }, 5200);
  };

  const resetEverything = () => {
    const fresh = Array(games.length).fill(false);
    setClearedGames(fresh);
    setActiveGame(null);
    setGameResetKey(0);
    setShowSpinner(false);
    setWheelRotation(0);
    setIsSpinning(false);
    setRewardWon(false);
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ clearedGames: fresh, rewardWon: false, wheelRotation: 0 }),
    );
  };

  const activeGameConfig = activeGame !== null ? games[activeGame] : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff0f5] text-[#6f2438]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#ffb7c5_0%,#fadadd_36%,#ffd166_72%,#b76e79_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.22),transparent_28%)]" />
      <FloatingPetals pieces={floatingPetals} />
      {rewardWon && <RewardShower pieces={finalePieces} />}

      <div className="relative z-10 mx-auto min-h-screen max-w-[450px] px-3 py-4 sm:px-4">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[2rem] px-4 py-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/30 px-3 py-1 text-[10px] uppercase tracking-[0.34em] text-[#8f4256]">
                <Heart className="h-3 w-3 fill-[#ff4d6d] text-[#ff4d6d]" />
                Garden of Love Games
              </p>
              <h1 className="mt-3 font-script text-4xl leading-none text-[#862f47]">
                💗 Garden of Love Games
              </h1>
              <p className="mt-1 text-sm text-[#8c5566]">For My Forever Valentine</p>
            </div>

            <button
              type="button"
              onClick={() => setSoundOn((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/30 text-[#9c4e64] shadow-sm transition hover:scale-[1.04]"
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          <p className="mt-4 text-sm text-[#8c5566]">
            Complete all 6 games, win a secret surprise... 🌷
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-[#9a5c70]">
              <span>❤️‍🔥 Love Progress</span>
              <span>{completedCount}/6 games cleared</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/30">
              <motion.div
                animate={{ width: `${(completedCount / games.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 130, damping: 18 }}
                className="h-full rounded-full bg-[linear-gradient(90deg,#ff4d6d,#ffd166,#b76e79)]"
              />
            </div>
          </div>
        </motion.header>

        <AnimatePresence mode="wait">
          {activeGameConfig ? (
            <motion.section
              key={`game-${activeGameConfig.id}-${gameResetKey}`}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.98 }}
              className="mt-4"
            >
              <div className="glass-panel rounded-[2rem] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.32em] text-[#9a5c70]">
                      {activeGameConfig.title}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#7b2841]">
                      {activeGameConfig.icon} {activeGameConfig.short}
                    </h2>
                    <p className="mt-2 text-sm text-[#8c5566]">
                      {activeGameConfig.quote}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveGame(null)}
                      className="rounded-full bg-white/35 px-3 py-2 text-xs font-semibold text-[#8e4b60]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={resetCurrentGame}
                      className="inline-flex items-center gap-2 rounded-full bg-white/35 px-3 py-2 text-xs font-semibold text-[#8e4b60]"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      Reset Game
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <GameRenderer
                    key={`${activeGameConfig.id}-${gameResetKey}`}
                    game={activeGameConfig}
                    onWin={() => handleGameWin(activeGameConfig.id)}
                  />
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="home"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              className="mt-4 space-y-4"
            >
              <div className="grid gap-3">
                {games.map((game, index) => {
                  const unlocked = index === 0 || clearedGames[index - 1] || clearedGames[index];
                  const cleared = clearedGames[index];
                  return (
                    <motion.button
                      key={game.id}
                      whileHover={unlocked ? { scale: 1.02, y: -2 } : undefined}
                      whileTap={unlocked ? { scale: 0.99 } : undefined}
                      onClick={() => openGame(index)}
                      className={`glass-panel rounded-[1.8rem] p-4 text-left transition ${
                        unlocked ? 'shadow-[0_16px_40px_rgba(183,110,121,0.2)]' : 'opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/40 text-2xl shadow-sm">
                            {unlocked ? game.icon : <Lock className="h-5 w-5 text-[#8e4b60]" />}
                          </div>
                          <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-[#9a5c70]">
                            Game {game.id}
                          </p>
                          <h3 className="mt-1 text-xl font-semibold text-[#7b2841]">
                            {game.title}
                          </h3>
                          <p className="mt-2 text-sm text-[#8c5566]">{game.short}</p>
                          <p className="mt-2 text-xs italic text-[#a16779]">
                            {game.quote}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] ${
                            cleared
                              ? 'bg-[#ff4d6d]/15 text-[#9e2b48]'
                              : unlocked
                                ? 'bg-white/40 text-[#8f4256]'
                                : 'bg-white/25 text-[#9e7d87]'
                          }`}
                        >
                          {cleared ? 'Cleared' : unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="glass-panel rounded-[1.8rem] p-4 text-center">
                {allCleared ? (
                  <>
                    <p className="text-sm text-[#8c5566]">
                      The universe has a gift for you... Spin when ready.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSpinner(true)}
                      className="mt-4 rounded-full bg-[linear-gradient(135deg,#ff4d6d,#ffd166,#b76e79)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(183,110,121,0.28)]"
                    >
                      ✨ You completed every game of love! ✨
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-[#8c5566]">
                    Finish the six games in sequence to unlock the secret reward wheel.
                  </p>
                )}
              </div>

              {(showSpinner || rewardWon) && (
                <SpinnerReward
                  rotation={wheelRotation}
                  isSpinning={isSpinning}
                  rewardWon={rewardWon}
                  onSpin={spinWheel}
                />
              )}

              {rewardWon && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-[1.8rem] p-5 text-center"
                >
                  <Trophy className="mx-auto h-10 w-10 text-[#ff4d6d]" />
                  <h3 className="mt-3 text-2xl font-semibold text-[#7b2841]">
                    You won a Tulip Bracelet! 🌷
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#8c5566]">
                    Just like our love — timeless and beautiful.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#8c5566]">
                    Happy Birthday, my love! You spun your way into my heart forever.
                    Here&apos;s your Tulip Bracelet — just like the first flower I ever gave
                    you. 🌷💍
                  </p>
                  <button
                    type="button"
                    onClick={resetEverything}
                    className="mt-4 rounded-full bg-white/40 px-4 py-2 text-sm font-semibold text-[#8e4b60]"
                  >
                    Reset Whole Garden
                  </button>
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GameRenderer({ game, onWin }) {
  if (game.id === 1) {
    return <HeartMatchGame onWin={onWin} />;
  }
  if (game.id === 2) {
    return <LoveLetterGame onWin={onWin} />;
  }
  if (game.id === 3) {
    return <RomanticPuzzleGame onWin={onWin} />;
  }
  if (game.id === 4) {
    return <CatchRosesGame onWin={onWin} />;
  }
  if (game.id === 5) {
    return <LoveMeterGame onWin={onWin} />;
  }
  return <SoulmateGame onWin={onWin} />;
}

function HeartMatchGame({ onWin }) {
  const symbols = ['❤️', '🌹', '💋', '🎁'];
  const [cards, setCards] = useState(() => shuffle([...symbols, ...symbols]).map((icon, index) => ({
    id: `${icon}-${index}`,
    icon,
    matched: false
  })));
  const [flipped, setFlipped] = useState([]);
  const [message, setMessage] = useState('Match all 4 romantic pairs.');

  useEffect(() => {
    if (flipped.length !== 2) {
      return;
    }

    const [first, second] = flipped;
    const firstCard = cards.find((card) => card.id === first);
    const secondCard = cards.find((card) => card.id === second);
    if (!firstCard || !secondCard) {
      return;
    }

    if (firstCard.icon === secondCard.icon) {
      setCards((current) =>
        current.map((card) =>
          card.id === first || card.id === second ? { ...card, matched: true } : card,
        ),
      );
      setMessage('You found a heartbeat!');
      setFlipped([]);
      return;
    }

    const timer = window.setTimeout(() => {
      setFlipped([]);
      setMessage('Cute try. The cards are being dramatic.');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.every((card) => card.matched)) {
      setMessage('You connected our hearts! 💞');
      const timer = window.setTimeout(onWin, 900);
      return () => window.clearTimeout(timer);
    }
  }, [cards, onWin]);

  return (
    <div>
      <p className="mb-3 text-sm text-[#8c5566]">{message}</p>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => {
          const open = card.matched || flipped.includes(card.id);
          return (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.96 }}
              disabled={open || flipped.length === 2}
              onClick={() => setFlipped((current) => [...current, card.id])}
              className={`flex aspect-square items-center justify-center rounded-[1.3rem] text-2xl shadow-sm transition ${
                open ? 'bg-white/70' : 'bg-[linear-gradient(135deg,#ff4d6d,#ffb7c5)] text-white'
              }`}
            >
              {open ? card.icon : '💗'}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function LoveLetterGame({ onWin }) {
  const [hits, setHits] = useState(0);
  const [position, setPosition] = useState({ x: 40, y: 28 });
  const [toast, setToast] = useState('');

  const moveLetter = () => {
    setPosition({
      x: 8 + Math.random() * 72,
      y: 10 + Math.random() * 65
    });
  };

  useEffect(() => {
    moveLetter();
  }, []);

  useEffect(() => {
    if (hits >= 6) {
      setToast('Love letter delivered! 💌');
      const timer = window.setTimeout(onWin, 900);
      return () => window.clearTimeout(timer);
    }
  }, [hits, onWin]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-[#8c5566]">
        <span>Taps: {hits}/6</span>
        <span>{toast || '+1 Kiss 💋'}</span>
      </div>
      <div className="relative min-h-[260px] overflow-hidden rounded-[1.6rem] bg-white/30">
        <motion.button
          animate={{ left: `${position.x}%`, top: `${position.y}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          onClick={() => {
            setHits((current) => current + 1);
            setToast('+1 Kiss 💋');
            moveLetter();
          }}
          className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff4d6d,#ffd166)] text-2xl shadow-[0_12px_28px_rgba(255,77,109,0.3)]"
        >
          ❤️💌
        </motion.button>
      </div>
    </div>
  );
}

function RomanticPuzzleGame({ onWin }) {
  const [tiles, setTiles] = useState(() => shufflePuzzle());

  useEffect(() => {
    const solved = tiles.join(',') === '1,2,3,4,5,6,7,8,0';
    if (solved) {
      const timer = window.setTimeout(onWin, 900);
      return () => window.clearTimeout(timer);
    }
  }, [tiles, onWin]);

  const moveTile = (index) => {
    const emptyIndex = tiles.indexOf(0);
    const sameRow =
      Math.floor(index / 3) === Math.floor(emptyIndex / 3) &&
      Math.abs(index - emptyIndex) === 1;
    const vertical = Math.abs(index - emptyIndex) === 3;
    if (!sameRow && !vertical) {
      return;
    }
    const next = [...tiles];
    next[emptyIndex] = tiles[index];
    next[index] = 0;
    setTiles(next);
  };

  return (
    <div>
      <p className="mb-3 text-sm text-[#8c5566]">
        Arrange the tiles into order. Forever love likes symmetry.
      </p>
      <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] bg-white/30 p-3">
        {tiles.map((tile, index) => (
          <button
            key={`${tile}-${index}`}
            onClick={() => moveTile(index)}
            className={`flex aspect-square items-center justify-center rounded-[1rem] text-xl font-bold ${
              tile === 0
                ? 'bg-transparent'
                : 'bg-[linear-gradient(135deg,#ffb7c5,#ff4d6d,#ffd166)] text-white shadow-sm'
            }`}
          >
            {tile === 0 ? '' : `${tile} 💖`}
          </button>
        ))}
      </div>
    </div>
  );
}

function CatchRosesGame({ onWin }) {
  const areaRef = useRef(null);
  const [basketX, setBasketX] = useState(50);
  const [roses, setRoses] = useState(() => createRoses());
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);

  useEffect(() => {
    if (caught >= 10) {
      const timer = window.setTimeout(onWin, 900);
      return () => window.clearTimeout(timer);
    }
  }, [caught, onWin]);

  useEffect(() => {
    if (missed >= 3) {
      setCaught(0);
      setMissed(0);
      setRoses(createRoses());
    }
  }, [missed]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRoses((current) =>
        current.map((rose) => {
          const nextY = rose.y + rose.speed;
          if (nextY > 88) {
            const basketLeft = basketX - 14;
            const basketRight = basketX + 14;
            if (rose.x >= basketLeft && rose.x <= basketRight) {
              setCaught((value) => value + 1);
            } else {
              setMissed((value) => value + 1);
            }
            return respawnRose(rose.id);
          }
          return { ...rose, y: nextY };
        }),
      );
    }, 80);

    return () => window.clearInterval(timer);
  }, [basketX]);

  const moveBasket = (clientX) => {
    if (!areaRef.current) {
      return;
    }
    const rect = areaRef.current.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(12, Math.min(88, percent)));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-[#8c5566]">
        <span>Caught: {caught}/10</span>
        <span>Missed: {missed}/3</span>
      </div>
      <div
        ref={areaRef}
        className="relative min-h-[280px] overflow-hidden rounded-[1.6rem] bg-white/30"
        onMouseMove={(event) => moveBasket(event.clientX)}
        onTouchMove={(event) => moveBasket(event.touches[0].clientX)}
        onClick={(event) => moveBasket(event.clientX)}
      >
        {roses.map((rose) => (
          <motion.div
            key={rose.id}
            animate={{ left: `${rose.x}%`, top: `${rose.y}%` }}
            transition={{ duration: 0.08, ease: 'linear' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl"
          >
            🌹
          </motion.div>
        ))}

        <motion.div
          animate={{ left: `${basketX}%` }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          className="absolute bottom-3 -translate-x-1/2 text-4xl"
        >
          💝
        </motion.div>
      </div>
    </div>
  );
}

function LoveMeterGame({ onWin }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (percent >= 100) {
      const timer = window.setTimeout(onWin, 900);
      return () => window.clearTimeout(timer);
    }
  }, [percent, onWin]);

  return (
    <div>
      <div className="rounded-[1.6rem] bg-white/35 p-4">
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-[radial-gradient(circle,#ff4d6d_0%,#ffb7c5_70%,#ffffff_100%)] shadow-[0_18px_40px_rgba(255,77,109,0.2)]">
          <div className="text-center text-white">
            <p className="text-4xl">💖</p>
            <p className="mt-2 text-2xl font-bold">{percent}%</p>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-[#8c5566]">
          Tap the kiss button 10 times to fill the meter.
        </p>
      </div>

      <button
        type="button"
        disabled={percent >= 100}
        onClick={() => setPercent((current) => Math.min(100, current + 10))}
        className="mt-4 w-full rounded-full bg-[linear-gradient(135deg,#ff4d6d,#ffd166,#ffb7c5)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(255,77,109,0.25)] disabled:opacity-60"
      >
        Kiss 💋
      </button>
    </div>
  );
}

function SoulmateGame({ onWin }) {
  const options = [
    { id: 1, face: '🐻', extra: '☁️', correct: false },
    { id: 2, face: '🐰', extra: '🌸', correct: false },
    { id: 3, face: '🐻', extra: '💌', correct: true },
    { id: 4, face: '🐱', extra: '🎀', correct: false }
  ];

  const [message, setMessage] = useState('Which one is sending you love letters?');
  const [wrongId, setWrongId] = useState(null);

  const choose = (item) => {
    if (item.correct) {
      setMessage('You found your soulmate! 🐻❤️');
      const timer = window.setTimeout(onWin, 900);
      return () => window.clearTimeout(timer);
    }
    setWrongId(item.id);
    setMessage('Not that one. Retry this game and trust the bear with the letter.');
    window.setTimeout(() => setWrongId(null), 450);
  };

  return (
    <div>
      <p className="mb-3 text-sm text-[#8c5566]">{message}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.97 }}
            animate={wrongId === item.id ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
            onClick={() => choose(item)}
            className="rounded-[1.5rem] bg-white/40 p-4 text-center shadow-sm"
          >
            <div className="text-5xl">{item.face}</div>
            <div className="mt-2 text-2xl">{item.extra}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function SpinnerReward({ rotation, isSpinning, rewardWon, onSpin }) {
  const sliceAngle = 360 / wheelOptions.length;
  const colors = ['#ffb7c5', '#ffd166', '#fadadd', '#b76e79', '#ff8fab', '#fff0f5', '#ffcad4', '#ffc2d1'];
  const gradient = wheelOptions
    .map((_, index) => `${colors[index]} ${index * sliceAngle}deg ${(index + 1) * sliceAngle}deg`)
    .join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[1.8rem] p-5 text-center"
    >
      <p className="text-[10px] uppercase tracking-[0.32em] text-[#9a5c70]">Secret Surprise</p>
      <h3 className="mt-2 text-2xl font-semibold text-[#7b2841]">Reward Wheel</h3>

      <div className="relative mx-auto mt-5 h-72 w-72">
        <div className="absolute left-1/2 top-[-6px] z-10 h-0 w-0 -translate-x-1/2 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-[#7b2841]" />
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: isSpinning ? 5.2 : 0, ease: [0.1, 0.9, 0.2, 1] }}
          className="relative h-full w-full rounded-full border-[10px] border-white/70 shadow-[0_20px_50px_rgba(183,110,121,0.25)]"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          {wheelOptions.map((option, index) => {
            const angle = index * sliceAngle + sliceAngle / 2;
            return (
              <div
                key={option.label}
                className="absolute left-1/2 top-1/2 w-20 -translate-x-1/2 -translate-y-1/2 text-center text-[11px] font-semibold text-[#7b2841]"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-92px) rotate(${-angle}deg)`,
                }}
              >
                <div>{option.icon}</div>
                <div className="mt-1 leading-3">{option.label}</div>
              </div>
            );
          })}
          <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#7b2841] shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
        </motion.div>
      </div>

      <button
        type="button"
        disabled={isSpinning || rewardWon}
        onClick={onSpin}
        className="mt-5 rounded-full bg-[linear-gradient(135deg,#ff4d6d,#ffd166,#b76e79)] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(183,110,121,0.28)] disabled:opacity-60"
      >
        {rewardWon ? 'Tulip Bracelet Won 🌷' : isSpinning ? 'Spinning...' : 'Spin the Wheel'}
      </button>

      {rewardWon && (
        <p className="mt-4 text-sm text-[#8c5566]">🎉 You won: Tulip Bracelet 🌷 🎉</p>
      )}
    </motion.div>
  );
}

function FloatingPetals({ pieces }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute opacity-45"
          style={{ left: piece.left, top: piece.top, fontSize: `${piece.size}rem` }}
          animate={{ y: [0, -16, 0], x: [0, 8, -7, 0], rotate: [0, 6, -6, 0] }}
          transition={{ duration: piece.duration, delay: piece.delay, repeat: Infinity }}
        >
          {piece.emoji}
        </motion.span>
      ))}
    </div>
  );
}

function RewardShower({ pieces }) {
  useEffect(() => {
    confetti({
      particleCount: 240,
      spread: 120,
      origin: { y: 0.55 },
      startVelocity: 18,
      colors: ['#ffb7c5', '#ff4d6d', '#ffd166', '#b76e79', '#fadadd']
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ y: '-10vh', opacity: 0, rotate: 0 }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: [0, 24, -22, 0] }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: 'linear' }}
          className="absolute"
          style={{ left: piece.left, fontSize: `${piece.size}rem` }}
        >
          {piece.emoji}
        </motion.span>
      ))}
    </div>
  );
}

function launchRewardCelebration() {
  confetti({
    particleCount: 280,
    spread: 120,
    origin: { y: 0.58 },
    startVelocity: 18,
    colors: ['#ffb7c5', '#ff4d6d', '#ffd166', '#b76e79', '#fadadd']
  });
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function shufflePuzzle() {
  let tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  for (let i = 0; i < 30; i += 1) {
    const empty = tiles.indexOf(0);
    const moves = [];
    if (empty % 3 !== 0) {
      moves.push(empty - 1);
    }
    if (empty % 3 !== 2) {
      moves.push(empty + 1);
    }
    if (empty > 2) {
      moves.push(empty - 3);
    }
    if (empty < 6) {
      moves.push(empty + 3);
    }
    const move = moves[Math.floor(Math.random() * moves.length)];
    const next = [...tiles];
    next[empty] = tiles[move];
    next[move] = 0;
    tiles = next;
  }
  return tiles;
}

function createRoses() {
  return Array.from({ length: 3 }, (_, index) => ({
    id: `rose-${index}`,
    x: 20 + index * 25,
    y: -index * 18,
    speed: 3 + Math.random() * 1.4
  }));
}

function respawnRose(id) {
  return {
    id,
    x: 10 + Math.random() * 80,
    y: -10 - Math.random() * 20,
    speed: 3 + Math.random() * 1.4
  };
}

export default App;
