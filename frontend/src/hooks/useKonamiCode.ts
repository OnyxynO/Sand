import { useEffect, useRef, useState } from 'react';

const KONAMI = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export function useKonamiCode(): number {
  const [active, setActive] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const attendu = KONAMI[indexRef.current];

      if (e.key === attendu) {
        indexRef.current += 1;
        if (indexRef.current === KONAMI.length) {
          indexRef.current = 0;
          setActive((n) => n + 1);
        }
      } else {
        // Recommencer depuis 0, mais vérifier si la touche courante est le début
        indexRef.current = e.key === KONAMI[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return active;
}
