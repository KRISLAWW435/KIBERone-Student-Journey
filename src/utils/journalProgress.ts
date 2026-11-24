import { ASSETS, DESIGN_PALETTES } from '../data/presets';
import {
  Branch,
  ConfirmedResidentSkill,
  GroupCommonCurriculum,
  JournalDocument,
  JournalProgress,
  JournalProgressBlock,
  JournalProgressLevel,
  ResidentRecord,
  SkillDefinition,
  StudentGroup,
  StudentStatus,
} from '../types/journal';

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
  const hasProjects = visibleProjects.some(
    (p) =>
      (p.isRealScreenshot && Boolean(p.imageUrl)) ||
      (p.title.trim().length > 0 && p.description.trim().length > 8)
  );

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
      { id: 'nt-1', title: 'Разработка 3D-игр', iconKey: 'gamepad' },
      { id: 'nt-2', title: 'Продвинутый Python', iconKey: 'python' },
      { id: 'nt-3', title: '3D-моделирование', iconKey: 'cube3d' },
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
      decorElements: [],
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
      logoUrl: ASSETS.logo,
      showModules: true,
      modules: mappedModules,
      showSkills: true,
      skills: mappedSkills,
      confirmedSkills,
      suggestedSkillsPool: Array.from(
        new Set(mappedModules.flatMap((m) => m.suggestedSkills ?? []))
      ),
      showProjects: true,
      projects: [
        {
          id: `proj-${resident.id}-1`,
          title: '',
          caption: '',
          description: '',
          fallbackTheme: 'game3d',
          isRealScreenshot: false,
        },
        {
          id: `proj-${resident.id}-2`,
          title: '',
          caption: '',
          description: '',
          fallbackTheme: 'python',
          isRealScreenshot: false,
        },
      ],
      footerWebsite: '',
    },
    page2: {
      background: { color: palette.pageBg, showGrid: false, gridStyle: 'dots' },
      decorElements: [],
      objectLayouts: {},
      headerTitle: 'МОИ ДОСТИЖЕНИЯ',
      headerTealColor: palette.p2Teal,
      headerYellowColor: palette.p2Yellow,
      showHeaderDecor: true,
      showStrengths: true,
      strengthsColumns: 2,
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
        bearUrl: ASSETS.bearTablet,
        bearScale: 1,
        bearOffsetX: 0,
        bearOffsetY: 0,
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
      suggestedSkillsPool: Array.from(
        new Set(mergedModules.flatMap((m) => m.suggestedSkills ?? []))
      ),
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
