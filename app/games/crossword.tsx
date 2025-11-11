/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
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
  crosswordGrids?: number;
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
  crosswordGrids = 10,
}: CrosswordProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);

  const handleGenerateCrossword = async () => {
    setIsGenerating(true);

    // Validate grid size before generation
    if (cross_words && cross_words.length > 0 && crosswordGrids > 0) {
      const totalLetters = cross_words.reduce((sum, w) => sum + w.length, 0);
      const maxRecommended = Math.ceil(Math.sqrt(totalLetters * 2.2));

      if (crosswordGrids > maxRecommended + 5) {
        setError(`Grid size ${crosswordGrids} is too large for ${cross_words.length} words. Maximum recommended: ${maxRecommended}. Please reduce the grid size to avoid a mostly empty grid.`);
        setErrorModalOpen(true);
        setIsGenerating(false);
        return;
      }
    }

    try {
      const crosswordResponse = await generateCrossword(
        cross_words,
        clues,
        wordsPerPuzzle,
        num_puzzles,
        crosswordGrids
      );

      if (crosswordResponse) {
        // Check if all puzzles have the expected number of words
        const response = crosswordResponse.response;
        if (Array.isArray(response) && cross_words && cross_words.length > 0) {
          const expectedWordsPerPuzzle = wordsPerPuzzle === 1 ? cross_words.length : wordsPerPuzzle;
          const missingWordsInfo: string[] = [];
          
          response.forEach((crossword, index) => {
            const placedWordsCount = crossword.outputJson?.length || 0;
            if (placedWordsCount < expectedWordsPerPuzzle) {
              const missingCount = expectedWordsPerPuzzle - placedWordsCount;
              missingWordsInfo.push(`Puzzle ${index + 1}: ${missingCount} word(s) could not be placed`);
            }
          });
          
          if (missingWordsInfo.length > 0) {
            const warningMessage = `Warning: Some words could not be placed in the crossword grid:\n${missingWordsInfo.join('\n')}\n\nConsider:\n- Using a larger grid size\n- Using shorter words\n- Reducing the number of words per puzzle`;
            console.warn(warningMessage);
            // Still generate the PDF but show a warning
          }
        }
        
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

      // PROPER CROSSWORD NUMBERING SYSTEM
      // Numbering is based on POSITIONS in the grid, not words
      // A position gets a number if it's the start of an ACROSS or DOWN word
      // Words sharing the same starting position share the same number

      // Step 1: Find all starting positions (cells where words begin)
      const startingPositions = new Map<string, {
        row: number;
        col: number;
        acrossWords: any[];
        downWords: any[];
      }>();

      placedWords.forEach((word: any) => {
        const { startx, starty, orientation, answer } = word;
        const key = `${starty}-${startx}`;

        if (!startingPositions.has(key)) {
          startingPositions.set(key, {
            row: starty,
            col: startx,
            acrossWords: [],
            downWords: []
          });
        }

        const position = startingPositions.get(key)!;
        if (orientation === "across") {
          position.acrossWords.push(word);
        } else {
          position.downWords.push(word);
        }
      });

      // Step 2: Sort positions top-to-bottom, left-to-right and assign sequential numbers
      const sortedPositions = Array.from(startingPositions.entries())
        .sort((a, b) => {
          const [, posA] = a;
          const [, posB] = b;
          if (posA.row !== posB.row) {
            return posA.row - posB.row;
          }
          return posA.col - posB.col;
        });

      // Step 3: Assign numbers to positions and update words
      const renumberedWords: any[] = [];
      sortedPositions.forEach(([key, position], idx) => {
        const clueNumber = idx + 1;

        // All words at this position get the same number
        position.acrossWords.forEach(word => {
          renumberedWords.push({
            ...word,
            position: clueNumber
          });
        });

        position.downWords.forEach(word => {
          renumberedWords.push({
            ...word,
            position: clueNumber
          });
        });
      });

      // Reserve space for title and ensure grid doesn't overlap
      const titleHeight = 30; // Space reserved for title
      const cluesHeight = 120; // Fixed space reserved for clues at bottom
      const gridSpacing = 10; // Additional spacing after title

      // Keep track of total words for font size adjustment
      const totalWords = renumberedWords.length;

      const availableGridHeight = pageHeight - titleHeight - cluesHeight - margin * 2;
      const availableGridWidth = pageWidth - margin * 2;

      const cellSize = Math.min(
        availableGridWidth / cols,
        availableGridHeight / rows
      );

      const gridOffsetX = (pageWidth - cellSize * cols) / 2;
      const gridOffsetY = titleHeight + gridSpacing + margin;

      const numberFontSize = Math.max(4, cellSize * 0.7);
      const letterFontSize = Math.max(6, cellSize * 1.1);

      const drawGrid = (isSolution = false, customCellSize?: number, customGridOffsetX?: number, customGridOffsetY?: number) => {
        const activeCellSize = customCellSize || cellSize;
        const activeGridOffsetX = customGridOffsetX !== undefined ? customGridOffsetX : gridOffsetX;
        const activeGridOffsetY = customGridOffsetY !== undefined ? customGridOffsetY : gridOffsetY;
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
          for (let colIndex = 0; colIndex < cols; colIndex++) {
            const x = activeGridOffsetX + colIndex * activeCellSize;
            const y = activeGridOffsetY + rowIndex * activeCellSize;

            // Check if the current cell is part of any word
            const wordInCell = renumberedWords.some((word: any) => {
              const { startx, starty, answer, orientation } = word;
              for (let i = 0; i < answer.length; i++) {
                const currentCol =
                  orientation === "across" ? startx + i : startx;
                const currentRow = orientation === "down" ? starty + i : starty;
                if (currentCol === colIndex && currentRow === rowIndex) {
                  return true;
                }
              }
              return false;
            });

            // Debugging: Log the cell and whether it contains a word
            console.log(
              `Cell (${rowIndex}, ${colIndex}): ${
                wordInCell ? "Contains word" : "Empty"
              }`
            );

            // Set fill color based on whether the cell is part of a word
            if (wordInCell) {
              doc.setFillColor(255, 255, 255); // White for cells with text
            } else {
              doc.setFillColor(200, 200, 200); // Gray for empty cells
            }

            doc.rect(x, y, activeCellSize, activeCellSize, "F"); // 'F' for filled rectangle
            doc.setDrawColor(0, 0, 0); // Black for border
            doc.rect(x, y, activeCellSize, activeCellSize); // Draw border
          }
        }

        for (const word of renumberedWords) {
          const { startx, starty, answer, orientation, position } = word;

          // Debugging: Log the word being placed
          console.log(
            `Placing word: ${answer}, Start: (${startx}, ${starty}), Orientation: ${orientation}`
          );

          for (let i = 0; i < answer.length; i++) {
            const colIndex = orientation === "across" ? startx + i : startx;
            const rowIndex = orientation === "down" ? starty + i : starty;

            const x = activeGridOffsetX + colIndex * activeCellSize;
            const y = activeGridOffsetY + rowIndex * activeCellSize;

            if (isSolution) {
              doc.setFontSize(Math.max(6, activeCellSize * 0.6));
              doc.setFont(font || "times", "normal");
              doc.text(
                answer[i].toUpperCase(),
                x + activeCellSize / 4,
                y + activeCellSize * 0.75
              );
            }
          }
        }

        // Handle number placement separately to avoid overlaps
        if (!isSolution) {
          // Group words by their starting cell to detect overlaps
          const cellNumbers: Record<string, { across?: number; down?: number }> = {};
          
          renumberedWords.forEach((word) => {
            const { startx, starty, orientation, position } = word;
            const cellKey = `${starty}-${startx}`;
            
            if (!cellNumbers[cellKey]) {
              cellNumbers[cellKey] = {};
            }
            
            if (orientation === "across") {
              cellNumbers[cellKey].across = position;
            } else {
              cellNumbers[cellKey].down = position;
            }
          });
          
          // Place numbers, positioning them side by side if there are overlaps
          Object.entries(cellNumbers).forEach(([cellKey, numbers]) => {
            const [rowStr, colStr] = cellKey.split('-');
            const rowIndex = parseInt(rowStr);
            const colIndex = parseInt(colStr);
            
            const x = activeGridOffsetX + colIndex * activeCellSize;
            const y = activeGridOffsetY + rowIndex * activeCellSize;

            doc.setFontSize(Math.max(4, activeCellSize * 0.4));
            doc.setFont(font || "times", "normal");
            
            const hasAcross = numbers.across !== undefined;
            const hasDown = numbers.down !== undefined;

            if (hasAcross && hasDown) {
              // Both words start at this position
              // Since they share the same starting position, they MUST have the same number
              // Just display the number once
              doc.text(numbers.across!.toString(), x + activeCellSize * 0.1, y + activeCellSize * 0.2);
            } else if (hasAcross) {
              // Only across number
              doc.text(numbers.across!.toString(), x + activeCellSize * 0.1, y + activeCellSize * 0.2);
            } else if (hasDown) {
              // Only down number
              doc.text(numbers.down!.toString(), x + activeCellSize * 0.1, y + activeCellSize * 0.2);
            }
          });
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

      // Reduce spacing when there are many words
      const headerSpacing = totalWords > 30 ? 8 : 15;
      let currentY = gridOffsetY + rows * cellSize + headerSpacing;

      const headerFontSize = totalWords > 30 ? 7 : 8;
      doc.setFontSize(headerFontSize);
      doc.setFont(font || "times", "italic");
      doc.text("Across", leftColumnX, currentY);
      doc.text("Down", rightColumnX, currentY);

      currentY += totalWords > 30 ? 6 : 10;

      const distributeClues = (
        clues: any[],
        xPosition: number,
        yPosition: number
      ) => {
        // Use smaller font size for better fit when there are many clues
        const clueFontSize = totalWords > 30 ? 7 : (totalWords > 20 ? 8 : 9);
        doc.setFontSize(clueFontSize);
        doc.setFont(font || "times", "italic");

        clues.forEach((wordInfo: any) => {
          const clueText = `${wordInfo.position}. ${wordInfo.clue}`;
          const splitText = doc.splitTextToSize(clueText, clueColumnWidth);

          // Use compact line spacing for better fit
          const lineSpacing = totalWords > 30 ? 3.5 : 4;

          doc.text(splitText, xPosition, yPosition);
          yPosition += splitText.length * lineSpacing;
        });

        return yPosition; // Return the updated Y position
      };

      const acrossWords = renumberedWords.filter((word: any) => word.orientation === "across");
      const downWords = renumberedWords.filter((word: any) => word.orientation === "down");
      
      const finalAcrossY = distributeClues(acrossWords, leftColumnX, currentY);
      const finalDownY = distributeClues(downWords, rightColumnX, currentY);
      
      // Check if this puzzle is missing words and add a note
      const expectedWordsCount = wordsPerPuzzle === 1 ? (cross_words?.length || 0) : wordsPerPuzzle;
      const actualWordsCount = renumberedWords.length;
      
      if (actualWordsCount < expectedWordsCount) {
        const missingCount = expectedWordsCount - actualWordsCount;
        const noteY = Math.max(finalAcrossY, finalDownY) + 15;
        
        if (noteY < pageHeight - margin - 20) {
          doc.setFontSize(8);
          doc.setFont(font || "times", "italic");
          doc.text(
            `Note: ${missingCount} word(s) could not be placed in this crossword grid.`,
            pageWidth / 2,
            noteY,
            { align: "center" }
          );
        }
      }

      // Page for solution
      if (num_puzzles === 1 || solutions_per_page === 1) {
        doc.addPage();
        doc.setFontSize(20);
        doc.text(`Solution ${index + 1}`, pageWidth / 2, margin + 10, {
          align: "center",
        });
        
        // Recalculate grid positioning for solution page (more space available without clues)
        const solutionAvailableHeight = pageHeight - titleHeight - margin * 2;
        const solutionCellSize = Math.min(
          availableGridWidth / cols,
          solutionAvailableHeight / rows
        );
        
        // Update for solution drawing
        const solutionGridOffsetX = (pageWidth - solutionCellSize * cols) / 2;
        const solutionGridOffsetY = titleHeight + gridSpacing + margin;
        
        drawGrid(true, solutionCellSize, solutionGridOffsetX, solutionGridOffsetY);
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

          // Use the same proper numbering system for solutions
          const startingPositions = new Map<string, {
            row: number;
            col: number;
            acrossWords: any[];
            downWords: any[];
          }>();

          placedWords.forEach((word: any) => {
            const { startx, starty, orientation } = word;
            const key = `${starty}-${startx}`;

            if (!startingPositions.has(key)) {
              startingPositions.set(key, {
                row: starty,
                col: startx,
                acrossWords: [],
                downWords: []
              });
            }

            const position = startingPositions.get(key)!;
            if (orientation === "across") {
              position.acrossWords.push(word);
            } else {
              position.downWords.push(word);
            }
          });

          const sortedPositions = Array.from(startingPositions.entries())
            .sort((a, b) => {
              const [, posA] = a;
              const [, posB] = b;
              if (posA.row !== posB.row) {
                return posA.row - posB.row;
              }
              return posA.col - posB.col;
            });

          const renumberedWords: any[] = [];
          sortedPositions.forEach(([key, position], idx) => {
            const clueNumber = idx + 1;

            position.acrossWords.forEach(word => {
              renumberedWords.push({
                ...word,
                position: clueNumber
              });
            });

            position.downWords.forEach(word => {
              renumberedWords.push({
                ...word,
                position: clueNumber
              });
            });
          });

          const adjustedCellSize = Math.min(
            gridWidth / cols,
            gridHeight / rows
          );

          const columnIndex = index % gridsInRow;
          const rowIndex = Math.floor(index / gridsInRow);

          const offsetX = margin + columnIndex * (gridWidth + margin);
          const offsetY = margin + 20 + rowIndex * (gridHeight + 20);

          // Build a quick lookup map for letters in the grid
          const letterMap: Record<string, string> = {};
          renumberedWords.forEach(({ startx, starty, answer, orientation }) => {
            for (let i = 0; i < answer.length; i++) {
              const col = orientation === "across" ? startx + i : startx;
              const row = orientation === "down" ? starty + i : starty;
              letterMap[`${row}-${col}`] = answer[i];
            }
          });

          // Draw every cell so that the solution grid mirrors the puzzle grid
          for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
            for (let colIdx = 0; colIdx < cols; colIdx++) {
              const x = offsetX + colIdx * adjustedCellSize;
              const y = offsetY + rowIdx * adjustedCellSize;

              const key = `${rowIdx}-${colIdx}`;
              const letter = letterMap[key];
              const isWordCell = Boolean(letter && letter !== "-" && letter !== " ");

              // Shade cells: white for letters, grey for blanks
              if (isWordCell) {
                doc.setFillColor(255, 255, 255);
              } else {
                doc.setFillColor(200, 200, 200);
              }

              // Filled rectangle then border
              doc.rect(x, y, adjustedCellSize, adjustedCellSize, "F");
              doc.setDrawColor(0, 0, 0);
              doc.rect(x, y, adjustedCellSize, adjustedCellSize);

              // Write the letter if this is part of a word
              if (isWordCell) {
                doc.setFontSize(Math.max(6, adjustedCellSize * 0.6));
                doc.setFont(font || "times", "normal");
                doc.text(
                  letter.toUpperCase(),
                  x + adjustedCellSize / 4,
                  y + adjustedCellSize * 0.75
                );
              }
            }
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
        onPress={handleGenerateCrossword}
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
