import React, { useState } from "react";
import { Button } from "@heroui/button";
import jsPDF from "jspdf";
import { generateMinesweeper } from "@/managers/gamesManager";
const bombSymbol = "./bomb.png"; // Path to your bomb image

interface MineFinderProps {
  width?: number;
  height?: number;
  mines?: number;
  font?: string;
  num_puzzles?: number;
  solutions_per_page?: number;
  custom_name?: string;
  custom_solution_name?: string;
}

export default function MineFinder({
  width = 10,
  height = 10,
  mines,
  font,
  num_puzzles = 1,
  solutions_per_page = 1,
  custom_name,
  custom_solution_name,
}: MineFinderProps) {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateMineFinder = async () => {
    setIsGenerating(true);

    try {
      const mineFieldResponses = await generateMinesweeper(
        width,
        height,
        mines,
        num_puzzles
      );
      if (mineFieldResponses && mineFieldResponses.response) {
        generatePDF(mineFieldResponses.response);
      }
    } catch (error) {
      console.error("Failed to generate minefield:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = (minefields: any[]) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Calculate max cell size to fit within the page margins
    const maxGridWidth = pageWidth - 2 * margin;
    const maxGridHeight = pageHeight / 2 - 2 * margin; // Fit two grids vertically
    const cellSize = Math.min(maxGridWidth / width!, maxGridHeight / height!);

    minefields.forEach((minefieldData, index) => {
      const { puzzle, solution } = minefieldData;

      // Page for each Minesweeper Puzzle (puzzle view without bombs)
      if (index > 0) doc.addPage();
      doc.setFont(font || "times", "normal");
      doc.setFontSize(20);
      doc.text(
        custom_name || `Minesweeper Puzzle ${index + 1}`,
        pageWidth / 2,
        margin,
        { align: "center" }
      );

      // Centering the puzzle grid
      const offsetX = (pageWidth - width! * cellSize) / 2;
      const offsetY = margin + 20;

      drawMinefieldGrid(doc, puzzle, offsetX, offsetY, cellSize, false); // Puzzle without bombs

      if (num_puzzles === 1 || solutions_per_page === 1) {
        // Single puzzle and solution per page
        doc.addPage();
        doc.text(`Minesweeper Solution ${index + 1}`, pageWidth / 2, margin, {
          align: "center",
        });
        drawMinefieldGrid(doc, solution, offsetX, offsetY, cellSize, true); // Solution with bombs
      }
    });

    if (num_puzzles > 1) {
      // If more than one puzzle, print solutions in a compact layout
      const solutionsPages = Math.ceil(num_puzzles / solutions_per_page);
      for (let page = 0; page < solutionsPages; page++) {
        doc.addPage();
        doc.setFont(font || "times", "normal");
        doc.setFontSize(20);
        doc.text(
          custom_solution_name ||
            `Solutions ${page * solutions_per_page + 1} - ${Math.min((page + 1) * solutions_per_page, num_puzzles)}`,
          pageWidth / 2,
          margin,
          { align: "center" }
        );

        const solutionsToShow = minefields.slice(
          page * solutions_per_page,
          (page + 1) * solutions_per_page
        );
        const gridPerRow = 2; // 2 grids per row for layout
        const gridSize = (pageWidth - 2 * margin - 10) / gridPerRow; // Adjust to fit 2 grids per row with margin
        const adjustedCellSize = gridSize / width!;

        solutionsToShow.forEach((minefield, index) => {
          const offsetX = margin + (index % gridPerRow) * (gridSize + 10);
          const offsetY =
            margin + 30 + Math.floor(index / gridPerRow) * (gridSize + 20);
          drawMinefieldGrid(
            doc,
            minefield.solution,
            offsetX,
            offsetY,
            adjustedCellSize,
            true
          ); // Solution with bombs
        });
      }
    }

    const pdfDataUrl = doc.output("bloburl");
    window.open(pdfDataUrl, "_blank");
  };

  const drawMinefieldGrid = (
    doc: jsPDF,
    gridData: any[],
    offsetX: number,
    offsetY: number,
    cellSize: number,
    showBombs: boolean
  ) => {
    const numberFontSize = cellSize * 0.6; // Adjust font size relative to cell size
    const bombImgSize = cellSize * 0.8; // Bomb image slightly smaller than the cell size

    gridData.forEach((row: any[]) => {
      row.forEach((cell: any) => {
        const x = offsetX + cell.x * cellSize;
        const y = offsetY + cell.y * cellSize;

        // Set the fill color based on the `isGray` property
        if (cell.isGray) {
          doc.setFillColor(200, 200, 200); // Light gray color for gray cells
        } else {
          doc.setFillColor(255, 255, 255); // White for non-gray cells
        }
        doc.rect(x, y, cellSize, cellSize, "F"); // Draw filled rectangle

        // Draw cell border
        doc.setDrawColor(0, 0, 0); // Black border
        doc.rect(x, y, cellSize, cellSize); // Draw cell border

        if (showBombs && cell.isMine) {
          // Draw the bomb only if `showBombs` is true
          const imgX = x + (cellSize - bombImgSize) / 2;
          const imgY = y + (cellSize - bombImgSize) / 2;
          doc.addImage(bombSymbol, "PNG", imgX, imgY, bombImgSize, bombImgSize);
        } else if (!cell.isMine && cell.mines > 0) {
          // Draw the number of surrounding mines if not a mine
          doc.setFont(font || "times", "normal");
          doc.setFontSize(numberFontSize);
          doc.setTextColor(0, 0, 0); // Black text
          doc.text(
            cell.mines.toString(),
            x + cellSize / 2,
            y + cellSize / 2 + numberFontSize / 3,
            { align: "center" }
          );
        }
      });
    });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Button
        isDisabled={isGenerating || !width || !height || !mines}
        color="secondary"
        onPress={handleGenerateMineFinder}
      >
        {isGenerating ? "Generating..." : "Generate Minesweeper PDF"}
      </Button>
    </div>
  );
}
