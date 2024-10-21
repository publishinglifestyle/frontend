/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import jsPDF from "jspdf";

import ErrorModal from "../modals/errorModal";

import { generateCrossword } from "@/managers/gamesManager"; // Import backend function

interface CrosswordProps {
  cross_words?: string[];
  clues?: string[];
  font?: string;
  custom_name?: string;
  custom_solution_name?: string;
  wordsPerPuzzle?: number;
  num_puzzles?: number;
  solutions_per_page?: number;
  is_sequential?: boolean;
}

export default function Crossword({
  cross_words,
  clues,
  font,
  custom_name,
  custom_solution_name,
  wordsPerPuzzle = 10,
  num_puzzles = 1,
  solutions_per_page = 1,
  is_sequential = true,
}: CrosswordProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);

  const handleGenerateCrossword = async () => {
    setIsGenerating(true);

    try {
      const crosswordResponse = await generateCrossword(
        cross_words,
        clues,
        wordsPerPuzzle,
        num_puzzles
      );

      console.log({ cross_words, clues, wordsPerPuzzle, num_puzzles });
      console.log(crosswordResponse);

      if (crosswordResponse) {
        generatePDF(crosswordResponse.response);
      }
    } catch (error: any) {
      console.error("Error generating crossword:", error.response?.data?.error);
      if (error) {
        setError(error.response?.data?.error || error.message);
        setErrorModalOpen(true);
      }
    }

    setIsGenerating(false);
  };

  const generatePDF = (crosswordData: any[]) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    crosswordData.forEach((crossword, index) => {
      const { rows, cols, table: grid, outputJson: placedWords } = crossword;

      if (
        !grid ||
        !placedWords ||
        !Array.isArray(grid) ||
        grid.length === 0 ||
        !Array.isArray(placedWords)
      ) {
        console.error(
          "Grid or placedWords are undefined or not in the expected format!"
        );

        return;
      }

      const cellSize = Math.min(
        (pageWidth - margin * 2) / cols,
        (pageHeight / 2 - margin * 2) / rows
      );

      const gridOffsetX = (pageWidth - cellSize * cols) / 2;
      const gridOffsetY = margin + 20;

      const numberFontSize = cellSize * 0.7;
      const letterFontSize = cellSize * 1.1;

      const drawGrid = (isSolution = false) => {
        for (const word of placedWords) {
          const { startx, starty, answer, orientation, position } = word;

          for (let i = 0; i < answer.length; i++) {
            const colIndex = orientation === "across" ? startx + i : startx;
            const rowIndex = orientation === "down" ? starty + i : starty;

            const x = gridOffsetX + colIndex * cellSize;
            const y = gridOffsetY + rowIndex * cellSize;

            doc.rect(x, y, cellSize, cellSize);

            const number = i === 0 ? position.toString() : ""; // Only add the number at the start of the word

            if (number) {
              doc.setFontSize(numberFontSize);
              doc.setFont(font || "times", "normal");
              doc.text(number, x + 2, y + 4);
            }

            if (isSolution) {
              doc.setFontSize(letterFontSize);
              doc.setFont(font || "times", "normal");
              doc.text(
                answer[i].toUpperCase(),
                x + cellSize / 4,
                y + cellSize * 0.75
              );
            }
          }
        }
      };

      if (index > 0) doc.addPage();

      const puzzleTitle = is_sequential
        ? `Puzzle ${index + 1}`
        : custom_name || `Crossword Puzzle ${index + 1}`;

      doc.setFont(font || "times", "normal");
      doc.setFontSize(20);
      doc.text(puzzleTitle, pageWidth / 2, margin + 10, { align: "center" });

      drawGrid(false);

      const maxColumns = 2;
      const clueColumnWidth = (pageWidth - 2 * margin) / maxColumns - 10;
      const leftColumnX = (pageWidth - (2 * clueColumnWidth + 10)) / 2;
      const rightColumnX = leftColumnX + clueColumnWidth + 10;
      let currentY = gridOffsetY + rows * cellSize + 20;

      doc.setFontSize(8);
      doc.setFont(font || "times", "italic");
      doc.text("Across", leftColumnX, currentY);
      doc.text("Down", rightColumnX, currentY);

      currentY += 10;

      const distributeClues = (
        clues: any[],
        xPosition: number,
        yPosition: number
      ) => {
        clues.forEach((wordInfo: any) => {
          const clueText = `${wordInfo.position}. ${wordInfo.clue}`;
          const splitText = doc.splitTextToSize(clueText, clueColumnWidth);

          if (yPosition + splitText.length * 6 > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }

          doc.text(splitText, xPosition, yPosition);
          yPosition += splitText.length * 6;
        });
      };

      distributeClues(
        placedWords.filter((word: any) => word.orientation === "across"),
        leftColumnX,
        currentY
      );
      distributeClues(
        placedWords.filter((word: any) => word.orientation === "down"),
        rightColumnX,
        currentY
      );

      // Page for solution
      if (num_puzzles === 1 || solutions_per_page === 1) {
        doc.addPage();
        doc.setFontSize(20);
        doc.text(`Solution ${index + 1}`, pageWidth / 2, margin + 10, {
          align: "center",
        });
        drawGrid(true);
      }
    });

    if (num_puzzles > 1) {
      const solutionsPages = Math.ceil(num_puzzles / solutions_per_page);

      for (let page = 0; page < solutionsPages; page++) {
        doc.addPage();
        doc.setFont(font || "times", "normal");
        doc.setFontSize(20);
        doc.text(
          custom_solution_name ||
            `Solutions ${page * solutions_per_page + 1} - ${Math.min(
              (page + 1) * solutions_per_page,
              num_puzzles
            )}`,
          pageWidth / 2,
          margin - 10,
          { align: "center" }
        );

        const solutionsToShow = crosswordData.slice(
          page * solutions_per_page,
          (page + 1) * solutions_per_page
        );

        const gridPerRow = 2;
        const gridsInRow = Math.min(gridPerRow, solutions_per_page);
        const gridWidth = (pageWidth - (gridsInRow + 1) * margin) / gridsInRow;
        const gridHeight = gridWidth;

        solutionsToShow.forEach((crossword, index) => {
          const {
            rows,
            cols,
            table: grid,
            outputJson: placedWords,
          } = crossword;
          const adjustedCellSize = Math.min(
            gridWidth / cols,
            gridHeight / rows
          );

          const columnIndex = index % gridsInRow;
          const rowIndex = Math.floor(index / gridsInRow);

          const offsetX = margin + columnIndex * (gridWidth + margin);
          const offsetY = margin + 20 + rowIndex * (gridHeight + 20);

          // Draw the solution grid for each crossword
          let wordIndex = 0;

          for (const word of placedWords) {
            const { startx, starty, answer, orientation } = word;

            for (let i = 0; i < answer.length; i++) {
              const colIndex = orientation === "across" ? startx + i : startx;
              const rowIndex = orientation === "down" ? starty + i : starty;

              const x = offsetX + colIndex * adjustedCellSize;
              const y = offsetY + rowIndex * adjustedCellSize;

              doc.rect(x, y, adjustedCellSize, adjustedCellSize);

              if (answer[i] !== "-" && answer[i] !== " ") {
                doc.setFontSize(5);
                doc.setFont(font || "times", "normal");

                doc.text(
                  answer[i].toUpperCase(),
                  x + adjustedCellSize / 4,
                  y + adjustedCellSize * 0.75
                );
              }
            }
            wordIndex += 1;
          }
        });
      }
    }

    const pdfDataUrl = doc.output("bloburl");

    window.open(pdfDataUrl, "_blank");
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Button
        color="secondary"
        isDisabled={!cross_words || cross_words.length === 0 || isGenerating}
        onClick={handleGenerateCrossword}
      >
        {isGenerating ? "Generating..." : "Generate Crossword PDF"}
      </Button>
      <ErrorModal
        isOpen={errorModalOpen}
        message={error || "An error occurred while generating the crossword."}
        onClose={() => setErrorModalOpen(false)}
      />
    </div>
  );
}
