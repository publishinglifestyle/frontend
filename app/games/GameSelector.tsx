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
import type { IconType } from "react-icons";

interface Game {
  id: string;
  name: string;
  icon: IconType;
  description: string;
  color: string;
}

const gamesList: Game[] = [
  {
    id: "1",
    name: "Sudoku",
    icon: FaTableCells,
    description: "Logic-based number placement puzzle",
    color: "#8B5CF6",
  },
  {
    id: "2",
    name: "Crossword",
    icon: FaCrosshairs,
    description: "Word puzzle with intersecting clues",
    color: "#EC4899",
  },
  {
    id: "3",
    name: "Word Search",
    icon: FaMagnifyingGlass,
    description: "Find hidden words in a grid",
    color: "#06B6D4",
  },
  {
    id: "4",
    name: "Hangman",
    icon: FaQuestion,
    description: "Guess the word letter by letter",
    color: "#F59E0B",
  },
  {
    id: "5",
    name: "Scramble Words",
    icon: FaArrowsLeftRight,
    description: "Unscramble letters to form words",
    color: "#10B981",
  },
  {
    id: "6",
    name: "Cryptogram",
    icon: FaLock,
    description: "Decode encrypted messages",
    color: "#EF4444",
  },
  {
    id: "7",
    name: "Maze",
    icon: FaPuzzlePiece,
    description: "Navigate through complex paths",
    color: "#6366F1",
  },
  {
    id: "8",
    name: "Mine Finder",
    icon: FaBomb,
    description: "Minesweeper-style logic game",
    color: "#F97316",
  },
  {
    id: "9",
    name: "Dots to Dots",
    icon: FaCircleDot,
    description: "Connect the dots to reveal images",
    color: "#14B8A6",
  },
];

interface GameSelectorProps {
  selectedGame: string | null;
  onSelectGame: (gameId: string) => void;
}

export default function GameSelector({ selectedGame, onSelectGame }: GameSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Select Game
        </h2>
      </div>
      <div className="space-y-2">
        {gamesList.map((game, index) => {
          const isSelected = selectedGame === game.id;
          const Icon = game.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

          return (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectGame(game.id)}
              className={`
                w-full text-left p-3 rounded-xl
                transition-all duration-200 ease-out
                flex items-center gap-3
                border
                ${isSelected
                  ? "bg-gradient-to-r from-purple-500/20 to-violet-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                }
              `}
            >
              {/* Icon */}
              <div
                className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                  transition-all duration-200
                `}
                style={{
                  backgroundColor: isSelected ? `${game.color}30` : 'rgba(255,255,255,0.05)',
                  color: isSelected ? game.color : 'rgba(255,255,255,0.5)',
                }}
              >
                <Icon className="text-xl" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h3 className={`
                  font-medium text-sm truncate
                  ${isSelected ? "text-white" : "text-white/70"}
                `}>
                  {game.name}
                </h3>
                <p className={`
                  text-xs truncate
                  ${isSelected ? "text-white/60" : "text-white/40"}
                `}>
                  {game.description}
                </p>
              </div>

              {/* Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                >
                  <svg
                    className="w-3.5 h-3.5 text-white"
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
          );
        })}
      </div>
    </div>
  );
}
