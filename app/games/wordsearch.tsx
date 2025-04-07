"use client";

import { generateWordSearch } from "@/managers/gamesManager";
import { Button } from "@heroui/button";
// No longer need jsPDF: import jsPDF from "jspdf";
import { useState } from "react";

// Interfaces remain the same...
interface Word { clean: string; path: { x: number; y: number }[]; }
interface Cell { letter: string; should_be_empty: boolean; }
interface WordSearchProps {
  words?: string[];
  font?: string; // Font family name (e.g., 'Arial', 'Helvetica', 'Times New Roman')
  is_sequential?: boolean;
  num_puzzles?: number;
  // solutions_per_page is less relevant for image output, but we might use num_puzzles
  invert_words?: number;
  custom_name?: string;
  custom_solution_name?: string;
  fontSize?: number; // Target font size for grid letters (in pixels for canvas)
  grid_size?: number;
}

export default function WordSearch({
  words,
  font = "Helvetica", // Default font - ensure browser availability or use web fonts
  is_sequential,
  num_puzzles = 1,
  // solutions_per_page = 1, // Less relevant now
  invert_words,
  custom_name,
  custom_solution_name,
  fontSize = 16, // Default font size for grid letters (CANVAS pixels) - Adjusted for visibility
  grid_size = 25,
}: WordSearchProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // --- Canvas Drawing Configuration ---
  const imageWidth = 1200; // Target width for the output image in pixels
  const imageRatio = 1.414; // A4 aspect ratio (height/width)
  const imageHeight = Math.round(imageWidth * imageRatio);
  const margin = 60; // Margin in pixels inside the canvas
  const titleFontSize = 32; // Title font size in pixels
  const listFontSize = 18; // Word list font size in pixels
  const lineSpacing = 1.4; // Multiplier for line height based on font size

  // Helper to download a Data URL
  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleGenerateImages = async () => {
    setIsGenerating(true);
    try {
      console.log(`Generating Images with Font: ${font}, GridFontSize: ${fontSize}, GridSize: ${grid_size}`);
      const wordSearchResponses = await generateWordSearch(
        words, num_puzzles, invert_words, grid_size
      );

      if (wordSearchResponses && wordSearchResponses.length > 0) {
        // Generate images sequentially
        for (let i = 0; i < wordSearchResponses.length; i++) {
          await generatePageImage(wordSearchResponses[i], i, false); // Generate puzzle image
          await generatePageImage(wordSearchResponses[i], i, true);  // Generate solution image
        }
      } else {
        console.error("Failed to generate word search data or data is empty.");
        alert("Could not generate the puzzle data. Please check the words input.");
      }
    } catch (error) {
      console.error("Error generating word search images:", error);
      alert(`An error occurred while generating the images: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generates a single canvas image for one puzzle or solution page
  const generatePageImage = async (wordSearchData: any, index: number, isSolution: boolean): Promise<void> => {
    return new Promise((resolve) => {
      const { grid, words: solutionWords } = wordSearchData;
      if (!grid || grid.length === 0) {
        console.warn(`Skipping image generation for invalid data at index ${index}`);
        resolve(); // Resolve promise even if skipped
        return;
      }
      const actualGridSize = grid.length;

      // --- Setup Canvas ---
      const canvas = document.createElement("canvas");
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Failed to get 2D context");
        resolve(); // Resolve promise on error
        return;
      }

      // Background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Available drawing area
      const availableWidth = imageWidth - 2 * margin;
      const availableHeight = imageHeight - 2 * margin;

      // --- Draw Title ---
      const titleText = isSolution
        ? (is_sequential ? `Solution ${index + 1}` : custom_solution_name || `Word Search Solution ${index + 1}`)
        : (is_sequential ? `Puzzle ${index + 1}` : custom_name || `Word Search Puzzle ${index + 1}`);
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `bold ${titleFontSize}px "${font}", ${font}, Helvetica, Arial, sans-serif`;
      const titleY = margin;
      ctx.fillText(titleText, imageWidth / 2, titleY);
      let currentY = titleY + titleFontSize * lineSpacing; // Update Y position

      // --- Grid Size Calculation (similar logic, but for available pixel height) ---
      const wordListEstimateHeight = isSolution ? 0 : 150; // Estimate space needed for word list only on puzzle page
      const maxGridHeightAllowed = availableHeight - (currentY - margin) - wordListEstimateHeight - (isSolution ? 0 : 20); // Reserve space below title and for list (if applicable)
      let gridCellSizePx = Math.min(availableWidth / actualGridSize, maxGridHeightAllowed / actualGridSize);
      gridCellSizePx = Math.max(gridCellSizePx, 5); // Min cell size in pixels
      const gridWidthPx = actualGridSize * gridCellSizePx;
      const gridHeightPx = actualGridSize * gridCellSizePx; // Grid is square
      const gridOffsetX = margin + (availableWidth - gridWidthPx) / 2; // Center horizontally
      const gridOffsetY = currentY + 20; // Add some space below title

      // --- Draw Grid onto the Main Canvas ---
      console.log(`Drawing ${isSolution ? 'Solution' : 'Puzzle'} ${index + 1} Grid onto Canvas with: cellPx=${gridCellSizePx.toFixed(1)}, fontSize=${fontSize}, font=${font}`);
      drawWordSearchGridOnCanvas({ // Pass the main context and offsets
        ctx, // The main canvas context
        grid,
        offsetX: gridOffsetX, // Position within the main canvas
        offsetY: gridOffsetY, // Position within the main canvas
        cellSizePx: gridCellSizePx, // Cell size in pixels
        showWords: isSolution,
        words: solutionWords,
        fontSizePx: fontSize, // Grid font size in pixels
        fontFamily: font, // Font name
      });
      currentY = gridOffsetY + gridHeightPx; // Update Y position

      // --- Draw Word List (Only on Puzzle Page) ---
      if (!isSolution) {
        currentY += 25; // Space below grid
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = `${listFontSize}px "${font}", ${font}, Helvetica, Arial, sans-serif`;

        const wordsPerLine = 5; // Adjust for pixel layout
        const columnSpacing = 30; // Pixels between columns
        const listColumnWidth = Math.floor((availableWidth - (wordsPerLine - 1) * columnSpacing) / wordsPerLine);
        const wordListTotalWidth = wordsPerLine * listColumnWidth + (wordsPerLine - 1) * columnSpacing;
        const wordListStartX = margin + (availableWidth - wordListTotalWidth) / 2; // Center list block

        const sortedWords = [...solutionWords].sort((a, b) => a.clean.localeCompare(b.clean));

        sortedWords.forEach((wordData, i) => {
          const colIndex = i % wordsPerLine;
          const rowIndex = Math.floor(i / wordsPerLine);
          const wordX = wordListStartX + colIndex * (listColumnWidth + columnSpacing);
          const wordY = currentY + rowIndex * (listFontSize * lineSpacing);
          if (wordY < imageHeight - margin) { // Basic check to avoid drawing off bottom
            ctx.fillText(wordData.clean.toUpperCase(), wordX, wordY, listColumnWidth); // Use maxWidth
          } else if (rowIndex === Math.floor(i / wordsPerLine) && colIndex === 0) { // Only warn once per row overflow
            console.warn("Word list might exceed image height.");
          }
        });
      }

      // --- Convert and Download ---
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const filenameSuffix = isSolution ? `_solution_${index + 1}` : `_puzzle_${index + 1}`;
        const baseFilename = custom_name ? custom_name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'wordsearch';
        const filename = `${baseFilename}${filenameSuffix}.png`;
        downloadDataUrl(dataUrl, filename);
        console.log(`Image generated and download prompted: ${filename}`);
      } catch (e) {
        console.error("Error converting canvas to Data URL or downloading:", e);
        alert(`Failed to save image ${index + 1}: ${e.message}`);
      } finally {
        resolve(); // Resolve the promise after attempting download
      }
    }); // End Promise constructor
  }; // End generatePageImage


  // ==================================================================
  // Canvas Drawing Function for the Grid (Draws onto an EXISTING Context)
  // ==================================================================
  const drawWordSearchGridOnCanvas = ({
    ctx, grid, offsetX, offsetY, cellSizePx, showWords, words, fontSizePx, fontFamily,
  }: {
    ctx: CanvasRenderingContext2D; // Expects the context of the target canvas
    grid: Cell[][];
    offsetX: number; // X position to start drawing the grid within the target ctx
    offsetY: number; // Y position to start drawing the grid within the target ctx
    cellSizePx: number; // Cell size in pixels
    showWords: boolean;
    words?: Word[];
    fontSizePx: number; // Font size for grid letters in pixels
    fontFamily: string; // Font family name
  }) => {
    if (!grid || grid.length === 0) return;
    const gridSize = grid.length;

    // --- Settings for Grid Drawing on the Passed Context ---
    ctx.save(); // Save context state before drawing grid
    ctx.translate(offsetX, offsetY); // Move origin to where grid should start

    // Text settings
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${fontSizePx}px "${fontFamily}", ${fontFamily}, Helvetica, Arial, sans-serif`;

    // Draw letters
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = grid[r]?.[c];
        const letter = cell?.letter;
        if (typeof letter === "string" && letter.trim() !== "") {
          const x = c * cellSizePx + cellSizePx / 2; // Center X within cell (relative to grid origin)
          const y = r * cellSizePx + cellSizePx / 2; // Center Y within cell (relative to grid origin)
          ctx.fillText(letter.toUpperCase(), x, y);
        }
      }
    }

    // Draw highlights if showing solutions
    if (showWords && words) {
      ctx.strokeStyle = "rgba(100, 100, 100, 0.9)";
      // Calculate line width based on cell size, but ensure it's visible
      ctx.lineWidth = Math.max(1, Math.min(2, cellSizePx * 0.05)); // Example: 5% of cell size, min 1px, max 2px
      const highlightedCells = new Set<string>();

      words.forEach((word) => {
        if (word?.path) {
          word.path.forEach((coord) => {
            if (coord && typeof coord.x === 'number' && coord.x >= 0 && coord.x < gridSize && typeof coord.y === 'number' && coord.y >= 0 && coord.y < gridSize) {
              const cellKey = `${coord.x},${coord.y}`;
              if (!highlightedCells.has(cellKey)) {
                highlightedCells.add(cellKey);
                const x = coord.x * cellSizePx;
                const y = coord.y * cellSizePx;
                // Draw slightly inset rectangle stroke
                ctx.strokeRect(x + ctx.lineWidth / 2, y + ctx.lineWidth / 2, cellSizePx - ctx.lineWidth, cellSizePx - ctx.lineWidth);
              }
            }
          });
        }
      });
    }

    ctx.restore(); // Restore context state
  }; // End drawWordSearchGridOnCanvas

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <Button
        isDisabled={!words || words.length === 0 || words.every(w => w.trim() === "") || isGenerating}
        color="secondary"
        // --- Update Button Handler ---
        onPress={handleGenerateImages}
      >
        {/* Update Button Text */}
        {isGenerating ? "Generating Images..." : "Generate Word Search Images (PNG)"}
      </Button>
    </div>
  );
}