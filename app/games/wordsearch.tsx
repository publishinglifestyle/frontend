"use client";

import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import { generateWordSearch } from "@/managers/gamesManager";
import jsPDF from "jspdf";

interface Word {
  clean: string;
  path: { x: number; y: number }[];
}

interface Cell {
  letter: string;
  should_be_empty: boolean;
}

interface WordSearchProps {
  words?: string[];
  font?: string;
  is_sequential?: boolean;
  num_puzzles?: number;
  solutions_per_page?: number;
  invert_words?: number;
  custom_name?: string;
  custom_solution_name?: string;
  fontSize?: number;
}

export default function WordSearch({
  words,
  font,
  is_sequential,
  num_puzzles = 1,
  solutions_per_page = 1,
  invert_words,
  custom_name,
  custom_solution_name,
  fontSize = 8,
}: WordSearchProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const margin = 10;
  const baseCellSize = 6;

  const handleGenerateWordSearch = async () => {
    setIsGenerating(true);
    const wordSearchResponses = await generateWordSearch(
      words,
      num_puzzles,
      invert_words
    );

    if (wordSearchResponses) {
      generatePDF(wordSearchResponses); // Accessing response directly from the backend data structure
    }

    setIsGenerating(false);
  };

  const generatePDF = (wordSearchData: any[]) => {
    console.log(JSON.stringify(wordSearchData));
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    let fontSizeToUse = 8;

    wordSearchData.forEach((wordSearch, index) => {
      const { grid, words } = wordSearch;
      const gridSize = grid.length;
      const maxGridWidth = pageWidth - 2 * margin;
      const adjustedCellSize = Math.min(baseCellSize, maxGridWidth / gridSize); // Adjust cell size to fit within the margins
      const gridWidth = gridSize * adjustedCellSize;

      // Centering the grid on the page
      const offsetX = (pageWidth - gridWidth) / 2;
      const offsetY = margin + 20;

      // Determine titles based on the naming convention
      const puzzleTitle = is_sequential
        ? `Puzzle ${index + 1}`
        : custom_name || `Word Search Puzzle ${index + 1}`;
      const solutionTitle = is_sequential
        ? `Solution ${index + 1}`
        : custom_solution_name || `Word Search Solution ${index + 1}`;

      // Page for each Word Search Puzzle (puzzle view without highlighted words)
      if (index > 0) doc.addPage();
      doc.setFont(font || "times", "normal");
      doc.setFontSize(20);
      doc.text(puzzleTitle, pageWidth / 2, margin + 10, { align: "center" });

      fontSizeToUse =
        fontSize && !isNaN(fontSize) && fontSize > 0
          ? fontSize
          : 8 * (adjustedCellSize / baseCellSize);

      // Draw the puzzle grid
      drawWordSearchGrid({
        doc,
        grid,
        offsetX,
        offsetY,
        cellSize: adjustedCellSize,
        showWords: false,
        fontSize: fontSizeToUse,
      });

      // Draw the words to find below the grid, aligned to the left of the centered grid
      const wordsStartY = offsetY + gridSize * adjustedCellSize + 10;
      doc.setFontSize(10);

      const wordsX = offsetX; // Align words to the left of the centered grid
      const maxColumns = 3;
      const wordsPerColumn = Math.ceil(words.length / maxColumns);
      const columnWidth = (pageWidth - 2 * margin) / maxColumns;

      for (let i = 0; i < words.length; i++) {
        const column = Math.floor(i / wordsPerColumn);
        const row = i % wordsPerColumn;
        const x = wordsX + column * columnWidth;
        const y = wordsStartY + row * 5;

        doc.text(words[i].clean.toUpperCase(), x, y);
      }

      if (num_puzzles === 1 || solutions_per_page === 1) {
        // Single puzzle and solution per page
        doc.addPage();
        doc.setFontSize(20);
        doc.text(solutionTitle, pageWidth / 2, margin + 10, {
          align: "center",
        });

        // Draw the solution grid, highlighting the correct words
        drawWordSearchGrid({
          doc,
          grid,
          offsetX,
          offsetY,
          cellSize: adjustedCellSize,
          showWords: true,
          words,
          fontSize: fontSizeToUse,
        });
      }
    });

    if (num_puzzles > 1) {
      // If more than one puzzle, print solutions in a compact layout
      const solutionsPages = Math.ceil(num_puzzles / solutions_per_page);
      for (let page = 0; page < solutionsPages; page++) {
        doc.addPage();
        doc.setFont(font || "times", "normal");
        doc.setFontSize(16);
        doc.text(
          is_sequential
            ? `Solutions ${page * solutions_per_page + 1} - ${Math.min(
                (page + 1) * solutions_per_page,
                num_puzzles
              )}`
            : custom_solution_name || "Solutions",
          pageWidth / 2,
          margin + 10,
          { align: "center" }
        );

        const solutionsToShow = wordSearchData.slice(
          page * solutions_per_page,
          (page + 1) * solutions_per_page
        );
        const gridPerRow = 2; // 2 grids per row for layout
        const maxGridSize = (pageWidth - 3 * margin) / gridPerRow; // Adjust max grid size to fit within margins

        solutionsToShow.forEach((wordSearch, index) => {
          const gridSize = wordSearch.grid.length;
          const adjustedSolutionCellSize = Math.min(
            baseCellSize,
            maxGridSize / gridSize
          ); // Adjust cell size for solutions
          const offsetX =
            margin + (index % gridPerRow) * (maxGridSize + margin);
          //   const offsetY =
          //     margin + 20 + Math.floor(index / gridPerRow) * (gridSize + 20);
          const offsetY =
            margin +
            20 +
            Math.floor(index / gridPerRow) *
              (gridSize * adjustedSolutionCellSize + 20); // Added extra space between grids

          drawWordSearchGrid({
            doc,
            grid: wordSearch.grid,
            offsetX: offsetX,
            offsetY: offsetY,
            cellSize: adjustedSolutionCellSize,
            showWords: true,
            words: wordSearch.words,
            fontSize: fontSizeToUse,
          });
        });
      }
    }

    const pdfDataUrl = doc.output("bloburl");
    window.open(pdfDataUrl, "_blank");
  };

  const drawWordSearchGrid = ({
    doc,
    grid,
    offsetX,
    offsetY,
    cellSize,
    showWords,
    words,
    fontSize,
  }: {
    doc: jsPDF;
    grid: Cell[][];
    offsetX: number;
    offsetY: number;
    cellSize: number;
    showWords: boolean;
    fontSize: number;
    words?: Word[];
  }) => {
    const gridSize = grid.length;

    // Draw borders only for cells that contain solution words
    if (showWords && words) {
      const highlightedCells = new Set(); // To avoid drawing multiple times on the same cell

      words.forEach((word) => {
        word.path.forEach((coord) => {
          // Check if the coordinates are within bounds and the cell is not meant to be empty
          if (
            coord.x >= 0 &&
            coord.x < gridSize &&
            coord.y >= 0 &&
            coord.y < gridSize &&
            !grid[coord.y][coord.x].should_be_empty
          ) {
            const cellKey = `${coord.x},${coord.y}`;
            if (!highlightedCells.has(cellKey)) {
              highlightedCells.add(cellKey);

              const x = offsetX + coord.x * cellSize;
              const y = offsetY + coord.y * cellSize;
              doc.setDrawColor(0, 0, 0); // Standard border color
              doc.setLineWidth(0.5); // Standard border thickness
              doc.rect(x, y, cellSize, cellSize); // Draw border around each letter in the solution
            }
          } else {
            console.warn(
              `Coordinate out of bounds or should be empty: (${coord.x}, ${coord.y})`
            );
          }
        });
      });
    }

    // Draw the entire grid and letters
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = grid[r][c];
        const letter = cell.letter;

        if (typeof letter === "string" && letter.trim() !== "") {
          const x = offsetX + c * cellSize;
          const y = offsetY + r * cellSize + cellSize * 0.75; // Adjusted position to ensure correct alignment

          // Draw the letter inside the cell
          doc.setFont(font || "times", "bold");
          doc.setFontSize(fontSize); // Adjust font size based on cell size
          doc.text(letter, x + cellSize / 4, y);
        }
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Button
        isDisabled={!words || words[0] === "" || isGenerating}
        color="secondary"
        onClick={handleGenerateWordSearch}
      >
        {isGenerating ? "Generating..." : "Generate Word Search PDF"}
      </Button>
    </div>
  );
}
