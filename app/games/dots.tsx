"use client"

import React, { useRef, useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@nextui-org/button';
import { Spacer } from '@nextui-org/spacer';
import jsPDF from 'jspdf';

interface DotsToDotsProps {
    is_sequential: boolean;
    custom_name: string;
    font: string;
}

const DotsToDots: React.FC<DotsToDotsProps> = ({ is_sequential, custom_name, font }) => {
    const [image, setImage] = useState<string | ArrayBuffer | null>(null);
    const [dots, setDots] = useState<{ x: number; y: number }[]>([]);
    const [draggingDotIndex, setDraggingDotIndex] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileInputClick = () => {
        fileInputRef.current?.click();
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = imageRef.current;

        if (!canvas || !ctx || !img) return;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Center the image on the canvas
        const x = (canvas.width - img.width) / 2;
        const y = (canvas.height - img.height) / 2;

        // Draw the image centered
        ctx.drawImage(img, x, y, img.width, img.height);

        // Draw the dots with numbers
        ctx.fillStyle = 'red';
        ctx.font = `12px ${font}`; // Use the selected font

        dots.forEach((dot, index) => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw the sequential number next to each dot
            const label = (index + 1).toString();
            ctx.fillText(label, dot.x + 7, dot.y - 7);
        });
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if a dot is clicked
        const index = dots.findIndex(dot => Math.hypot(dot.x - x, dot.y - y) < 5);
        if (index !== -1) {
            setDraggingDotIndex(index);
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (draggingDotIndex === null) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Update the position of the dragged dot
        setDots(dots.map((dot, index) =>
            index === draggingDotIndex ? { x, y } : dot
        ));
    };

    const handleMouseUp = () => {
        setDraggingDotIndex(null);
    };

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (draggingDotIndex !== null) return; // Prevent adding dots while dragging

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setDots([...dots, { x, y }]);
    };

    const generatePDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;

        // Add custom name as the title of the page
        doc.setFont(font);
        doc.setFontSize(16);
        doc.text(custom_name, pageWidth / 2, margin + 10, { align: 'center' });

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create a new canvas for the dots
        const dotsCanvas = document.createElement('canvas');
        dotsCanvas.width = canvas.width;
        dotsCanvas.height = canvas.height;
        const dotsCtx = dotsCanvas.getContext('2d');
        if (dotsCtx) {
            // Resize dots and change their color to black for the PDF
            const dotRadius = 2; // Smaller dot size for PDF
            dotsCtx.fillStyle = 'black'; // Set dot color to black
            dotsCtx.font = `8px ${font}`; // Use the selected font for PDF

            dots.forEach((dot, index) => {
                dotsCtx.beginPath();
                dotsCtx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
                dotsCtx.fill();

                // Draw the sequential number next to each dot
                const label = (index + 1).toString();
                dotsCtx.fillText(label, dot.x + 3, dot.y - 3); // Adjusted for smaller size
            });

            const dotsImgData = dotsCanvas.toDataURL('image/png');
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = imgWidth * (dotsCanvas.height / dotsCanvas.width);
            const offsetX = margin;
            const offsetY = (doc.internal.pageSize.getHeight() - imgHeight) / 2 + 20; // Adjust for title space

            doc.addImage(dotsImgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight);

            // Generate PDF and open in a new tab
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
        }
    };

    // Redraw the canvas when the image or dots change
    useEffect(() => {
        if (image) {
            const img = new Image();
            img.src = image as string;
            img.onload = () => {
                imageRef.current = img;
                drawCanvas();
            };
        }
    }, [image, dots, font, is_sequential, custom_name]);

    return (
        <div style={{ textAlign: 'center' }}>
            {image && (
                <>
                    <canvas
                        ref={canvasRef}
                        style={{ border: '1px solid black', display: image ? 'block' : 'none', margin: '0 auto' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onClick={handleClick}
                    />
                    <Spacer y={4} />
                </>
            )}

            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                style={{ display: 'none' }} // Hide the input
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <Button
                    onClick={generatePDF}
                    color="secondary"
                    isDisabled={!dots.length}
                >
                    Generate PDF
                </Button>
                <Button
                    onClick={handleFileInputClick}
                    color="secondary"
                    variant='ghost'
                >
                    Upload Image
                </Button>
            </div>
        </div>
    );
};

export default DotsToDots;
