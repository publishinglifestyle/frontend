"use client"

import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import jsPDF from 'jspdf';
import { generateMazeBase64 } from '@/managers/gamesManager'; // Assume this is the function you call to get the base64 maze

interface MazeProps {
    width?: number;
    height?: number;
    cellSize?: number;
    font?: string;
}

export default function Maze({ width, height, cellSize = 10, font }: MazeProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateMaze = async () => {
        setIsGenerating(true);
        const mazeBase64 = await generateMazeBase64(width, height, cellSize);

        if (mazeBase64) {
            generatePDF(mazeBase64);
        }

        setIsGenerating(false);
    };

    const generatePDF = (mazeBase64: string) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10; // Set a margin for the page

        const imgWidth = pageWidth - margin * 2; // Image width based on page width minus margins
        const imgHeight = imgWidth; // Keeping the image square

        // Center the image horizontally on the page
        const offsetX = (pageWidth - imgWidth) / 2;

        // Add maze image to PDF
        doc.setFont(font || "times", "normal");
        doc.setFontSize(16);
        doc.text('Maze Puzzle', pageWidth / 2, 10, { align: 'center' });

        doc.addImage(`data:image/png;base64,${mazeBase64}`, 'PNG', offsetX, 20, imgWidth, imgHeight);

        // Save the PDF or open in a new window
        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={isGenerating || !width || !height}
                color="secondary"
                onClick={handleGenerateMaze}
            >
                {isGenerating ? "Generating..." : "Generate PDF"}
            </Button>
        </div>
    );
}
