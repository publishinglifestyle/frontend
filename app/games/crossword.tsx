import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import { generateCrossword } from '@/managers/gamesManager';
import jsPDF from 'jspdf';

interface CrosswordProps {
    cross_words?: string[];
}

export default function Crossword({ cross_words }: CrosswordProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateCrossword = async () => {
        setIsGenerating(true);
        const crosswordResponse = await generateCrossword(cross_words);

        if (crosswordResponse) {
            generatePDF(crosswordResponse);
        }

        setIsGenerating(false);
    };

    const generatePDF = (crosswordLayout: any) => {
        const doc = new jsPDF('p', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10; // Set a margin for the page

        // Determine the maximum grid size based on available space
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = (pageHeight / 2) - margin * 2; // Adjust height to leave space for clues

        const rows = crosswordLayout.rows;
        const cols = crosswordLayout.cols;

        // Calculate the cell size to fit the grid within the available space
        const cellSize = Math.min(availableWidth / cols, availableHeight / rows);

        const offsetX = (pageWidth - availableWidth) / 2; // Center horizontally
        const offsetY = margin + 10; // Start position below title

        // Page 1: Draw the crossword game (unsolved puzzle)
        doc.setFont("times", "normal");
        doc.setFontSize(16);
        doc.text('Crossword Puzzle', pageWidth / 2, 10, { align: 'center' });

        crosswordLayout.outputJson.forEach((wordInfo: any) => {
            const startX = offsetX + (wordInfo.startx - 1) * cellSize;
            const startY = offsetY + (wordInfo.starty - 1) * cellSize;

            for (let i = 0; i < wordInfo.answer.length; i++) {
                const x = wordInfo.orientation === 'across' ? startX + i * cellSize : startX;
                const y = wordInfo.orientation === 'down' ? startY + i * cellSize : startY;

                // Draw the cell border only for the cells that are part of a word
                doc.rect(x, y, cellSize, cellSize);

                // Draw numbers for the starting cells of the words
                if (i === 0 && wordInfo.position !== undefined) {
                    doc.setFontSize(cellSize * 0.5);
                    doc.text(wordInfo.position.toString(), x + 2, y + cellSize * 0.3); // Top-left corner inside the cell
                    doc.setFontSize(cellSize * 1.5); // Reset for other text
                }
            }
        });

        // Adjust the width for clue columns
        const clueColumnWidth = (pageWidth - margin * 2) / 2 - 10;
        const leftColumnX = margin; // Left margin
        const rightColumnX = margin + clueColumnWidth + 20; // Positioned properly within page

        // Add clues below the grid
        let currentY = offsetY + availableHeight + 20;

        doc.setFontSize(12);
        doc.setFont("times", "italic");
        doc.text('Across', leftColumnX, currentY);
        doc.text('Down', rightColumnX, currentY);

        currentY += 10;

        const acrossClues = crosswordLayout.outputJson.filter((wordInfo: any) => wordInfo.orientation === 'across');
        const downClues = crosswordLayout.outputJson.filter((wordInfo: any) => wordInfo.orientation === 'down');

        let clueLineHeight = 7; // Line height for each clue
        let acrossY = currentY;
        let downY = currentY;

        acrossClues.forEach((wordInfo: any) => {
            const clueText = `${wordInfo.position}. ${wordInfo.clue}`;
            const splitText = doc.splitTextToSize(clueText, clueColumnWidth); // Wrap text to fit within column width
            doc.text(splitText, leftColumnX, acrossY);
            acrossY += splitText.length * clueLineHeight;
        });

        downClues.forEach((wordInfo: any) => {
            const clueText = `${wordInfo.position}. ${wordInfo.clue}`;
            const splitText = doc.splitTextToSize(clueText, clueColumnWidth); // Wrap text to fit within column width
            doc.text(splitText, rightColumnX, downY);
            downY += splitText.length * clueLineHeight;
        });

        // Page 2: Draw the crossword solution
        doc.addPage();

        doc.setFontSize(16);
        doc.text('Solutions', pageWidth / 2, 10, { align: 'center' });

        crosswordLayout.outputJson.forEach((wordInfo: any) => {
            const startX = offsetX + (wordInfo.startx - 1) * cellSize;
            const startY = offsetY + (wordInfo.starty - 1) * cellSize;

            for (let i = 0; i < wordInfo.answer.length; i++) {
                const x = wordInfo.orientation === 'across' ? startX + i * cellSize : startX;
                const y = wordInfo.orientation === 'down' ? startY + i * cellSize : startY;

                // Draw the cell border only for the cells that are part of a word
                doc.rect(x, y, cellSize, cellSize);

                // Draw the letters in the cells
                const letter = wordInfo.answer[i];
                doc.text(letter.toUpperCase(), x + cellSize / 2, y + cellSize / 2 + 3, {
                    align: 'center'
                });

                // Draw numbers for the starting cells of the words in the solution as well
                if (i === 0 && wordInfo.position !== undefined) {
                    doc.setFontSize(cellSize * 0.5);
                    doc.text(wordInfo.position.toString(), x + 2, y + cellSize * 0.3); // Top-left corner inside the cell
                    doc.setFontSize(cellSize * 1.5); // Reset for other text
                }
            }
        });

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={!cross_words || isGenerating}
                color="secondary"
                onClick={handleGenerateCrossword}
            >
                {isGenerating ? "Generating..." : "Generate PDF"}
            </Button>
        </div>
    );
}
