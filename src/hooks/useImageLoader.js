import { useState, useEffect } from 'react';

/**
 * A custom hook to detect when an image has been fully loaded by the browser.
 * Useful for "blur-up" loading patterns.
 * 
 * @param {string} src - The source URL of the image to monitor.
 * @returns {boolean} - Returns true if the image is loaded, false otherwise.
 */
export function useImageLoader(src) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!src) return;

        // Reset state if src changes
        setIsLoaded(false);

        const img = new Image();
        img.src = src;

        if (img.complete) {
            setIsLoaded(true);
        } else {
            img.onload = () => setIsLoaded(true);
        }

        return () => {
            img.onload = null;
        };
    }, [src]);

    return isLoaded;
}
