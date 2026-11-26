/**
 * Rollback snapshot of Page 1 default dimensions from Task #41
 * (saved before applying Task #42 compact Page 1 defaults).
 */
export const PAGE1_PREVIOUS_SIZE_SNAPSHOT = {
  coverObjectDefaults: {
    logo: { x: 40, y: 24, width: 108, height: 58, zIndex: 22 },
    coverTitle: { x: 40, y: 104, width: 340, height: 58, zIndex: 22 },
    coverSubtitle: { x: 40, y: 170, width: 310, height: 32, zIndex: 22 },
    coverInfo: { x: 40, y: 234, width: 360, height: 54, zIndex: 24 },
    coverBubble: { x: 302, y: 14, width: 254, height: 74, zIndex: 28 },
    coverBear: { x: 524, y: 28, width: 246, height: 296, zIndex: 25 },
  },
  modulesGridMaxWidthPx: {
    count1: { ultra: 220, compact: 248, spacious: 272 },
    count2: { ultra: 456, compact: 492, spacious: 540 },
    count3: { ultra: 648, compact: 690, spacious: 714 },
    count4: { ultra: 424, compact: 464, spacious: 464 },
    count56: { ultra: 618, compact: 678, spacious: 678 },
  },
  projectsGridMaxWidthPx: {
    count1: { ultra: 228, compact: 264, spacious: 306 },
    count2: { ultra: 456, compact: 492, spacious: 540 },
    count3: { ultra: 648, compact: 690, spacious: 714 },
    count4: { ultra: 424, compact: 464, spacious: 464 },
    count56: { ultra: 618, compact: 678, spacious: 678 },
  },
  moduleImageHeightPx: {
    ultraLongDesc: 73,
    ultraDefault: 77,
    compactSingleRow: 122,
    compactMultiRow: 92,
    spaciousCount1: 156,
    spaciousCount2: 136,
    spaciousCount3: 114,
  },
  projectImageHeightPx: {
    ultraCount1: 124,
    ultraCount2or4: 85,
    ultraDefault: 83,
    compactCount1: 174,
    compactCount2: 156,
    compactCount3: 134,
    compactCount4: 106,
    compactCount56: 98,
    spaciousCount1: 180,
    spaciousCount2: 166,
    spaciousCount3: 142,
  },
  skillTag: {
    minWidth: 106,
    maxWidth: 171,
    minHeightUltra: 34,
    minHeightCompact: 36,
    minHeightSpacious: 38,
  },
} as const;
