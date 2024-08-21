"use client"

import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import jsPDF from 'jspdf';
import { generateCryptogram } from '@/managers/gamesManager'; // Assuming you have this function

interface CryptogramProps {
    phrases?: string[];
    font?: string;
}

export default function Cryptogram({ phrases, font }: CryptogramProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateCryptogram = async () => {
        setIsGenerating(true);
        const cryptogramResponse = await generateCryptogram(phrases || []);

        if (cryptogramResponse) {
            generatePDF(cryptogramResponse);
        }

        setIsGenerating(false);
    };

    const generatePDF = (cryptogramData: any[]) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20; // Set a margin for the page
        const maxWidth = pageWidth - 2 * margin; // Maximum width for text
        let yPos;

        // First page: Cryptogram game
        cryptogramData.forEach((entry, index) => {
            const { cryptogram, partiallySolvedPhrase } = entry;

            // Calculate the Y position based on index to space out the entries properly
            yPos = margin + index * 60;

            // Add the cryptogram in bold
            doc.setFont(font || "times", "bold");
            doc.setFontSize(18);
            const cryptogramLines = doc.splitTextToSize(cryptogram, maxWidth);
            doc.text(cryptogramLines, margin, yPos);

            // Add the partially solved phrase (puzzle format with clues) below the cryptogram in italic
            doc.setFont(font || "times", "italic");
            doc.setFontSize(16);
            const puzzleLines = doc.splitTextToSize(partiallySolvedPhrase, maxWidth);
            doc.text(puzzleLines, margin, yPos + 20);

            // Add a separator line between entries
            doc.setDrawColor(150);
            doc.line(margin, yPos + 30, pageWidth - margin, yPos + 30);
        });

        // Add a new page for the solution
        doc.addPage();

        // Second page: Solutions
        cryptogramData.forEach((entry, index) => {
            const { originalPhrase, cryptogram } = entry;

            // Calculate the Y position based on index to space out the entries properly
            yPos = margin + index * 60;

            // Add the cryptogram in bold
            doc.setFont(font || "times", "bold");
            doc.setFontSize(18);
            const cryptogramLines = doc.splitTextToSize(cryptogram, maxWidth);
            doc.text(cryptogramLines, margin, yPos);

            // Add the original phrase below the cryptogram in italic
            doc.setFont(font || "times", "italic");
            doc.setFontSize(16);
            const originalLines = doc.splitTextToSize(originalPhrase, maxWidth);
            doc.text(originalLines, margin, yPos + 20);

            // Add a separator line between entries
            doc.setDrawColor(150);
            doc.line(margin, yPos + 30, pageWidth - margin, yPos + 30);
        });

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={!phrases || phrases[0] == '' || isGenerating}
                color="secondary"
                onClick={handleGenerateCryptogram}
            >
                {isGenerating ? "Generating..." : "Generate PDF"}
            </Button>
        </div>
    );
}
