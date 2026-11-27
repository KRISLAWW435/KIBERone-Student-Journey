import {
  ASSETS,
  createDefaultPage2TapeElement,
  DEFAULT_PAGE1_DECOR_ELEMENTS,
  DEFAULT_PAGE2_DECOR_ELEMENTS,
  DEFAULT_SPEECH_BUBBLE_TEXT,
  DESIGN_PALETTES,
} from '../data/presets';
import {
  Branch,
  CanvasObjectTransform,
  ConfirmedResidentSkill,
  DecorElement,
  GroupCommonCurriculum,
  JournalDocument,
  JournalProgress,
  JournalProgressBlock,
  JournalProgressLevel,
  LibraryModule,
  ModuleItem,
  Page2SectionKey,
  ResidentRecord,
  SkillDefinition,
  StudentGroup,
  StudentStatus,
} from '../types/journal';

export const STRENGTH_EXAMPLE_MAX_CHARS = 180;
export const MENTOR_GREETING_MAX_CHARS = 60;
export const MENTOR_BODY_MAX_CHARS = 280;
export const MENTOR_SIGNATURE_MAX_CHARS = 50;
export const MAX_PAGE1_MODULES = 6;
export const MAX_PAGE1_PROJECTS = 6;
export const PAGE1_CARD_LIMIT_MESSAGE =
  'Достигнуто максимальное количество карточек для этой страницы. Удалите один из элементов или выберите наиболее значимые результаты';

export const DEFAULT_PAGE2_SECTION_ORDER: Page2SectionKey[] = [
  'strengths',
  'pride',
  'mentorNote',
  'nextChapter',
];

export function normalizePage2SectionOrder(
  order?: Page2SectionKey[]
): Page2SectionKey[] {
  if (!Array.isArray(order) || order.length === 0) {
    return [...DEFAULT_PAGE2_SECTION_ORDER];
  }
  const valid = order.filter((k): k is Page2SectionKey =>
    DEFAULT_PAGE2_SECTION_ORDER.includes(k)
  );
  const seen = new Set<Page2SectionKey>();
  const deduped: Page2SectionKey[] = [];
  for (const k of valid) {
    if (!seen.has(k)) {
      seen.add(k);
      deduped.push(k);
    }
  }
  for (const k of DEFAULT_PAGE2_SECTION_ORDER) {
    if (!seen.has(k)) {
      deduped.push(k);
    }
  }
  return deduped;
}

export function computeActiveModuleSuggestedSkillIds(
  modules: ModuleItem[],
  libraryModules: LibraryModule[] = []
): string[] {
  const seen = new Set<string>();
  modules.forEach((mod) => {
    if (mod.hidden) return;
    let rawIds = mod.suggestedSkills ?? [];
    if (rawIds.length === 0 && libraryModules.length > 0) {
      const lib =
        libraryModules.find((l) => mod.libraryModuleId && l.id === mod.libraryModuleId) ??
        libraryModules.find(
          (l) =>
            (l.officialTitle || l.title).trim().toLowerCase() ===
              (mod.officialTitle || mod.title).trim().toLowerCase() ||
            (l.shortTitle || l.displayTitle || '').trim().toLowerCase() ===
              mod.title.trim().toLowerCase()
        );
      if (lib?.suggestedSkills) {
        rawIds = lib.suggestedSkills;
      }
    }
    rawIds.forEach((sid) => {
      if (sid) seen.add(sid);
    });
  });
  return Array.from(seen);
}

export const UNIVERSAL_PRIDE_TEMPLATES: string[] = [
  'Уверенная защита собственного проекта перед группой',
  'Самостоятельный поиск и исправление ошибки в коде',
  'Сложный проект доведён до рабочего результата',
  'Активная помощь одногруппникам и уверенные ответы на вопросы',
];

const MODULE_PRIDE_TEMPLATE_RULES: Array<{
  keywords: string[];
  categories?: string[];
  templates: string[];
}> = [
  {
    keywords: ['python', 'pygame', 'turtle'],
    templates: [
      'Написан первый рабочий код на Python',
      'Среди результатов — собственная мини-игра на Python',
    ],
  },
  {
    keywords: ['roblox', 'роблокс'],
    templates: [
      'Создана собственная игровая карта в Roblox',
      'Самостоятельно настроены игровые механики и объекты в Roblox Studio',
    ],
  },
  {
    keywords: ['figma', 'дизайн', 'design', 'photoshop', 'blender', 'tinkercad', 'spline', 'aseprite'],
    categories: ['design-3d'],
    templates: [
      'Создан первый макет сайта в Figma',
      'Собрана авторская 3D-модель с продуманной композицией',
    ],
  },
  {
    keywords: ['minecraft', 'scratch', 'kodu', 'construct', 'godot', 'unity', 'unreal', 'геймдизайн'],
    categories: ['games'],
    templates: [
      'Создана собственная игра с уровнями и правилами',
      'Продумана и протестирована логика игровых персонажей',
    ],
  },
  {
    keywords: ['html', 'css', 'javascript', 'typescript', 'tilda', 'лендинг'],
    categories: ['web-mobile'],
    templates: [
      'Свёрстана и оформлена собственная веб-страница',
    ],
  },
  {
    keywords: ['ai', 'ии', 'нейросет', 'prompt', 'вайбкодинг', 'kodik'],
    categories: ['ai'],
    templates: [
      'Освоены нейросети и применены AI-инструменты в проекте',
    ],
  },
];

export function getPrideTemplatesForModules(modules: ModuleItem[]): string[] {
  const activeMods = modules.filter((m) => !m.hidden);
  const picked = new Set<string>();

  if (activeMods.length === 0) {
    // Общий список, если модули пока не выбраны
    [
      'Написан первый рабочий код на Python',
      'Среди результатов — собственная мини-игра',
      'Создана собственная игровая карта в Roblox',
      'Создан первый макет сайта в Figma',
      ...UNIVERSAL_PRIDE_TEMPLATES,
    ].forEach((t) => picked.add(t));
    return Array.from(picked);
  }

  activeMods.forEach((mod) => {
    const haystack = `${mod.libraryModuleId || ''} ${mod.officialTitle || ''} ${mod.title || ''} ${mod.subtitle || ''}`.toLowerCase();
    const cat = (mod.category || '').toLowerCase();
    MODULE_PRIDE_TEMPLATE_RULES.forEach((rule) => {
      const matchesKeyword = rule.keywords.some((kw) => haystack.includes(kw));
      const matchesCat = rule.categories?.some((c) => cat === c) ?? false;
      if (matchesKeyword || matchesCat) {
        rule.templates.forEach((t) => picked.add(t));
      }
    });
  });

  UNIVERSAL_PRIDE_TEMPLATES.forEach((t) => picked.add(t));
  return Array.from(picked);
}

export function formatRuDate(isoDate?: string): string {
  if (!isoDate) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (match) {
    return `${match[3]}.${match[2]}.${match[1]}`;
  }
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function formatGroupPeriod(startDate?: string, endDate?: string): string {
  const start = formatRuDate(startDate);
  const end = formatRuDate(endDate);
  if (start && end) return `с ${start} по ${end}`;
  if (start) return `с ${start}`;
  if (end) return `по ${end}`;
  return 'Учебный период';
}

export function normalizeStudentStatus(status: unknown): StudentStatus {
  if (status === 'paused') return 'paused';
  if (status === 'completed') return 'completed';
  if (status === 'dropped' || status === 'transferred') return 'paused';
  return 'active';
}

export function getStudentStatusLabel(status: StudentStatus | string): string {
  switch (normalizeStudentStatus(status)) {
    case 'active':
      return 'Активен';
    case 'paused':
      return 'На паузе';
    case 'completed':
      return 'Завершил курс';
  }
}

export function getStudentStatusMeta(status: StudentStatus | string): {
  status: StudentStatus;
  label: string;
  dotClass: string;
  badgeClass: string;
} {
  const normalized = normalizeStudentStatus(status);
  switch (normalized) {
    case 'active':
      return {
        status: 'active',
        label: 'Активен',
        dotClass: 'bg-emerald-500',
        badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    case 'paused':
      return {
        status: 'paused',
        label: 'На паузе',
        dotClass: 'bg-amber-400',
        badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    case 'completed':
      return {
        status: 'completed',
        label: 'Завершил курс',
        dotClass: 'bg-zinc-400',
        badgeClass: 'text-zinc-600 bg-zinc-100 border-zinc-200',
      };
  }
}

export function computeJournalProgress(doc: JournalDocument): JournalProgress {
  const nameClean = (doc.resident.fullName || '').trim();
  const hasProfile =
    nameClean.length > 1 &&
    nameClean.toLowerCase() !== 'новый резидент' &&
    Boolean((doc.resident.age || '').trim());

  const visibleModules = doc.page1.modules.filter((m) => !m.hidden);
  const visibleSkills = doc.page1.skills.filter((s) => !s.hidden);
  const skillsCount = Math.max(
    visibleSkills.length,
    doc.page1.confirmedSkills?.length ?? 0
  );
  const hasCurriculum = visibleModules.length > 0 && skillsCount > 0;

  const visibleProjects = doc.page1.projects.filter((p) => !p.hidden);
  const DEFAULT_PROJECT_TITLES = new Set([
    'мой первый проект',
    'учебный мини-проект',
    'учебный проект',
    'новый проект',
  ]);
  const DEFAULT_PROJECT_CAPTIONS = new Set([
    'игровая сцена и алгоритмы модуля',
    'практическая работа на занятии',
    'практическая работа на модуле',
    'самостоятельное задание в группе',
    'создание программы и тестирование',
    'подпись проекта',
  ]);
  const DEFAULT_PROJECT_DESCRIPTIONS = new Set([
    'создана собственная сцена и проверена логика работы.',
    'закрепление основных приёмов программирования.',
    'создание игровой сцены и проверка алгоритмов.',
    'закрепление основных навыков модуля.',
    'собственная игровая сцена и алгоритмы.',
    'закрепление ключевых навыков модуля.',
    'что было реализовано на занятии.',
  ]);
  const hasProjects = visibleProjects.some((p) => {
    if (p.isRealScreenshot && Boolean(p.imageUrl)) return true;
    const titleClean = (p.title || '').trim();
    const captionClean = (p.caption || '').trim();
    const descClean = (p.description || '').trim();
    const hasCustomTitle =
      titleClean.length > 1 &&
      !DEFAULT_PROJECT_TITLES.has(titleClean.toLowerCase());
    const hasCustomCaption =
      captionClean.length > 2 &&
      !DEFAULT_PROJECT_CAPTIONS.has(captionClean.toLowerCase());
    const hasCustomDesc =
      descClean.length > 8 &&
      !DEFAULT_PROJECT_DESCRIPTIONS.has(descClean.toLowerCase());
    return hasCustomTitle || hasCustomCaption || hasCustomDesc;
  });

  const visibleStrengths = doc.page2.strengths.filter((s) => !s.hidden);
  const hasPrideAndStrengths =
    doc.page2.prideText.trim().length > 10 && visibleStrengths.length > 0;

  const hasMentorNote =
    doc.page2.mentorNote.greeting.trim().length > 2 &&
    doc.page2.mentorNote.body.trim().length > 15;

  const blocks: JournalProgressBlock[] = [
    { id: 'profile', label: 'Имя и профиль ученика', completed: hasProfile },
    { id: 'curriculum', label: 'Модули и навыки группы', completed: hasCurriculum },
    { id: 'projects', label: 'Проекты и скриншоты', completed: hasProjects },
    { id: 'pride', label: 'Момент гордости и сильные стороны', completed: hasPrideAndStrengths },
    { id: 'mentorNote', label: 'Слово наставника', completed: hasMentorNote },
  ];

  const filledBlocks = blocks.filter((b) => b.completed).length;
  const totalBlocks = blocks.length;

  let statusLevel: JournalProgressLevel = 'not_started';
  if (filledBlocks === totalBlocks || doc.status === 'ready' || doc.status === 'exported') {
    statusLevel = 'ready';
  } else if (filledBlocks >= 2) {
    statusLevel = 'in_progress';
  }

  return {
    filledBlocks,
    totalBlocks,
    label: `Заполнено ${filledBlocks} из ${totalBlocks} блоков`,
    statusLevel,
    blocks,
  };
}

export function getBranchLabel(branch?: Branch): string {
  if (!branch) return 'Не указана';
  return branch.address ? `${branch.name} (${branch.address})` : branch.name;
}

export function buildDefaultCommonData(
  group: StudentGroup
): GroupCommonCurriculum {
  if (group.commonData) {
    return group.commonData;
  }
  return {
    paletteId: DESIGN_PALETTES[0].id,
    modules: [],
    skills: [],
    nextChapterTitle: 'Что интересного впереди?',
    nextChapterDescription: 'Тебя ждут новые интересные модули:',
    nextChapterTopics: [
      { id: 'nt-1', title: 'Python', iconKey: 'python' },
      { id: 'nt-2', title: 'Minecraft', iconKey: 'minecraft' },
      { id: 'nt-3', title: 'VR/AR', iconKey: 'vrar' },
    ],
  };
}

export function createStudentJournal(
  resident: ResidentRecord,
  group: StudentGroup,
  branch: Branch | undefined,
  _skillsCatalog: SkillDefinition[] = []
): JournalDocument {
  const now = new Date().toISOString();
  const common = buildDefaultCommonData(group);
  const palette =
    DESIGN_PALETTES.find((p) => p.id === common.paletteId) ?? DESIGN_PALETTES[0];
  const periodStr = formatGroupPeriod(group.startDate, group.endDate);
  const branchStr = branch ? branch.name : '';

  const mappedModules = common.modules.map((m, idx) => ({
    ...m,
    id: `mod-${resident.id}-${idx}-${Date.now()}`,
    order: idx + 1,
  }));

  const mappedSkills = common.skills.map((s, idx) => ({
    ...s,
    id: `sk-${resident.id}-${idx}-${Date.now()}`,
  }));

  const confirmedSkills: ConfirmedResidentSkill[] = mappedSkills.map((s) => ({
    id: s.id,
    skillId: s.skillId,
    label: s.label,
    bgColor: s.bgColor,
    status: s.status ?? 'independent',
    confirmedAt: now,
  }));

  const doc: JournalDocument = {
    id: resident.journalId || `journal-${resident.id}-${Date.now()}`,
    groupId: group.id,
    residentId: resident.id,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    resident: {
      fullName: resident.fullName,
      age: resident.age,
      ageCategory: resident.ageCategory || group.ageCategory,
      period: periodStr,
      mentorName: resident.mentorName || group.mentorName,
      branch: branchStr,
    },
    page1: {
      background: { color: palette.pageBg, showGrid: false, gridStyle: 'dots' },
      decorElements: DEFAULT_PAGE1_DECOR_ELEMENTS.map((d) => ({ ...d })),
      decorSeeded: true,
      objectLayouts: {},
      coverTitle: 'МОЙ ПУТЬ',
      coverSubtitle: 'в мире технологий',
      coverBgStart: palette.coverStart,
      coverBgEnd: palette.coverEnd,
      showAge: true,
      showBranch: Boolean(branchStr),
      showCoverBear: true,
      bearImageUrl: ASSETS.bearTablet,
      bearScale: 1,
      bearOffsetX: 0,
      bearOffsetY: 0,
      bearCropTop: true,
      coverSpeechBubbleText: DEFAULT_SPEECH_BUBBLE_TEXT,
      logoUrl: ASSETS.logo,
      showModules: true,
      modules: mappedModules,
      showSkills: true,
      skills: mappedSkills,
      confirmedSkills,
      suggestedSkillsPool: computeActiveModuleSuggestedSkillIds(mappedModules),
      showProjects: true,
      projects: [
        {
          id: `proj-${resident.id}-1`,
          title: 'Мой первый проект',
          caption: 'Игровая сцена и алгоритмы модуля',
          description: 'Создана собственная сцена и проверена логика работы.',
          fallbackTheme: 'game3d',
          isRealScreenshot: false,
        },
        {
          id: `proj-${resident.id}-2`,
          title: 'Учебный мини-проект',
          caption: 'Практическая работа на занятии',
          description: 'Закрепление основных приёмов программирования.',
          fallbackTheme: 'python',
          isRealScreenshot: false,
        },
      ],
      footerWebsite: '',
    },
    page2: {
      background: { color: palette.pageBg, showGrid: false, gridStyle: 'dots' },
      decorElements: [
        ...DEFAULT_PAGE2_DECOR_ELEMENTS.filter((d) => d.kind !== 'tape').map(
          (d) => ({ ...d })
        ),
        createDefaultPage2TapeElement(0),
      ],
      decorSeeded: true,
      tapeSeeded: true,
      objectLayouts: {},
      headerTitle: 'МОИ ДОСТИЖЕНИЯ',
      headerTealColor: palette.p2Teal,
      headerYellowColor: palette.p2Yellow,
      showHeaderDecor: true,
      showStrengths: true,
      strengthsColumns: 3,
      strengths: [],
      showPride: true,
      prideTitle: 'А вот чем ты можешь гордиться!',
      prideText: '',
      prideBgColor: palette.prideCoral,
      prideBearUrl: ASSETS.bearTrophy,
      prideBearScale: 1,
      prideBearOffsetX: 0,
      prideBearOffsetY: 0,
      showPrideConfetti: true,
      showMentorNote: true,
      mentorNote: {
        greeting: '',
        body: '',
        signature: group.mentorName
          ? `Твой наставник, ${group.mentorName.split(' ')[0]}`
          : '',
        observationsDraft: '',
        fontStyle: 'handwriting',
        fontSize: 19,
        tiltDeg: -1.2,
      },
      showNextChapter: true,
      nextChapter: {
        title: common.nextChapterTitle || 'Что интересного впереди?',
        description:
          common.nextChapterDescription || 'Тебя ждут новые интересные модули:',
        bgColor: palette.nextBg,
        topics: common.nextChapterTopics.map((t, i) => ({
          ...t,
          id: `nt-${resident.id}-${i}`,
        })),
        bearUrl: ASSETS.bearVr,
        bearScale: 1,
        bearOffsetX: 0,
        bearOffsetY: 0,
        bearVrMigrated: true,
      },
      footerWebsite: '',
    },
  };

  doc.completionProgress = computeJournalProgress(doc);
  return doc;
}

export function applyGroupCommonDataToJournal(
  existing: JournalDocument,
  group: StudentGroup,
  branch: Branch | undefined,
  common: GroupCommonCurriculum
): JournalDocument {
  const now = new Date().toISOString();
  const palette =
    DESIGN_PALETTES.find((p) => p.id === common.paletteId) ?? DESIGN_PALETTES[0];
  const periodStr = formatGroupPeriod(group.startDate, group.endDate);
  const branchStr = branch ? branch.name : existing.resident.branch;

  const existingGroupModules = existing.page1.modules.filter(
    (m) => !m.isIndividual
  );
  const existingIndividualModules = existing.page1.modules.filter(
    (m) => m.isIndividual
  );

  const syncedGroupModules = common.modules.map((m, idx) => {
    const match = existingGroupModules.find(
      (em) =>
        (m.libraryModuleId && em.libraryModuleId === m.libraryModuleId) ||
        em.title.trim().toLowerCase() === m.title.trim().toLowerCase()
    );
    return {
      ...m,
      id: match?.id || `mod-${existing.residentId || existing.id}-${idx}-${Date.now()}`,
      hidden: match?.hidden ?? false,
      isIndividual: false,
      order: idx + 1,
    };
  });

  const mergedModules = [
    ...syncedGroupModules,
    ...existingIndividualModules.map((m, idx) => ({
      ...m,
      order: syncedGroupModules.length + idx + 1,
    })),
  ];

  const existingGroupSkills = existing.page1.skills.filter(
    (s) => !s.isIndividual
  );
  const existingIndividualSkills = existing.page1.skills.filter(
    (s) => s.isIndividual
  );

  const syncedGroupSkills = common.skills.map((s, idx) => {
    const match = existingGroupSkills.find(
      (es) =>
        (s.skillId && es.skillId === s.skillId) ||
        es.label.trim().toLowerCase() === s.label.trim().toLowerCase()
    );
    return {
      ...s,
      id: match?.id || `sk-${existing.residentId || existing.id}-${idx}-${Date.now()}`,
      hidden: match?.hidden ?? false,
      status: match?.status ?? s.status ?? 'independent',
      isIndividual: false,
    };
  });

  const mergedSkills = [...syncedGroupSkills, ...existingIndividualSkills];

  const mappedConfirmed: ConfirmedResidentSkill[] = mergedSkills
    .filter((s) => !s.hidden)
    .map((s) => ({
      id: s.id,
      skillId: s.skillId,
      label: s.label,
      bgColor: s.bgColor,
      status: s.status ?? 'independent',
      confirmedAt: now,
    }));

  const updated: JournalDocument = {
    ...existing,
    groupId: group.id,
    updatedAt: now,
    resident: {
      ...existing.resident,
      ageCategory: group.ageCategory,
      period: periodStr,
      mentorName: group.mentorName || existing.resident.mentorName,
      branch: branchStr,
    },
    page1: {
      ...existing.page1,
      background: {
        ...(existing.page1.background ?? { showGrid: false, gridStyle: 'dots' }),
        color: palette.pageBg,
      },
      coverBgStart: palette.coverStart,
      coverBgEnd: palette.coverEnd,
      showBranch: Boolean(branchStr),
      showModules: mergedModules.length > 0 ? true : existing.page1.showModules,
      modules: mergedModules,
      showSkills: mergedSkills.length > 0 ? true : existing.page1.showSkills,
      skills: mergedSkills,
      confirmedSkills: mappedConfirmed,
      suggestedSkillsPool: computeActiveModuleSuggestedSkillIds(mergedModules),
    },
    page2: {
      ...existing.page2,
      background: {
        ...(existing.page2.background ?? { showGrid: false, gridStyle: 'dots' }),
        color: palette.pageBg,
      },
      headerTealColor: palette.p2Teal,
      headerYellowColor: palette.p2Yellow,
      prideBgColor: palette.prideCoral,
      nextChapter: {
        ...existing.page2.nextChapter,
        title: common.nextChapterTitle || existing.page2.nextChapter.title,
        description:
          common.nextChapterDescription ||
          existing.page2.nextChapter.description,
        bgColor: palette.nextBg,
        topics: common.nextChapterTopics.map((t, i) => ({
          ...t,
          id: `nt-${existing.id}-${i}`,
        })),
      },
    },
  };

  updated.completionProgress = computeJournalProgress(updated);
  return updated;
}

function cloneObjectLayouts(
  layouts?: Record<string, CanvasObjectTransform>
): Record<string, CanvasObjectTransform> {
  if (!layouts) return {};
  const result: Record<string, CanvasObjectTransform> = {};
  Object.entries(layouts).forEach(([key, val]) => {
    if (val) {
      result[key] = { ...val };
    }
  });
  return result;
}

function cloneDecorElements(elements?: DecorElement[]): DecorElement[] {
  if (!elements) return [];
  return elements.map((el) => ({ ...el }));
}

function findMatchingSourceModule(
  targetMod: ModuleItem,
  sourceModules: ModuleItem[]
): ModuleItem | undefined {
  if (targetMod.libraryModuleId) {
    const byLib = sourceModules.find(
      (sm) =>
        sm.libraryModuleId && sm.libraryModuleId === targetMod.libraryModuleId
    );
    if (byLib) return byLib;
  }
  const targetKey = (targetMod.officialTitle || targetMod.title || '')
    .trim()
    .toLowerCase();
  if (!targetKey) return undefined;
  return sourceModules.find(
    (sm) =>
      (sm.officialTitle || sm.title || '').trim().toLowerCase() === targetKey
  );
}

export function applyDesignSnapshotToJournal(
  target: JournalDocument,
  source: JournalDocument
): JournalDocument {
  const now = new Date().toISOString();

  // Preserve target's personal project transforms; copy fixed page1 layouts & remap matched module transforms
  const sourceLayouts1 = cloneObjectLayouts(source.page1.objectLayouts);
  const nextPage1Layouts: Record<string, CanvasObjectTransform> = {};
  Object.entries(sourceLayouts1).forEach(([key, val]) => {
    if (!key.startsWith('project-') && !key.startsWith('module-')) {
      nextPage1Layouts[key] = val;
    }
  });
  Object.entries(target.page1.objectLayouts ?? {}).forEach(([key, val]) => {
    if (key.startsWith('project-') && val) {
      nextPage1Layouts[key] = { ...val };
    }
  });

  // Transfer ONLY common illustration & display settings for matching module cards
  const updatedModules = target.page1.modules.map((targetMod) => {
    const matchedSource = findMatchingSourceModule(
      targetMod,
      source.page1.modules
    );
    if (!matchedSource) {
      return targetMod;
    }
    const sourceModTransform =
      sourceLayouts1[`module-${matchedSource.id}`];
    if (sourceModTransform) {
      nextPage1Layouts[`module-${targetMod.id}`] = { ...sourceModTransform };
    }
    return {
      ...targetMod,
      visualMode: matchedSource.visualMode,
      customImageUrl: matchedSource.customImageUrl,
      imageMediaId: matchedSource.imageMediaId,
      imageScale: matchedSource.imageScale,
      imagePosX: matchedSource.imagePosX,
      imagePosY: matchedSource.imagePosY,
      cardBgColor: matchedSource.cardBgColor,
      layoutVariant: matchedSource.layoutVariant,
      size: matchedSource.size,
    };
  });

  const updated: JournalDocument = {
    ...target,
    updatedAt: now,
    page1: {
      ...target.page1,
      background: source.page1.background
        ? { ...source.page1.background }
        : target.page1.background,
      decorElements: cloneDecorElements(source.page1.decorElements),
      decorSeeded: source.page1.decorSeeded ?? target.page1.decorSeeded,
      objectLayouts: nextPage1Layouts,
      coverTitle: source.page1.coverTitle,
      coverTitleSize: source.page1.coverTitleSize,
      coverTitleColor: source.page1.coverTitleColor,
      coverSubtitle: source.page1.coverSubtitle,
      coverSubtitleSize: source.page1.coverSubtitleSize,
      coverSubtitleColor: source.page1.coverSubtitleColor,
      coverBgStart: source.page1.coverBgStart,
      coverBgEnd: source.page1.coverBgEnd,
      showAge: source.page1.showAge,
      showBranch: source.page1.showBranch,
      showCoverBear: source.page1.showCoverBear,
      bearImageUrl: source.page1.bearImageUrl,
      bearScale: source.page1.bearScale,
      bearOffsetX: source.page1.bearOffsetX,
      bearOffsetY: source.page1.bearOffsetY,
      bearCropTop: source.page1.bearCropTop,
      coverSpeechBubbleText: source.page1.coverSpeechBubbleText,
      coverBubbleFontSize: source.page1.coverBubbleFontSize,
      coverBubbleTextColor: source.page1.coverBubbleTextColor,
      coverBubbleBgColor: source.page1.coverBubbleBgColor,
      logoUrl: source.page1.logoUrl,
      showModules: source.page1.showModules,
      modules: updatedModules,
      showSkills: source.page1.showSkills,
      showProjects: source.page1.showProjects,
      footerWebsite: source.page1.footerWebsite,
    },
    page2: {
      ...target.page2,
      background: source.page2.background
        ? { ...source.page2.background }
        : target.page2.background,
      decorElements: cloneDecorElements(source.page2.decorElements),
      decorSeeded: source.page2.decorSeeded ?? target.page2.decorSeeded,
      tapeSeeded: source.page2.tapeSeeded ?? target.page2.tapeSeeded,
      objectLayouts: cloneObjectLayouts(source.page2.objectLayouts),
      sectionOrder: source.page2.sectionOrder
        ? [...source.page2.sectionOrder]
        : target.page2.sectionOrder,
      headerTitle: source.page2.headerTitle,
      headerTealColor: source.page2.headerTealColor,
      headerYellowColor: source.page2.headerYellowColor,
      showHeaderDecor: source.page2.showHeaderDecor,
      showStrengths: source.page2.showStrengths,
      strengthsColumns: source.page2.strengthsColumns,
      showPride: source.page2.showPride,
      prideTitle: source.page2.prideTitle,
      prideBgColor: source.page2.prideBgColor,
      prideBearUrl: source.page2.prideBearUrl,
      prideBearScale: source.page2.prideBearScale,
      prideBearOffsetX: source.page2.prideBearOffsetX,
      prideBearOffsetY: source.page2.prideBearOffsetY,
      showPrideConfetti: source.page2.showPrideConfetti,
      showMentorNote: source.page2.showMentorNote,
      mentorNote: {
        ...target.page2.mentorNote,
        fontStyle: source.page2.mentorNote.fontStyle,
        fontSize: source.page2.mentorNote.fontSize,
        tiltDeg: source.page2.mentorNote.tiltDeg,
        mentorPhotoUrl: source.page2.mentorNote.mentorPhotoUrl,
      },
      showNextChapter: source.page2.showNextChapter,
      nextChapter: {
        ...target.page2.nextChapter,
        bgColor: source.page2.nextChapter.bgColor,
        bearUrl: source.page2.nextChapter.bearUrl,
        bearScale: source.page2.nextChapter.bearScale,
        bearOffsetX: source.page2.nextChapter.bearOffsetX,
        bearOffsetY: source.page2.nextChapter.bearOffsetY,
        speechBubbleText: source.page2.nextChapter.speechBubbleText,
        bearVrMigrated: source.page2.nextChapter.bearVrMigrated,
        showDecor: source.page2.nextChapter.showDecor,
        showRouteLine: source.page2.nextChapter.showRouteLine,
      },
      footerWebsite: source.page2.footerWebsite,
    },
  };

  updated.completionProgress = computeJournalProgress(updated);
  return updated;
}

export function getJournalDesignSignature(doc: JournalDocument): string {
  return JSON.stringify({
    p1: {
      background: doc.page1.background ?? null,
      decorElements: doc.page1.decorElements ?? [],
      objectLayouts: doc.page1.objectLayouts ?? {},
      coverTitleSize: doc.page1.coverTitleSize ?? null,
      coverTitleColor: doc.page1.coverTitleColor ?? null,
      coverSubtitleSize: doc.page1.coverSubtitleSize ?? null,
      coverSubtitleColor: doc.page1.coverSubtitleColor ?? null,
      coverBgStart: doc.page1.coverBgStart,
      coverBgEnd: doc.page1.coverBgEnd,
      showAge: doc.page1.showAge,
      showBranch: doc.page1.showBranch,
      showCoverBear: doc.page1.showCoverBear,
      bearImageUrl: doc.page1.bearImageUrl,
      bearScale: doc.page1.bearScale,
      bearOffsetX: doc.page1.bearOffsetX,
      bearOffsetY: doc.page1.bearOffsetY,
      bearCropTop: doc.page1.bearCropTop,
      coverBubbleFontSize: doc.page1.coverBubbleFontSize ?? null,
      coverBubbleTextColor: doc.page1.coverBubbleTextColor ?? null,
      coverBubbleBgColor: doc.page1.coverBubbleBgColor ?? null,
      logoUrl: doc.page1.logoUrl,
      showModules: doc.page1.showModules,
      showSkills: doc.page1.showSkills,
      showProjects: doc.page1.showProjects,
      moduleVisuals: doc.page1.modules.map((m) => ({
        id: m.id,
        visualMode: m.visualMode,
        customImageUrl: m.customImageUrl ?? null,
        imageMediaId: m.imageMediaId ?? null,
        imageScale: m.imageScale ?? 1,
        imagePosX: m.imagePosX ?? 0,
        imagePosY: m.imagePosY ?? 0,
        cardBgColor: m.cardBgColor ?? null,
        layoutVariant: m.layoutVariant ?? 'classic',
        size: m.size ?? 'normal',
      })),
    },
    p2: {
      background: doc.page2.background ?? null,
      decorElements: doc.page2.decorElements ?? [],
      objectLayouts: doc.page2.objectLayouts ?? {},
      sectionOrder: doc.page2.sectionOrder ?? null,
      headerTealColor: doc.page2.headerTealColor,
      headerYellowColor: doc.page2.headerYellowColor,
      showHeaderDecor: doc.page2.showHeaderDecor,
      showStrengths: doc.page2.showStrengths,
      strengthsColumns: doc.page2.strengthsColumns,
      showPride: doc.page2.showPride,
      prideBgColor: doc.page2.prideBgColor,
      prideBearUrl: doc.page2.prideBearUrl,
      prideBearScale: doc.page2.prideBearScale,
      prideBearOffsetX: doc.page2.prideBearOffsetX,
      prideBearOffsetY: doc.page2.prideBearOffsetY,
      showPrideConfetti: doc.page2.showPrideConfetti,
      showMentorNote: doc.page2.showMentorNote,
      mentorNoteStyle: {
        fontStyle: doc.page2.mentorNote.fontStyle,
        fontSize: doc.page2.mentorNote.fontSize,
        tiltDeg: doc.page2.mentorNote.tiltDeg,
        mentorPhotoUrl: doc.page2.mentorNote.mentorPhotoUrl ?? null,
      },
      showNextChapter: doc.page2.showNextChapter,
      nextChapterStyle: {
        bgColor: doc.page2.nextChapter.bgColor,
        bearUrl: doc.page2.nextChapter.bearUrl,
        bearScale: doc.page2.nextChapter.bearScale,
        bearOffsetX: doc.page2.nextChapter.bearOffsetX,
        bearOffsetY: doc.page2.nextChapter.bearOffsetY,
        showDecor: doc.page2.nextChapter.showDecor ?? true,
        showRouteLine: doc.page2.nextChapter.showRouteLine ?? true,
      },
    },
  });
}

export function hasJournalDesignChanged(
  prev: JournalDocument,
  next: JournalDocument
): boolean {
  return getJournalDesignSignature(prev) !== getJournalDesignSignature(next);
}

