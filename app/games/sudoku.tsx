import React, { useState, useRef, useCallback } from "react";
import { Button } from "@heroui/button"; // Assuming this Button component exists
import { generateSudoku } from "@/managers/gamesManager"; // Assuming this fetches Sudoku data

// Helper function to download canvas content
const downloadCanvasAsImage = (canvas: HTMLCanvasElement, filename: string) => {
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link);
};

// --- SudokuProps Interface (Unchanged) ---
interface SudokuProps {
  difficulty?: string;
  font?: string; // e.g., 'Arial', 'Times New Roman', 'Courier New'
  is_sequential?: boolean;
  custom_name?: string;
  custom_solution_name?: string;
  num_puzzles?: number;
  solutions_per_page?: number; // Note: For canvas, this affects grouping for download
}

// --- Default Font ---
const DEFAULT_FONT = "Arial"; // Choose a common web-safe font

export default function Sudoku({
  difficulty,
  font = DEFAULT_FONT,
  is_sequential,
  custom_name,
  custom_solution_name,
  num_puzzles = 1,
  solutions_per_page = 4, // Sensible default for multiple solutions per image
}: SudokuProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  // Use a ref for a single canvas element that we'll reuse
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Drawing Function (Canvas specific) ---
  const drawSudokuGridOnCanvas = (
    ctx: CanvasRenderingContext2D,
    gridData: string,
    offsetX: number,
    offsetY: number,
    cellSize: number,
    gridFont: string,
    gridFontSize: number,
    title?: string,
    titleFontSize?: number
  ) => {
    const canvas = ctx.canvas;
    const gridTotalSize = cellSize * 9;

    // --- Draw Title (Optional) ---
    if (title && titleFontSize) {
      ctx.font = `bold ${titleFontSize}px ${gridFont}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom"; // Align text bottom relative to Y
      // Center title above the grid
      ctx.fillText(title, offsetX + gridTotalSize / 2, offsetY - 10); // 10px margin above grid
    }

    // --- Draw Grid Lines ---
    ctx.strokeStyle = "#000000"; // Black lines
    for (let i = 0; i <= 9; i++) {
      const lineWidth = i % 3 === 0 ? 2 : 0.5; // Thicker lines for 3x3 boxes
      ctx.lineWidth = lineWidth;

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(offsetX + i * cellSize, offsetY);
      ctx.lineTo(offsetX + i * cellSize, offsetY + gridTotalSize);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + i * cellSize);
      ctx.lineTo(offsetX + gridTotalSize, offsetY + i * cellSize);
      ctx.stroke();
    }

    // --- Draw Numbers ---
    ctx.font = `${gridFontSize}px ${gridFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // Crucial for vertical centering
    ctx.fillStyle = "#000000"; // Black numbers

    for (let i = 0; i < 81; i++) {
      const row = Math.floor(i / 9);
      const col = i % 9;
      const value = gridData[i];

      if (value !== "-" && value !== "0" && value !== ".") {
        // Handle common empty cell chars
        // Calculate the center of the cell
        const cellCenterX = offsetX + col * cellSize + cellSize / 2;
        const cellCenterY = offsetY + row * cellSize + cellSize / 2;

        ctx.fillText(value, cellCenterX, cellCenterY);
      }
    }
  };

  // --- Main Generation and Drawing Logic ---
  const handleGenerateSudoku = useCallback(async () => {
    if (!difficulty) return; // Don't generate if no difficulty selected

    setIsGenerating(true);
    try {
      const sudokuResponses = await generateSudoku(difficulty, num_puzzles);

      if (sudokuResponses && sudokuResponses.length > 0) {
        // --- Canvas Setup ---
        const canvas = canvasRef.current || document.createElement("canvas");
        if (!canvasRef.current) {
          // If dynamically created, keep a reference? Not strictly needed here.
          // Or better, create it fresh each time if sizes vary wildly.
          // Let's stick to dynamic creation per image for simplicity of sizing.
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Could not get canvas context");
          setIsGenerating(false);
          return; // Early exit if canvas context fails
        }

        // --- Constants for Drawing (pixels) ---
        const A4_WIDTH_PX = 794; // Approx A4 width at 96 DPI
        const A4_HEIGHT_PX = 1123; // Approx A4 height at 96 DPI
        const MARGIN = 50; // Generous margin
        const TITLE_FONT_SIZE = 30;
        const NUMBER_FONT_SIZE = 18;
        const SMALL_NUMBER_FONT_SIZE = 12; // For compact solution grids

        // --- Generate Puzzle Images ---
        for (let index = 0; index < sudokuResponses.length; index++) {
          const sudoku = sudokuResponses[index];
          const { puzzle } = sudoku;

          const puzzleTitle = is_sequential
            ? `Puzzle ${index + 1}`
            : custom_name || `Puzzle ${index + 1}`; // Use index as fallback for custom

          // Configure canvas for single large puzzle
          canvas.width = A4_WIDTH_PX;
          canvas.height = A4_HEIGHT_PX / 2; // Can be shorter if only one grid
          ctx.fillStyle = "#FFFFFF"; // White background
          ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear canvas with background

          // Calculate size and position for the single puzzle grid
          const availableWidth = canvas.width - 2 * MARGIN;
          const availableHeight =
            canvas.height - 2 * MARGIN - TITLE_FONT_SIZE - 20; // Space for title+margin
          const gridSize = Math.min(availableWidth, availableHeight); // Fit within bounds
          const cellSize = gridSize / 9;
          const gridOffsetX = (canvas.width - gridSize) / 2;
          const gridOffsetY = MARGIN + TITLE_FONT_SIZE + 20; // Below title

          drawSudokuGridOnCanvas(
            ctx,
            puzzle,
            gridOffsetX,
            gridOffsetY,
            cellSize,
            font,
            NUMBER_FONT_SIZE,
            puzzleTitle,
            TITLE_FONT_SIZE
          );

          // Download this puzzle image
          const puzzleFilename = `${puzzleTitle.replace(/\s+/g, "_")}.png`;
          downloadCanvasAsImage(canvas, puzzleFilename);
          // Small delay might help browser handle multiple downloads, though not guaranteed
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // --- Generate Solution Images ---
        if (num_puzzles === 1) {
          // Single puzzle, single solution image
          const sudoku = sudokuResponses[0];
          const { solution } = sudoku;
          const solutionTitle = is_sequential
            ? `Solution 1`
            : custom_solution_name || `Solution 1`; // Use index as fallback

          // Configure canvas (reuse dimensions from puzzle)
          canvas.width = A4_WIDTH_PX;
          canvas.height = A4_HEIGHT_PX / 2;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const availableWidth = canvas.width - 2 * MARGIN;
          const availableHeight =
            canvas.height - 2 * MARGIN - TITLE_FONT_SIZE - 20;
          const gridSize = Math.min(availableWidth, availableHeight);
          const cellSize = gridSize / 9;
          const gridOffsetX = (canvas.width - gridSize) / 2;
          const gridOffsetY = MARGIN + TITLE_FONT_SIZE + 20;

          drawSudokuGridOnCanvas(
            ctx,
            solution,
            gridOffsetX,
            gridOffsetY,
            cellSize,
            font,
            NUMBER_FONT_SIZE,
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
            const solutionsToShow = sudokuResponses.slice(startIdx, endIdx);

            // Adjust canvas height based on how many rows of grids
            const estimatedGridHeight =
              (A4_WIDTH_PX - 2 * MARGIN - (gridsPerRow - 1) * 20) / gridsPerRow;
            canvas.width = A4_WIDTH_PX;
            // Calculate needed height: Margin + Title + Rows*(GridHeight + Spacing) + Margin
            canvas.height =
              MARGIN +
              TITLE_FONT_SIZE +
              20 +
              gridsPerCol * (estimatedGridHeight + 20) +
              MARGIN;
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // --- Draw Page Title ---
            const pageTitle = is_sequential
              ? `Solutions ${startIdx + 1} - ${endIdx}`
              : custom_solution_name || `Solutions (Page ${page + 1})`;
            ctx.font = `bold ${TITLE_FONT_SIZE}px ${font}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#000000";
            ctx.fillText(pageTitle, canvas.width / 2, MARGIN);

            // --- Draw Solution Grids ---
            const horizontalSpacing = 20; // Space between grids horizontally
            const verticalSpacing = 30; // Space between rows vertically + space for optional mini-title
            const totalHorizontalSpacing =
              (gridsPerRow - 1) * horizontalSpacing;
            const availableWidthForGrids =
              canvas.width - 2 * MARGIN - totalHorizontalSpacing;
            const miniGridSize = availableWidthForGrids / gridsPerRow;
            const miniCellSize = miniGridSize / 9;
            const startY = MARGIN + TITLE_FONT_SIZE + 30; // Start Y below the main title

            solutionsToShow.forEach((sudoku: any, indexInPage: number) => {
              const { solution } = sudoku;
              const gridIndex = startIdx + indexInPage; // Overall index

              const solutionMiniTitle = is_sequential
                ? `Solution ${gridIndex + 1}`
                : custom_solution_name
                ? `${custom_solution_name} ${gridIndex + 1}`
                : `Solution ${gridIndex + 1}`; // Mini-title above each grid

              const rowNum = Math.floor(indexInPage / gridsPerRow);
              const colNum = indexInPage % gridsPerRow;

              const offsetX =
                MARGIN + colNum * (miniGridSize + horizontalSpacing);
              const offsetY =
                startY + rowNum * (miniGridSize + verticalSpacing);

              // Draw the individual solution grid
              drawSudokuGridOnCanvas(
                ctx,
                solution,
                offsetX,
                offsetY + 15, // Add little space for the mini-title
                miniCellSize,
                font,
                SMALL_NUMBER_FONT_SIZE, // Smaller font for compact view
                solutionMiniTitle, // Pass the mini-title
                SMALL_NUMBER_FONT_SIZE + 2 // Slightly larger font size for mini-title
              );
            });

            // Download this solution page image
            const solutionPageFilename = `${pageTitle.replace(
              /\s+/g,
              "_"
            )}.png`;
            downloadCanvasAsImage(canvas, solutionPageFilename);
            await new Promise((resolve) => setTimeout(resolve, 100)); // Delay
          }
        }
      }
    } catch (error) {
      console.error("Error generating Sudoku:", error);
      // Handle error appropriately, maybe show a message to the user
    } finally {
      setIsGenerating(false);
    }
  }, [
    difficulty,
    num_puzzles,
    font,
    is_sequential,
    custom_name,
    custom_solution_name,
    solutions_per_page,
  ]); // Add dependencies

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      {/* Hidden canvas for drawing, or remove if creating dynamically */}
      {/* <canvas ref={canvasRef} style={{ display: 'none' }}></canvas> */}
      <Button
        isDisabled={!difficulty || isGenerating}
        color="secondary" // Use your Button component's props
        onPress={handleGenerateSudoku} // Or onClick if it's a standard HTML button
      >
        {isGenerating ? "Generating Images..." : "Generate Sudoku Images"}
      </Button>
      {isGenerating && <p>Generating images, please wait...</p>}
      {!difficulty && (
        <p style={{ color: "orange", marginTop: "10px" }}>
          Please select a difficulty.
        </p>
      )}
    </div>
  );
}
