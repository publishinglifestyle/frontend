"use client";

import { generateWordSearch } from "@/managers/gamesManager";
import { Button } from "@heroui/button";
// No jsPDF needed
import { useState } from "react";

// Interfaces remain the same...
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
  font?: string; // Font family name
  is_sequential?: boolean;
  num_puzzles?: number;
  solutions_per_page?: number; // How many solutions per image page
  invert_words?: number;
  custom_name?: string;
  custom_solution_name?: string;
  fontSize?: number; // Target font size for grid letters (pixels)
  grid_size?: number;
}

export default function WordSearch({
  words,
  font = "Helvetica",
  is_sequential,
  num_puzzles = 1,
  solutions_per_page = 4, // Default to 4 solutions per image page
  invert_words,
  custom_name,
  custom_solution_name,
  fontSize = 16, // Default grid font size in pixels
  grid_size = 25,
}: WordSearchProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // --- Canvas Drawing Configuration ---
  const imageWidth = 1200; // Pixels
  const imageRatio = 1.414; // A4-ish aspect ratio
  const imageHeight = Math.round(imageWidth * imageRatio);
  const margin = 60; // Pixels inside the canvas
  const titleFontSize = 32; // Pixels
  const listFontSize = 18; // Pixels
  const solutionTitleFontSize = 24; // Pixels for multi-solution page title
  const lineSpacing = 1.4;
  const solutionGridSpacing = 30; // Pixels between solution grids

  // Helper to download a Data URL
  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateImages = async () => {
    setIsGenerating(true);
    try {
      console.log(
        `Generating Images with Font: ${font}, GridFontSize: ${fontSize}, GridSize: ${grid_size}, SolutionsPerPage: ${solutions_per_page}`
      );
      const wordSearchResponses = await generateWordSearch(
        words,
        num_puzzles,
        invert_words,
        grid_size
      );

      if (!wordSearchResponses || wordSearchResponses.length === 0) {
        console.error("Failed to generate word search data or data is empty.");
        alert(
          "Could not generate the puzzle data. Please check the words input."
        );
        setIsGenerating(false);
        return;
      }

      // --- Generate Individual Puzzle Images ---
      for (let i = 0; i < wordSearchResponses.length; i++) {
        // Generate puzzle image (always one per file)
        await generateSinglePageImage(wordSearchResponses[i], i, false);
      }

      // --- Generate Composite Solution Images ---
      const effectiveSolsPerPage =
        solutions_per_page > 0
          ? solutions_per_page
          : wordSearchResponses.length; // Ensure positive
      const totalSolutionPages = Math.ceil(
        wordSearchResponses.length / effectiveSolsPerPage
      );

      for (let page = 0; page < totalSolutionPages; page++) {
        const startIndex = page * effectiveSolsPerPage;
        const endIndex = startIndex + effectiveSolsPerPage;
        const solutionChunk = wordSearchResponses.slice(startIndex, endIndex);

        // Generate one image containing solutions for this chunk
        await generateMultiSolutionImagePage(
          solutionChunk,
          page,
          startIndex,
          wordSearchResponses.length
        );
      }
    } catch (error: any) {
      console.error("Error generating word search images:", error);
      alert(`An error occurred while generating the images: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generates a single image for ONE puzzle (or ONE solution if num_puzzles=1)
  const generateSinglePageImage = async (
    wordSearchData: any,
    index: number,
    isSolution: boolean
  ): Promise<void> => {
    return new Promise((resolve) => {
      const { grid, words: solutionWords } = wordSearchData;
      if (!grid || grid.length === 0) {
        console.warn(
          `Skipping single image generation for invalid data at index ${index}`
        );
        resolve();
        return;
      }
      const actualGridSize = grid.length;
      const canvas = document.createElement("canvas");
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get 2D context");
        resolve();
        return;
      }

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const availableWidth = imageWidth - 2 * margin;
      const availableHeight = imageHeight - 2 * margin;

      // Title
      const titleText = isSolution
        ? is_sequential
          ? `Solution ${index + 1}`
          : custom_solution_name || `Word Search Solution ${index + 1}`
        : is_sequential
        ? `Puzzle ${index + 1}`
        : custom_name || `Word Search Puzzle ${index + 1}`;
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `bold ${titleFontSize}px "${font}", ${font}, Helvetica, Arial, sans-serif`;
      const titleY = margin;
      ctx.fillText(titleText, imageWidth / 2, titleY);
      let currentY = titleY + titleFontSize * lineSpacing;

      // Grid Size/Position
      const wordListEstimateHeight = isSolution ? 0 : 150;
      const maxGridHeightAllowed =
        availableHeight -
        (currentY - margin) -
        wordListEstimateHeight -
        (isSolution ? 0 : 20);
      let gridCellSizePx = Math.min(
        availableWidth / actualGridSize,
        maxGridHeightAllowed / actualGridSize
      );
      gridCellSizePx = Math.max(gridCellSizePx, 5);
      const gridWidthPx = actualGridSize * gridCellSizePx;
      const gridHeightPx = actualGridSize * gridCellSizePx;
      const gridOffsetX = margin + (availableWidth - gridWidthPx) / 2;
      const gridOffsetY = currentY + 20;

      // Draw Grid
      console.log(
        `Drawing ${isSolution ? "Solution" : "Puzzle"} ${
          index + 1
        } onto Single Canvas with: cellPx=${gridCellSizePx.toFixed(
          1
        )}, fontSize=${fontSize}, font=${font}`
      );
      drawWordSearchGridOnCanvas({
        ctx,
        grid,
        offsetX: gridOffsetX,
        offsetY: gridOffsetY,
        cellSizePx: gridCellSizePx,
        showWords: isSolution,
        words: solutionWords,
        fontSizePx: fontSize,
        fontFamily: font,
      });
      currentY = gridOffsetY + gridHeightPx;

      // Word List (Only on Puzzle Page)
      if (!isSolution) {
        currentY += 25;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = `${listFontSize}px "${font}", ${font}, Helvetica, Arial, sans-serif`;
        const wordsPerLine = 5;
        const columnSpacing = 30;
        const listColumnWidth = Math.floor(
          (availableWidth - (wordsPerLine - 1) * columnSpacing) / wordsPerLine
        );
        const wordListTotalWidth =
          wordsPerLine * listColumnWidth + (wordsPerLine - 1) * columnSpacing;
        const wordListStartX =
          margin + (availableWidth - wordListTotalWidth) / 2;
        const sortedWords = [...solutionWords].sort((a, b) =>
          a.clean.localeCompare(b.clean)
        );
        sortedWords.forEach((wordData, i) => {
          const colIndex = i % wordsPerLine;
          const rowIndex = Math.floor(i / wordsPerLine);
          const wordX =
            wordListStartX + colIndex * (listColumnWidth + columnSpacing);
          const wordY = currentY + rowIndex * (listFontSize * lineSpacing);
          if (wordY < imageHeight - margin) {
            ctx.fillText(
              wordData.clean.toUpperCase(),
              wordX,
              wordY,
              listColumnWidth
            );
          } else if (
            rowIndex === Math.floor(i / wordsPerLine) &&
            colIndex === 0
          ) {
            console.warn("Word list might exceed image height.");
          }
        });
      }

      // Convert and Download
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const filenameSuffix = isSolution
          ? `_solution_${index + 1}`
          : `_puzzle_${index + 1}`;
        const baseFilename = custom_name
          ? custom_name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
          : "wordsearch";
        const filename = `${baseFilename}${filenameSuffix}.png`;
        downloadDataUrl(dataUrl, filename);
        console.log(`Single image generated: ${filename}`);
      } catch (e: any) {
        console.error("Error converting single canvas or downloading:", e);
        alert(`Failed to save image ${index + 1}: ${e.message}`);
      } finally {
        resolve();
      }
    });
  };

  // ==================================================================
  // Generates a single image containing MULTIPLE solution grids
  // ==================================================================
  const generateMultiSolutionImagePage = async (
    solutionChunk: any[],
    pageIndex: number, // 0-based index of the solution page
    globalStartIndex: number, // 0-based index of the first solution on this page in the overall list
    totalPuzzles: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get 2D context for multi-solution page");
        resolve();
        return;
      }

      // Background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Available drawing area
      const availableWidth = imageWidth - 2 * margin;
      const availableHeight = imageHeight - 2 * margin;

      // --- Multi-Solution Page Title ---
      const startNum = globalStartIndex + 1;
      const endNum = Math.min(
        globalStartIndex + solutionChunk.length,
        totalPuzzles
      );
      const titleText = is_sequential
        ? `Solutions ${startNum} - ${endNum}`
        : custom_solution_name ||
          `Word Search Solutions (Page ${pageIndex + 1})`;
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `bold ${solutionTitleFontSize}px "${font}", ${font}, Helvetica, Arial, sans-serif`;
      const titleY = margin;
      ctx.fillText(titleText, imageWidth / 2, titleY);
      let currentContentY = titleY + solutionTitleFontSize * lineSpacing + 20;

      // --- Calculate Grid Layout ---
      const numGridsOnPage = solutionChunk.length;
      const gridsPerRow = Math.max(1, Math.floor(Math.sqrt(numGridsOnPage)));
      const gridsPerCol = Math.ceil(numGridsOnPage / gridsPerRow);
      const availableGridAreaHeight =
        availableHeight - (currentContentY - margin);
      const slotWidthPx = Math.floor(
        (availableWidth - (gridsPerRow - 1) * solutionGridSpacing) / gridsPerRow
      );
      const slotHeightPx = Math.floor(
        (availableGridAreaHeight - (gridsPerCol - 1) * solutionGridSpacing) /
          gridsPerCol
      );

      if (slotWidthPx <= 0 || slotHeightPx <= 0) {
        console.error(
          "Calculated slot dimensions are invalid for multi-solution layout."
        );
        resolve();
        return;
      }

      // --- Loop through solutions for THIS page and draw grids ---
      solutionChunk.forEach((wordSearch, chunkIndex) => {
        const { grid, words: solutionWords } = wordSearch;
        if (!grid || grid.length === 0) return; // Skip invalid data in chunk
        const actualGridSize = grid.length;

        // Calculate position of this grid's slot
        const rowIndex = Math.floor(chunkIndex / gridsPerRow);
        const colIndex = chunkIndex % gridsPerRow;
        const slotOffsetX =
          margin + colIndex * (slotWidthPx + solutionGridSpacing);
        const slotOffsetY =
          currentContentY + rowIndex * (slotHeightPx + solutionGridSpacing);

        // Calculate cell size and final grid size to fit the slot
        let gridCellSizePx = Math.min(
          slotWidthPx / actualGridSize,
          slotHeightPx / actualGridSize
        );
        gridCellSizePx = Math.max(gridCellSizePx, 2); // Min cell size for solutions
        const gridWidthPx = actualGridSize * gridCellSizePx;
        const gridHeightPx = actualGridSize * gridCellSizePx;

        // Center the grid within its slot
        const gridOffsetX = slotOffsetX + (slotWidthPx - gridWidthPx) / 2;
        const gridOffsetY = slotOffsetY + (slotHeightPx - gridHeightPx) / 2;

        // Calculate scaled font size for potentially smaller grids
        // Use a slightly different base size reference if needed, or fixed small size
        const solutionGridFontSize = Math.max(
          8,
          fontSize * (gridCellSizePx / 25)
        ); // Example scaling, adjust base (25px?) or make fixed

        console.log(
          `  Drawing solution ${
            globalStartIndex + chunkIndex + 1
          } onto multi-solution canvas: cellPx=${gridCellSizePx.toFixed(
            1
          )}, fontSize=${solutionGridFontSize.toFixed(1)}`
        );
        drawWordSearchGridOnCanvas({
          ctx, // <<< Pass the main canvas context
          grid,
          offsetX: gridOffsetX, // Position within the main canvas
          offsetY: gridOffsetY, // Position within the main canvas
          cellSizePx: gridCellSizePx,
          showWords: true,
          words: solutionWords,
          fontSizePx: solutionGridFontSize, // Scaled font size
          fontFamily: font,
        });
      }); // End loop through chunk

      // --- Convert and Download the composite image ---
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const baseFilename = custom_solution_name
          ? custom_solution_name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
          : "wordsearch_solutions";
        const filename = `${baseFilename}_page_${pageIndex + 1}.png`;
        downloadDataUrl(dataUrl, filename);
        console.log(`Multi-solution image generated: ${filename}`);
      } catch (e: any) {
        console.error(
          "Error converting multi-solution canvas or downloading:",
          e
        );
        alert(
          `Failed to save solution image page ${pageIndex + 1}: ${e.message}`
        );
      } finally {
        resolve();
      }
    }); // End Promise constructor
  }; // End generateMultiSolutionImagePage

  // ==================================================================
  // drawWordSearchGridOnCanvas (Helper Function - No changes needed from previous version)
  // ==================================================================
  const drawWordSearchGridOnCanvas = ({
    /* ... params ... */ ctx,
    grid,
    offsetX,
    offsetY,
    cellSizePx,
    showWords,
    words,
    fontSizePx,
    fontFamily,
  }: {
    ctx: CanvasRenderingContext2D;
    grid: Cell[][];
    offsetX: number;
    offsetY: number;
    cellSizePx: number;
    showWords: boolean;
    words?: Word[];
    fontSizePx: number;
    fontFamily: string;
  }) => {
    if (!grid || grid.length === 0) return;
    const gridSize = grid.length;
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${fontSizePx}px "${fontFamily}", ${fontFamily}, Helvetica, Arial, sans-serif`;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = grid[r]?.[c];
        const letter = cell?.letter;
        if (typeof letter === "string" && letter.trim() !== "") {
          const x = c * cellSizePx + cellSizePx / 2;
          const y = r * cellSizePx + cellSizePx / 2;
          ctx.fillText(letter.toUpperCase(), x, y);
        }
      }
    }
    if (showWords && words) {
      ctx.strokeStyle = "rgba(100, 100, 100, 0.9)";
      ctx.lineWidth = Math.max(1, Math.min(2, cellSizePx * 0.05));
      const highlightedCells = new Set<string>();
      words.forEach((word) => {
        if (word?.path) {
          word.path.forEach((coord) => {
            if (
              coord &&
              typeof coord.x === "number" &&
              coord.x >= 0 &&
              coord.x < gridSize &&
              typeof coord.y === "number" &&
              coord.y >= 0 &&
              coord.y < gridSize
            ) {
              const cellKey = `${coord.x},${coord.y}`;
              if (!highlightedCells.has(cellKey)) {
                highlightedCells.add(cellKey);
                const x = coord.x * cellSizePx;
                const y = coord.y * cellSizePx;
                ctx.strokeRect(
                  x + ctx.lineWidth / 2,
                  y + ctx.lineWidth / 2,
                  cellSizePx - ctx.lineWidth,
                  cellSizePx - ctx.lineWidth
                );
              }
            }
          });
        }
      });
    }
    ctx.restore();
  }; // End drawWordSearchGridOnCanvas

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <Button
        isDisabled={
          !words ||
          words.length === 0 ||
          words.every((w) => w.trim() === "") ||
          isGenerating
        }
        color="secondary"
        onPress={handleGenerateImages}
      >
        {isGenerating
          ? "Generating Images..."
          : "Generate Word Search Images (PNG)"}
      </Button>
    </div>
  );
}
