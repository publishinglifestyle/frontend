"use client"

import React, { useState } from "react";
import { Button } from '@nextui-org/button';
import { scrambleWords } from '@/managers/gamesManager';
import jsPDF from 'jspdf';

interface ScrambleWordsProps {
    words?: string[];
    font?: string;
}

interface ScrambledWord {
    scrambledWord: string;
    originalWord: string;
}

export default function ScrambleWords({ words, font }: ScrambleWordsProps) {
    const [scrambledWords, setScrambledWords] = useState<ScrambledWord[] | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const cleanWords = (words: string[]) => {
        return words.map(word => word.trim().replace(/['"]+/g, ''));
    };

    const handleGenerateScrambledWords = async () => {
        setIsGenerating(true);
        const cleanedWords = cleanWords(words || []);
        const scrambledWordsResponse = await scrambleWords(cleanedWords);
        setScrambledWords(scrambledWordsResponse);

        if (scrambledWordsResponse) {
            generatePDF(scrambledWordsResponse);
            setIsGenerating(false);
        }
    };

    const addContentToPDF = (doc: jsPDF, content: ScrambledWord[], startY: number, isSolution: boolean = false) => {
        const margin = 40; // Set margin to 40mm
        const columnWidth = 25;
        const equalSignWidth = 12;
        const blankLineWidth = 40;
        const lineHeight = 10;
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxLinesPerColumn = Math.floor((pageHeight - startY - margin) / lineHeight);

        let x = margin;
        let y = startY;
        let columnCount = 0;

        content.forEach((wordInfo, index) => {
            const scrambledWord = wordInfo.scrambledWord;
            const originalWord = wordInfo.originalWord;

            const wordX = x;
            const equalX = wordX + columnWidth;
            const blankX = equalX + equalSignWidth;

            doc.text(scrambledWord, wordX, y);
            doc.text('=', equalX, y);

            if (isSolution) {
                doc.text(originalWord, blankX, y);
            } else {
                doc.setFont(font || "courier", "normal");
                doc.text('_ _ _ _ _ _ _ _', blankX, y);
                doc.setFont(font || "times", "italic");
            }

            y += lineHeight;

            if ((index + 1) % maxLinesPerColumn === 0) {
                columnCount += 1;
                if (columnCount < 2) {
                    x += columnWidth + equalSignWidth + blankLineWidth + margin;
                    y = startY;
                } else if (index + 1 < content.length) {
                    doc.addPage();
                    x = margin;
                    y = startY;
                    columnCount = 0;
                }
            }
        });

        return y;
    };

    const generatePDF = (scrambledWords: ScrambledWord[]) => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const margin = 40; // Set margin to 40mm
        doc.setFont(font || "times", "italic");
        doc.setFontSize(14);

        doc.setFont(font || "times", "normal");
        doc.setFontSize(16);
        doc.text('Scrambled Words Game', 105, margin - 20, { align: 'center' });
        doc.setFont(font || "times", "italic");
        doc.setFontSize(14);

        const startY = margin;

        const gameContent = scrambledWords.map(wordInfo => ({
            scrambledWord: wordInfo.scrambledWord,
            originalWord: wordInfo.originalWord
        }));

        addContentToPDF(doc, gameContent, startY);

        doc.addPage();
        doc.setFont(font || "times", "normal");
        doc.setFontSize(16);
        doc.text('Scrambled Words Solutions', 105, margin - 20, { align: 'center' });
        doc.setFont(font || "times", "italic");
        doc.setFontSize(14);

        addContentToPDF(doc, gameContent, startY, true);

        const pdfDataUrl = doc.output('bloburl');
        window.open(pdfDataUrl, '_blank');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Button
                isDisabled={!words || words[0] == '' || isGenerating}
                color="secondary"
                onClick={handleGenerateScrambledWords}
            >
                {isGenerating ? "Generating..." : "Generate PDF"}
            </Button>
        </div>
    );
}
