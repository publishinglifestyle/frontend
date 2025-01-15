"use client"

import React, { useState } from 'react';
import { Button } from '@nextui-org/button';
import { generateNurikabe } from '@/managers/gamesManager';
import jsPDF from 'jspdf';

interface NurikabeProps {
    size?: number;
    font?: string;
}

interface NurikabeResponse {
    grid_size: number;
    puzzle: (number | null)[][];
    solution: (number | string | null)[][];
}

export default function Nurikabe({ size, font }: NurikabeProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateNurikabe = async () => {
        setIsGenerating(true);
        const nurikabeResponse = await generateNurikabe(size); // Pass size to the generateNurikabe function

        if (nurikabeResponse) {
            generatePDF(nurikabeResponse);
        }

        setIsGenerating(false);
    };

    const generatePDF = (nurikabeData: NurikabeResponse) => {
        const { grid_size, puzzle, solution } = nurikabeData;
        const doc = new jsPDF('p', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const cellSize = Math.min((pageWidth - margin * 2) / grid_size, 20); // Max cell size is 20mm

        const gridOffsetX = (pageWidth - grid_size * cellSize) / 2;
        const gridOffsetY = 40; // Start position below the title

        // Page 1: Draw the Nurikabe Puzzle
        doc.setFont(font || "times", "normal");
        doc.setFontSize(16);
        doc.text(`Nurikabe Puzzle - Size: ${grid_size}x${grid_size}`, pageWidth / 2, 20, { align: 'center' });

        drawNurikabeGrid(doc, puzzle, gridOffsetX, gridOffsetY, cellSize, grid_size, false);

        // Page 2: Draw the Nurikabe Solution
        doc.addPage();
        doc.setFont(font || "times", "normal");
        doc.setFontSize(16);
        doc.text('Nurikabe Solution', pageWidth / 2, 20, { align: 'center' });

        drawNurikabeGrid(doc, solution, gridOffsetX, gridOffsetY, cellSize, grid_size, true);

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    const drawNurikabeGrid = (
        doc: jsPDF,
        gridData: (number | string | null)[][],
        offsetX: number,
        offsetY: number,
        cellSize: number,
        gridSize: number,
        isSolution: boolean
    ) => {
        // Draw the grid lines
        doc.setLineWidth(0.5);
        doc.setDrawColor(0);
        for (let i = 0; i <= gridSize; i++) {
            // Vertical lines
            doc.line(offsetX + i * cellSize, offsetY, offsetX + i * cellSize, offsetY + gridSize * cellSize);
            // Horizontal lines
            doc.line(offsetX, offsetY + i * cellSize, offsetX + gridSize * cellSize, offsetY + i * cellSize);
        }

        // Draw the numbers and blocks
        doc.setFont(font || "times", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0); // Black for text

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const value = gridData[row][col];
                const x = offsetX + col * cellSize;
                const y = offsetY + row * cellSize;

                if (isSolution) {
                    if (value === '■') {
                        // Draw the gray blocks for the solution
                        doc.setFillColor(200, 200, 200); // Gray
                        doc.rect(x, y, cellSize, cellSize, 'F');
                    } else if (value === '□') {
                        // Draw the white blocks for the solution
                        doc.setFillColor(255, 255, 255); // White
                        doc.rect(x, y, cellSize, cellSize, 'F');
                    }
                } else {
                    // For the puzzle grid, we use white cells with the specified numbers
                    if (value !== null && value !== '■' && value !== '□') {
                        // Draw the numbers from the puzzle
                        doc.text(value.toString(), x + cellSize / 2, y + cellSize / 2 + 4, {
                            align: 'center',
                            baseline: 'middle'
                        });
                    }
                }

                // Draw the grid lines on top of the blocks
                doc.setDrawColor(0); // Black for grid lines
                doc.rect(x, y, cellSize, cellSize); // Draw cell border
            }
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={!size || isGenerating}
                color="secondary"
                onClick={handleGenerateNurikabe}
            >
                {isGenerating ? "Generating..." : "Generate Nurikabe PDF"}
            </Button>
        </div>
    );
}
