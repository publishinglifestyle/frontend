"use client"

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
}

export default function MineFinder({ width, height, mines, font }: MineFinderProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateMineFinder = async () => {
        setIsGenerating(true);

        try {
            const mineFieldResponse = await generateMinesweeper(width, height, mines);
            console.log('Backend Response:', mineFieldResponse); // Debugging the response

            if (mineFieldResponse && mineFieldResponse.response) {
                generatePDF(mineFieldResponse.response);
            }
        } catch (error) {
            console.error("Failed to generate minefield:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generatePDF = (minefield: any) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const cellSize = 10; // Size of each cell
        const gridTotalWidth = (width || 0) * cellSize;

        // Centering the grid on the page
        const offsetX = (pageWidth - gridTotalWidth) / 2;
        const offsetY = 40; // Start position below the title

        // Page 1: Draw the Minesweeper Puzzle (no bombs)
        doc.setFont(font || "times", "normal");
        doc.setFontSize(16);
        doc.text('Minesweeper Puzzle', pageWidth / 2, 20, { align: 'center' });

        minefield.forEach((row: any[]) => {
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

                // Only draw the number of surrounding mines if the cell is not a mine
                if (!cell.isMine && cell.mines > 0) {
                    doc.setFont(font || "times", "normal");
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0); // Black text
                    doc.text(cell.mines.toString(), x + 4, y + 7); // Centered number
                }
            });
        });

        // Page 2: Draw the Minesweeper Solution (with bombs only where isMine is true)
        doc.addPage();
        doc.setFont(font || "times", "normal");
        doc.setFontSize(16);
        doc.text('Minesweeper Solution', pageWidth / 2, 20, { align: 'center' });

        minefield.forEach((row: any[]) => {
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

                // Only draw the bomb if `isMine` is true
                if (cell.isMine) {
                    const imgWidth = cellSize - 2;
                    const imgHeight = cellSize - 2;
                    doc.addImage(bombSymbol, 'PNG', x + 1, y + 1, imgWidth, imgHeight);
                } else if (cell.shouldShowAsGrayInSolution) {
                    // Draw '1' if it's a gray cell that wasn't shown in the puzzle
                    doc.setFont(font || "times", "normal");
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0); // Black text
                    doc.text("1", x + 4, y + 7); // Centered number '1'
                } else if (cell.mines > 0) {
                    // Draw the number of surrounding mines if not a mine
                    doc.setFont(font || "times", "normal");
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0); // Black text
                    doc.text(cell.mines.toString(), x + 4, y + 7); // Centered number
                }
            });
        });

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
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
