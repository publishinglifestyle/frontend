"use client"

import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Select, SelectItem } from '@nextui-org/select';
import { Input } from "@nextui-org/input";
import dynamic from 'next/dynamic';

// Dynamically import the game components
const Sudoku = dynamic(() => import('./sudoku'));
const Crossword = dynamic(() => import('./crossword'));
const Nurikabe = dynamic(() => import('./nurikabe'));
const WordSearch = dynamic(() => import('./wordsearch'));
const Hangman = dynamic(() => import('./hangman'));
const ScrambleWords = dynamic(() => import('./wordscrumble'));
const Cryptogram = dynamic(() => import('./cryptogram'));
const Maze = dynamic(() => import('./maze'));
const MineFinder = dynamic(() => import('./mineFinder'));
const DotsToDots = dynamic(() => import('./dots'));

const games = [
    { id: '1', name: 'Sudoku', component: Sudoku },
    { id: '2', name: 'Crossword', component: Crossword },
    { id: '3', name: 'Nurikabe', component: Nurikabe },
    { id: '4', name: 'Word Search', component: WordSearch },
    { id: '5', name: 'Hangman', component: Hangman },
    { id: '6', name: 'Scramble Words', component: ScrambleWords },
    { id: '7', name: 'Cryptogram', component: Cryptogram },
    { id: '8', name: 'Maze', component: Maze },
    { id: '9', name: 'Mine Finder', component: MineFinder },
    { id: '10', name: 'Dots to Dots', component: DotsToDots },
];

const fonts = ["times", "courier", "helvetica", "symbol", "zapfdingbats"];
const sudoku_difficulty = ["easy", "medium", "hard", "expert"];

export default function GamesPage() {
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [selectedFont, setSelectedFont] = useState<string>('times');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
    const [crosswordWords, setCrosswordWords] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<number>(5);
    const [wordSearchWords, setWordSearchWords] = useState<string>('');
    const [hangmanWord, setHangmanWord] = useState<string>('');
    const [scrambleWordsInput, setScrambleWordsInput] = useState<string>('');
    const [cryptogramPhrases, setCryptogramPhrases] = useState<string>('');
    const [mazeWidth, setMazeWidth] = useState<number>(41);
    const [mazeHeight, setMazeHeight] = useState<number>(41);
    const [mineFinderWidth, setMineFinderWidth] = useState<number>(9);
    const [mineFinderHeight, setMineFinderHeight] = useState<number>(9);
    const [mineCount, setMineCount] = useState<number>(10);

    const renderSelectedGame = () => {
        const game = games.find(game => game.id === selectedGame);
        if (game && game.component) {
            const GameComponent = game.component;

            if (selectedGame === '1') {
                return <GameComponent difficulty={selectedDifficulty} font={selectedFont} />;
            } else if (selectedGame === '2') {
                return <GameComponent cross_words={crosswordWords.split(',')} font={selectedFont} />;
            } else if (selectedGame === '3') {
                return <GameComponent size={selectedSize} font={selectedFont} />;
            } else if (selectedGame === '4') {
                return <GameComponent words={wordSearchWords.split(',')} font={selectedFont} />;
            } else if (selectedGame === '5') {
                return <GameComponent hangman_words={hangmanWord.split(',')} font={selectedFont} />;
            } else if (selectedGame === '6') {
                return <GameComponent words={scrambleWordsInput.split(',')} font={selectedFont} />;
            } else if (selectedGame === '7') {
                return <GameComponent phrases={cryptogramPhrases.split(',')} font={selectedFont} />;
            } else if (selectedGame === '8') {
                return <GameComponent width={mazeWidth} height={mazeHeight} font={selectedFont} />;
            } else if (selectedGame === '9') {
                return <GameComponent width={mineFinderWidth} height={mineFinderHeight} mines={mineCount} font={selectedFont} />;
            } else if (selectedGame === '10') {
                return <GameComponent />;
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
                                if (e.target.value !== '1') setSelectedDifficulty('');
                                if (e.target.value !== '2') setCrosswordWords('');
                                if (e.target.value !== '3') setSelectedSize(0);
                                if (e.target.value !== '4') setWordSearchWords('');
                                if (e.target.value !== '5') setHangmanWord('');
                                if (e.target.value !== '6') setScrambleWordsInput('');
                                if (e.target.value !== '7') setCryptogramPhrases('');
                                if (e.target.value !== '8') {
                                    setMazeWidth(41);
                                    setMazeHeight(41);
                                }
                                if (e.target.value !== '9') {
                                    setMineFinderWidth(9);
                                    setMineFinderHeight(9);
                                    setMineCount(10);
                                }

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
                                isRequired={true}
                                size="sm"
                                label="Enter Grid Size"
                                placeholder="Enter grid size"
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setSelectedSize(value);
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

                        {/* Conditionally render the text input for Scramble Words */}
                        {selectedGame === '6' && (
                            <Input
                                isRequired={true}
                                size="sm"
                                label="Enter words"
                                placeholder="Enter words separated by commas"
                                onChange={(e) => setScrambleWordsInput(e.target.value)}
                                value={scrambleWordsInput}
                            />
                        )}

                        {/* Conditionally render the text input for Cryptogram */}
                        {selectedGame === '7' && (
                            <Input
                                isRequired={true}
                                size="sm"
                                label="Enter phrases"
                                placeholder="Enter phrases separated by commas"
                                onChange={(e) => setCryptogramPhrases(e.target.value)}
                                value={cryptogramPhrases}
                            />
                        )}

                        {/* Conditionally render the inputs for Maze */}
                        {selectedGame === '8' && (
                            <>
                                <Input
                                    type="number"
                                    min={3}
                                    max={101}
                                    step={2} // Ensure odd numbers
                                    isRequired={true}
                                    size="sm"
                                    label="Enter Maze Width"
                                    placeholder="Enter maze width"
                                    onChange={(e) => setMazeWidth(Number(e.target.value))}
                                    value={mazeWidth.toString()}
                                />
                                <Input
                                    type="number"
                                    min={3}
                                    max={101}
                                    step={2} // Ensure odd numbers
                                    isRequired={true}
                                    size="sm"
                                    label="Enter Maze Height"
                                    placeholder="Enter maze height"
                                    onChange={(e) => setMazeHeight(Number(e.target.value))}
                                    value={mazeHeight.toString()}
                                />
                            </>
                        )}

                        {/* Conditionally render the inputs for Mine Finder */}
                        {selectedGame === '9' && (
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

                        <Select
                            isRequired
                            size="sm"
                            label="Select Font"
                            placeholder="Select font"
                            onChange={(e) => setSelectedFont(e.target.value)}
                            value={selectedFont}
                        >
                            {fonts.map((font) => (
                                <SelectItem key={font} value={font}>
                                    {font}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                </CardFooter>
            </Card>
        </>
    );
}
