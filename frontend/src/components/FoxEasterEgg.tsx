import { useEffect, useRef, useState } from 'react';
import foxWebp from '../assets/fox.webp';

const FOX_LARGEUR = 224; // w-56 = 14rem

interface Position {
  bottom: number;
  left: number;
}

interface Props {
  actif: boolean;
  onTermine: () => void;
}

function choisirPosition(): Position {
  const panneaux = Array.from(document.querySelectorAll('.sand-card'));
  const visibles = panneaux.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > FOX_LARGEUR && r.top > 80 && r.top < window.innerHeight - 50;
  });

  if (visibles.length > 0) {
    const panneau = visibles[Math.floor(Math.random() * visibles.length)];
    const r = panneau.getBoundingClientRect();
    const left = r.left + Math.random() * Math.max(0, r.width - FOX_LARGEUR);
    return {
      bottom: window.innerHeight - r.top,
      left: Math.round(left),
    };
  }

  return { bottom: 0, left: window.innerWidth - FOX_LARGEUR - 80 };
}

export default function FoxEasterEgg({ actif, onTermine }: Props) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!actif) return;

    setPosition(choisirPosition());
    setVisible(true);

    // Redémarrer l'animation WebP : vider src puis le réassigner
    if (imgRef.current) {
      imgRef.current.src = '';
      imgRef.current.src = foxWebp;
    }

    const timer = setTimeout(() => {
      setVisible(false);
      onTermine();
    }, 4000);

    return () => clearTimeout(timer);
  }, [actif, onTermine]);

  if (!visible || !position) return null;

  return (
    <img
      ref={imgRef}
      src={foxWebp}
      alt=""
      aria-hidden="true"
      onClick={() => { setVisible(false); onTermine(); }}
      style={{
        position: 'fixed',
        bottom: position.bottom,
        left: position.left,
        width: FOX_LARGEUR,
        mixBlendMode: 'multiply',
        zIndex: 9999,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    />
  );
}
