import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import jsPDF from 'jspdf';
import { generateMinesweeper } from "@/managers/gamesManager";
const bombSymbol = './bomb.png';  // Path to your bomb image

interface MineFinderProps {
    width?: number;
    height?: number;
    mines?: number;
    font?: string;
    num_puzzles?: number;
    solutions_per_page?: number;
}

export default function MineFinder({ width, height, mines, font, num_puzzles = 1, solutions_per_page = 1 }: MineFinderProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateMineFinder = async () => {
        setIsGenerating(true);

        try {
            const mineFieldResponses = await generateMinesweeper(width, height, mines, num_puzzles);
            if (mineFieldResponses && mineFieldResponses.response) {
                generatePDF(mineFieldResponses.response);
            }
        } catch (error) {
            console.error("Failed to generate minefield:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generatePDF = (minefields: any[]) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const cellSize = 10;
        const gridWidth = (width || 0) * cellSize;

        minefields.forEach((minefieldData, index) => {
            const { puzzle, solution } = minefieldData;

            // Page for each Minesweeper Puzzle (puzzle view without bombs)
            if (index > 0) doc.addPage();
            doc.setFont(font || "times", "normal");
            doc.setFontSize(16);
            doc.text(`Minesweeper Puzzle ${index + 1}`, pageWidth / 2, margin - 10, { align: 'center' });

            // Centering the puzzle grid
            const offsetX = (pageWidth - gridWidth) / 2;
            const offsetY = margin + 10;

            drawMinefieldGrid(doc, puzzle, offsetX, offsetY, cellSize, false);  // Puzzle without bombs

            if (num_puzzles === 1 || solutions_per_page === 1) {
                // Single puzzle and solution per page
                doc.addPage();
                doc.text(`Minesweeper Solution ${index + 1}`, pageWidth / 2, margin - 10, { align: 'center' });
                drawMinefieldGrid(doc, solution, offsetX, offsetY, cellSize, true);  // Solution with bombs
            }
        });

        if (num_puzzles > 1) {
            // If more than one puzzle, print solutions in a compact layout
            const solutionsPages = Math.ceil(num_puzzles / solutions_per_page);
            for (let page = 0; page < solutionsPages; page++) {
                doc.addPage();
                doc.setFont(font || "times", "normal");
                doc.setFontSize(16);
                doc.text(`Solutions ${page * solutions_per_page + 1} - ${Math.min((page + 1) * solutions_per_page, num_puzzles)}`, pageWidth / 2, margin - 10, { align: 'center' });

                const solutionsToShow = minefields.slice(page * solutions_per_page, (page + 1) * solutions_per_page);
                const gridPerRow = 2; // 2 grids per row for layout
                const gridSize = pageWidth / 2 - margin - 10; // Adjust to fit 2 grids per row with margin

                solutionsToShow.forEach((minefield, index) => {
                    const offsetX = (index % gridPerRow) * (gridSize + 20) + (pageWidth - gridPerRow * gridSize - (gridPerRow - 1) * 20) / 2;
                    const offsetY = margin + 20 + Math.floor(index / gridPerRow) * (gridSize + 20);
                    drawMinefieldGrid(doc, minefield.solution, offsetX, offsetY, gridSize / width!, true);  // Solution with bombs
                });
            }
        }

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    const drawMinefieldGrid = (doc: jsPDF, gridData: any[], offsetX: number, offsetY: number, cellSize: number, showBombs: boolean) => {
        gridData.forEach((row: any[]) => {
            row.forEach((cell: any) => {
                const x = offsetX + cell.x * cellSize;
                const y = offsetY + cell.y * cellSize;

                // Set the fill color based on the `isGray` property
                if (cell.isGray) {
                    doc.setFillColor(200, 200, 200); // Light gray color for gray cells
                } else {
                    doc.setFillColor(255, 255, 255); // White for non-gray cells
                }
                doc.rect(x, y, cellSize, cellSize, 'F'); // Draw filled rectangle

                // Draw cell border
                doc.setDrawColor(0, 0, 0); // Black border
                doc.rect(x, y, cellSize, cellSize); // Draw cell border

                if (showBombs && cell.isMine) {
                    // Draw the bomb only if `showBombs` is true
                    const imgWidth = cellSize - 2;
                    const imgHeight = cellSize - 2;
                    doc.addImage(bombSymbol, 'PNG', x + 1, y + 1, imgWidth, imgHeight);
                } else if (!cell.isMine && cell.mines > 0) {
                    // Draw the number of surrounding mines if not a mine
                    doc.setFont(font || "times", "normal");
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0); // Black text
                    doc.text(cell.mines.toString(), x + cellSize / 2, y + cellSize / 2 + 3, { align: 'center' });
                }
            });
        });
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={isGenerating || !width || !height || !mines}
                color="secondary"
                onClick={handleGenerateMineFinder}
            >
                {isGenerating ? "Generating..." : "Generate Minesweeper PDF"}
            </Button>
        </div>
    );
}
