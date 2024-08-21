"use client"

import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import { generateWordSearch } from '@/managers/gamesManager';
import jsPDF from 'jspdf';

interface WordSearchProps {
    words?: string[];
    font?: string;
}

export default function WordSearch({ words, font }: WordSearchProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateWordSearch = async () => {
        setIsGenerating(true);
        const wordSearchResponse = await generateWordSearch(words);

        if (wordSearchResponse) {
            generatePDF(wordSearchResponse);
        }

        setIsGenerating(false);
    };

    const generatePDF = (wordSearchData: any) => {
        const { puzzle, grid, words } = wordSearchData;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const cellSize = 7; // Size of each cell
        const gridSize = grid.length;
        const gridWidth = gridSize * cellSize;

        // Define the type for word object
        interface Word {
            clean: string;
            path: { x: number; y: number }[];
        }

        // Centering the grid on the page
        const offsetX = (pageWidth - gridWidth) / 2;
        const offsetY = 40; // Start position below the title

        // Page 1: Draw the Word Search Puzzle
        doc.setFont(font || "times", "normal");
        doc.setFontSize(16);
        doc.text('Word Search Puzzle', pageWidth / 2, 20, { align: 'center' });

        // Draw the puzzle grid
        doc.setFontSize(8); // Smaller font size for letters inside the grid
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const letter = grid[r][c];

                if (typeof letter === 'string' && letter.trim() !== '') {
                    const x = offsetX + c * cellSize;
                    const y = offsetY + r * cellSize + 3; // Adjusted position to ensure correct alignment
                    doc.text(letter, x + 2, y);
                }
            }
        }

        // Draw the words to find in capital letters below the grid
        const wordsStartY = offsetY + gridSize * cellSize + 20;
        doc.setFontSize(12);
        const wordsPerLine = 3;
        const wordLines = Math.ceil(words.length / wordsPerLine);
        for (let i = 0; i < wordLines; i++) {
            const wordLine = words.slice(i * wordsPerLine, (i + 1) * wordsPerLine).map((word: Word) => word.clean).join(', ').toUpperCase();
            doc.text(wordLine, offsetX, wordsStartY + 10 + i * 7);
        }

        // Page 2: Draw the Word Search Solution
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Word Search Solution', pageWidth / 2, 20, { align: 'center' });

        // Draw the solution grid, highlighting only the correct words and bolding the letters
        doc.setFontSize(8); // Smaller font size for letters inside the grid
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const letter = grid[r][c];

                if (typeof letter === 'string' && letter.trim() !== '') {
                    const x = offsetX + c * cellSize;
                    const y = offsetY + r * cellSize + 3; // Adjusted position to ensure correct alignment

                    const isPartOfWord = words.some((word: Word) =>
                        word.path.some(coord => coord.x === c && coord.y === r)
                    );

                    if (isPartOfWord) {
                        doc.setFont(font || "times", "bold");
                        doc.setLineWidth(0.5);
                        doc.rect(x - 1, y - 5, cellSize, cellSize); // Draw the border
                    } else {
                        doc.setFont(font || "times", "normal");
                    }
                    doc.text(letter, x + 2, y);
                }
            }
        }

        // Draw the words below the solution grid
        const solutionWordsStartY = offsetY + gridSize * cellSize + 20;
        doc.setFontSize(12);
        for (let i = 0; i < wordLines; i++) {
            const wordLine = words.slice(i * wordsPerLine, (i + 1) * wordsPerLine).map((word: Word) => word.clean).join(', ').toUpperCase();
            doc.text(wordLine, offsetX, solutionWordsStartY + 10 + i * 7);
        }

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={!words || words[0] == '' || isGenerating}
                color="secondary"
                onClick={handleGenerateWordSearch}
            >
                {isGenerating ? "Generating..." : "Generate Word Search PDF"}
            </Button>
        </div>
    );
}
