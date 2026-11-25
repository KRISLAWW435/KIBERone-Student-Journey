import React from 'react';

interface PageBackdropArtworkProps {
  page: 1 | 2;
  accentTeal?: string;
  accentYellow?: string;
  accentCoral?: string;
}

export function PageBackdropArtwork({
  page,
  accentTeal = '#38C8D4',
  accentCoral = '#FF7B6B',
  accentYellow = '#FFE14D',
}: PageBackdropArtworkProps) {
  if (page === 1) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden select-none"
      >
        <svg
          viewBox="0 0 794 1123"
          width="794"
          height="1123"
          fill="none"
          className="w-full h-full"
        >
          {/* Soft sweeping mint wave beneath cover wave transition */}
          <path
            d="M0 296C155 272 288 340 472 336C620 332 720 298 794 278V354C695 358 560 384 395 370C215 354 105 328 0 340V296Z"
            fill="#C7F4F6"
            opacity="0.72"
          />
          <path
            d="M0 306C165 284 312 342 492 340C626 338 722 310 794 290V318C702 332 592 350 462 348C284 346 142 308 0 322V306Z"
            fill={accentTeal}
            opacity="0.58"
          />

          {/* Right-margin double wavy teal squiggle beside Skills */}
          <path
            d="M666 646C674 638 684 638 692 646C700 654 710 654 718 646C726 638 736 638 744 646"
            stroke={accentTeal}
            strokeWidth="4.2"
            strokeLinecap="round"
            opacity="0.88"
          />
          <path
            d="M666 660C674 652 684 652 692 660C700 668 710 668 718 660C726 652 736 652 744 660"
            stroke={accentTeal}
            strokeWidth="4.2"
            strokeLinecap="round"
            opacity="0.88"
          />

          {/* Paper-Cutout Corner Waves (Bottom-Left & Bottom-Right) */}
          <path
            d="M0 996C88 1004 162 1044 218 1123H0V996Z"
            fill="#D3F5F7"
            opacity="0.88"
          />
          <path
            d="M0 1044C66 1052 118 1078 156 1123H0V1044Z"
            fill={accentTeal}
            opacity="0.78"
          />

          <path
            d="M794 878C688 920 604 1004 544 1123H794V878Z"
            fill="#D8F5F8"
            opacity="0.85"
          />
          <path
            d="M794 942C702 982 632 1044 590 1123H638C680 1046 734 996 794 966V942Z"
            fill={accentTeal}
            opacity="0.78"
          />

          {/* Dimensional Dot Clusters */}
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2].map((col) => (
              <circle
                key={`p1-dot-r-${row}-${col}`}
                cx={732 + col * 15}
                cy={386 + row * 15}
                r="3.1"
                fill={accentTeal}
                opacity="0.56"
              />
            ))
          )}
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <circle
                key={`p1-dot-l-${row}-${col}`}
                cx={16 + col * 13}
                cy={820 + row * 13}
                r="2.8"
                fill="#93C5FD"
                opacity="0.62"
              />
            ))
          )}
        </svg>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden select-none"
    >
      <svg
        viewBox="0 0 794 1123"
        width="794"
        height="1123"
        fill="none"
        className="w-full h-full"
      >
        {/* Top-Right Layered Organic Coral, Yellow & Teal Corner Blobs */}
        <path
          d="M622 0H794V128C756 122 722 96 688 74C652 50 626 28 622 0Z"
          fill={accentCoral}
          opacity="0.9"
        />
        <path
          d="M578 0H664C654 24 636 42 612 46C588 50 572 28 578 0Z"
          fill={accentYellow}
          opacity="0.92"
        />
        <path
          d="M738 82C762 72 782 78 794 94V150C766 150 742 132 738 106C736 96 736 88 738 82Z"
          fill={accentTeal}
          opacity="0.78"
        />

        {/* Right Margin Dimensional Dot Grid */}
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2].map((col) => (
            <circle
              key={`p2-dot-r-${row}-${col}`}
              cx={734 + col * 14}
              cy={158 + row * 14}
              r="2.9"
              fill={accentTeal}
              opacity="0.52"
            />
          ))
        )}
      </svg>
    </div>
  );
}
