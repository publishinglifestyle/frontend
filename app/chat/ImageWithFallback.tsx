import React, { useState, useEffect } from 'react';

function ImageWithFallback({ src, alt, className }: { src: string, alt: string, className?: string }) {
    const [imgSrc, setImgSrc] = useState(src);
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        console.log(`ImageWithFallback: Received new src: ${src}`);
        setImgSrc(src);
        setRetry(0);
    }, [src]);

    const handleError = () => {
        console.error(`Failed to load image: ${imgSrc}`);
        if (retry < 1) {
            console.log('Retrying to load image...');
            setRetry(retry + 1);
            setImgSrc(`${src}?retry=${retry + 1}`);
        } else {
            console.log('Loading fallback image...');
            setImgSrc('./fallback.png'); // Ensure this path is correct and the image exists in your public directory
        }
    };

    return <img src={imgSrc} alt={alt} className={className} loading="lazy" onError={handleError} />;
}

export default ImageWithFallback;
