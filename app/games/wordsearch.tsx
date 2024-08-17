import React, { useState, useRef, useEffect } from "react";
import { Button } from '@nextui-org/button';
import { generateWordSearch } from '@/managers/gamesManager';

interface WordSearchProps {
    words?: string[];
}

export default function WordSearch({ words }: WordSearchProps) {
    const [wordSearchPuzzle, setWordSearchPuzzle] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleGenerateWordSearch = async () => {
        const wordSearchResponse = await generateWordSearch(words); // Pass words to the generate function
        setWordSearchPuzzle(wordSearchResponse);
    };

    useEffect(() => {
        if (wordSearchPuzzle && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Split the word search puzzle string into rows
                const rows = wordSearchPuzzle.split('\n');
                const size = 360; // You can adjust this size
                const gridSize = rows.length;
                const cellSize = size / gridSize;

                canvas.width = size;
                canvas.height = size;

                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Set background color to white
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw the grid
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                for (let i = 0; i <= gridSize; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * cellSize, 0);
                    ctx.lineTo(i * cellSize, size);
                    ctx.moveTo(0, i * cellSize);
                    ctx.lineTo(size, i * cellSize);
                    ctx.stroke();
                }

                // Draw the letters in the grid
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';

                rows.forEach((row, rowIndex) => {
                    const letters = row.split(' ');
                    letters.forEach((letter, colIndex) => {
                        ctx.fillText(
                            letter,
                            colIndex * cellSize + cellSize / 2,
                            rowIndex * cellSize + cellSize / 2
                        );
                    });
                });
            }
        }
    }, [wordSearchPuzzle]);

    const handleSaveAsImage = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = 'wordsearch.png';
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {wordSearchPuzzle && (
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
            <div style={{ marginTop: wordSearchPuzzle ? '20px' : '0' }}>
                <Button
                    isDisabled={!words || words.length === 0}
                    color="secondary"
                    onClick={handleGenerateWordSearch}
                    style={{ marginRight: '10px' }}
                >
                    Generate Word Search
                </Button>
                {wordSearchPuzzle && (
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
