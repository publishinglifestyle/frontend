import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import { generateSudoku } from '@/managers/gamesManager';
import jsPDF from 'jspdf';

interface SudokuProps {
    difficulty?: string;
}

export default function Sudoku({ difficulty }: SudokuProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateSudoku = async () => {
        setIsGenerating(true);
        const sudokuResponse = await generateSudoku(difficulty); // Pass difficulty to the generate function

        if (sudokuResponse) {
            generatePDF(sudokuResponse);
        }

        setIsGenerating(false);
    };

    const generatePDF = (sudokuData: any) => {
        const { puzzle, solution, difficulty } = sudokuData;

        const doc = new jsPDF('p', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const cellSize = 15; // Set cell size for the grid

        const gridOffsetX = (pageWidth - 9 * cellSize) / 2;
        const gridOffsetY = 40; // Start position below the title

        // Page 1: Draw the Sudoku Puzzle
        doc.setFont("times", "normal");
        doc.setFontSize(16);
        doc.text(`Sudoku Puzzle - Difficulty: ${difficulty}`, pageWidth / 2, 20, { align: 'center' });

        drawSudokuGrid(doc, puzzle, gridOffsetX, gridOffsetY, cellSize);

        // Page 2: Draw the Sudoku Solution
        doc.addPage();
        doc.text('Sudoku Solution', pageWidth / 2, 20, { align: 'center' });

        drawSudokuGrid(doc, solution, gridOffsetX, gridOffsetY, cellSize);

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    const drawSudokuGrid = (doc: jsPDF, gridData: string, offsetX: number, offsetY: number, cellSize: number) => {
        // Draw the grid lines
        doc.setLineWidth(0.5);
        for (let i = 0; i <= 9; i++) {
            const lineWidth = i % 3 === 0 ? 1 : 0.5;
            doc.setLineWidth(lineWidth);

            // Vertical lines
            doc.line(offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + 9 * cellSize);
            // Horizontal lines
            doc.line(offsetX, offsetY + i * cellSize, offsetX + 9 * cellSize, offsetY + i * cellSize);
        }

        // Draw the numbers
        doc.setFontSize(12);
        for (let i = 0; i < 81; i++) {
            const row = Math.floor(i / 9);
            const col = i % 9;
            const value = gridData[i];

            if (value !== '-') {
                doc.text(value, offsetX + col * cellSize + cellSize / 2, offsetY + row * cellSize + cellSize / 2 + 3, {
                    align: 'center'
                });
            }
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={difficulty == '' || isGenerating}
                color="secondary"
                onClick={handleGenerateSudoku}
            >
                {isGenerating ? "Generating..." : "Generate Sudoku PDF"}
            </Button>
        </div>
    );
}
