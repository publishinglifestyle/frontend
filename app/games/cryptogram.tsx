"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import jsPDF from "jspdf";
import { generateCryptogram } from "@/managers/gamesManager"; // Assuming you have this function

interface CryptogramProps {
  phrases?: string[];
  font?: string;
  custom_name?: string;
  custom_solution_name?: string;
}

export default function Cryptogram({
  phrases,
  font,
  custom_name,
  custom_solution_name,
}: CryptogramProps) {
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
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40; // Set a margin for the page
    const maxWidth = pageWidth - 2 * margin; // Maximum width for text
    const lineHeight = 10; // Height between lines
    const titleGap = 20; // Gap after the title
    let yPos = margin + titleGap; // Initial Y position

    // Function to add title
    const addTitle = (text: string) => {
      doc.setFont(font || "times", "normal");
      doc.setFontSize(20);
      doc.text(text, pageWidth / 2, margin, { align: "center" });
    };

    // First page: Cryptogram game
    addTitle(custom_name || "Cryptogram Puzzle");

    doc.setFont(font || "times", "normal");
    doc.setFontSize(12);

    cryptogramData.forEach((entry, index) => {
      const { cryptogram, partiallySolvedPhrase } = entry;

      // Check if there is enough space on the current page; if not, add a new page
      if (yPos + lineHeight * 2 + 20 > pageHeight - margin) {
        doc.addPage();
        yPos = margin; // Reset Y position after adding a new page
      }

      // Add the cryptogram text
      const cryptogramLines = doc.splitTextToSize(cryptogram, maxWidth);
      doc.text(cryptogramLines, margin, yPos);
      yPos += lineHeight * cryptogramLines.length;

      // Add the partially solved phrase below the cryptogram
      const puzzleLines = doc.splitTextToSize(partiallySolvedPhrase, maxWidth);
      doc.text(puzzleLines, margin, yPos);
      yPos += lineHeight * puzzleLines.length;

      // Add a separator line between entries
      doc.setDrawColor(150);
      doc.line(margin, yPos + 5, pageWidth - margin, yPos + 5);
      yPos += 15; // Adjust yPos for next entry
    });

    // Add a new page for the solution if the previous page is used up
    doc.addPage();
    yPos = margin + titleGap; // Reset Y position for the solutions page

    // Second page: Solutions
    addTitle(custom_solution_name || "Cryptogram Solution");

    doc.setFont(font || "times", "normal");
    doc.setFontSize(12);

    cryptogramData.forEach((entry, index) => {
      const { originalPhrase, cryptogram } = entry;

      // Check if there is enough space on the current page; if not, add a new page
      if (yPos + lineHeight * 2 + 20 > pageHeight - margin) {
        doc.addPage();
        yPos = margin; // Reset Y position after adding a new page
      }

      // Add the cryptogram text
      const cryptogramLines = doc.splitTextToSize(cryptogram, maxWidth);
      doc.text(cryptogramLines, margin, yPos);
      yPos += lineHeight * cryptogramLines.length;

      // Add the original phrase below the cryptogram
      const originalLines = doc.splitTextToSize(originalPhrase, maxWidth);
      doc.text(originalLines, margin, yPos);
      yPos += lineHeight * originalLines.length;

      // Add a separator line between entries
      doc.setDrawColor(150);
      doc.line(margin, yPos + 5, pageWidth - margin, yPos + 5);
      yPos += 15; // Adjust yPos for next entry
    });

    const pdfDataUrl = doc.output("bloburl");
    window.open(pdfDataUrl, "_blank");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Button
        isDisabled={!phrases || phrases[0] == "" || isGenerating}
        color="secondary"
        onPress={handleGenerateCryptogram}
      >
        {isGenerating ? "Generating..." : "Generate PDF"}
      </Button>
    </div>
  );
}
