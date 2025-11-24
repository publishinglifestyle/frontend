"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import jsPDF from "jspdf";
import { generateHangman } from "@/managers/gamesManager";

interface HangmanProps {
  hangman_words?: string[];
  font?: string;
  is_sequential?: boolean;
  custom_name?: string;
  custom_solution_name?: string;
}

export default function Hangman({
  hangman_words,
  font,
  is_sequential,
  custom_name,
  custom_solution_name,
}: HangmanProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateHangman = async () => {
    setIsGenerating(true);
    const hangmanResponse = await generateHangman(hangman_words); // Assuming it returns an array of Hangman games

    if (hangmanResponse?.response) {
      const base64Image = await getBase64Image("./hangman.png"); // Use the uploaded hangman.png
      generatePDF(hangmanResponse.response, base64Image);
    }

    setIsGenerating(false);
  };

  // Convert the image to Base64 Data URL
  const getBase64Image = (imgUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imgUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
    });
  };

  const generatePDF = (hangmanGames: any[], base64Image: string) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const hangmanWidth = 60;
    const hangmanHeight = 80;
    const wordSpacing = 10;
    const alphabetY = 150;
    const winnerY = 180;

    hangmanGames.forEach((game, index) => {
      if (index > 0) {
        doc.addPage();
      }

      doc.setFont(font || "courier", "normal");
      doc.setFontSize(16);

      // Centered X position for the hangman image
      const centerX = (pageWidth - hangmanWidth) / 2;

      // Add the hangman image centered
      doc.addImage(
        base64Image,
        "PNG",
        centerX,
        margin,
        hangmanWidth,
        hangmanHeight
      );

      // Draw underscores for each letter in the word centered
      if (typeof game.word === "string") {
        const wordLength = game.word.length;
        const totalWordWidth = wordLength * wordSpacing;
        const startX = (pageWidth - totalWordWidth) / 2;
        const dashY = margin + hangmanHeight + 20;

        for (let i = 0; i < wordLength; i++) {
          const dashX = startX + i * wordSpacing;
          doc.text("_", dashX, dashY);
        }
      }

      // Add custom name or sequential number as title
      const titleText = is_sequential ? `Game ${index + 1}` : custom_name || "";
      doc.setFontSize(20);
      doc.text(titleText, pageWidth / 2, margin - 10, { align: "center" });

      // Draw alphabet section below the hangman image centered
      drawCenteredAlphabet(doc, pageWidth, alphabetY);

      // Draw the winner section centered
      drawCenteredWinnerSection(doc, pageWidth, winnerY);
    });

    // Add solutions page
    addSolutionsPage(doc, hangmanGames, custom_solution_name || "Solutions");

    const pdfDataUrl = doc.output("bloburl");
    window.open(pdfDataUrl, "_blank");
  };

  const drawCenteredAlphabet = (doc: jsPDF, pageWidth: number, y: number) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 12;
    const letterSpacing = 10;
    const lettersPerRow = 13;
    doc.setFontSize(fontSize);

    const totalRowWidth = lettersPerRow * letterSpacing;
    const startX1 = (pageWidth - totalRowWidth) / 2;
    const startX2 =
      (pageWidth - (alphabet.length - lettersPerRow) * letterSpacing) / 2;

    for (let i = 0; i < lettersPerRow; i++) {
      doc.text(alphabet[i], startX1 + i * letterSpacing, y);
    }

    for (let i = lettersPerRow; i < alphabet.length; i++) {
      doc.text(
        alphabet[i],
        startX2 + (i - lettersPerRow) * letterSpacing,
        y + fontSize
      );
    }
  };

  const drawCenteredWinnerSection = (
    doc: jsPDF,
    pageWidth: number,
    y: number
  ) => {
    doc.setFontSize(20);
    const text = "Winner:";
    const textWidth = doc.getTextWidth(text);
    const lineLength = 60;

    const startX = (pageWidth - lineLength) / 2;

    doc.text(text, (pageWidth - textWidth) / 2, y);
    doc.setLineWidth(0.5);
    doc.line(startX, y + 2, startX + lineLength, y + 2);
  };

  const addSolutionsPage = (
    doc: jsPDF,
    hangmanGames: any[],
    custom_solution_name: string
  ) => {
    doc.addPage();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const columnWidth = (pageWidth - 2 * margin) / 2; // Two columns per page
    const lineHeight = 10;
    const startY = margin + 30; // Start position after title
    let currentY = startY;
    let currentColumn = 0;

    doc.setFontSize(20);
    doc.text(custom_solution_name || "Solutions", pageWidth / 2, margin, {
      align: "center",
    });

    doc.setFontSize(12);

    hangmanGames.forEach((game, index) => {
      const solutionText = `${index + 1}. ${game.word.trim().toUpperCase()}`;

      // Check if adding the text exceeds page height
      if (currentY + lineHeight > pageHeight - margin) {
        if (currentColumn === 0) {
          // Move to the second column on the same page
          currentColumn++;
          currentY = startY;
        } else {
          // Add a new page and reset column and Y position
          doc.addPage();
          currentColumn = 0;
          currentY = startY;
          doc.setFontSize(20);
          doc.text(custom_solution_name || "Solutions", pageWidth / 2, margin, {
            align: "center",
          });
          doc.setFontSize(12);
        }
      }

      // Calculate X position based on current column
      const xPosition = margin + currentColumn * (columnWidth + margin);
      doc.text(solutionText, xPosition, currentY);

      // Increment Y position for next line
      currentY += lineHeight;
    });
  };

  // Validate all required fields
  const isFormValid = (): boolean => {
    // Check required fields
    if (!hangman_words || hangman_words.length === 0 || hangman_words.every((w) => !w || w.trim() === "")) {
      return false; // Words are required
    }

    // Check custom name if not sequential
    if (is_sequential === false && (!custom_name || custom_name.trim() === "")) {
      return false; // Custom name is required when not sequential
    }

    return true;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Button
        isDisabled={isGenerating || !isFormValid()}
        color="secondary"
        onPress={handleGenerateHangman}
      >
        {isGenerating ? "Generating..." : "Generate Hangman PDF"}
      </Button>
    </div>
  );
}
