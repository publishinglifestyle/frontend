import React, { useState, useRef, useEffect } from "react";
import { Button } from '@nextui-org/button';
import { generateCrossword } from '@/managers/gamesManager';

interface CrosswordProps {
    cross_words?: string;
}

export default function Crossword({ cross_words }: CrosswordProps) {
    const [crosswordLayout, setCrosswordLayout] = useState<any | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleGenerateCrossword = async () => {
        const crosswordResponse = await generateCrossword(cross_words);
        setCrosswordLayout(crosswordResponse);
    };

    useEffect(() => {
        if (crosswordLayout && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const cellSize = 40; // Size of each cell
                const rows = crosswordLayout.rows;
                const cols = crosswordLayout.cols;
                const width = cols * cellSize;
                const height = (rows * cellSize) + (crosswordLayout.outputJson.length * 20) + 40;

                canvas.width = width;
                canvas.height = height;
                ctx.clearRect(0, 0, width, height);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);

                // Draw the grid
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        // Draw the cell border
                        ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);

                        const cellValue = crosswordLayout.table[r][c];

                        if (cellValue === '-') {
                            // Fill black cells
                            ctx.fillStyle = 'black';
                            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                        } else {
                            // Fill white cells
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);

                            // Randomly decide whether to show the letter (e.g., 50% chance)
                            if (cellValue !== '' && cellValue !== '-' && Math.random() > 0.5) {
                                ctx.fillStyle = 'black';
                                ctx.font = '20px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(cellValue.toUpperCase(), c * cellSize + cellSize / 2, r * cellSize + cellSize / 2);
                            }
                        }
                    }
                }

                // Add numbering for the starting cells of words
                ctx.font = '10px Arial';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillStyle = 'black';

                crosswordLayout.outputJson.forEach((wordInfo: any) => {
                    if (wordInfo.position !== undefined) {
                        const x = (wordInfo.startx - 1) * cellSize;
                        const y = (wordInfo.starty - 1) * cellSize;
                        ctx.fillText(wordInfo.position.toString(), x + 2, y + 2); // Add number in the top-left corner
                    }
                });

                // Draw the clues below the grid
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.font = '14px Arial';
                const clueStartY = rows * cellSize + 20;
                crosswordLayout.outputJson.forEach((wordInfo: any, index: number) => {
                    const clueText = `${wordInfo.position}. ${wordInfo.clue}`;
                    ctx.fillText(clueText, 10, clueStartY + index * 20);
                });
            }
        }
    }, [crosswordLayout]);

    const handleSaveAsImage = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = 'crossword.png';
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {crosswordLayout && (
                <canvas
                    ref={canvasRef}
                    style={{
                        border: '1px solid black',
                        backgroundColor: 'white',
                        display: 'block',
                        margin: '20px auto'
                    }}
                ></canvas>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <Button
                    isDisabled={!cross_words}
                    color="secondary"
                    onClick={handleGenerateCrossword}
                >
                    Generate Crossword
                </Button>
                {crosswordLayout && (
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
