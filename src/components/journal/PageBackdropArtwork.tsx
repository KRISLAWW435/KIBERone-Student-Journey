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
  accentYellow = '#FFE14D',
  accentCoral = '#FF7B6B',
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
          {/* Top-edge sweeping turquoise & mint wave band below cover transition */}
          <path
            d="M0 296C155 272 288 344 472 340C620 336 720 302 794 282V358C695 362 560 390 395 376C215 360 105 332 0 344V296Z"
            fill="#C7F4F6"
            opacity="0.72"
          />
          <path
            d="M0 306C165 284 312 346 492 344C626 342 722 314 794 294V322C702 336 592 356 462 354C284 352 142 312 0 326V306Z"
            fill={accentTeal}
            opacity="0.65"
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

          {/* Bottom-left organic teal & mint wave accents */}
          <path
            d="M0 996C88 1004 162 1044 218 1123H0V996Z"
            fill="#D3F5F7"
            opacity="0.85"
          />
          <path
            d="M0 1044C66 1052 118 1078 156 1123H0V1044Z"
            fill={accentTeal}
            opacity="0.72"
          />
          <path
            d="M174 1123C144 1072 86 1032 0 1018"
            stroke="#1E293B"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.28"
          />

          {/* Bottom-right sweeping teal ribbon waves matching reference */}
          <path
            d="M794 878C688 920 604 1004 544 1123H794V878Z"
            fill="#D8F5F8"
            opacity="0.82"
          />
          <path
            d="M794 942C702 982 632 1044 590 1123H638C680 1046 734 996 794 966V942Z"
            fill={accentTeal}
            opacity="0.72"
          />
          <path
            d="M794 904C708 946 636 1016 572 1123"
            stroke="#1E293B"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.24"
          />

          {/* Decorative 5-point Yellow Stars */}
          <path
            d="M368 310L372.8 320.6L384.4 322L375.8 329.8L378.2 341.2L368 335.4L357.8 341.2L360.2 329.8L351.6 322L363.2 320.6L368 310Z"
            fill={accentYellow}
          />
          <path
            d="M578 820L583.4 831.8L596.2 833.4L586.8 842.2L589.4 854.8L578 848.4L566.6 854.8L569.2 842.2L559.8 833.4L572.6 831.8L578 820Z"
            fill={accentYellow}
          />
          <path
            d="M46 604L49.4 611.6L57.6 612.6L51.5 618.2L53.2 626.4L46 622.3L38.8 626.4L40.5 618.2L34.4 612.6L42.6 611.6L46 604Z"
            fill={accentYellow}
            opacity="0.9"
          />

          {/* 4-point Sparkles & Diamonds */}
          <path
            d="M456 640L459 647L466 650L459 653L456 660L453 653L446 650L453 647L456 640Z"
            fill={accentTeal}
          />
          <path
            d="M726 300L729 306L735 309L729 312L726 318L723 312L717 309L723 306L726 300Z"
            fill={accentTeal}
          />
          <path
            d="M346 1084L352 1090L346 1096L340 1090L346 1084Z"
            fill={accentTeal}
          />
          <path
            d="M510 832L514 836L510 840L506 836L510 832Z"
            fill={accentCoral}
            opacity="0.85"
          />

          {/* Crisp Margin Dot Grid Cluster (Top-right body corner & Left margin) */}
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2].map((col) => (
              <circle
                key={`p1-dot-r-${row}-${col}`}
                cx={732 + col * 15}
                cy={386 + row * 15}
                r="2.8"
                fill={accentTeal}
                opacity="0.48"
              />
            ))
          )}
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <circle
                key={`p1-dot-l-${row}-${col}`}
                cx={20 + col * 13}
                cy={820 + row * 13}
                r="2.4"
                fill="#93C5FD"
                opacity="0.55"
              />
            ))
          )}

          {/* Small Geometric Circles & Triangles in White Space */}
          <circle cx="426" cy="836" r="4.5" fill="#FDE047" opacity="0.85" />
          <circle cx="748" cy="842" r="4" fill={accentCoral} opacity="0.7" />
          <circle cx="24" cy="378" r="5" fill={accentYellow} opacity="0.75" />
          <polygon
            points="698,1084 708,1098 690,1098"
            fill={accentYellow}
            opacity="0.82"
          />
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
        {/* Top-Right Layered Organic Coral, Yellow & Teal Corner Blobs (Reference 2) */}
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

        {/* Top-Left Corner Stars, Sparkles & Confetti Flecks (Reference 2) */}
        <path
          d="M52 34L56.6 44L67.6 45.2L59.4 52.6L61.6 63.4L52 57.9L42.4 63.4L44.6 52.6L36.4 45.2L47.4 44L52 34Z"
          fill={accentYellow}
        />
        <path
          d="M150 28L153.2 35.4L160.6 38.6L153.2 41.8L150 49.2L146.8 41.8L139.4 38.6L146.8 35.4L150 28Z"
          fill={accentTeal}
        />
        <path
          d="M122 60L128 66L122 72L116 66L122 60Z"
          fill="#8B5CF6"
          opacity="0.7"
        />
        <circle cx="96" cy="36" r="3.5" fill={accentCoral} opacity="0.85" />

        {/* Top-Right Sparkles & Stars around Header */}
        <path
          d="M666 56L670.4 65.4L680.6 66.6L673 73.6L675 83.6L666 78.6L657 83.6L659 73.6L651.4 66.6L661.6 65.4L666 56Z"
          fill={accentYellow}
        />
        <path
          d="M708 62L711.2 69.2L718.4 72.4L711.2 75.6L708 82.8L704.8 75.6L697.6 72.4L704.8 69.2L708 62Z"
          fill="#818CF8"
          opacity="0.8"
        />

        {/* Right Margin Dot Grid near Strengths / Middle Spread */}
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2].map((col) => (
            <circle
              key={`p2-dot-r-${row}-${col}`}
              cx={734 + col * 14}
              cy={158 + row * 14}
              r="2.6"
              fill={accentTeal}
              opacity="0.45"
            />
          ))
        )}

        {/* Whitespace Accents Between Strengths & Middle Spread */}
        <path
          d="M446 392L450 401L459 405L450 409L446 418L442 409L433 405L442 401L446 392Z"
          fill="#BAE6FD"
        />
        <circle cx="386" cy="404" r="4" fill={accentYellow} opacity="0.8" />
        <circle cx="24" cy="482" r="5" fill="#99F6E4" opacity="0.85" />
        <path
          d="M18 672C24 664 32 664 38 672C44 680 52 680 58 672"
          stroke={accentTeal}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Left-margin geometric triangle & dots */}
        <polygon
          points="20,250 31,264 14,268"
          fill={accentYellow}
          opacity="0.82"
        />
        <circle cx="770" cy="596" r="4.5" fill={accentCoral} opacity="0.55" />
        <path
          d="M764 636L770 642L764 648L758 642L764 636Z"
          fill={accentTeal}
          opacity="0.65"
        />

        {/* Bottom-Left Subtle Geometric Line Accent Behind Notebook */}
        <path
          d="M178 1123L204 1044"
          stroke="#6366F1"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.28"
        />
        <path
          d="M0 912C34 926 52 962 40 1004C28 1046 0 1068 0 1068V912Z"
          fill="#E0F2FE"
          opacity="0.7"
        />

        {/* Bottom-Right Warm Sunny-Yellow Organic Corner Blob & Accent Arc (Reference 2) */}
        <path
          d="M524 1123C558 1068 620 1034 692 1018C738 1008 772 982 794 944V1123H524Z"
          fill={accentYellow}
          opacity="0.88"
        />
        <path
          d="M652 1123C688 1086 738 1064 794 1062V1123H652Z"
          fill={accentCoral}
          opacity="0.22"
        />
        <circle cx="482" cy="1096" r="4.5" fill={accentTeal} opacity="0.75" />
      </svg>
    </div>
  );
}
