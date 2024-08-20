import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import jsPDF from 'jspdf';
import { generateHangman } from '@/managers/gamesManager';

interface HangmanProps {
    hangman_words?: string[];
}

export default function Hangman({ hangman_words }: HangmanProps) {
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const handleGenerateHangman = async () => {
        setIsGenerating(true);
        const hangmanResponse = await generateHangman(hangman_words); // Assuming it returns an array of Hangman games

        if (hangmanResponse?.response) {
            const base64Image = await getBase64Image('/hangman.png');
            generatePDF(hangmanResponse.response, base64Image);
        }

        setIsGenerating(false);
    };

    // Convert the image to Base64 Data URL
    const getBase64Image = (imgUrl: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = imgUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            };
            img.onerror = (error) => {
                reject(error);
            };
        });
    };

    const generatePDF = (hangmanGames: any[], base64Image: string) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const marginX = 10;
        const hangmanWidth = 30; // Width for the hangman structure
        const hangmanHeight = 40; // Height for the hangman structure
        const spacingX = 20; // Spacing between the hangman images and words
        const spacingY = 60; // Vertical spacing between rows
        const wordsPerRow = 2;

        // Page 1: Draw the Hangman Games
        doc.setFont("times", "normal");
        doc.setFontSize(16);
        doc.text('Hangman Games', pageWidth / 2, 20, { align: 'center' });

        let xPos = marginX; // X position for hangman images
        let yPos = 30; // Initial Y position

        hangmanGames.forEach((game, index) => {
            if (index > 0 && index % wordsPerRow === 0) { // Limit to wordsPerRow per row
                xPos = marginX;
                yPos += hangmanHeight + spacingY; // Move to the next row after wordsPerRow images
            }

            // Add the hangman image
            doc.addImage(base64Image, 'PNG', xPos, yPos, hangmanWidth, hangmanHeight);

            // Draw the dashes (matching the number of letters in the word)
            if (typeof game.word === 'string') {
                doc.setFontSize(14);
                const wordLength = game.word.length;
                const dashStartX = xPos + hangmanWidth + spacingX / 2;
                for (let i = 0; i < wordLength; i++) {
                    const dashX = dashStartX + (i * 8);
                    const dashY = yPos + hangmanHeight / 2 - 5; // Position for the dash

                    // Draw the dash
                    doc.text('_', dashX, dashY);
                }

                // Draw the boxes (always 6, aligned below the dashes)
                for (let i = 0; i < 6; i++) {
                    const boxX = dashStartX + (i * 8);
                    const boxY = yPos + hangmanHeight / 2;

                    // Draw the box under the dash
                    doc.setLineWidth(0.5); // Bold line for the box
                    doc.rect(boxX - 3, boxY + 2, 5, 10); // Rectangular box (10mm wide, 20mm tall)
                }
            } else {
                console.error(`Invalid word for game: ${game}`);
            }

            xPos += pageWidth / wordsPerRow - marginX; // Move X position for the next hangman
        });

        // Page 2: Draw the Hangman Solutions
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Hangman Solutions', pageWidth / 2, 20, { align: 'center' });

        let solutionYPos = 40;
        hangmanGames.forEach((game, index) => {
            if (game.word) {
                doc.text(`${index + 1}. ${game.word.toUpperCase()}`, marginX, solutionYPos);
                solutionYPos += 10;
            } else {
                console.error(`Invalid word for game: ${game}`);
            }
        });

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={!hangman_words || hangman_words[0] == '' || isGenerating}
                color="secondary"
                onClick={handleGenerateHangman}
            >
                {isGenerating ? "Generating..." : "Generate Hangman PDF"}
            </Button>
        </div>
    );
}
