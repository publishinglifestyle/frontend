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
    is_sequential?: boolean;
    num_puzzles?: number;
    solutions_per_page?: number;
    invert_words?: number;
    custom_name?: string;
    custom_solution_name?: string;
}

export default function WordSearch({ words, font, is_sequential, num_puzzles = 1, solutions_per_page = 1, invert_words, custom_name, custom_solution_name }: WordSearchProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const margin = 10; // Margin for the page
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

        wordSearchData.forEach((wordSearch, index) => {
            const { grid, words } = wordSearch;
            const gridSize = grid.length;
            const maxGridWidth = pageWidth - 2 * margin;
            const adjustedCellSize = Math.min(baseCellSize, maxGridWidth / gridSize); // Adjust cell size to fit within the margins
            const gridWidth = gridSize * adjustedCellSize;

            // Centering the grid on the page
            const offsetX = (pageWidth - gridWidth) / 2;
            const offsetY = margin + 20;

            // Determine titles based on the naming convention
            const puzzleTitle = is_sequential ? `Puzzle ${index + 1}` : custom_name || `Word Search Puzzle ${index + 1}`;
            const solutionTitle = is_sequential ? `Solution ${index + 1}` : custom_solution_name || `Word Search Solution ${index + 1}`;

            // Page for each Word Search Puzzle (puzzle view without highlighted words)
            if (index > 0) doc.addPage();
            doc.setFont(font || "times", "normal");
            doc.setFontSize(20);
            doc.text(puzzleTitle, pageWidth / 2, margin + 10, { align: 'center' });

            // Draw the puzzle grid
            drawWordSearchGrid(doc, grid, offsetX, offsetY, adjustedCellSize, false);


            // Draw the words to find below the grid, aligned to the left of the centered grid
            const wordsStartY = offsetY + gridSize * adjustedCellSize + 10;
            doc.setFontSize(10);

            const wordsX = offsetX;  // Align words to the left of the centered grid
            const maxColumns = 3;
            const wordsPerColumn = Math.ceil(words.length / maxColumns);
            const columnWidth = (pageWidth - 2 * margin) / maxColumns;

            for (let i = 0; i < words.length; i++) {
                const column = Math.floor(i / wordsPerColumn);
                const row = i % wordsPerColumn;
                const x = wordsX + column * columnWidth;
                const y = wordsStartY + row * 5;

                doc.text(words[i].clean.toUpperCase(), x, y);
            }

            if (num_puzzles === 1 || solutions_per_page === 1) {
                // Single puzzle and solution per page
                doc.addPage();
                doc.setFontSize(20);
                doc.text(solutionTitle, pageWidth / 2, margin + 10, { align: 'center' });

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
                doc.text(
                    is_sequential
                        ? `Solutions ${page * solutions_per_page + 1} - ${Math.min((page + 1) * solutions_per_page, num_puzzles)}`
                        : custom_solution_name || "Solutions",
                    pageWidth / 2,
                    margin + 10,
                    { align: 'center' }
                );

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
        const gridSize = grid.length;
        const lineThickness = 2; // Thickness of the highlight line
        const cornerRadius = cellSize / 2; // Radius for the rounded ends

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const letter = grid[r][c];

                if (typeof letter === 'string' && letter.trim() !== '') {
                    const x = offsetX + c * cellSize;
                    const y = offsetY + r * cellSize + cellSize * 0.75; // Adjusted position to ensure correct alignment

                    if (showWords) {
                        const wordPath = words?.find((word: Word) =>
                            word.path.some((coord: { x: number; y: number }) => coord.x === c && coord.y === r)
                        );

                        if (wordPath) {
                            const startX = offsetX + wordPath.path[0].x * cellSize + cellSize / 2;
                            const startY = offsetY + wordPath.path[0].y * cellSize + cellSize / 2;
                            const endX = offsetX + wordPath.path[wordPath.path.length - 1].x * cellSize + cellSize / 2;
                            const endY = offsetY + wordPath.path[wordPath.path.length - 1].y * cellSize + cellSize / 2;

                            // Set the line color and width
                            doc.setDrawColor(255, 0, 0); // Red color for the highlight
                            doc.setLineWidth(lineThickness);

                            // Draw the straight line connecting the start and end points
                            doc.line(startX, startY, endX, endY);

                            // Draw rounded ends using custom arcs
                            drawRoundedEnd(doc, startX, startY, cornerRadius);
                            drawRoundedEnd(doc, endX, endY, cornerRadius);
                        }

                        // Draw the letter inside the cell
                        doc.setFont(font || "times", "bold");
                        doc.setFontSize(8 * (cellSize / baseCellSize)); // Adjust font size based on cell size
                        doc.text(letter, x + cellSize / 4, y);
                    } else {
                        // Draw the letter normally if not highlighting
                        doc.setFont(font || "times", "normal");
                        doc.setFontSize(8 * (cellSize / baseCellSize));
                        doc.text(letter, x + cellSize / 4, y);
                    }
                }
            }
        }
    };

    // Helper function to draw rounded ends using small line segments to simulate a curve
    const drawRoundedEnd = (doc: jsPDF, centerX: number, centerY: number, radius: number) => {
        const numSegments = 8; // Number of segments to approximate a circle
        const angleStep = Math.PI / numSegments; // Angle step for each segment

        for (let i = 0; i <= numSegments; i++) {
            const angle = i * angleStep;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            if (i === 0) {
                doc.moveTo(x, y);
            } else {
                doc.lineTo(x, y);
            }
        }
        doc.fill(); // Fill the rounded end with the current fill color
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

