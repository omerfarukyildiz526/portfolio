'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const PHOTOS = [
  { id: 'p0', src: '/photos/1758641024787.png', gradient: ['#1a2a4a', '#2244aa'] },
  { id: 'p1', src: '/photos/181980218.jpg', gradient: ['#2a1a1a', '#aa4422'] },
  { id: 'p2', src: '/photos/482796749_1712698422644812_3597903296951852725_n.jpg', gradient: ['#1a2a1a', '#226622'] },
];

function Photo({
  photo,
  size,
  onClick,
  isSmall,
  style: extraStyle,
}: {
  photo: typeof PHOTOS[0];
  size: number;
  onClick?: () => void;
  isSmall: boolean;
  style?: React.CSSProperties;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className="overflow-hidden flex-shrink-0 transition-transform duration-200"
      style={{
        ...extraStyle,
        width: size,
        height: size,
        borderRadius: '50%',
        cursor: isSmall ? 'pointer' : 'default',
        border: isSmall
          ? '2px solid var(--border)'
          : '3px solid var(--border)',
        boxShadow: isSmall
          ? '0 6px 24px rgba(0,0,0,0.55)'
          : '0 16px 56px rgba(0,0,0,0.65)',
        position: 'absolute',
        transform: isSmall ? undefined : undefined,
      }}
    >
      {!imgError ? (
        <Image
          src={photo.src}
          alt="profile"
          fill
          style={{ objectFit: 'cover' }}
          onError={() => setImgError(true)}
          sizes={`${size}px`}
          priority
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${photo.gradient[0]} 0%, ${photo.gradient[1]} 100%)`,
          }}
        />
      )}
    </div>
  );
}

export default function ProfileStack({
  mainSize = 148,
  smallSize = 58,
}: {
  mainSize?: number;
  smallSize?: number;
}) {
  const [mainIdx, setMainIdx] = useState(0);

  const smalls = [0, 1, 2].filter((i) => i !== mainIdx);

  const containerW = mainSize + smallSize + 24;
  const containerH = mainSize + smallSize + 16;

  const mainLeft = Math.round((containerW - mainSize) / 2);
  const mainTop = containerH - mainSize;

  const smallPositions = [
    { left: 0, top: Math.round(smallSize * 0.2) },
    { left: containerW - smallSize, top: 0 },
  ];

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: containerW, height: containerH }}
    >
      {smalls.map((photoIdx, pos) => (
        <Photo
          key={PHOTOS[photoIdx].id}
          photo={PHOTOS[photoIdx]}
          size={smallSize}
          isSmall
          onClick={() => setMainIdx(photoIdx)}
          style={{ ...smallPositions[pos] }}
        />
      ))}

      <Photo
        photo={PHOTOS[mainIdx]}
        size={mainSize}
        isSmall={false}
        style={{ left: mainLeft, top: mainTop }}
      />
    </div>
  );
}
