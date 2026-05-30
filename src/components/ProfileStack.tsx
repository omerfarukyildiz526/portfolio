'use client';

import React, { useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import Image from 'next/image';

const PHOTOS = [
  { id: 'p0', src: '/photos/1758641024787.png', gradient: ['#1a2a4a', '#2244aa'] },
  { id: 'p1', src: '/photos/181980218.jpg', gradient: ['#2a1a1a', '#aa4422'] },
  { id: 'p2', src: '/photos/482796749_1712698422644812_3597903296951852725_n.jpg', gradient: ['#1a2a1a', '#226622'] },
];

const FLOAT_DELAYS = [0, 0.6, 1.2];

function Photo({
  photo,
  size,
  onClick,
  isSmall,
  style: extraStyle,
  floatDelay = 0,
}: {
  photo: typeof PHOTOS[0];
  size: number;
  onClick?: () => void;
  isSmall: boolean;
  style?: React.CSSProperties;
  floatDelay?: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      layoutId={photo.id}
      animate={{ y: [0, isSmall ? -6 : -10, 0] }}
      transition={{
        layout: { type: 'spring', stiffness: 280, damping: 26 },
        y: {
          duration: isSmall ? 3.2 : 4.0,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: floatDelay,
        },
      }}
      onClick={onClick}
      whileHover={isSmall ? { scale: 1.1, zIndex: 20 } : {}}
      className="overflow-hidden flex-shrink-0"
      style={{
        ...extraStyle,
        width: size,
        height: size,
        borderRadius: '50%',
        cursor: isSmall ? 'pointer' : 'default',
        border: isSmall
          ? '2px solid rgba(255,255,255,0.12)'
          : '3px solid rgba(255,255,255,0.16)',
        boxShadow: isSmall
          ? '0 6px 24px rgba(0,0,0,0.55)'
          : '0 16px 56px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.05)',
        position: 'absolute',
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
    </motion.div>
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

  // Container: roomy enough for scattered bubble layout
  const containerW = mainSize + smallSize + 24;
  const containerH = mainSize + smallSize + 16;

  // Main photo: bottom-center
  const mainLeft = Math.round((containerW - mainSize) / 2);
  const mainTop = containerH - mainSize;

  // Small photos: upper-left and upper-right, well separated
  const smallPositions = [
    { left: 0, top: Math.round(smallSize * 0.2) },                          // sol üst
    { left: containerW - smallSize, top: 0 },                               // sağ üst
  ];

  return (
    <LayoutGroup>
      <div
        className="relative flex-shrink-0"
        style={{ width: containerW, height: containerH }}
      >
        {/* Small floating photos */}
        {smalls.map((photoIdx, pos) => (
          <Photo
            key={PHOTOS[photoIdx].id}
            photo={PHOTOS[photoIdx]}
            size={smallSize}
            isSmall
            onClick={() => setMainIdx(photoIdx)}
            floatDelay={FLOAT_DELAYS[pos + 1]}
            style={{ ...smallPositions[pos] }}
          />
        ))}

        {/* Main photo */}
        <Photo
          photo={PHOTOS[mainIdx]}
          size={mainSize}
          isSmall={false}
          floatDelay={0}
          style={{ left: mainLeft, top: mainTop }}
        />
      </div>
    </LayoutGroup>
  );
}
