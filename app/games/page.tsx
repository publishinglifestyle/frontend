"use client"

import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Select, SelectItem } from '@nextui-org/select';
import { Input } from "@nextui-org/input";
import dynamic from 'next/dynamic';

// Dynamically import the Sudoku, Crossword, Nurikabe, WordSearch, and Hangman components
const Sudoku = dynamic(() => import('./sudoku'));
const Crossword = dynamic(() => import('./crossword'));
const Nurikabe = dynamic(() => import('./nurikabe'));
const WordSearch = dynamic(() => import('./wordsearch'));
const Hangman = dynamic(() => import('./hangman')); // Import Hangman dynamically

const games = [
    {
        id: '1',
        name: 'Sudoku',
        component: Sudoku
    },
    {
        id: '2',
        name: 'Crossword',
        component: Crossword
    },
    {
        id: '3',
        name: 'Nurikabe',
        component: Nurikabe
    },
    {
        id: '4',
        name: 'Word Search',
        component: WordSearch
    },
    {
        id: '5',
        name: 'Hangman',
        component: Hangman
    }
];

const sudoku_difficulty = ["easy", "medium", "hard", "expert"];

export default function GamesPage() {
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('easy');
    const [crosswordWords, setCrosswordWords] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<number>(5); // Default size for Nurikabe
    const [wordSearchWords, setWordSearchWords] = useState<string>(''); // State for Word Search words
    const [hangmanWord, setHangmanWord] = useState<string>(''); // State for Hangman word

    const renderSelectedGame = () => {
        const game = games.find(game => game.id === selectedGame);
        if (game && game.component) {
            const GameComponent = game.component;

            if (selectedGame === '1') {
                return <GameComponent difficulty={selectedDifficulty} />;
            } else if (selectedGame === '2') {
                return <GameComponent cross_words={crosswordWords} />;
            } else if (selectedGame === '3') {
                return <GameComponent size={selectedSize} />;
            } else if (selectedGame === '4') {
                return <GameComponent words={wordSearchWords.split(',')} />;
            } else if (selectedGame === '5') {
                return <GameComponent word={hangmanWord} />;
            } else {
                return <GameComponent />;
            }
        }
        return null;
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <h1 className="text-2xl">Games</h1>
                </CardHeader>
                <CardBody>
                    {renderSelectedGame()}
                </CardBody>
                <CardFooter>
                    <div className="flex gap-2 w-full">
                        <Select
                            isRequired
                            size="sm"
                            label="Select a game"
                            placeholder="Select a game"
                            onChange={(e) => {
                                setSelectedGame(e.target.value);
                                // Reset specific states when switching games
                                if (e.target.value !== '1') setSelectedDifficulty('easy');
                                if (e.target.value !== '2') setCrosswordWords('');
                                if (e.target.value !== '3') setSelectedSize(5);
                                if (e.target.value !== '4') setWordSearchWords('');
                                if (e.target.value !== '5') setHangmanWord('');
                            }}
                        >
                            {games.map((game) => (
                                <SelectItem key={game.id} value={game.id}>
                                    {game.name}
                                </SelectItem>
                            ))}
                        </Select>

                        {/* Conditionally render the difficulty select for Sudoku */}
                        {selectedGame === '1' && (
                            <Select
                                isRequired
                                size="sm"
                                label="Select Difficulty"
                                placeholder="Select difficulty"
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                value={selectedDifficulty}
                            >
                                {sudoku_difficulty.map((difficulty) => (
                                    <SelectItem key={difficulty} value={difficulty}>
                                        {difficulty}
                                    </SelectItem>
                                ))}
                            </Select>
                        )}

                        {/* Conditionally render the text input for Crossword */}
                        {selectedGame === '2' && (
                            <Input
                                isRequired={true}
                                size="sm"
                                label="Enter words"
                                placeholder="Enter words separated by commas"
                                onChange={(e) => setCrosswordWords(e.target.value)}
                                value={crosswordWords}
                            />
                        )}

                        {/* Conditionally render the number input for Nurikabe */}
                        {selectedGame === '3' && (
                            <Input
                                type="number"
                                min={3}
                                max={20}
                                step={1}
                                isRequired={true}
                                size="sm"
                                label="Enter Grid Size"
                                placeholder="Enter grid size"
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value >= 3 && value <= 20) {
                                        setSelectedSize(value);
                                    }
                                }}
                                value={selectedSize.toString()}
                            />
                        )}

                        {/* Conditionally render the text input for Word Search */}
                        {selectedGame === '4' && (
                            <Input
                                isRequired={true}
                                size="sm"
                                label="Enter words"
                                placeholder="Enter words separated by commas"
                                onChange={(e) => setWordSearchWords(e.target.value)}
                                value={wordSearchWords}
                            />
                        )}

                        {/* Conditionally render the text input for Hangman */}
                        {selectedGame === '5' && (
                            <Input
                                isRequired={true}
                                size="sm"
                                label="Enter the word for Hangman"
                                placeholder="Enter the word"
                                onChange={(e) => setHangmanWord(e.target.value)}
                                value={hangmanWord}
                            />
                        )}
                    </div>
                </CardFooter>
            </Card>
        </>
    );
}
