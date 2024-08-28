"use client";

import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import { generateCrossword } from '@/managers/gamesManager'; // Import backend function
import jsPDF from 'jspdf';

interface CrosswordProps {
    cross_words?: string[];
    font?: string;
    custom_name?: string;
    custom_solution_name?: string;
    wordsPerPuzzle?: number;
    num_puzzles?: number;
    solutions_per_page?: number;
    is_sequential?: boolean;
}

export default function Crossword({ cross_words, font, custom_name, custom_solution_name, wordsPerPuzzle = 10, num_puzzles = 1, solutions_per_page = 1, is_sequential = true }: CrosswordProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateCrossword = async () => {
        setIsGenerating(true);

        try {
            const crosswordResponse = await generateCrossword(cross_words, wordsPerPuzzle, num_puzzles);
            if (crosswordResponse) {
                generatePDF(crosswordResponse.response);
            }
        } catch (error) {
            console.error("Error generating crossword:", error);
        }

        setIsGenerating(false);
    };

    const generatePDF = (crosswordData: any[]) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        crosswordData.forEach((crossword, index) => {
            const { rows, cols, table: grid, outputJson: placedWords } = crossword;

            if (!grid || !placedWords) {
                console.error("Grid or placedWords are undefined!");
                return;
            }

            const cellSize = Math.min(
                (pageWidth - margin * 2) / cols,
                (pageHeight / 2 - margin * 2) / rows
            );

            const gridOffsetX = (pageWidth - cellSize * cols) / 2;
            const gridOffsetY = margin + 20;

            const numberFontSize = cellSize * 0.7;
            const letterFontSize = cellSize * 1.1;

            const getNumberForCell = (colIndex: number, rowIndex: number) => {
                for (const word of placedWords) {
                    if (word.startx === colIndex && word.starty === rowIndex) {
                        return word.position.toString();
                    }
                }
                return '';
            };

            const drawGrid = (isSolution = false) => {
                for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
                    for (let colIndex = 0; colIndex < cols; colIndex++) {
                        const cell = grid[rowIndex][colIndex];
                        const x = gridOffsetX + colIndex * cellSize;
                        const y = gridOffsetY + rowIndex * cellSize;

                        doc.rect(x, y, cellSize, cellSize);

                        if (cell === '-' || cell === ' ') {
                            doc.setFillColor(0, 0, 0);
                            doc.rect(x, y, cellSize, cellSize, 'F');
                        } else {
                            const number = getNumberForCell(colIndex, rowIndex);
                            if (number) {
                                doc.setFontSize(numberFontSize);
                                doc.setFont(font || "times", "normal");
                                doc.text(number, x + 2, y + 4);
                            }

                            if (isSolution) {
                                doc.setFontSize(letterFontSize);
                                doc.setFont(font || "times", "normal");
                                doc.text(
                                    cell.toUpperCase(),
                                    x + cellSize / 4,
                                    y + cellSize * 0.75
                                );
                            }
                        }
                    }
                }
            };

            if (index > 0) doc.addPage();

            const puzzleTitle = is_sequential ? `Puzzle ${index + 1}` : custom_name || `Crossword Puzzle ${index + 1}`;
            doc.setFont(font || "times", "normal");
            doc.setFontSize(20);
            doc.text(puzzleTitle, pageWidth / 2, margin + 10, { align: 'center' });

            drawGrid(false);

            const maxColumns = 2;
            const clueColumnWidth = (pageWidth - 2 * margin) / maxColumns - 10;
            const leftColumnX = (pageWidth - (2 * clueColumnWidth + 10)) / 2;
            const rightColumnX = leftColumnX + clueColumnWidth + 10;
            let currentY = gridOffsetY + rows * cellSize + 20;

            doc.setFontSize(8);
            doc.setFont(font || "times", "italic");
            doc.text('Across', leftColumnX, currentY);
            doc.text('Down', rightColumnX, currentY);

            currentY += 10;

            const distributeClues = (clues: any[], xPosition: number, yPosition: number) => {
                clues.forEach((wordInfo: any) => {
                    const clueText = `${wordInfo.position}. ${wordInfo.clue}`;
                    const splitText = doc.splitTextToSize(clueText, clueColumnWidth);

                    if (yPosition + splitText.length * 6 > pageHeight - margin) {
                        doc.addPage();
                        yPosition = margin;
                    }

                    doc.text(splitText, xPosition, yPosition);
                    yPosition += splitText.length * 6;
                });
            };

            distributeClues(
                placedWords.filter((word: any) => word.orientation === 'across'),
                leftColumnX,
                currentY
            );
            distributeClues(
                placedWords.filter((word: any) => word.orientation === 'down'),
                rightColumnX,
                currentY
            );

            // Page for solution
            if (num_puzzles === 1 || solutions_per_page === 1) {
                doc.addPage();
                doc.setFontSize(20);
                doc.text(`Solution ${index + 1}`, pageWidth / 2, margin + 10, { align: 'center' });
                drawGrid(true);
            }
        });

        console.log("solution_per_page", solutions_per_page);

        if (num_puzzles > 1) {
            // If more than one puzzle, print solutions in a compact layout
            const solutionsPages = Math.ceil(num_puzzles / solutions_per_page);
            for (let page = 0; page < solutionsPages; page++) {
                doc.addPage();
                doc.setFont(font || "times", "normal");
                doc.setFontSize(20);
                doc.text(
                    custom_solution_name || `Solutions ${page * solutions_per_page + 1} - ${Math.min((page + 1) * solutions_per_page, num_puzzles)}`,
                    pageWidth / 2,
                    margin - 10,
                    { align: 'center' }
                );

                const solutionsToShow = crosswordData.slice(page * solutions_per_page, (page + 1) * solutions_per_page);

                // Determine number of rows and columns based on solutions_per_page
                const gridPerRow = solutions_per_page === 4 ? 2 : solutions_per_page; // 2 grids per row for 4 solutions, else use solutions_per_page as column count
                const gridsInRow = Math.min(gridPerRow, solutions_per_page);
                const gridWidth = (pageWidth - (gridsInRow + 1) * margin) / gridsInRow; // Adjust grid width to fit within margins
                const gridHeight = gridWidth; // Keep the grid square

                solutionsToShow.forEach((crossword, index) => {
                    const { rows, cols, table: grid, outputJson: placedWords } = crossword;
                    const adjustedCellSize = Math.min(gridWidth / cols, gridHeight / rows);
                    const columnIndex = index % gridsInRow;
                    const rowIndex = Math.floor(index / gridsInRow);

                    const offsetX = margin + columnIndex * (gridWidth + margin);
                    const offsetY = margin + 20 + rowIndex * (gridHeight + 20);

                    // Draw the solution grid for each crossword
                    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
                        for (let colIndex = 0; colIndex < cols; colIndex++) {
                            const cell = grid[rowIndex][colIndex];
                            const x = offsetX + colIndex * adjustedCellSize;
                            const y = offsetY + rowIndex * adjustedCellSize;

                            doc.rect(x, y, adjustedCellSize, adjustedCellSize);

                            if (cell !== '-' && cell !== ' ') {
                                doc.setFontSize(8);
                                doc.setFont(font || "times", "normal");
                                doc.text(cell.toUpperCase(), x + adjustedCellSize / 4, y + adjustedCellSize * 0.75);
                            }
                        }
                    }
                });
            }
        }



        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={!cross_words || cross_words.length === 0 || isGenerating}
                color="secondary"
                onClick={handleGenerateCrossword}
            >
                {isGenerating ? "Generating..." : "Generate Crossword PDF"}
            </Button>
        </div>
    );
}
