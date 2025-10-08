"use client";

import { motion } from "framer-motion";
import {
  FaTableCells,
  FaCrosshairs,
  FaMagnifyingGlass,
  FaArrowsLeftRight,
  FaLock,
  FaPuzzlePiece,
  FaBomb,
  FaCircleDot,
  FaQuestion
} from "react-icons/fa6";

interface Game {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const gamesList: Game[] = [
  {
    id: "1",
    name: "Sudoku",
    icon: <FaTableCells className="text-2xl" />,
    description: "Logic-based number placement puzzle",
    color: "from-gray-700 to-gray-800",
  },
  {
    id: "2",
    name: "Crossword",
    icon: <FaCrosshairs className="text-2xl" />,
    description: "Word puzzle with intersecting clues",
    color: "from-gray-700 to-gray-800",
  },
  {
    id: "3",
    name: "Word Search",
    icon: <FaMagnifyingGlass className="text-2xl" />,
    description: "Find hidden words in a grid",
    color: "from-gray-700 to-gray-800",
  },
  {
    id: "4",
    name: "Hangman",
    icon: <FaQuestion className="text-2xl" />,
    description: "Guess the word letter by letter",
    color: "from-gray-700 to-gray-800",
  },
  {
    id: "5",
    name: "Scramble Words",
    icon: <FaArrowsLeftRight className="text-2xl" />,
    description: "Unscramble letters to form words",
    color: "from-gray-700 to-gray-800",
  },
  {
    id: "6",
    name: "Cryptogram",
    icon: <FaLock className="text-2xl" />,
    description: "Decode encrypted messages",
    color: "from-gray-700 to-gray-800",
  },
  {
    id: "7",
    name: "Maze",
    icon: <FaPuzzlePiece className="text-2xl" />,
    description: "Navigate through complex paths",
    color: "from-gray-700 to-gray-800",
  },
  {
    id: "8",
    name: "Mine Finder",
    icon: <FaBomb className="text-2xl" />,
    description: "Minesweeper-style logic game",
    color: "from-gray-700 to-gray-800",
  },
  {
    id: "9",
    name: "Dots to Dots",
    icon: <FaCircleDot className="text-2xl" />,
    description: "Connect the dots to reveal images",
    color: "from-gray-700 to-gray-800",
  },
];

interface GameSelectorProps {
  selectedGame: string | null;
  onSelectGame: (gameId: string) => void;
}

export default function GameSelector({ selectedGame, onSelectGame }: GameSelectorProps) {
  return (
    <div className="w-full">
      <h2 className="text-sm font-semibold mb-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Select Game
      </h2>
      <div className="space-y-1">
        {gamesList.map((game) => (
          <motion.button
            key={game.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectGame(game.id)}
            className={`
              w-full text-left p-3 rounded-lg
              transition-all duration-200 ease-out
              flex items-center gap-3
              ${
                selectedGame === game.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
          >
            <div className={`flex-shrink-0 ${selectedGame === game.id ? "text-white" : "text-gray-600 dark:text-gray-400"}`}>
              {game.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">
                {game.name}
              </h3>
            </div>
            {selectedGame === game.id && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-shrink-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
