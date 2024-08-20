import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import jsPDF from 'jspdf';
import { generateMinesweeper } from '@/managers/gamesManager';

const bombSymbol = './bomb.png';  // Path to your bomb image

interface MineFinderProps {
    width?: number;
    height?: number;
    mines?: number;
}

export default function MineFinder({ width, height, mines }: MineFinderProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateMineFinder = async () => {
        setIsGenerating(true);

        try {
            console.log(width, height, mines)
            const mineFieldResponse = await generateMinesweeper(width, height, mines);

            if (mineFieldResponse && mineFieldResponse.response) {
                generatePDF(mineFieldResponse.response);
            }
        } catch (error) {
            console.error("Failed to generate minefield:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const generatePDF = async (minefield: any) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const cellSize = 10; // Size of each cell
        const gridHeight = minefield.length;
        const gridWidth = minefield[0].length;
        const gridTotalWidth = gridWidth * cellSize;

        // Centering the grid on the page
        const offsetX = (pageWidth - gridTotalWidth) / 2;
        const offsetY = 40; // Start position below the title

        // Load the bomb image
        const img = new Image();
        img.src = bombSymbol;

        img.onload = () => {
            // Page 1: Draw the Minesweeper Puzzle
            doc.setFont("times", "normal");
            doc.setFontSize(16);
            doc.text('Minesweeper Puzzle', pageWidth / 2, 20, { align: 'center' });

            for (let r = 0; r < gridHeight; r++) {
                for (let c = 0; c < gridWidth; c++) {
                    const cell = minefield[r][c];
                    const x = offsetX + c * cellSize;
                    const y = offsetY + r * cellSize;

                    // Set the fill color based on the `isGray` property
                    if (cell.isGray) {
                        doc.setFillColor(200, 200, 200); // Light gray color using RGB
                    } else {
                        doc.setFillColor(255, 255, 255); // White color for non-gray cells
                    }

                    // Draw the filled rectangle
                    doc.rect(x, y, cellSize, cellSize, 'F'); // Filled rectangle

                    // Draw cell border
                    doc.setDrawColor(0, 0, 0); // Set the border color to black
                    doc.rect(x, y, cellSize, cellSize); // Draw cell border

                    // Draw the number of surrounding mines
                    if (cell.mines > 0 && !cell.isMine) {
                        doc.setFontSize(10);
                        doc.setTextColor(0, 0, 0); // Set text color to black
                        doc.text(cell.mines.toString(), x + 4, y + 7); // Adjust text position for center alignment
                    }
                }
            }

            // Page 2: Draw the Minesweeper Solution
            doc.addPage();
            doc.setFontSize(16);
            doc.text('Minesweeper Solution', pageWidth / 2, 20, { align: 'center' });

            for (let r = 0; r < gridHeight; r++) {
                for (let c = 0; c < gridWidth; c++) {
                    const cell = minefield[r][c];
                    const x = offsetX + c * cellSize;
                    const y = offsetY + r * cellSize;

                    // Set the fill color based on the `isGray` property
                    if (cell.isGray) {
                        doc.setFillColor(200, 200, 200); // Light gray color using RGB
                    } else {
                        doc.setFillColor(255, 255, 255); // White color for non-gray cells
                    }

                    // Draw the filled rectangle
                    doc.rect(x, y, cellSize, cellSize, 'F'); // Filled rectangle

                    // Draw cell border
                    doc.setDrawColor(0, 0, 0); // Set the border color to black
                    doc.rect(x, y, cellSize, cellSize); // Draw cell border

                    if (cell.isMine) {
                        // Draw bomb image for mine
                        const imgWidth = cellSize - 2; // Adjust image size to fit inside the cell
                        const imgHeight = cellSize - 2;
                        doc.addImage(img, 'PNG', x + 1, y + 1, imgWidth, imgHeight); // Place the image within the cell
                    } else if (cell.mines > 0) {
                        // Draw the number of surrounding mines
                        doc.setFontSize(10);
                        doc.setTextColor(0, 0, 0); // Set text color to black
                        doc.text(cell.mines.toString(), x + 4, y + 7); // Adjust text position for center alignment
                    }
                }
            }

            const pdfDataUrl = doc.output('bloburl');
            window.open(pdfDataUrl, '_blank');
        };
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
