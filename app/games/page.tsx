"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import jsPDF from "jspdf";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import ErrorModal from "@/app/modals/errorModal";
import { getSubscription } from "@/managers/subscriptionManager";
import { getUser } from "@/managers/userManager";
import { useAuth } from "../auth-context";
import SubscriptionModal from "../modals/subscriptionModal";
import { abrilFatfaceFont } from "./fonts/abril_fatface";
import { caveatVariableFont } from "./fonts/caveat_variable";
import { dancingScriptFont } from "./fonts/dancing_script";
import { shadowsIntoLightFont } from "./fonts/shadows_into_light";
import GameSelector from "./GameSelector";

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

// Custom Fonts

const games = [
  { id: "1", name: "Sudoku", component: Sudoku },
  { id: "2", name: "Crossword", component: Crossword },
  { id: "3", name: "Word Search", component: WordSearch },
  { id: "4", name: "Hangman", component: Hangman },
  { id: "5", name: "Scramble Words", component: ScrambleWords },
  { id: "6", name: "Cryptogram", component: Cryptogram },
  { id: "7", name: "Maze" }, // No component, will use iframe
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

    if (!currentSubscription?.is_active) {
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

  const renderSelectedGame = () => {
    if (selectedGame === "7" && isMazeAllowed) {
      // Render an iframe for the Maze game
      return (
        <iframe
          src="https://lca-maze-e5a721fab7ab.herokuapp.com/"
          width="100%"
          height="600px"
          style={{ border: "none" }}
          title="Maze Game"
        ></iframe>
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
        return (
          <GameComponent difficulty={selectedDifficulty} {...commonProps} />
        );
      } else if (selectedGame === "2") {
        return (
          <GameComponent
            cross_words={crosswordWords.split(",")}
            clues={crosswordClues.split(",")}
            wordsPerPuzzle={wordsPerPuzzle}
            crosswordGrids={crosswordGrids}
            {...commonProps}
          />
        );
      } else if (selectedGame === "3") {
        return (
          <GameComponent
            words={wordSearchWords.split(",")}
            fontSize={wordSearchFontSize}
            grid_size={wordSearchGridSize}
            {...commonProps}
          />
        );
      } else if (selectedGame === "4") {
        return (
          <GameComponent
            hangman_words={hangmanWord.split(",")}
            {...commonProps}
          />
        );
      } else if (selectedGame === "5") {
        return (
          <GameComponent
            words={scrambleWordsInput.split(",")}
            {...commonProps}
          />
        );
      } else if (selectedGame === "6") {
        return (
          <GameComponent
            phrases={cryptogramPhrases.split(",")}
            {...commonProps}
          />
        );
      } else if (selectedGame === "8") {
        return (
          <GameComponent
            width={mineFinderWidth}
            height={mineFinderHeight}
            mines={mineCount}
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

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Game Generator
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and customize puzzle games
            </p>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Game Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="sticky top-4">
                <CardBody className="p-6">
                  <GameSelector
                    selectedGame={selectedGame}
                    onSelectGame={(gameId) => {
                      setSelectedGame(gameId);
                      // Reset specific states when switching games
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
                      // Reset custom fields
                      setCustomName("");
                      setCustomSolutionName("");
                      setSolutionsPerPage(1);
                      setNumPuzzles(1);
                      setInvertWords(0);

                      if (gameId === "7") {
                        setIsMazeAllowed(true);
                      }
                    }}
                  />
                </CardBody>
              </Card>
            </motion.div>

            {/* Right Main Content - Configuration & Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Configuration Card */}
              {selectedGame && (
                <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {games.find((g) => g.id === selectedGame)?.name}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Configure your game settings below
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-5">
                    <div className="space-y-5">

                      {/* Game Preview Section */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 min-h-[150px] border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1 h-4 bg-primary rounded-full"></div>
                          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Preview
                          </h3>
                        </div>
                        {renderSelectedGame()}
                      </div>

                      {/* Configuration Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-4 bg-primary rounded-full"></div>
                          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Settings
                          </h3>
                        </div>
                        <div className="space-y-3.5">

            {/* Name Type */}
            {selectedGame !== "7" && (
              <Select
                isRequired
                size="md"
                label="Name Type"
                placeholder="Select Name Type"
                classNames={{
                  label: "text-xs font-medium",
                  trigger: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                }}
                onChange={(e) =>
                  setIsSequential(e.target.value === "sequential")
                }
              >
                <SelectItem key="sequential">Sequential Name</SelectItem>
                <SelectItem key="custom">Custom Name</SelectItem>
              </Select>
            )}

            {/* Custom Names */}
            {!isSequential && (
              <>
                <Input
                  isRequired={true}
                  size="md"
                  label="Custom Name"
                  placeholder="Enter a custom name"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setCustomName(e.target.value)}
                  value={customName}
                />
                {selectedGame !== "9" && (
                  <Input
                    isRequired={true}
                    size="md"
                    label="Custom Solution Name"
                    placeholder="Enter a custom solution name"
                    classNames={{
                      label: "text-xs font-medium",
                      input: "bg-white dark:bg-gray-900",
                    }}
                    onChange={(e) => setCustomSolutionName(e.target.value)}
                    value={customSolutionName}
                  />
                )}
              </>
            )}

            {/* Sudoku and Wordsearch Specific Input */}
            {(selectedGame === "1" ||
              selectedGame === "2" ||
              selectedGame === "3" ||
              selectedGame === "8") && (
              <>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  isRequired={true}
                  size="md"
                  label="Number of Puzzles to Generate"
                  placeholder="Enter number of puzzles"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setNumPuzzles(Number(e.target.value))}
                  value={numPuzzles.toString()}
                />
              </>
            )}

            {/* Crossword specific input */}
            {selectedGame === "2" && numPuzzles > 1 && (
              <Input
                type="number"
                min={1}
                max={10}
                step={1}
                isRequired={true}
                size="md"
                label="Words per Puzzle"
                placeholder="Enter number of words"
                classNames={{
                  label: "text-xs font-medium",
                  input: "bg-white dark:bg-gray-900",
                  inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                }}
                onChange={(e) => setWordsPerPuzzle(Number(e.target.value))}
                value={wordsPerPuzzle.toString()}
              />
            )}

            {/* Crossword Grid Size */}
            {selectedGame === "2" && (
              <>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  step={1}
                  size="md"
                  label="Grid Size (0 for auto)"
                  placeholder="Enter grid size or 0 for auto"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setCrosswordGrids(Number(e.target.value))}
                  value={crosswordGrids.toString()}
                />
                {crosswordGrids > 0 && crosswordWords && (() => {
                  const words = crosswordWords.split(",").map(w => w.trim()).filter(w => w);
                  const totalLetters = words.reduce((sum, w) => sum + w.length, 0);
                  const longestWord = Math.max(...words.map(w => w.length), 0);

                  // Calculate minimum recommended grid size
                  const minRecommended = Math.max(
                    longestWord + 2,
                    Math.ceil(Math.sqrt(totalLetters * 1.5))
                  );

                  // Calculate maximum recommended grid size to avoid sparse grids
                  // Using a more conservative multiplier to prevent mostly-empty grids
                  const maxRecommended = Math.ceil(Math.sqrt(totalLetters * 2.2));

                  if (crosswordGrids < longestWord) {
                    return (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ Grid size must be at least {longestWord} (length of longest word "{words.find(w => w.length === longestWord)}")
                      </p>
                    );
                  } else if (crosswordGrids < minRecommended) {
                    return (
                      <p className="text-xs text-amber-500 mt-1">
                        ⚠️ Recommended grid size: {minRecommended} or larger for better word placement
                      </p>
                    );
                  } else if (crosswordGrids > maxRecommended + 5) {
                    return (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ Grid size {crosswordGrids} is too large for {words.length} words. Maximum recommended: {maxRecommended}. This will result in a mostly empty grid.
                      </p>
                    );
                  } else if (crosswordGrids > maxRecommended) {
                    return (
                      <p className="text-xs text-amber-500 mt-1">
                        ⚠️ Grid size {crosswordGrids} may be too large for {words.length} words. Recommended: {minRecommended}-{maxRecommended}
                      </p>
                    );
                  }
                  return null;
                })()}
              </>
            )}

            {/* Sudoku Specific Input */}
            {selectedGame === "1" && (
              <>
                <Select
                  isRequired
                  size="md"
                  label="Select Difficulty"
                  placeholder="Select difficulty"
                  classNames={{
                    label: "text-xs font-medium",
                    trigger: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  value={selectedDifficulty}
                >
                  {sudoku_difficulty.map((difficulty) => (
                    <SelectItem key={difficulty}>{difficulty}</SelectItem>
                  ))}
                </Select>
              </>
            )}

            {/* Solutions per Page */}
            {(selectedGame === "1" ||
              selectedGame === "2" ||
              selectedGame === "3" ||
              selectedGame === "8") &&
              numPuzzles > 1 && (
                <Select
                  isRequired
                  size="md"
                  label="Solutions per Page"
                  placeholder="Select number of solutions per page"
                  classNames={{
                    label: "text-xs font-medium",
                    trigger: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setSolutionsPerPage(Number(e.target.value))}
                  value={solutionsPerPage.toString()}
                >
                  {[1, 2, 3, 4].map((option) => (
                    <SelectItem key={option}>{option.toString()}</SelectItem>
                  ))}
                </Select>
              )}

            {/* Word Search Specific Inputs */}
            {selectedGame === "3" && (
              <>
                <Input
                  isRequired={true}
                  size="md"
                  label="Enter words"
                  placeholder="Enter words separated by commas"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setWordSearchWords(e.target.value)}
                  value={wordSearchWords}
                />

                <Input
                  isRequired={true}
                  size="md"
                  label="Font Size"
                  placeholder="Enter font size"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) =>
                    setWordSearchFontSize(Number(e.target.value))
                  }
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (value < 30) {
                      setWordSearchFontSize(30);
                    }
                  }}
                  max={60}
                  min={30}
                  value={wordSearchFontSize?.toString() || ""}
                />
                <Input
                  isRequired={true}
                  size="md"
                  label="Grid Size"
                  placeholder="Enter grid size"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) =>
                    setWordSearchGridSize(Number(e.target.value))
                  }
                  onBlur={(e) => {
                    const value = Number(e.target.value);
                    if (value < 8) {
                      setWordSearchGridSize(8);
                    } else if (value > 25) {
                      setWordSearchGridSize(25);
                    }
                  }}
                  max={25}
                  min={8}
                  value={wordSearchGridSize?.toString() || ""}
                />
                {/* Inversion Option for Word Search */}
                <Select
                  isRequired
                  size="md"
                  label="Invert Words"
                  placeholder="Select if words should be inverted"
                  classNames={{
                    label: "text-xs font-medium",
                    trigger: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setInvertWords(Number(e.target.value))}
                  value={invertWords.toString()}
                >
                  <SelectItem key="0">No</SelectItem>
                  <SelectItem key="0.5">Yes</SelectItem>
                </Select>
              </>
            )}

            {selectedGame === "2" && (
              <>
                <Input
                  isRequired={true}
                  size="md"
                  label="Enter words"
                  placeholder="Enter words separated by commas"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setCrosswordWords(e.target.value)}
                  value={crosswordWords}
                />
                <Input
                  isRequired={true}
                  size="md"
                  label="Enter clues"
                  placeholder="Enter clues separated by commas"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setCrosswordClues(e.target.value)}
                  value={crosswordClues}
                />
              </>
            )}

            {selectedGame === "4" && (
              <Input
                isRequired={true}
                size="md"
                label="Enter the word for Hangman"
                placeholder="Enter the word"
                classNames={{
                  label: "text-xs font-medium",
                  input: "bg-white dark:bg-gray-900",
                  inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                }}
                onChange={(e) => setHangmanWord(e.target.value)}
                value={hangmanWord}
              />
            )}

            {selectedGame === "5" && (
              <Input
                isRequired={true}
                size="md"
                label="Enter words"
                placeholder="Enter words separated by commas"
                classNames={{
                  label: "text-xs font-medium",
                  input: "bg-white dark:bg-gray-900",
                  inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                }}
                onChange={(e) => setScrambleWordsInput(e.target.value)}
                value={scrambleWordsInput}
              />
            )}

            {selectedGame === "6" && (
              <Input
                isRequired={true}
                size="md"
                label="Enter phrases"
                placeholder="Enter phrases separated by commas"
                classNames={{
                  label: "text-xs font-medium",
                  input: "bg-white dark:bg-gray-900",
                  inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                }}
                onChange={(e) => setCryptogramPhrases(e.target.value)}
                value={cryptogramPhrases}
              />
            )}

            {/* Mine Finder Inputs */}
            {selectedGame === "8" && (
              <>
                <Input
                  type="number"
                  min={3}
                  max={30}
                  step={1}
                  isRequired={true}
                  size="md"
                  label="Enter Grid Width"
                  placeholder="Enter grid width"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setMineFinderWidth(Number(e.target.value))}
                  value={mineFinderWidth.toString()}
                />
                <Input
                  type="number"
                  min={3}
                  max={30}
                  step={1}
                  isRequired={true}
                  size="md"
                  label="Enter Grid Height"
                  placeholder="Enter grid height"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setMineFinderHeight(Number(e.target.value))}
                  value={mineFinderHeight.toString()}
                />
                <Input
                  type="number"
                  min={1}
                  max={mineFinderWidth * mineFinderHeight - 1}
                  step={1}
                  isRequired={true}
                  size="md"
                  label="Enter Number of Mines"
                  placeholder="Enter number of mines"
                  classNames={{
                    label: "text-xs font-medium",
                    input: "bg-white dark:bg-gray-900",
                    inputWrapper: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                  }}
                  onChange={(e) => setMineCount(Number(e.target.value))}
                  value={mineCount.toString()}
                />
              </>
            )}

            {/* Font Selection */}
            {selectedGame !== "7" && (
              <Select
                isRequired
                size="md"
                label="Select Font"
                placeholder="Select font"
                classNames={{
                  label: "text-xs font-medium",
                  trigger: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                }}
                onChange={(e) => setSelectedFont(e.target.value)}
                value={selectedFont}
              >
                {fonts.map((font) => (
                  <SelectItem key={font}>{font}</SelectItem>
                ))}
              </Select>
            )}
                  </div>  {/* Close space-y-4 */}
                </div>  {/* Close Settings section */}
              </div>  {/* Close space-y-6 */}
            </CardBody>
          </Card>
              )}

              {/* Empty State */}
              {!selectedGame && (
                <Card>
                  <CardBody className="text-center py-20">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-2xl font-semibold mb-2">
                      Choose a Game to Start
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Select a game from the left sidebar to begin creating your puzzle
                    </p>
                  </CardBody>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorModalMessage}
      />

      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => {}} />
    </>
  );
}
