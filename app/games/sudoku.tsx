import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import { generateSudoku } from '@/managers/gamesManager';
import jsPDF from 'jspdf';

interface SudokuProps {
    difficulty?: string;
    font?: string;
    is_sequential?: boolean;
    custom_name?: string;
    custom_solution_name?: string;
    num_puzzles?: number;
    solutions_per_page?: number;
}

export default function Sudoku({ difficulty, font, is_sequential, custom_name, custom_solution_name, num_puzzles = 1, solutions_per_page = 1 }: SudokuProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateSudoku = async () => {
        setIsGenerating(true);
        const sudokuResponses = await generateSudoku(difficulty, num_puzzles);

        if (sudokuResponses) {
            generatePDF(sudokuResponses);
        }

        setIsGenerating(false);
    };

    const generatePDF = (sudokuData: any[]) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const cellSize = 10;

        sudokuData.forEach((sudoku, index) => {
            const { puzzle, solution } = sudoku;

            // Determine titles based on the naming convention
            const puzzleTitle = is_sequential ? `Puzzle ${index + 1}` : custom_name || `Custom Puzzle ${index + 1}`;
            const solutionTitle = is_sequential ? `Solution ${index + 1}` : custom_solution_name || `Custom Solution ${index + 1}`;

            // Page for each Sudoku Puzzle
            if (index > 0) doc.addPage();
            doc.setFont(font || "times", "normal");
            doc.setFontSize(20);
            doc.text(puzzleTitle, pageWidth / 2, margin, { align: 'center' });

            // Centering the puzzle grid on the page
            const gridOffsetX = (pageWidth - 9 * cellSize) / 2;
            const gridOffsetY = margin + 20;

            drawSudokuGrid(doc, puzzle, gridOffsetX, gridOffsetY, cellSize);

            if (num_puzzles === 1 || solutions_per_page === 1) {
                // One puzzle and its solution per page or single solution view
                doc.addPage();
                doc.setFontSize(20);
                doc.text(solutionTitle, pageWidth / 2, margin, { align: 'center' });
                drawSudokuGrid(doc, solution, gridOffsetX, gridOffsetY, cellSize);
            }
        });

        if (num_puzzles > 1) {
            // If more than one puzzle, print solutions in a compact layout
            const solutionsPages = Math.ceil(num_puzzles / solutions_per_page);
            for (let page = 0; page < solutionsPages; page++) {
                doc.addPage();
                doc.setFont(font || "times", "normal");
                doc.setFontSize(20);
                doc.text(is_sequential ? `Solutions ${page * solutions_per_page + 1} - ${Math.min((page + 1) * solutions_per_page, num_puzzles)}` : custom_solution_name || "Solution", pageWidth / 2, margin, { align: 'center' });

                const solutionsToShow = sudokuData.slice(page * solutions_per_page, (page + 1) * solutions_per_page);
                const gridPerRow = 2; // Always 2 grids per row for solutions layout
                const gridSize = pageWidth / 2 - margin - 10; // Size to fit 2 grids per row with some margin

                solutionsToShow.forEach((sudoku, index) => {
                    const offsetX = (index % gridPerRow) * (gridSize + 20) + (pageWidth - gridPerRow * gridSize - (gridPerRow - 1) * 20) / 2;
                    const offsetY = margin + 20 + Math.floor(index / gridPerRow) * (gridSize + 20);
                    drawSudokuGrid(doc, sudoku.solution, offsetX, offsetY, gridSize / 9);
                });
            }
        }

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    const drawSudokuGrid = (doc: jsPDF, gridData: string, offsetX: number, offsetY: number, cellSize: number) => {
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
                isDisabled={!difficulty || isGenerating}
                color="secondary"
                onClick={handleGenerateSudoku}
            >
                {isGenerating ? "Generating..." : "Generate Sudoku PDF"}
            </Button>
        </div>
    );
}
