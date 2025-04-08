import React, { useState, useCallback } from "react";
import { Button } from "@heroui/button"; // Assuming this Button component exists
import { generateMinesweeper } from "@/managers/gamesManager"; // Assuming this fetches Minesweeper data

// Assuming bombSymbol is correctly imported or defined.
// If it's a local path, ensure your build process handles it (e.g., copies it to the output directory or uses a data URL).
// For simplicity, using a placeholder path. Replace with your actual path or URL.
const bombSymbol = "./bomb.png"; // Path to your bomb image

// --- Helper function to download canvas content (same as before) ---
const downloadCanvasAsImage = (canvas: HTMLCanvasElement, filename: string) => {
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link);
};

// --- Helper function to preload an image ---
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(`Failed to load image: ${src} - ${err}`);
    img.src = src;
  });
};

// --- MineFinderProps Interface (Unchanged) ---
interface MineFinderProps {
  width?: number;
  height?: number;
  mines?: number;
  font?: string; // e.g., 'Arial', 'Times New Roman'
  num_puzzles?: number;
  solutions_per_page?: number; // Affects grouping for download
  custom_name?: string;
  custom_solution_name?: string;
}

// --- Default Font ---
const DEFAULT_FONT = "Arial";

export default function MineFinder({
  width = 10,
  height = 10,
  mines,
  font = DEFAULT_FONT,
  num_puzzles = 1,
  solutions_per_page = 2, // Default to 2 solutions per image page
  custom_name,
  custom_solution_name,
}: MineFinderProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Canvas Drawing Function ---
  const drawMinefieldGridOnCanvas = (
    ctx: CanvasRenderingContext2D,
    gridData: {
      x: number;
      y: number;
      isMine: boolean;
      mines: number;
      isGray: boolean;
    }[][], // Assuming gridData is Array<Array<Cell>>
    offsetX: number,
    offsetY: number,
    cellSize: number,
    showBombs: boolean,
    bombImageElement: HTMLImageElement | null, // Pass the loaded image element
    gridFont: string,
    gridFontSize: number,
    title?: string,
    titleFontSize?: number
  ) => {
    const canvas = ctx.canvas;
    const gridTotalWidth = width * cellSize; // Use component props width/height
    const gridTotalHeight = height * cellSize;

    // --- Draw Title (Optional) ---
    if (title && titleFontSize) {
      ctx.font = `bold ${titleFontSize}px ${gridFont}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#000000";
      ctx.fillText(title, offsetX + gridTotalWidth / 2, offsetY - 15); // Margin above grid
    }

    // --- Draw Grid Backgrounds and Content ---
    const numberFontSizeActual = cellSize * 0.6; // Font size relative to cell
    const bombImgSize = cellSize * 0.8; // Bomb image slightly smaller than cell

    ctx.font = `${numberFontSizeActual}px ${gridFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // Center text vertically

    gridData.forEach((row) => {
      row.forEach((cell) => {
        const cellX = offsetX + cell.x * cellSize;
        const cellY = offsetY + cell.y * cellSize;

        // Draw cell background
        ctx.fillStyle = cell.isGray ? "#CCCCCC" : "#FFFFFF"; // Light gray or white
        ctx.fillRect(cellX, cellY, cellSize, cellSize);

        // Draw cell content (bomb or number)
        if (showBombs && cell.isMine && bombImageElement) {
          const imgX = cellX + (cellSize - bombImgSize) / 2;
          const imgY = cellY + (cellSize - bombImgSize) / 2;
          try {
            ctx.drawImage(
              bombImageElement,
              imgX,
              imgY,
              bombImgSize,
              bombImgSize
            );
          } catch (e) {
            console.error("Error drawing bomb image:", e);
            // Fallback: draw a simple placeholder if image fails
            ctx.fillStyle = "red";
            ctx.fillRect(imgX, imgY, bombImgSize, bombImgSize);
          }
        } else if (!cell.isMine && cell.mines > 0) {
          // Set color based on number (optional, common in Minesweeper)
          const colors: { [key: number]: string } = {
            1: "#0000FF", // Blue
            2: "#008000", // Green
            3: "#FF0000", // Red
            4: "#000080", // Navy
            5: "#800000", // Maroon
            6: "#008080", // Teal
            7: "#000000", // Black
            8: "#808080", // Gray
          };
          ctx.fillStyle = colors[cell.mines] || "#000000"; // Default to black
          const textX = cellX + cellSize / 2;
          const textY = cellY + cellSize / 2;
          ctx.fillText(cell.mines.toString(), textX, textY);
        }
      });
    });

    // --- Draw Grid Lines (on top of backgrounds/content) ---
    ctx.strokeStyle = "#808080"; // Gray lines, common for Minesweeper
    ctx.lineWidth = 0.5; // Thin lines

    for (let i = 0; i <= height; i++) {
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + i * cellSize);
      ctx.lineTo(offsetX + gridTotalWidth, offsetY + i * cellSize);
      ctx.stroke();
    }
    for (let j = 0; j <= width; j++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(offsetX + j * cellSize, offsetY);
      ctx.lineTo(offsetX + j * cellSize, offsetY + gridTotalHeight);
      ctx.stroke();
    }

    // Optional: Add thicker outer border
    ctx.strokeStyle = "#404040"; // Darker gray border
    ctx.lineWidth = 1.5;
    ctx.strokeRect(offsetX, offsetY, gridTotalWidth, gridTotalHeight);
  };

  // --- Main Generation and Drawing Logic ---
  const handleGenerateMineFinder = useCallback(async () => {
    if (!width || !height || !mines) {
      setErrorMsg("Please ensure Width, Height, and Mines are set.");
      return;
    }
    setErrorMsg(null);
    setIsGenerating(true);

    let bombImageElement: HTMLImageElement | null = null;
    try {
      // --- Preload Bomb Image ---
      bombImageElement = await loadImage(bombSymbol);

      // --- Generate Minesweeper Data ---
      const mineFieldResponses = await generateMinesweeper(
        width,
        height,
        mines,
        num_puzzles
      );

      // --- Validate Response ---
      if (
        !mineFieldResponses?.response ||
        mineFieldResponses.response.length === 0
      ) {
        throw new Error("No minefield data received from the generator.");
      }
      const minefields = mineFieldResponses.response;

      // --- Canvas Setup ---
      const canvas = document.createElement("canvas"); // Create dynamically
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // --- Drawing Constants ---
      const A4_WIDTH_PX = 794; // Approx A4 width at 96 DPI
      const MARGIN = 40;
      const TITLE_FONT_SIZE = 24;
      const SMALL_TITLE_FONT_SIZE = 14;

      // --- Generate Puzzle Images ---
      for (let index = 0; index < minefields.length; index++) {
        const minefieldData = minefields[index];
        // Ensure data structure is correct (array of rows of cells)
        if (
          !Array.isArray(minefieldData.puzzle) ||
          !Array.isArray(minefieldData.puzzle[0])
        ) {
          console.warn(
            `Skipping puzzle ${index + 1} due to unexpected data structure.`
          );
          continue;
        }

        const puzzleTitle = custom_name
          ? `${custom_name} ${index + 1}`
          : `Minesweeper Puzzle ${index + 1}`;

        // Calculate optimal cell size for single puzzle
        const availableWidth = A4_WIDTH_PX - 2 * MARGIN;
        // Estimate height needed: margin + title + grid + margin
        const estGridHeight = (availableWidth / width) * height; // Maintain aspect ratio
        const totalHeight =
          MARGIN + TITLE_FONT_SIZE + 20 + estGridHeight + MARGIN;

        canvas.width = A4_WIDTH_PX;
        canvas.height = totalHeight;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear canvas

        const cellSize = availableWidth / width; // Cell size based on width
        const gridOffsetX = MARGIN;
        const gridOffsetY = MARGIN + TITLE_FONT_SIZE + 20; // Below title

        drawMinefieldGridOnCanvas(
          ctx,
          minefieldData.puzzle, // Pass puzzle data
          gridOffsetX,
          gridOffsetY,
          cellSize,
          false, // showBombs = false for puzzle
          bombImageElement,
          font,
          TITLE_FONT_SIZE, // Pass font size for numbers inside grid func
          puzzleTitle,
          TITLE_FONT_SIZE // Pass title font size
        );

        // Download this puzzle image
        const puzzleFilename = `${puzzleTitle.replace(/\s+/g, "_")}.png`;
        downloadCanvasAsImage(canvas, puzzleFilename);
        await new Promise((resolve) => setTimeout(resolve, 100)); // Optional delay
      }

      // --- Generate Solution Images ---
      if (num_puzzles === 1) {
        // Single puzzle, single solution image
        const minefieldData = minefields[0];
        if (
          !Array.isArray(minefieldData.solution) ||
          !Array.isArray(minefieldData.solution[0])
        ) {
          throw new Error(`Solution 1 has unexpected data structure.`);
        }

        const solutionTitle = custom_solution_name
          ? `${custom_solution_name} 1`
          : `Minesweeper Solution 1`;

        // Recalculate layout (same as puzzle)
        const availableWidth = A4_WIDTH_PX - 2 * MARGIN;
        const estGridHeight = (availableWidth / width) * height;
        const totalHeight =
          MARGIN + TITLE_FONT_SIZE + 20 + estGridHeight + MARGIN;

        canvas.width = A4_WIDTH_PX;
        canvas.height = totalHeight;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cellSize = availableWidth / width;
        const gridOffsetX = MARGIN;
        const gridOffsetY = MARGIN + TITLE_FONT_SIZE + 20;

        drawMinefieldGridOnCanvas(
          ctx,
          minefieldData.solution, // Pass solution data
          gridOffsetX,
          gridOffsetY,
          cellSize,
          true, // showBombs = true for solution
          bombImageElement,
          font,
          TITLE_FONT_SIZE, // Main number font size reference (will be scaled)
          solutionTitle,
          TITLE_FONT_SIZE
        );

        const solutionFilename = `${solutionTitle.replace(/\s+/g, "_")}.png`;
        downloadCanvasAsImage(canvas, solutionFilename);
      } else {
        // Multiple puzzles, generate compact solution images
        const numSolutionPages = Math.ceil(num_puzzles / solutions_per_page);
        const gridsPerRow = 2; // Fixed layout: 2 solution grids per row
        const gridsPerCol = Math.ceil(solutions_per_page / gridsPerRow);

        for (let page = 0; page < numSolutionPages; page++) {
          const startIdx = page * solutions_per_page;
          const endIdx = Math.min(startIdx + solutions_per_page, num_puzzles);
          const solutionsToShow = minefields.slice(startIdx, endIdx);

          // Calculate layout for multiple grids
          const horizontalSpacing = 30;
          const verticalSpacing = 40; // More space for mini-titles
          const totalHorizontalSpacing = (gridsPerRow - 1) * horizontalSpacing;
          const availableWidthForGrids =
            A4_WIDTH_PX - 2 * MARGIN - totalHorizontalSpacing;
          const miniGridWidth = availableWidthForGrids / gridsPerRow;
          const miniCellSize = miniGridWidth / width;
          const miniGridHeight = miniCellSize * height;

          // Estimate canvas height needed
          const totalHeight =
            MARGIN +
            TITLE_FONT_SIZE +
            20 + // Top margin + Main title
            gridsPerCol *
              (miniGridHeight + verticalSpacing + SMALL_TITLE_FONT_SIZE) + // Rows of grids + titles + spacing
            MARGIN; // Bottom margin

          canvas.width = A4_WIDTH_PX;
          canvas.height = totalHeight;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // --- Draw Page Title ---
          const pageTitle = custom_solution_name
            ? `${custom_solution_name} (Page ${page + 1})`
            : `Solutions ${startIdx + 1} - ${endIdx}`;
          ctx.font = `bold ${TITLE_FONT_SIZE}px ${font}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#000000";
          ctx.fillText(pageTitle, canvas.width / 2, MARGIN);

          // --- Draw Solution Grids ---
          const startY = MARGIN + TITLE_FONT_SIZE + 30; // Start Y below the main title

          solutionsToShow.forEach((minefieldData: any, indexInPage: number) => {
            const gridIndex = startIdx + indexInPage; // Overall index
            if (
              !Array.isArray(minefieldData.solution) ||
              !Array.isArray(minefieldData.solution[0])
            ) {
              console.warn(
                `Skipping solution ${
                  gridIndex + 1
                } due to unexpected data structure.`
              );
              return; // Skip drawing this grid if data is bad
            }

            const solutionMiniTitle = custom_solution_name
              ? `${custom_solution_name} ${gridIndex + 1}`
              : `Solution ${gridIndex + 1}`;

            const rowNum = Math.floor(indexInPage / gridsPerRow);
            const colNum = indexInPage % gridsPerRow;

            const offsetX =
              MARGIN + colNum * (miniGridWidth + horizontalSpacing);
            // Adjust Y to account for previous rows and spacing
            const offsetY =
              startY +
              rowNum *
                (miniGridHeight + verticalSpacing + SMALL_TITLE_FONT_SIZE);

            // Draw the individual solution grid
            drawMinefieldGridOnCanvas(
              ctx,
              minefieldData.solution,
              offsetX,
              offsetY,
              miniCellSize,
              true, // showBombs = true
              bombImageElement,
              font,
              TITLE_FONT_SIZE, // Base font size reference (scaled inside)
              solutionMiniTitle, // Pass the mini-title
              SMALL_TITLE_FONT_SIZE // Font size for the mini-title
            );
          });

          // Download this solution page image
          const solutionPageFilename = `${pageTitle
            .replace(/\s+/g, "_")
            .replace(/[()]/g, "")}.png`;
          downloadCanvasAsImage(canvas, solutionPageFilename);
          await new Promise((resolve) => setTimeout(resolve, 100)); // Delay
        }
      }
    } catch (error: any) {
      console.error("Error during Minesweeper generation or drawing:", error);
      setErrorMsg(`Error: ${error.message || "An unknown error occurred."}`);
    } finally {
      setIsGenerating(false);
    }
  }, [
    width,
    height,
    mines,
    num_puzzles,
    solutions_per_page,
    font,
    custom_name,
    custom_solution_name,
  ]); // Add dependencies

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Button
        isDisabled={isGenerating || !width || !height || !mines}
        color="secondary" // Use your Button component's props
        onPress={handleGenerateMineFinder} // Or onClick
      >
        {isGenerating ? "Generating..." : "Generate Mine finder Images"}
      </Button>
      {isGenerating && <p>Generating images, please wait...</p>}
      {errorMsg && (
        <p style={{ color: "red", marginTop: "10px" }}>{errorMsg}</p>
      )}
      {(!width || !height || !mines) && !isGenerating && !errorMsg && (
        <p style={{ color: "orange", marginTop: "10px" }}>
          Please set Width, Height, and Mines.
        </p>
      )}
    </div>
  );
}
