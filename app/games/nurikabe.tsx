import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@nextui-org/button';
import { generateNurikabe } from '@/managers/gamesManager';

interface NurikabeProps {
    size?: number;
}

interface NurikabeResponse {
    grid_size: number;
    puzzle: (number | null)[][];
    solution: string[][];
}

export default function Nurikabe({ size }: NurikabeProps) {
    const [nurikabePuzzle, setNurikabePuzzle] = useState<NurikabeResponse | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleGenerateNurikabe = async () => {
        const nurikabeResponse = await generateNurikabe(size); // Pass size to the generateNurikabe function
        setNurikabePuzzle(nurikabeResponse);
    };

    useEffect(() => {
        if (nurikabePuzzle && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const canvasSize = 300; // Adjust the size of the canvas
                const cellSize = canvasSize / nurikabePuzzle.grid_size;
                canvas.width = canvasSize;
                canvas.height = canvasSize;

                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Set background color to white
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw the grid with lighter lines
                ctx.strokeStyle = '#CCCCCC'; // Light gray for grid lines
                ctx.lineWidth = 1;
                for (let i = 0; i <= nurikabePuzzle.grid_size; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * cellSize, 0);
                    ctx.lineTo(i * cellSize, canvasSize);
                    ctx.moveTo(0, i * cellSize);
                    ctx.lineTo(canvasSize, i * cellSize);
                    ctx.stroke();
                }

                // Draw the puzzle numbers and solution markers with softer colors
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                for (let row = 0; row < nurikabePuzzle.grid_size; row++) {
                    for (let col = 0; col < nurikabePuzzle.grid_size; col++) {
                        const value = nurikabePuzzle.puzzle[row][col];
                        const solution = nurikabePuzzle.solution[row][col];

                        if (value !== null) {
                            ctx.fillStyle = '#333333'; // Dark gray for numbers
                            ctx.fillText(
                                value.toString(),
                                col * cellSize + cellSize / 2,
                                row * cellSize + cellSize / 2
                            );
                        }

                        if (solution === '■') {
                            ctx.fillStyle = '#555555'; // Medium gray for blocks
                            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                        }
                    }
                }
            }
        }
    }, [nurikabePuzzle]);

    const handleSaveAsImage = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = 'nurikabe.png';
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {nurikabePuzzle && (
                <canvas
                    ref={canvasRef}
                    style={{
                        border: '1px solid #CCCCCC',
                        backgroundColor: 'white',
                        display: 'block',
                        margin: '0 auto'
                    }}
                ></canvas>
            )}
            <div style={{ marginTop: nurikabePuzzle ? '20px' : '0' }}>
                <Button
                    isDisabled={!size}
                    color="secondary"
                    onClick={handleGenerateNurikabe}
                    style={{ marginRight: '10px' }}
                >
                    Generate Nurikabe
                </Button>
                {nurikabePuzzle && (
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
