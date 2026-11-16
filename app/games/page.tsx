"use client";

import jsPDF from "jspdf";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

import { useAuth } from "../auth-context";
import SubscriptionModal from "../modals/subscriptionModal";

import { abrilFatfaceFont } from "./fonts/abril_fatface";
import { caveatVariableFont } from "./fonts/caveat_variable";
import { dancingScriptFont } from "./fonts/dancing_script";
import { shadowsIntoLightFont } from "./fonts/shadows_into_light";
import GameSelector from "./GameSelector";

import { getUser } from "@/managers/userManager";
import { getSubscription } from "@/managers/subscriptionManager";
import ErrorModal from "@/app/modals/errorModal";

// Dynamically import the game components
const Sudoku = dynamic(() => import("./sudoku"), {
  ssr: false,
}) as React.FC<any>;
const Crossword = dynamic(() => import("./crossword"), { ssr: false });
const WordSearch = dynamic(() => import("./wordsearch"), { ssr: false });
const Hangman = dynamic(() => import("./hangman"), { ssr: false });
const ScrambleWords = dynamic(() => import("./wordscrumble"), { ssr: false });
const Cryptogram = dynamic(() => import("./cryptogram"), { ssr: false });
const MineFinder = dynamic(() => import("./mineFinder"), { ssr: false });
const DotsToDots = dynamic(() => import("./dots"), { ssr: false });

// Icons
const GamepadIcon = () => (
  <svg fill="none" height="48" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48">
    <rect height="12" rx="2" width="20" x="2" y="6" />
    <path d="M6 12h4M8 10v4" />
    <circle cx="17" cy="10" fill="currentColor" r="1" />
    <circle cx="15" cy="12" fill="currentColor" r="1" />
  </svg>
);

const SettingsIcon = () => (
  <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const games = [
  { id: "1", name: "Sudoku", component: Sudoku },
  { id: "2", name: "Crossword", component: Crossword },
  { id: "3", name: "Word Search", component: WordSearch },
  { id: "4", name: "Hangman", component: Hangman },
  { id: "5", name: "Scramble Words", component: ScrambleWords },
  { id: "6", name: "Cryptogram", component: Cryptogram },
  { id: "7", name: "Maze" },
  { id: "8", name: "Mine Finder", component: MineFinder },
  { id: "9", name: "Dots to Dots", component: DotsToDots },
];

const fonts = [
  "times",
  "courier",
  "helvetica",
  "dancing",
  "caveat",
  "abril",
  "shadows",
];
const sudoku_difficulty = ["easy", "medium", "hard", "expert"];

// Custom Input Component
const CustomInput = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-white/70">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200"
    />
  </div>
);

// Custom Select Component
const CustomSelect = ({ label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-white/70">{label}</label>
    <select
      {...props}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all duration-200 appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
    >
      {children}
    </select>
  </div>
);

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<string>("times");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [crosswordWords, setCrosswordWords] = useState<string>("");
  const [crosswordClues, setCrosswordClues] = useState<string>("");
  const [crosswordGrids, setCrosswordGrids] = useState<number>(0);
  const [wordSearchWords, setWordSearchWords] = useState<string>("");
  const [hangmanWord, setHangmanWord] = useState<string>("");
  const [scrambleWordsInput, setScrambleWordsInput] = useState<string>("");
  const [cryptogramPhrases, setCryptogramPhrases] = useState<string>("");
  const [mineFinderWidth, setMineFinderWidth] = useState<number>(9);
  const [mineFinderHeight, setMineFinderHeight] = useState<number>(9);
  const [mineCount, setMineCount] = useState<number>(10);
  const [isSequential, setIsSequential] = useState<boolean>(true);
  const [customName, setCustomName] = useState<string>("");
  const [customSolutionName, setCustomSolutionName] = useState<string>("");
  const [solutionsPerPage, setSolutionsPerPage] = useState<number>(1);
  const [wordsPerPuzzle, setWordsPerPuzzle] = useState<number>(1);
  const [numPuzzles, setNumPuzzles] = useState<number>(1);
  const [invertWords, setInvertWords] = useState<number>(0);
  const [isMazeAllowed, setIsMazeAllowed] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [wordSearchFontSize, setWordSearchFontSize] = useState<number>(30);
  const [wordSearchGridSize, setWordSearchGridSize] = useState<number>(15);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const { isAuthenticated } = useAuth();
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const currentUser = await getUser();

      if (currentUser && currentUser?.role !== "owner") {
        showModalIfNoActiveSubscription();
      }
    })();
  }, [isAuthenticated]);

  const showModalIfNoActiveSubscription = async () => {
    const currentSubscription = await getSubscription();

    if (currentSubscription && !currentSubscription?.is_active) {
      setShowSubscriptionModal(true);
    }
  };

  // Register the font with jsPDF
  jsPDF.API.events.push([
    "addFonts",
    function (this: jsPDF) {
      this.addFileToVFS("Dancing-Script.ttf", dancingScriptFont);
      this.addFont("Dancing-Script.ttf", "dancing", "normal");
      this.addFileToVFS("Caveat-Variable.ttf", caveatVariableFont);
      this.addFont("Caveat-Variable.ttf", "caveat", "normal");
      this.addFileToVFS("Abril-Fatface.ttf", abrilFatfaceFont);
      this.addFont("Abril-Fatface.ttf", "abril", "normal");
      this.addFileToVFS("Shadows-Into-Light.ttf", shadowsIntoLightFont);
      this.addFont("Shadows-Into-Light.ttf", "shadows", "normal");
    },
  ]);

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId);
    if (gameId !== "1") setSelectedDifficulty("");
    if (gameId !== "2") setCrosswordWords("");
    if (gameId !== "4") setWordSearchWords("");
    if (gameId !== "5") setHangmanWord("");
    if (gameId !== "6") setScrambleWordsInput("");
    if (gameId !== "7") setCryptogramPhrases("");
    if (gameId !== "9") {
      setMineFinderWidth(9);
      setMineFinderHeight(9);
      setMineCount(10);
    }
    setCustomName("");
    setCustomSolutionName("");
    setSolutionsPerPage(1);
    setNumPuzzles(1);
    setInvertWords(0);
    if (gameId === "7") {
      setIsMazeAllowed(true);
    }

    // Scroll to settings on mobile
    if (window.innerWidth < 1024 && settingsRef.current) {
      setTimeout(() => {
        settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const renderSelectedGame = () => {
    if (selectedGame === "7" && isMazeAllowed) {
      return (
        <iframe
          height="600px"
          src="https://lca-maze-e5a721fab7ab.herokuapp.com/"
          style={{ border: "none", borderRadius: "12px" }}
          title="Maze Game"
          width="100%"
        />
      );
    }

    const game = games.find((game) => game.id === selectedGame);

    if (game && game.component) {
      const GameComponent = game.component;
      const commonProps = {
        font: selectedFont,
        is_sequential: isSequential,
        custom_name: customName,
        custom_solution_name: customSolutionName,
        solutions_per_page: solutionsPerPage,
        num_puzzles: numPuzzles,
        invert_words: invertWords,
      };

      if (selectedGame === "1") {
        return <GameComponent difficulty={selectedDifficulty} {...commonProps} />;
      } else if (selectedGame === "2") {
        return (
          <GameComponent
            clues={crosswordClues.split(",")}
            cross_words={crosswordWords.split(",")}
            crosswordGrids={crosswordGrids}
            wordsPerPuzzle={wordsPerPuzzle}
            {...commonProps}
          />
        );
      } else if (selectedGame === "3") {
        return (
          <GameComponent
            fontSize={wordSearchFontSize}
            grid_size={wordSearchGridSize}
            words={wordSearchWords.split(",")}
            {...commonProps}
          />
        );
      } else if (selectedGame === "4") {
        return <GameComponent hangman_words={hangmanWord.split(",")} {...commonProps} />;
      } else if (selectedGame === "5") {
        return <GameComponent words={scrambleWordsInput.split(",")} {...commonProps} />;
      } else if (selectedGame === "6") {
        return <GameComponent phrases={cryptogramPhrases.split(",")} {...commonProps} />;
      } else if (selectedGame === "8") {
        return (
          <GameComponent
            height={mineFinderHeight}
            mines={mineCount}
            width={mineFinderWidth}
            {...commonProps}
          />
        );
      } else if (selectedGame === "9") {
        return <GameComponent {...commonProps} />;
      } else {
        return <GameComponent {...commonProps} />;
      }
    }

    return null;
  };

  const selectedGameName = games.find((g) => g.id === selectedGame)?.name || "";

  return (
    <>
      <div className="h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4 py-4 md:px-6 overflow-auto">
        {/* Background Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-5"
            initial={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                <GamepadIcon />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Game Generator
                </h1>
                <p className="text-white/60">
                  Create and customize puzzle games for your books
                </p>
              </div>
            </div>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Game Selection */}
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.1 }}
            >
              <div className="sticky top-4 bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                <GameSelector
                  selectedGame={selectedGame}
                  onSelectGame={handleSelectGame}
                />
              </div>
            </motion.div>

            {/* Right Main Content - Configuration & Preview */}
            <motion.div
              ref={settingsRef}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.2 }}
            >
              {/* Configuration Card */}
              {selectedGame && (
                <div className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white">
                      {selectedGameName}
                    </h2>
                    <p className="text-sm text-white/50 mt-0.5">
                      Configure your game settings below
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Settings Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <SettingsIcon />
                        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                          Settings
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name Type */}
                        {selectedGame !== "7" && (
                          <CustomSelect
                            defaultValue="sequential"
                            label="Name Type"
                            onChange={(e) => setIsSequential(e.target.value === "sequential")}
                          >
                            <option value="sequential">Sequential Name</option>
                            <option value="custom">Custom Name</option>
                          </CustomSelect>
                        )}

                        {/* Font Selection */}
                        {selectedGame !== "7" && (
                          <CustomSelect
                            label="Font"
                            value={selectedFont}
                            onChange={(e) => setSelectedFont(e.target.value)}
                          >
                            {fonts.map((font) => (
                              <option key={font} className="bg-zinc-900 capitalize" value={font}>
                                {font}
                              </option>
                            ))}
                          </CustomSelect>
                        )}

                        {/* Custom Names */}
                        {!isSequential && (
                          <>
                            <CustomInput
                              label="Custom Name"
                              placeholder="Enter a custom name"
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                            />
                            {selectedGame !== "9" && (
                              <CustomInput
                                label="Custom Solution Name"
                                placeholder="Enter a custom solution name"
                                value={customSolutionName}
                                onChange={(e) => setCustomSolutionName(e.target.value)}
                              />
                            )}
                          </>
                        )}

                        {/* Number of Puzzles */}
                        {(selectedGame === "1" || selectedGame === "8") && (
                          <CustomInput
                            label="Number of Puzzles"
                            max={10}
                            min={1}
                            placeholder="Enter number of puzzles"
                            type="number"
                            value={numPuzzles.toString()}
                            onChange={(e) => setNumPuzzles(Number(e.target.value))}
                          />
                        )}

                        {/* Solutions per Page */}
                        {(selectedGame === "1" || selectedGame === "8") && numPuzzles > 1 && (
                          <CustomSelect
                            label="Solutions per Page"
                            value={solutionsPerPage.toString()}
                            onChange={(e) => setSolutionsPerPage(Number(e.target.value))}
                          >
                            {[1, 2, 3, 4].map((option) => (
                              <option key={option} className="bg-zinc-900" value={option}>
                                {option}
                              </option>
                            ))}
                          </CustomSelect>
                        )}

                        {/* Sudoku Specific */}
                        {selectedGame === "1" && (
                          <CustomSelect
                            label="Difficulty"
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                          >
                            <option className="bg-zinc-900" value="">Select difficulty</option>
                            {sudoku_difficulty.map((difficulty) => (
                              <option key={difficulty} className="bg-zinc-900 capitalize" value={difficulty}>
                                {difficulty}
                              </option>
                            ))}
                          </CustomSelect>
                        )}

                        {/* Crossword Specific */}
                        {selectedGame === "2" && (
                          <>
                            <div className="md:col-span-2">
                              <CustomInput
                                label="Words (comma separated)"
                                placeholder="Enter words separated by commas"
                                value={crosswordWords}
                                onChange={(e) => setCrosswordWords(e.target.value)}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <CustomInput
                                label="Clues (comma separated)"
                                placeholder="Enter clues separated by commas"
                                value={crosswordClues}
                                onChange={(e) => setCrosswordClues(e.target.value)}
                              />
                            </div>
                            <CustomInput
                              label="Number of Puzzles"
                              max={10}
                              min={1}
                              placeholder="Enter number of puzzles"
                              type="number"
                              value={numPuzzles.toString()}
                              onChange={(e) => setNumPuzzles(Number(e.target.value))}
                            />
                            <CustomInput
                              label="Grid Size (0 for auto)"
                              max={30}
                              min={0}
                              placeholder="Enter grid size or 0 for auto"
                              type="number"
                              value={crosswordGrids.toString()}
                              onChange={(e) => setCrosswordGrids(Number(e.target.value))}
                            />
                            {numPuzzles > 1 && (
                              <>
                                <CustomSelect
                                  label="Solutions per Page"
                                  value={solutionsPerPage.toString()}
                                  onChange={(e) => setSolutionsPerPage(Number(e.target.value))}
                                >
                                  {[1, 2, 3, 4].map((option) => (
                                    <option key={option} className="bg-zinc-900" value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </CustomSelect>
                                <CustomInput
                                  label="Words per Puzzle"
                                  max={10}
                                  min={1}
                                  placeholder="Enter number of words"
                                  type="number"
                                  value={wordsPerPuzzle.toString()}
                                  onChange={(e) => setWordsPerPuzzle(Number(e.target.value))}
                                />
                              </>
                            )}
                            {/* Crossword Grid Size Validation */}
                            {crosswordGrids > 0 && crosswordWords && (() => {
                              const words = crosswordWords.split(",").map(w => w.trim()).filter(w => w);

                              if (words.length === 0) return null;

                              const totalLetters = words.reduce((sum, w) => sum + w.length, 0);
                              const longestWord = Math.max(...words.map(w => w.length), 0);
                              const minRecommended = Math.max(longestWord + 2, Math.ceil(Math.sqrt(totalLetters * 2.0)));
                              const maxRecommended = Math.ceil(Math.sqrt(totalLetters * 3.0));

                              if (crosswordGrids < longestWord) {
                                return (
                                  <p className="text-xs text-red-400 mt-1 md:col-span-2">
                                    Grid size must be at least {longestWord} (length of longest word)
                                  </p>
                                );
                              } else if (crosswordGrids < minRecommended) {
                                return (
                                  <p className="text-xs text-amber-400 mt-1 md:col-span-2">
                                    Recommended grid size: {minRecommended} or larger for better word placement
                                  </p>
                                );
                              } else if (crosswordGrids > maxRecommended + 10) {
                                return (
                                  <p className="text-xs text-red-400 mt-1 md:col-span-2">
                                    Grid size {crosswordGrids} is too large for {words.length} words. Maximum recommended: {maxRecommended}
                                  </p>
                                );
                              } else if (crosswordGrids > maxRecommended) {
                                return (
                                  <p className="text-xs text-amber-400 mt-1 md:col-span-2">
                                    Grid size {crosswordGrids} may be too large for {words.length} words. Recommended: {minRecommended}-{maxRecommended}
                                  </p>
                                );
                              }

                              return null;
                            })()}
                          </>
                        )}

                        {/* Word Search Specific */}
                        {selectedGame === "3" && (
                          <>
                            <div className="md:col-span-2">
                              <CustomInput
                                label="Words (comma separated)"
                                placeholder="Enter words separated by commas"
                                value={wordSearchWords}
                                onChange={(e) => setWordSearchWords(e.target.value)}
                              />
                            </div>
                            <CustomInput
                              label="Number of Puzzles"
                              max={10}
                              min={1}
                              placeholder="Enter number of puzzles"
                              type="number"
                              value={numPuzzles.toString()}
                              onChange={(e) => setNumPuzzles(Number(e.target.value))}
                            />
                            <CustomInput
                              label="Grid Size"
                              max={25}
                              min={8}
                              placeholder="Enter grid size"
                              type="number"
                              value={wordSearchGridSize.toString()}
                              onChange={(e) => setWordSearchGridSize(Number(e.target.value))}
                            />
                            {numPuzzles > 1 && (
                              <CustomSelect
                                label="Solutions per Page"
                                value={solutionsPerPage.toString()}
                                onChange={(e) => setSolutionsPerPage(Number(e.target.value))}
                              >
                                {[1, 2, 3, 4].map((option) => (
                                  <option key={option} className="bg-zinc-900" value={option}>
                                    {option}
                                  </option>
                                ))}
                              </CustomSelect>
                            )}
                            <CustomInput
                              label="Font Size"
                              max={60}
                              min={30}
                              placeholder="Enter font size"
                              type="number"
                              value={wordSearchFontSize.toString()}
                              onChange={(e) => setWordSearchFontSize(Number(e.target.value))}
                            />
                            <CustomSelect
                              label="Invert Words"
                              value={invertWords.toString()}
                              onChange={(e) => setInvertWords(Number(e.target.value))}
                            >
                              <option className="bg-zinc-900" value="0">No</option>
                              <option className="bg-zinc-900" value="0.5">Yes</option>
                            </CustomSelect>
                            {/* Word Search Grid Size Validation */}
                            {(() => {
                              if (!wordSearchWords || wordSearchWords.trim() === "" || wordSearchGridSize <= 0) {
                                return null;
                              }

                              const words = wordSearchWords.split(",").map(w => w.trim()).filter(w => w);

                              if (words.length === 0) return null;

                              const totalLetters = words.reduce((sum, w) => sum + w.length, 0);
                              const avgWordLength = totalLetters / words.length;
                              const longestWord = Math.max(...words.map(w => w.length), 0);
                              const wordsPerPuzzle = Math.ceil(words.length / (numPuzzles || 1));
                              const totalLettersPerPuzzle = wordsPerPuzzle * avgWordLength;
                              const gridCapacity = wordSearchGridSize * wordSearchGridSize;
                              const utilizationRatio = totalLettersPerPuzzle / gridCapacity;
                              const recommendedSize = Math.ceil(Math.sqrt(totalLettersPerPuzzle / 0.55));

                              if (wordSearchGridSize < longestWord) {
                                return (
                                  <p className="text-xs text-red-400 mt-1 md:col-span-2">
                                    Grid size must be at least {longestWord} (length of longest word "{words.find(w => w.length === longestWord)}")
                                  </p>
                                );
                              } else if (utilizationRatio > 0.65) {
                                return (
                                  <p className="text-xs text-red-400 mt-1 md:col-span-2">
                                    Grid size {wordSearchGridSize} is too small for {wordsPerPuzzle} words per puzzle. Recommended: {recommendedSize} or larger
                                  </p>
                                );
                              } else if (utilizationRatio > 0.5) {
                                return (
                                  <p className="text-xs text-amber-400 mt-1 md:col-span-2">
                                    Grid might be tight for {wordsPerPuzzle} words. Consider using grid size {recommendedSize} or larger
                                  </p>
                                );
                              } else if (utilizationRatio < 0.2) {
                                return (
                                  <p className="text-xs text-amber-400 mt-1 md:col-span-2">
                                    Grid size {wordSearchGridSize} may be too large for {wordsPerPuzzle} words. Consider a smaller grid (around {Math.ceil(Math.sqrt(totalLettersPerPuzzle / 0.4))})
                                  </p>
                                );
                              }

                              return null;
                            })()}
                          </>
                        )}

                        {/* Hangman Specific */}
                        {selectedGame === "4" && (
                          <div className="md:col-span-2">
                            <CustomInput
                              label="Words (comma separated)"
                              placeholder="Enter words separated by commas"
                              value={hangmanWord}
                              onChange={(e) => setHangmanWord(e.target.value)}
                            />
                          </div>
                        )}

                        {/* Scramble Words Specific */}
                        {selectedGame === "5" && (
                          <div className="md:col-span-2">
                            <CustomInput
                              label="Words (comma separated)"
                              placeholder="Enter words separated by commas"
                              value={scrambleWordsInput}
                              onChange={(e) => setScrambleWordsInput(e.target.value)}
                            />
                          </div>
                        )}

                        {/* Cryptogram Specific */}
                        {selectedGame === "6" && (
                          <div className="md:col-span-2">
                            <CustomInput
                              label="Phrases (comma separated)"
                              placeholder="Enter phrases separated by commas"
                              value={cryptogramPhrases}
                              onChange={(e) => setCryptogramPhrases(e.target.value)}
                            />
                          </div>
                        )}

                        {/* Mine Finder Specific */}
                        {selectedGame === "8" && (
                          <>
                            <CustomInput
                              label="Grid Width"
                              max={30}
                              min={3}
                              placeholder="Enter grid width"
                              type="number"
                              value={mineFinderWidth.toString()}
                              onChange={(e) => setMineFinderWidth(Number(e.target.value))}
                            />
                            <CustomInput
                              label="Grid Height"
                              max={30}
                              min={3}
                              placeholder="Enter grid height"
                              type="number"
                              value={mineFinderHeight.toString()}
                              onChange={(e) => setMineFinderHeight(Number(e.target.value))}
                            />
                            <CustomInput
                              label="Number of Mines"
                              max={mineFinderWidth * mineFinderHeight - 1}
                              min={1}
                              placeholder="Enter number of mines"
                              type="number"
                              value={mineCount.toString()}
                              onChange={(e) => setMineCount(Number(e.target.value))}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Generate Button Section */}
                    {selectedGame !== "7" && (
                      <div className="pt-4 border-t border-white/10">
                        <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-xl p-6 border border-purple-500/20">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-violet-500/30 rounded-2xl flex items-center justify-center border border-purple-500/40">
                              <svg className="text-purple-400" fill="none" height="28" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="28">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <h4 className="text-white font-medium mb-1">Ready to Generate</h4>
                              <p className="text-white/50 text-sm">Click the button below to create your puzzle images</p>
                            </div>
                            {renderSelectedGame()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Maze iframe */}
                    {selectedGame === "7" && (
                      <div className="pt-4 border-t border-white/10">
                        {renderSelectedGame()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!selectedGame && (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-3xl flex items-center justify-center border border-purple-500/30 text-purple-400">
                    <GamepadIcon />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Choose a Game to Start
                  </h3>
                  <p className="text-white/50 max-w-md mx-auto">
                    Select a game from the sidebar to begin creating your puzzle. Each game has unique settings to customize.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <ErrorModal
        isOpen={isErrorModalOpen}
        message={errorModalMessage}
        onClose={() => setIsErrorModalOpen(false)}
      />

      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => {}} />
    </>
  );
}
