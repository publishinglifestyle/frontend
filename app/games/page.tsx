"use client";

import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import jsPDF from "jspdf";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import ErrorModal from "@/app/modals/errorModal";
import { getSubscription } from "@/managers/subscriptionManager";
import { getUser } from "@/managers/userManager";
import { useAuth } from "../auth-context";
import SubscriptionModal from "../modals/subscriptionModal";
import { abrilFatfaceFont } from "./fonts/abril_fatface";
import { caveatVariableFont } from "./fonts/caveat_variable";
import { dancingScriptFont } from "./fonts/dancing_script";
import { shadowsIntoLightFont } from "./fonts/shadows_into_light";

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
  const [crosswordGrids, setCrosswordGrids] = useState<number>(10);
  const [wordSearchFontSize, setWordSearchFontSize] = useState<number>(8);
  const [wordSearchGridSize, setWordSearchGridSize] = useState<number>(25);
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
          src="https://maze-lowcontent-e5d92aeae259.herokuapp.com/"
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
      <Card>
        <CardHeader>
          <h1 className="text-2xl text-center">Games</h1>
        </CardHeader>
        <CardBody>{renderSelectedGame()}</CardBody>
        <CardFooter>
          <div className="flex flex-col items-center gap-4 w-full">
            <Select
              isRequired
              size="sm"
              label="Select a game"
              placeholder="Select a game"
              onChange={async (e) => {
                setSelectedGame(e.target.value);
                // Reset specific states when switching games
                if (e.target.value !== "1") setSelectedDifficulty("");
                if (e.target.value !== "2") setCrosswordWords("");
                //if (e.target.value !== '3') setSelectedSize(0);
                if (e.target.value !== "4") setWordSearchWords("");
                if (e.target.value !== "5") setHangmanWord("");
                if (e.target.value !== "6") setScrambleWordsInput("");
                if (e.target.value !== "7") setCryptogramPhrases("");
                if (e.target.value !== "9") {
                  setMineFinderWidth(9);
                  setMineFinderHeight(9);
                  setMineCount(10);
                }
                // Reset custom fields
                setCustomName("");
                setCustomSolutionName("");
                setSolutionsPerPage(1);
                setNumPuzzles(1);
                setInvertWords(0); // Reset inversion setting

                if (e.target.value === "7") {
                  setIsMazeAllowed(true);
                }
              }}
            >
              {games.map((game) => (
                <SelectItem key={game.id}>{game.name}</SelectItem>
              ))}
            </Select>

            {/* Name Type */}
            {selectedGame !== "7" && (
              <Select
                isRequired
                size="sm"
                label="Name Type"
                placeholder="Select Name Type"
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
                  size="sm"
                  label="Custom Name"
                  placeholder="Enter a custom name"
                  onChange={(e) => setCustomName(e.target.value)}
                  value={customName}
                />
                {selectedGame !== "9" && (
                  <Input
                    isRequired={true}
                    size="sm"
                    label="Custom Solution Name"
                    placeholder="Enter a custom solution name"
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
                  size="sm"
                  label="Number of Puzzles to Generate"
                  placeholder="Enter number of puzzles"
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
                size="sm"
                label="Words per Puzzle"
                placeholder="Enter number of words"
                onChange={(e) => setWordsPerPuzzle(Number(e.target.value))}
                value={wordsPerPuzzle.toString()}
              />
            )}

            {/* Sudoku Specific Input */}
            {selectedGame === "1" && (
              <>
                <Select
                  isRequired
                  size="sm"
                  label="Select Difficulty"
                  placeholder="Select difficulty"
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
                  size="sm"
                  label="Solutions per Page"
                  placeholder="Select number of solutions per page"
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
                  size="sm"
                  label="Enter words"
                  placeholder="Enter words separated by commas"
                  onChange={(e) => setWordSearchWords(e.target.value)}
                  value={wordSearchWords}
                />

                <Input
                  isRequired={true}
                  size="sm"
                  label="Font Size"
                  placeholder="Enter font size"
                  onChange={(e) =>
                    setWordSearchFontSize(Number(e.target.value))
                  }
                  max={20}
                  min={1}
                  value={wordSearchFontSize?.toString() || ""}
                />
                <Input
                  isRequired={true}
                  size="sm"
                  label="Grid Size"
                  placeholder="Enter grid size"
                  onChange={(e) =>
                    setWordSearchGridSize(Number(e.target.value))
                  }
                  max={20}
                  min={1}
                  value={wordSearchGridSize?.toString() || ""}
                />
                {/* Inversion Option for Word Search */}
                <Select
                  isRequired
                  size="sm"
                  label="Invert Words"
                  placeholder="Select if words should be inverted"
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
                  size="sm"
                  label="Enter words"
                  placeholder="Enter words separated by commas"
                  onChange={(e) => setCrosswordWords(e.target.value)}
                  value={crosswordWords}
                />
                <Input
                  isRequired={true}
                  size="sm"
                  label="Enter clues"
                  placeholder="Enter clues separated by commas"
                  onChange={(e) => setCrosswordClues(e.target.value)}
                  value={crosswordClues}
                />
                <Input
                  size="sm"
                  label="Number of grids"
                  placeholder="Enter number of grids"
                  type="number"
                  onChange={(e) => setCrosswordGrids(Number(e.target.value))}
                  value={crosswordGrids.toString()}
                />
              </>
            )}

            {selectedGame === "4" && (
              <Input
                isRequired={true}
                size="sm"
                label="Enter the word for Hangman"
                placeholder="Enter the word"
                onChange={(e) => setHangmanWord(e.target.value)}
                value={hangmanWord}
              />
            )}

            {selectedGame === "5" && (
              <Input
                isRequired={true}
                size="sm"
                label="Enter words"
                placeholder="Enter words separated by commas"
                onChange={(e) => setScrambleWordsInput(e.target.value)}
                value={scrambleWordsInput}
              />
            )}

            {selectedGame === "6" && (
              <Input
                isRequired={true}
                size="sm"
                label="Enter phrases"
                placeholder="Enter phrases separated by commas"
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
                  size="sm"
                  label="Enter Grid Width"
                  placeholder="Enter grid width"
                  onChange={(e) => setMineFinderWidth(Number(e.target.value))}
                  value={mineFinderWidth.toString()}
                />
                <Input
                  type="number"
                  min={3}
                  max={30}
                  step={1}
                  isRequired={true}
                  size="sm"
                  label="Enter Grid Height"
                  placeholder="Enter grid height"
                  onChange={(e) => setMineFinderHeight(Number(e.target.value))}
                  value={mineFinderHeight.toString()}
                />
                <Input
                  type="number"
                  min={1}
                  max={mineFinderWidth * mineFinderHeight - 1}
                  step={1}
                  isRequired={true}
                  size="sm"
                  label="Enter Number of Mines"
                  placeholder="Enter number of mines"
                  onChange={(e) => setMineCount(Number(e.target.value))}
                  value={mineCount.toString()}
                />
              </>
            )}

            {/* Font Selection */}
            {selectedGame !== "7" && (
              <Select
                isRequired
                size="sm"
                label="Select Font"
                placeholder="Select font"
                onChange={(e) => setSelectedFont(e.target.value)}
                value={selectedFont}
              >
                {fonts.map((font) => (
                  <SelectItem key={font}>{font}</SelectItem>
                ))}
              </Select>
            )}
          </div>
        </CardFooter>
      </Card>

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        message={errorModalMessage}
      />

      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => {}} />
    </>
  );
}
