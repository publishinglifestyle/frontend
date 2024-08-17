import React, { useState, useRef, useEffect } from "react";
import { Button } from '@nextui-org/button';
import { generateHangman } from '@/managers/gamesManager';

interface HangmanProps {
    word?: string;
}

interface HangmanResponse {
    word: string;
    maskedWord: string;
    instructions: string;
}

export default function Hangman({ word }: HangmanProps) {
    const [hangmanGame, setHangmanGame] = useState<HangmanResponse | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleGenerateHangman = async () => {
        const hangmanResponse = await generateHangman(word);
        setHangmanGame(hangmanResponse);
    };

    const drawHangmanStructure = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        // Base
        ctx.beginPath();
        ctx.moveTo(50, 300);
        ctx.lineTo(150, 300);
        ctx.stroke();

        // Vertical pole
        ctx.beginPath();
        ctx.moveTo(100, 300);
        ctx.lineTo(100, 50);
        ctx.stroke();

        // Top bar
        ctx.beginPath();
        ctx.moveTo(100, 50);
        ctx.lineTo(200, 50);
        ctx.stroke();

        // Rope
        ctx.beginPath();
        ctx.moveTo(200, 50);
        ctx.lineTo(200, 100);
        ctx.stroke();
    };

    const drawHangmanMan = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'black';

        // Draw head
        for (let i = 0; i < 360; i += 20) {
            const angle = i * (Math.PI / 180);
            const x = 200 + 20 * Math.cos(angle);
            const y = 120 + 20 * Math.sin(angle);
            ctx.fillRect(x, y, 2, 2);
        }

        // Draw body
        for (let i = 0; i <= 50; i += 5) {
            ctx.fillRect(200, 140 + i, 2, 2);
        }

        // Draw left arm
        for (let i = 0; i <= 20; i += 5) {
            ctx.fillRect(200 - i, 150 + i, 2, 2);
        }

        // Draw right arm
        for (let i = 0; i <= 20; i += 5) {
            ctx.fillRect(200 + i, 150 + i, 2, 2);
        }

        // Draw left leg
        for (let i = 0; i <= 20; i += 5) {
            ctx.fillRect(200 - i, 190 + i, 2, 2);
        }

        // Draw right leg
        for (let i = 0; i <= 20; i += 5) {
            ctx.fillRect(200 + i, 190 + i, 2, 2);
        }
    };

    useEffect(() => {
        if (hangmanGame && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Set canvas size
                canvas.width = 300;
                canvas.height = 400;

                // Set background color to white
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw the hangman structure
                drawHangmanStructure(ctx);

                // Draw the hangman made of dots
                drawHangmanMan(ctx);

                // Draw the masked word with the first letter revealed
                ctx.strokeStyle = 'black';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';

                hangmanGame.maskedWord.split(' ').forEach((letter, index) => {
                    ctx.fillText(
                        letter,
                        50 + index * 30, // Adjust spacing
                        canvas.height - 50
                    );
                });
            }
        }
    }, [hangmanGame]);

    const handleSaveAsImage = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = 'hangman.png';
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {hangmanGame && (
                <canvas
                    ref={canvasRef}
                    style={{
                        border: '1px solid black',
                        backgroundColor: 'white',
                        display: 'block',
                        margin: '0 auto'
                    }}
                ></canvas>
            )}
            <div style={{ marginTop: hangmanGame ? '20px' : '0' }}>
                <Button
                    isDisabled={!word}
                    color="secondary"
                    onClick={handleGenerateHangman}
                    style={{ marginRight: '10px' }}
                >
                    Generate Hangman
                </Button>
                {hangmanGame && (
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
