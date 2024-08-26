"use client"

import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import { generateCrossword } from '@/managers/gamesManager'; // Assuming this is how you import your backend function
import jsPDF from 'jspdf';

interface CrosswordProps {
    cross_words?: string[];
    font?: string;
}

export default function Crossword({ cross_words, font }: CrosswordProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateCrossword = async () => {
        setIsGenerating(true);

        try {
            // Generate crossword using the backend function
            const crosswordResponse = await generateCrossword(cross_words);
            console.log("Crossword response:", crosswordResponse); // Log the full response for debugging

            if (crosswordResponse) {
                generatePDF(crosswordResponse);
            }
        } catch (error) {
            console.error("Error generating crossword:", error);
        }

        setIsGenerating(false);
    };

    const generatePDF = (crosswordLayout: any) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        const { table: grid, outputJson: placedWords } = crosswordLayout.response;

        if (!grid || !placedWords) {
            console.error("Grid or placedWords are undefined!");
            return;
        }

        const rows = grid.length;
        const cols = grid[0].length;

        if (rows === 0 || cols === 0) {
            console.error("Grid is empty!");
            return;
        }

        // Calculate boundaries of the crossword to only show relevant cells
        let minRow = rows, maxRow = 0, minCol = cols, maxCol = 0;
        grid.forEach((row: string[], rowIndex: number) => {
            row.forEach((cell: string, colIndex: number) => {
                if (cell !== '-' && cell !== ' ') {
                    if (rowIndex < minRow) minRow = rowIndex;
                    if (rowIndex > maxRow) maxRow = rowIndex;
                    if (colIndex < minCol) minCol = colIndex;
                    if (colIndex > maxCol) maxCol = colIndex;
                }
            });
        });

        const relevantRows = maxRow - minRow + 1;
        const relevantCols = maxCol - minCol + 1;

        const availableWidth = pageWidth - margin * 2;
        const availableHeight = (pageHeight / 2) - margin * 2;
        const cellSize = Math.min(availableWidth / relevantCols, availableHeight / relevantRows);

        const gridOffsetX = margin + (availableWidth - cellSize * relevantCols) / 2;
        const gridOffsetY = margin + 20;

        const numberFontSize = cellSize * 0.4;
        const letterFontSize = cellSize * 0.7;

        const getNumberForCell = (colIndex: number, rowIndex: number) => {
            for (let i = 0; i < placedWords.length; i++) {
                const word = placedWords[i];
                const wordStartX = word.startx;
                const wordStartY = word.starty;

                if (wordStartX === colIndex && wordStartY === rowIndex) {
                    return word.position.toString(); // Return the position as a string for the start cell
                }
            }
            return '';
        };

        const drawGrid = (isSolution = false) => {
            for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
                for (let colIndex = minCol; colIndex <= maxCol; colIndex++) {
                    const cell = grid[rowIndex][colIndex];
                    const x = gridOffsetX + (colIndex - minCol) * cellSize;
                    const y = gridOffsetY + (rowIndex - minRow) * cellSize;

                    // Draw cell border
                    doc.rect(x, y, cellSize, cellSize);

                    // Determine the offset for number placement based on cell size
                    const numberOffsetX = cellSize > 15 ? 2 : 1;
                    const numberOffsetY = cellSize > 15 ? 4 : 1;

                    // Draw the starting position number if applicable
                    const number = getNumberForCell(colIndex, rowIndex);
                    if (number) {
                        doc.setFontSize(numberFontSize);
                        doc.setFont(font || "times", "normal");
                        doc.text(number, x + numberOffsetX, y + numberOffsetY);
                    }

                    if (isSolution && cell !== '-' && cell !== ' ') {
                        // Draw the letter in the solution grid, centered
                        doc.setFontSize(letterFontSize);
                        doc.setFont(font || "times", "normal");
                        const textWidth = doc.getTextWidth(cell.toUpperCase());
                        const textX = x + (cellSize - textWidth) / 2;
                        const textY = y + (cellSize + letterFontSize * 0.3) / 2; // Adjust for better vertical centering
                        doc.text(cell.toUpperCase(), textX, textY);
                    }
                }
            }
        };

        // Page 1: Draw the crossword puzzle (unsolved)
        doc.setFont(font || "times", "normal");
        doc.setFontSize(16);
        doc.text('Crossword Puzzle', pageWidth / 2, margin + 10, { align: 'center' });
        drawGrid(false);

        // Add clues below the grid
        const clueColumnWidth = (availableWidth - margin * 2) / 2 - 10;
        const leftColumnX = margin;
        const rightColumnX = margin + clueColumnWidth + 20;
        let currentY = gridOffsetY + relevantRows * cellSize + 20;

        doc.setFontSize(12);
        doc.setFont(font || "times", "italic");
        doc.text('Across', leftColumnX, currentY);
        doc.text('Down', rightColumnX, currentY);

        currentY += 10;

        const acrossClues = placedWords.filter((wordInfo: any) => wordInfo.orientation === 'across');
        const downClues = placedWords.filter((wordInfo: any) => wordInfo.orientation === 'down');

        const clueLineHeight = 7;
        let acrossY = currentY;
        let downY = currentY;

        acrossClues.forEach((wordInfo: any) => {
            const clueText = `${wordInfo.position}. ${wordInfo.clue}`;
            const splitText = doc.splitTextToSize(clueText, clueColumnWidth);
            doc.text(splitText, leftColumnX, acrossY);
            acrossY += splitText.length * clueLineHeight;
        });

        downClues.forEach((wordInfo: any) => {
            const clueText = `${wordInfo.position}. ${wordInfo.clue}`;
            const splitText = doc.splitTextToSize(clueText, clueColumnWidth);
            doc.text(splitText, rightColumnX, downY);
            downY += splitText.length * clueLineHeight;
        });

        // Page 2: Draw the crossword solution
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Solutions', pageWidth / 2, margin + 10, { align: 'center' });
        drawGrid(true);

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={!cross_words || cross_words[0] === '' || isGenerating}
                color="secondary"
                onClick={handleGenerateCrossword}
            >
                {isGenerating ? "Generating..." : "Generate PDF"}
            </Button>
        </div>
    );
}
