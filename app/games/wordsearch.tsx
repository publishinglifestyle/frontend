"use client"

import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import { generateWordSearch } from '@/managers/gamesManager';
import jsPDF from 'jspdf';

interface Word {
    clean: string;
    path: { x: number; y: number }[];
}

interface WordSearchProps {
    words?: string[];
    font?: string;
    num_puzzles?: number;
    solutions_per_page?: number;
    invert_words?: number;
}

export default function WordSearch({ words, font, num_puzzles = 1, solutions_per_page = 1, invert_words }: WordSearchProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const margin = 20; // Margin for the page
    const baseCellSize = 6; // Base cell size for the letters inside the puzzle

    const handleGenerateWordSearch = async () => {
        setIsGenerating(true);
        const wordSearchResponses = await generateWordSearch(words, num_puzzles, invert_words);

        if (wordSearchResponses) {
            generatePDF(wordSearchResponses);
        }

        setIsGenerating(false);
    };

    const generatePDF = (wordSearchData: any[]) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        wordSearchData.forEach((wordSearch, index) => {
            const { puzzle, grid, words } = wordSearch;
            const gridSize = grid.length;
            const maxGridWidth = pageWidth - 2 * margin;
            const adjustedCellSize = Math.min(baseCellSize, maxGridWidth / gridSize); // Adjust cell size to fit within the margins
            const gridWidth = gridSize * adjustedCellSize;

            // Centering the grid on the page
            const offsetX = (pageWidth - gridWidth) / 2;
            const offsetY = margin + 20;

            // Page for each Word Search Puzzle (puzzle view without highlighted words)
            if (index > 0) doc.addPage();
            doc.setFont(font || "times", "normal");
            doc.setFontSize(16);
            doc.text(`Word Search Puzzle ${index + 1}`, pageWidth / 2, margin + 10, { align: 'center' });

            // Draw the puzzle grid
            drawWordSearchGrid(doc, grid, offsetX, offsetY, adjustedCellSize, false);

            // Draw the words to find below the grid
            const wordsStartY = offsetY + gridSize * adjustedCellSize + 10;
            doc.setFontSize(10);
            const maxColumns = 3;
            const wordsPerColumn = Math.ceil(words.length / maxColumns);
            const columnWidth = (pageWidth - 2 * margin) / maxColumns;

            for (let i = 0; i < words.length; i++) {
                const column = Math.floor(i / wordsPerColumn);
                const row = i % wordsPerColumn;
                const x = margin + column * columnWidth;
                const y = wordsStartY + row * 5;

                doc.text(words[i].clean.toUpperCase(), x, y);
            }

            if (num_puzzles === 1 || solutions_per_page === 1) {
                // Single puzzle and solution per page
                doc.addPage();
                doc.setFontSize(16);
                doc.text(`Word Search Solution ${index + 1}`, pageWidth / 2, margin + 10, { align: 'center' });

                // Draw the solution grid, highlighting the correct words
                drawWordSearchGrid(doc, grid, offsetX, offsetY, adjustedCellSize, true, words);
            }
        });

        if (num_puzzles > 1) {
            // If more than one puzzle, print solutions in a compact layout
            const solutionsPages = Math.ceil(num_puzzles / solutions_per_page);
            for (let page = 0; page < solutionsPages; page++) {
                doc.addPage();
                doc.setFont(font || "times", "normal");
                doc.setFontSize(16);
                doc.text(`Solutions ${page * solutions_per_page + 1} - ${Math.min((page + 1) * solutions_per_page, num_puzzles)}`, pageWidth / 2, margin + 10, { align: 'center' });

                const solutionsToShow = wordSearchData.slice(page * solutions_per_page, (page + 1) * solutions_per_page);
                const gridPerRow = 2; // 2 grids per row for layout
                const maxGridSize = (pageWidth - 3 * margin) / gridPerRow; // Adjust max grid size to fit within margins

                solutionsToShow.forEach((wordSearch, index) => {
                    const gridSize = wordSearch.grid.length;
                    const adjustedSolutionCellSize = Math.min(baseCellSize, maxGridSize / gridSize); // Adjust cell size for solutions
                    const offsetX = margin + (index % gridPerRow) * (maxGridSize + margin);
                    const offsetY = margin + 20 + Math.floor(index / gridPerRow) * (maxGridSize + 20);
                    drawWordSearchGrid(doc, wordSearch.grid, offsetX, offsetY, adjustedSolutionCellSize, true, wordSearch.words);
                });
            }
        }

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    const drawWordSearchGrid = (doc: jsPDF, grid: string[][], offsetX: number, offsetY: number, cellSize: number, showWords: boolean, words?: Word[]) => {
        words?.forEach((word: Word) => {
            console.log(`Word: ${word.clean}, Path: ${JSON.stringify(word.path)}`);
        });


        const gridSize = grid.length;
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const letter = grid[r][c];

                if (typeof letter === 'string' && letter.trim() !== '') {
                    const x = offsetX + c * cellSize;
                    const y = offsetY + r * cellSize + cellSize * 0.75; // Adjusted position to ensure correct alignment

                    if (showWords) {
                        // Ensure we correctly determine if the letter is part of any word's path
                        const isPartOfWord = words?.some((word: Word) =>
                            word.path.some((coord: { x: number; y: number }) => coord.x === c && coord.y === r)
                        );

                        if (isPartOfWord) {
                            doc.setFont(font || "times", "bold");
                            doc.setFontSize(8 * (cellSize / baseCellSize)); // Adjust font size based on cell size
                            doc.setLineWidth(0.2);
                            doc.rect(x - 1, y - cellSize / 2, cellSize, cellSize); // Draw the border
                        } else {
                            doc.setFont(font || "times", "normal");
                            doc.setFontSize(8 * (cellSize / baseCellSize)); // Ensure consistent font size for non-highlighted letters
                        }
                    } else {
                        doc.setFont(font || "times", "normal");
                        doc.setFontSize(8 * (cellSize / baseCellSize)); // Ensure font size for non-solution view
                    }

                    doc.text(letter, x + cellSize / 4, y);
                }
            }
        }
    };



    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={!words || words[0] === '' || isGenerating}
                color="secondary"
                onClick={handleGenerateWordSearch}
            >
                {isGenerating ? "Generating..." : "Generate Word Search PDF"}
            </Button>
        </div>
    );
}
