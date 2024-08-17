import React, { useState, useRef, useEffect } from "react";
import { Button } from '@nextui-org/button';
import { generateSudoku } from '@/managers/gamesManager';

interface SudokuProps {
    difficulty?: string;
}

export default function Sudoku({ difficulty }: SudokuProps) {
    const [sudokuPuzzle, setSudokuPuzzle] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleGenerateSudoku = async () => {
        const sudokuResponse = await generateSudoku(difficulty); // Pass difficulty to the generate function
        setSudokuPuzzle(sudokuResponse.puzzle);
    };

    useEffect(() => {
        if (sudokuPuzzle && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Define canvas size and grid parameters
                const size = 360; // 40px * 9 = 360px
                canvas.width = size;
                canvas.height = size;
                const cellSize = size / 9;

                // Set background color to white
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw the grid
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                for (let i = 0; i <= 9; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * cellSize, 0);
                    ctx.lineTo(i * cellSize, size);
                    ctx.moveTo(0, i * cellSize);
                    ctx.lineTo(size, i * cellSize);
                    ctx.stroke();
                }

                // Draw thicker lines for 3x3 subgrids
                ctx.lineWidth = 3;
                for (let i = 0; i <= 9; i += 3) {
                    ctx.beginPath();
                    ctx.moveTo(i * cellSize, 0);
                    ctx.lineTo(i * cellSize, size);
                    ctx.moveTo(0, i * cellSize);
                    ctx.lineTo(size, i * cellSize);
                    ctx.stroke();
                }

                // Draw the numbers
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';

                for (let i = 0; i < 81; i++) {
                    const row = Math.floor(i / 9);
                    const col = i % 9;
                    const value = sudokuPuzzle[i];

                    if (value !== '-') {
                        ctx.fillText(
                            value,
                            col * cellSize + cellSize / 2,
                            row * cellSize + cellSize / 2
                        );
                    }
                }
            }
        }
    }, [sudokuPuzzle]);

    const handleSaveAsImage = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = 'sudoku.png';
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {sudokuPuzzle && (
                <canvas
                    ref={canvasRef}
                    style={{
                        border: '1px solid black',
                        backgroundColor: 'white', // Ensure background is white
                        display: 'block',
                        margin: '0 auto' // Center the canvas on the screen
                    }}
                ></canvas>
            )}
            <div style={{ marginTop: sudokuPuzzle ? '20px' : '0' }}>
                <Button
                    isDisabled={!difficulty}
                    color="secondary"
                    onClick={handleGenerateSudoku}
                    style={{ marginRight: '10px' }}
                >
                    Generate Sudoku
                </Button>
                {sudokuPuzzle && (
                    <Button
                        color="secondary"
                        variant="ghost"
                        onClick={handleSaveAsImage}
                    >
                        Save as Image
                    </Button>
                )}
            </div>
        </div>
    );
}
