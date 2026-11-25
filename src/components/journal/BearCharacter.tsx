import React, { useState } from 'react';

interface BearCharacterProps {
  src: string;
  alt: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  cropTop?: boolean;
  className?: string;
}

export function BearCharacter({
  src,
  alt,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  cropTop = false,
  className = '',
}: BearCharacterProps) {
  const [failed, setFailed] = useState(false);

  // Use mix-blend-multiply when the user picks a white-background JPG bear
  const isJpgOnWhite = /\.jpe?g$/i.test(src) || src.startsWith('data:image/jpeg');

  // Clean die-cut white sticker outline (~2px) + subtle paper lift shadow for transparent PNG bears
  const stickerFilter = !isJpgOnWhite
    ? [
        'drop-shadow(2px 0 0 #ffffff)',
        'drop-shadow(-2px 0 0 #ffffff)',
        'drop-shadow(0 2px 0 #ffffff)',
        'drop-shadow(0 -2px 0 #ffffff)',
        'drop-shadow(1.4px 1.4px 0 #ffffff)',
        'drop-shadow(-1.4px 1.4px 0 #ffffff)',
        'drop-shadow(1.4px -1.4px 0 #ffffff)',
        'drop-shadow(-1.4px -1.4px 0 #ffffff)',
        'drop-shadow(0 5px 8px rgba(17, 24, 39, 0.2))',
      ].join(' ')
    : 'drop-shadow(0 5px 8px rgba(17, 24, 39, 0.16))';

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-white/80 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-600 ${className}`}
        role="img"
        aria-label={alt}
      >
        Маскот KIBERone
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        transformOrigin: cropTop ? 'top center' : 'bottom center',
        filter: stickerFilter,
      }}
      className={`select-none pointer-events-none transition-transform duration-150 ${
        cropTop ? 'object-cover object-top' : 'object-contain'
      } ${isJpgOnWhite ? 'mix-blend-multiply' : ''} ${className}`}
    />
  );
}
