import { useEffect, useRef } from 'react';

/**
 * A hook that listens to rapid keyboard events typical of USB/Bluetooth physical barcode scanners.
 * Most physical scanners act as a keyboard, typing characters very quickly (< 50ms) and ending with 'Enter'.
 */
export default function useBarcodeScanner(onScan) {
  const buffer = useRef('');
  const lastKeyTime = useRef(Date.now());

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input field to avoid conflicts
      if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime.current;

      // If more than 100ms passed since last keystroke, it's probably human typing, reset buffer.
      if (timeDiff > 100) {
        buffer.current = '';
      }

      if (e.key === 'Enter') {
        // If we have a reasonable length buffer on Enter, trigger scan.
        if (buffer.current.length >= 3) {
          onScan(buffer.current);
        }
        buffer.current = '';
      } else if (e.key.length === 1) {
        // Append visual characters
        buffer.current += e.key;
      }

      lastKeyTime.current = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan]);
}
