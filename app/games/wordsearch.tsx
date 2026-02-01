"use client";

import { generateWordSearch } from "@/managers/gamesManager";
import { Button } from "@heroui/button";
// No jsPDF needed
import { useState } from "react";
import { ensureFontLoaded, getFontFamily } from "./utils/fontLoader";

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
  fontSize = 30, // Default grid font size in pixels
  grid_size = 15, // Default grid size for word search
}: WordSearchProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // --- Canvas Drawing Configuration ---
  const imageWidth = 1200; // Pixels
  const imageRatio = 1.414; // A4-ish aspect ratio
  const imageHeight = Math.round(imageWidth * imageRatio);
  const margin = 60; // Pixels inside the canvas
  const titleFontSize = 32; // Pixels
  const solutionTitleFontSize = 24; // Pixels for multi-solution page title
  const lineSpacing = 1.4;
  const solutionGridSpacing = 30; // Pixels between solution grids

  // Calculate optimal grid size based on font size and number of words
  const calculateOptimalGridSize = (wordCount: number, fontSize: number): number => {
    // Base calculation: larger fonts need smaller grids
    // fontSize 30 → ~15, fontSize 20 → ~22, fontSize 40 → ~11
    let baseSize = Math.round(450 / fontSize);

    // Adjust based on word count per puzzle
    const wordsPerPuzzle = Math.ceil(wordCount / num_puzzles);

    // For fontSize 30:
    // - 5-10 words → grid size ~10-12
    // - 10-20 words → grid size ~12-15
    // - 20+ words → grid size ~15+
    const wordAdjustment = Math.floor(wordsPerPuzzle / 8);
    const adjustedSize = baseSize + wordAdjustment;

    // Clamp between reasonable bounds
    const minSize = Math.max(8, Math.round(240 / fontSize)); // Min size scales with font
    const maxSize = 25; // Maximum grid size

    return Math.min(maxSize, Math.max(minSize, adjustedSize));
  };

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
      // Ensure the font is loaded before drawing
      await ensureFontLoaded(font);

      // Calculate optimal grid size if not provided
      const wordCount = words?.length || 0;
      const effectiveGridSize = grid_size ?? calculateOptimalGridSize(wordCount, fontSize);

      console.log(
        `Generating Images with Font: ${font}, GridFontSize: ${fontSize}, GridSize: ${effectiveGridSize} ${grid_size ? '(manual)' : '(auto-calculated)'}, SolutionsPerPage: ${solutions_per_page}`
      );
      const wordSearchResponses = await generateWordSearch(
        words,
        num_puzzles,
        invert_words,
        effectiveGridSize
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
      ctx.font = `bold ${titleFontSize}px ${getFontFamily(font)}, Helvetica, Arial, sans-serif`;
      const titleY = margin;
      ctx.fillText(titleText, imageWidth / 2, titleY);
      let currentY = titleY + titleFontSize * lineSpacing;

      // Grid Size/Position
      const wordListEstimateHeight = isSolution ? 0 : fontSize * 8;
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
        ctx.font = `${fontSize}px ${getFontFamily(font)}, Helvetica, Arial, sans-serif`;
        const wordsPerLine = 3;

        // Distribute columns evenly across the grid width
        const columnWidth = gridWidthPx / wordsPerLine;

        // Align with the visual left edge of the first grid column
        // Grid letters are centered in cells, so we offset by half a cell minus half letter width
        const wordListStartX = gridOffsetX + gridCellSizePx / 2 - fontSize / 3;

        const sortedWords = [...solutionWords].sort((a, b) =>
          a.clean.localeCompare(b.clean)
        );
        sortedWords.forEach((wordData, i) => {
          const colIndex = i % wordsPerLine;
          const rowIndex = Math.floor(i / wordsPerLine);
          const wordX = wordListStartX + colIndex * columnWidth;
          const wordY = currentY + rowIndex * (fontSize * lineSpacing);
          if (wordY < imageHeight - margin) {
            ctx.fillText(
              wordData.clean.toUpperCase(),
              wordX,
              wordY
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
      ctx.font = `bold ${solutionTitleFontSize}px ${getFontFamily(font)}, Helvetica, Arial, sans-serif`;
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

        console.log(
          `  Drawing solution ${
            globalStartIndex + chunkIndex + 1
          } onto multi-solution canvas: cellPx=${gridCellSizePx.toFixed(
            1
          )}, fontSize=${fontSize}`
        );
        drawWordSearchGridOnCanvas({
          ctx, // <<< Pass the main canvas context
          grid,
          offsetX: gridOffsetX, // Position within the main canvas
          offsetY: gridOffsetY, // Position within the main canvas
          cellSizePx: gridCellSizePx,
          showWords: true,
          words: solutionWords,
          fontSizePx: fontSize, // Use same font size as puzzle
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

    // Draw highlights FIRST (before letters) if showing words
    if (showWords && words) {
      ctx.fillStyle = "rgba(200, 200, 200, 0.5)"; // Light gray

      words.forEach((word) => {
        if (word?.path && word.path.length > 0) {
          const path = word.path;

          // Get start and end positions
          const startCoord = path[0];
          const endCoord = path[path.length - 1];

          if (!startCoord || !endCoord) return;

          const startX = startCoord.x * cellSizePx + cellSizePx / 2;
          const startY = startCoord.y * cellSizePx + cellSizePx / 2;
          const endX = endCoord.x * cellSizePx + cellSizePx / 2;
          const endY = endCoord.y * cellSizePx + cellSizePx / 2;

          // Calculate the angle and length of the word
          const dx = endX - startX;
          const dy = endY - startY;
          const angle = Math.atan2(dy, dx);
          const length = Math.sqrt(dx * dx + dy * dy);

          // Draw a rounded capsule (pill shape) along the word
          ctx.save();
          ctx.translate(startX, startY);
          ctx.rotate(angle);

          // More precise sizing - extend to cover first and last letter fully
          const capsuleHeight = cellSizePx * 0.7; // Narrower height
          const radius = Math.min(capsuleHeight / 2, cellSizePx * 0.35); // Less rounded corners

          // Start half a cell before first letter center, end half a cell after last letter center
          const startOffset = -cellSizePx / 2;
          const endOffset = length + cellSizePx / 2;
          const capsuleLength = endOffset - startOffset;

          // Draw rounded capsule shape starting from startOffset
          ctx.beginPath();
          ctx.arc(startOffset + radius, 0, radius, Math.PI / 2, (3 * Math.PI) / 2);
          ctx.lineTo(endOffset - radius, -radius);
          ctx.arc(endOffset - radius, 0, radius, (3 * Math.PI) / 2, Math.PI / 2);
          ctx.lineTo(startOffset + radius, radius);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      });
    }

    // Draw letters on top of highlights
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${fontSizePx}px ${getFontFamily(fontFamily)}, Helvetica, Arial, sans-serif`;

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

    ctx.restore();
  }; // End drawWordSearchGridOnCanvas

  // Validate all required fields and grid size
  const isFormValid = (): boolean => {
    // Check required fields
    if (!words || words.length === 0 || words.every((w) => w.trim() === "")) {
      return false; // Words are required
    }

    if (!grid_size || grid_size <= 0) {
      return false; // Grid size is required
    }

    if (!fontSize || fontSize <= 0) {
      return false; // Font size is required
    }

    if (!num_puzzles || num_puzzles <= 0) {
      return false; // Number of puzzles is required
    }

    // Check custom name if not sequential
    if (is_sequential === false && (!custom_name || custom_name.trim() === "")) {
      return false; // Custom name is required when not sequential
    }

    // Validate grid size for word count
    const validWords = words.filter(w => w.trim() !== "");
    const totalLetters = validWords.reduce((sum, w) => sum + w.trim().length, 0);
    const longestWord = Math.max(...validWords.map(w => w.trim().length), 0);
    const wordsPerPuzzle = Math.ceil(validWords.length / num_puzzles);
    const avgWordLength = totalLetters / validWords.length;
    const totalLettersPerPuzzle = wordsPerPuzzle * avgWordLength;
    const gridCapacity = grid_size * grid_size;
    const utilizationRatio = totalLettersPerPuzzle / gridCapacity;

    // Check if grid is too small for longest word
    if (grid_size < longestWord) {
      return false;
    }

    // Check if utilization ratio exceeds threshold
    if (utilizationRatio > 0.65) {
      return false;
    }

    return true;
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <Button
        isDisabled={isGenerating || !isFormValid()}
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
