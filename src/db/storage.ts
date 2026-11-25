import {
  DEFAULT_GROUP_TEMPLATES,
  getModuleAgeGroups,
  KIBERONE_CURRICULUM_MODULES,
  MODULE_CATEGORIES,
  UNIFIED_SKILLS_CATALOG,
} from '../data/curriculumCatalog';
import {
  ASSETS,
  BUILTIN_MEDIA_ASSETS,
  createDefaultPage2TapeElement,
  DEFAULT_BRANCHES,
  DEFAULT_PAGE1_DECOR_ELEMENTS,
  DEFAULT_PAGE2_DECOR_ELEMENTS,
  DEFAULT_SPEECH_BUBBLE_TEXT,
  SAMPLE_GROUPS,
  SAMPLE_JOURNALS,
  SAMPLE_RESIDENTS,
  SAMPLE_TEMPLATES,
} from '../data/presets';
import {
  Branch,
  GroupCurriculumTemplate,
  JournalDocument,
  JournalTemplate,
  LibraryModule,
  MediaAsset,
  ModuleCategoryConfig,
  ResidentRecord,
  SkillDefinition,
  StudentGroup,
} from '../types/journal';
import {
  computeJournalProgress,
  formatGroupPeriod,
  normalizeStudentStatus,
} from '../utils/journalProgress';

const DB_NAME = 'kiberone_student_journey_db';
const DB_VERSION = 7;

const STORE_JOURNALS = 'journals';
const STORE_MEDIA = 'media';
const STORE_BRANCHES = 'branches';
const STORE_GROUPS = 'groups';
const STORE_RESIDENTS = 'residents';
const STORE_MODULE_LIBRARY = 'moduleLibrary';
const STORE_TEMPLATES = 'templates';
const STORE_SKILL_LIBRARY = 'skillsLibrary';
const STORE_MODULE_CATEGORIES = 'moduleCategories';
const STORE_GROUP_TEMPLATES = 'groupTemplates';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (event.oldVersion > 0 && event.oldVersion < 7) {
        for (const resetStore of [
          STORE_MODULE_LIBRARY,
          STORE_MODULE_CATEGORIES,
          STORE_GROUP_TEMPLATES,
        ]) {
          if (db.objectStoreNames.contains(resetStore)) {
            db.deleteObjectStore(resetStore);
          }
        }
      }
      const stores = [
        STORE_JOURNALS,
        STORE_MEDIA,
        STORE_BRANCHES,
        STORE_GROUPS,
        STORE_RESIDENTS,
        STORE_MODULE_LIBRARY,
        STORE_TEMPLATES,
        STORE_SKILL_LIBRARY,
        STORE_MODULE_CATEGORIES,
        STORE_GROUP_TEMPLATES,
      ];
      for (const name of stores) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('Не удалось открыть IndexedDB'));
  });
}

async function readStore<T>(storeName: string): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve((req.result as T[]) || []);
    req.onerror = () => reject(req.error);
  });
}

async function putItem<T>(storeName: string, item: T): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteItem(storeName: string, id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function stripLegacyQuarterText(value?: string): string {
  if (!value) return '';
  if (/квартал|q[1-4]\b/i.test(value)) {
    return 'с 01.09.2026 по 25.12.2026';
  }
  return value;
}

function normalizeJournal(doc: JournalDocument): JournalDocument {
  const p1 = doc.page1;
  const hasConfirmed = Array.isArray(p1.confirmedSkills);
  const confirmedSkills = hasConfirmed
    ? p1.confirmedSkills!
    : p1.skills.map((s) => ({
        id: s.id,
        skillId: s.skillId,
        label: s.label,
        bgColor: s.bgColor,
        status: s.status ?? ('independent' as const),
        confirmedAt: doc.updatedAt || doc.createdAt,
      }));
  const cleanBranch = (doc.resident.branch || '').includes('кампус') ||
    (doc.resident.branch || '').includes('Адрес 1')
    ? 'Локация 1'
    : (doc.resident.branch || '').includes('Северный филиал') ||
      (doc.resident.branch || '').includes('Адрес 2')
    ? 'Локация 2'
    : doc.resident.branch;

  const starterProjects =
    Array.isArray(p1.projects) && p1.projects.length > 0
      ? p1.projects
      : [
          {
            id: `proj-norm-${doc.id}-1`,
            title: 'Мой первый проект',
            caption: 'Практическая работа на модуле',
            description: 'Создание игровой сцены и проверка алгоритмов.',
            fallbackTheme: 'game3d' as const,
            isRealScreenshot: false,
          },
          {
            id: `proj-norm-${doc.id}-2`,
            title: 'Учебный мини-проект',
            caption: 'Самостоятельное задание в группе',
            description: 'Закрепление основных навыков модуля.',
            fallbackTheme: 'python' as const,
            isRealScreenshot: false,
          },
        ];

  const p1HasDecor =
    Array.isArray(p1.decorElements) && p1.decorElements.length > 0;
  const p1DecorElements =
    !p1.decorSeeded && !p1HasDecor
      ? DEFAULT_PAGE1_DECOR_ELEMENTS.map((d) => ({ ...d }))
      : p1.decorElements ?? [];

  const p2HasDecor =
    Array.isArray(doc.page2.decorElements) &&
    doc.page2.decorElements.length > 0;
  let p2DecorElements =
    !doc.page2.decorSeeded && !p2HasDecor
      ? DEFAULT_PAGE2_DECOR_ELEMENTS.map((d) => ({ ...d }))
      : doc.page2.decorElements ?? [];

  const visibleStrengthsCount = (doc.page2.strengths ?? []).filter(
    (s) => !s.hidden
  ).length;
  if (
    !doc.page2.tapeSeeded &&
    !p2DecorElements.some((d) => d.kind === 'tape')
  ) {
    p2DecorElements = [
      ...p2DecorElements,
      createDefaultPage2TapeElement(visibleStrengthsCount),
    ];
  }

  const nextChapterRaw = doc.page2.nextChapter;
  const shouldMigrateVrBear =
    !nextChapterRaw.bearUrl ||
    nextChapterRaw.bearUrl === ASSETS.bearTablet ||
    nextChapterRaw.bearUrl === '/assets/bear_vr.png';

  const resolvedCoverBubble =
    p1.coverSpeechBubbleText !== undefined
      ? p1.coverSpeechBubbleText
      : nextChapterRaw.speechBubbleText !== undefined
      ? nextChapterRaw.speechBubbleText
      : DEFAULT_SPEECH_BUBBLE_TEXT;

  const normalizedModules = (p1.modules ?? []).map((mod) => {
    const official = mod.libraryModuleId
      ? OFFICIAL_MODULE_BY_ID.get(mod.libraryModuleId)
      : undefined;
    const hasUserUploadedImg =
      Boolean(mod.imageMediaId) ||
      Boolean(
        mod.customImageUrl && !mod.customImageUrl.startsWith('/assets/modules/')
      );
    const resolvedCustomImageUrl = hasUserUploadedImg
      ? mod.customImageUrl
      : official?.customImageUrl ?? mod.customImageUrl;
    return {
      ...mod,
      visualMode: 'image' as const,
      customImageUrl: resolvedCustomImageUrl,
    };
  });

  const normalized: JournalDocument = {
    ...doc,
    status: doc.status || 'draft',
    resident: {
      ...doc.resident,
      branch: cleanBranch,
      period: stripLegacyQuarterText(doc.resident.period),
    },
    page1: {
      ...p1,
      modules: normalizedModules,
      decorElements: p1DecorElements,
      decorSeeded: true,
      coverSpeechBubbleText: resolvedCoverBubble,
      showProjects: p1.showProjects !== false,
      projects: starterProjects,
      footerWebsite: '',
      confirmedSkills,
      suggestedSkillsPool: p1.suggestedSkillsPool ?? [],
    },
    page2: {
      ...doc.page2,
      decorElements: p2DecorElements,
      decorSeeded: true,
      tapeSeeded: true,
      footerWebsite: '',
      mentorNote: {
        ...doc.page2.mentorNote,
        greeting: (doc.page2.mentorNote.greeting || '').replace(
          /в этом квартале/gi,
          'за этот период обучения'
        ),
      },
      nextChapter: {
        ...nextChapterRaw,
        bearUrl: shouldMigrateVrBear ? ASSETS.bearVr : nextChapterRaw.bearUrl,
        bearVrMigrated: true,
      },
    },
  };
  normalized.completionProgress = computeJournalProgress(normalized);
  return normalized;
}

function normalizeGroup(grp: StudentGroup & { defaultPeriod?: string }): StudentGroup {
  const startDate = grp.startDate || '2026-09-01';
  const endDate = grp.endDate || '2026-12-25';
  const branchId = grp.branchId || DEFAULT_BRANCHES[0].id;
  const { defaultPeriod: _legacy, ...rest } = grp;
  return {
    ...rest,
    branchId,
    startDate,
    endDate,
  };
}

function normalizeResident(
  res: ResidentRecord & { branch?: string; period?: string }
): ResidentRecord {
  const status = normalizeStudentStatus(
    res.status || (res.archived ? 'paused' : 'active')
  );
  const branchId = res.branchId || DEFAULT_BRANCHES[0].id;
  return {
    id: res.id,
    groupId: res.groupId,
    fullName: res.fullName,
    age: res.age,
    ageCategory: res.ageCategory,
    mentorName: res.mentorName,
    branchId,
    status,
    archived: status !== 'active',
    journalId: res.journalId,
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
  };
}

function normalizeLibraryModule(mod: LibraryModule): LibraryModule {
  const legacy = mod as LibraryModule & {
    code?: string;
    ageCategories?: unknown;
  };
  const { code: _removedCode, ageCategories: _removedAgeCats, ...clean } = legacy;
  const shortTitle = clean.shortTitle || clean.displayTitle || clean.title;
  const officialTitle = clean.officialTitle || clean.title || shortTitle;
  const category = clean.category || clean.categoryId || 'algorithms';
  const cleanedCustomUrl = clean.customImageUrl || undefined;
  const illustrationType = 'image' as const;
  const illustrationValue = cleanedCustomUrl || clean.illustrationValue || '';
  const ageGroups = getModuleAgeGroups({
    ...clean,
    shortTitle,
    officialTitle,
    title: officialTitle,
    category,
    categoryId: category,
    ageGroups: clean.ageGroups ?? [],
    illustrationType,
    illustrationValue,
  } as LibraryModule);

  return {
    ...clean,
    officialTitle,
    displayTitle: shortTitle,
    shortTitle,
    title: officialTitle,
    category,
    categoryId: category,
    ageGroups,
    illustrationType,
    illustrationValue,
    customImageUrl: cleanedCustomUrl,
    visualMode: 'image',
    suggestedSkills: clean.suggestedSkills ?? [],
    relatedSkills: clean.relatedSkills ?? [],
    isActive: clean.isActive !== undefined ? clean.isActive : true,
    isEditable: clean.isEditable !== undefined ? clean.isEditable : true,
  };
}

// Branches
function normalizeBranch(branch: Branch): Branch {
  if (
    branch.id === 'branch-1' &&
    (branch.name.includes('кампус') ||
      branch.name.includes('Адрес 1') ||
      branch.address === 'ул. Ленина, 45')
  ) {
    return {
      ...branch,
      name: 'Локация 1',
      address: 'ул. Победы, 53, оф. 22',
    };
  }
  if (
    branch.id === 'branch-2' &&
    (branch.name.includes('Северный филиал') ||
      branch.name.includes('Адрес 2') ||
      branch.address === 'пр. Мира, 112')
  ) {
    return {
      ...branch,
      name: 'Локация 2',
      address: 'просп. 50 лет Октября, 54',
    };
  }
  return branch;
}

export async function getAllBranches(): Promise<Branch[]> {
  const existing = await readStore<Branch>(STORE_BRANCHES);
  if (existing.length === 0) {
    await Promise.all(DEFAULT_BRANCHES.map((b) => putItem(STORE_BRANCHES, b)));
    return [...DEFAULT_BRANCHES];
  }
  const normalized = existing.map(normalizeBranch);
  const changed = normalized.filter(
    (b, idx) =>
      b.name !== existing[idx].name || b.address !== existing[idx].address
  );
  if (changed.length > 0) {
    await Promise.all(changed.map((b) => putItem(STORE_BRANCHES, b)));
  }
  return normalized.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export const saveBranch = (branch: Branch) => putItem(STORE_BRANCHES, branch);
export const deleteBranch = (id: string) => deleteItem(STORE_BRANCHES, id);

// Journals
export async function getAllJournals(): Promise<JournalDocument[]> {
  const existing = await readStore<JournalDocument>(STORE_JOURNALS);
  if (existing.length === 0) {
    await Promise.all(SAMPLE_JOURNALS.map((j) => putItem(STORE_JOURNALS, j)));
    return [...SAMPLE_JOURNALS]
      .map(normalizeJournal)
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }
  return existing
    .map(normalizeJournal)
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export const saveJournal = (doc: JournalDocument) => {
  const stamped: JournalDocument = {
    ...doc,
    completionProgress: computeJournalProgress(doc),
  };
  return putItem(STORE_JOURNALS, stamped);
};
export const deleteJournal = (id: string) => deleteItem(STORE_JOURNALS, id);

// Media
export async function getAllMediaAssets(): Promise<MediaAsset[]> {
  const custom = await readStore<MediaAsset>(STORE_MEDIA);
  return [
    ...BUILTIN_MEDIA_ASSETS,
    ...custom.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  ];
}

export const saveMediaAsset = (asset: MediaAsset) => putItem(STORE_MEDIA, asset);
export const deleteMediaAsset = (id: string) => deleteItem(STORE_MEDIA, id);

// Groups
export async function getAllGroups(): Promise<StudentGroup[]> {
  const existing = await readStore<StudentGroup>(STORE_GROUPS);
  if (existing.length === 0) {
    await Promise.all(SAMPLE_GROUPS.map((g) => putItem(STORE_GROUPS, g)));
    return [...SAMPLE_GROUPS];
  }
  return existing
    .map(normalizeGroup)
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export const saveGroup = (group: StudentGroup) => putItem(STORE_GROUPS, group);
export const deleteGroup = (id: string) => deleteItem(STORE_GROUPS, id);

// Residents
export async function getAllResidents(): Promise<ResidentRecord[]> {
  const existing = await readStore<ResidentRecord>(STORE_RESIDENTS);
  if (existing.length === 0) {
    await Promise.all(SAMPLE_RESIDENTS.map((r) => putItem(STORE_RESIDENTS, r)));
    return [...SAMPLE_RESIDENTS];
  }
  return existing
    .map(normalizeResident)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));
}

export const saveResident = (res: ResidentRecord) => putItem(STORE_RESIDENTS, res);
export const deleteResident = (id: string) => deleteItem(STORE_RESIDENTS, id);

// Module Library
const LEGACY_V2_STUB_IDS = new Set([
  'lib-kodu',
  'lib-python',
  'lib-animaker',
  'lib-blender',
  'lib-roblox',
  'lib-web',
]);

const OFFICIAL_MODULE_ORDER = new Map(
  KIBERONE_CURRICULUM_MODULES.map((m, idx) => [m.id, idx])
);
const OFFICIAL_MODULE_BY_ID = new Map(
  KIBERONE_CURRICULUM_MODULES.map((m) => [m.id, m])
);

function normalizeModuleTitleKey(value?: string): string {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

const OFFICIAL_MODULE_BY_TITLE = new Map<string, LibraryModule>();
KIBERONE_CURRICULUM_MODULES.forEach((m) => {
  OFFICIAL_MODULE_BY_TITLE.set(normalizeModuleTitleKey(m.officialTitle), m);
  OFFICIAL_MODULE_BY_TITLE.set(normalizeModuleTitleKey(m.title), m);
});

function sameStringArray(a?: string[], b?: string[]): boolean {
  const arrA = a ?? [];
  const arrB = b ?? [];
  if (arrA.length !== arrB.length) return false;
  return arrA.every((val, idx) => val === arrB[idx]);
}

function isObsoleteBuiltinModule(raw: LibraryModule): boolean {
  if (LEGACY_V2_STUB_IDS.has(raw.id)) return true;
  if (raw.createdAt === '2026-09-01T10:00:00.000Z') return true;
  if (raw.id.startsWith('module-') && !/^module-\d+$/.test(raw.id)) return true;
  if (raw.createdAt && raw.createdAt < '2026-11-25T18:00:00.000Z' && !/^module-\d+$/.test(raw.id)) {
    return true;
  }
  return false;
}

export async function getAllLibraryModules(): Promise<LibraryModule[]> {
  const existing = await readStore<LibraryModule>(STORE_MODULE_LIBRARY);
  if (existing.length === 0) {
    await Promise.all(
      KIBERONE_CURRICULUM_MODULES.map((m) => putItem(STORE_MODULE_LIBRARY, m))
    );
    return [...KIBERONE_CURRICULUM_MODULES];
  }

  const isPureLegacyV2Seed = existing.every((m) => LEGACY_V2_STUB_IDS.has(m.id));
  if (isPureLegacyV2Seed) {
    await Promise.all([
      ...existing.map((m) => deleteItem(STORE_MODULE_LIBRARY, m.id)),
      ...KIBERONE_CURRICULUM_MODULES.map((m) => putItem(STORE_MODULE_LIBRARY, m)),
    ]);
    return [...KIBERONE_CURRICULUM_MODULES];
  }

  const idsToDelete: string[] = [];
  const modulesToSave = new Map<string, LibraryModule>();
  const resolvedById = new Map<string, LibraryModule>();

  for (const raw of existing) {
    const rawAny = raw as LibraryModule & { code?: string };
    const matchedOfficial =
      OFFICIAL_MODULE_BY_ID.get(raw.id) ??
      OFFICIAL_MODULE_BY_TITLE.get(
        normalizeModuleTitleKey(raw.officialTitle || raw.title)
      ) ??
      OFFICIAL_MODULE_BY_TITLE.get(normalizeModuleTitleKey(raw.title));

    if (matchedOfficial) {
      if (raw.id !== matchedOfficial.id) {
        idsToDelete.push(raw.id);
      }

      const hasUserCustomImg =
        Boolean(raw.imageMediaId) ||
        Boolean(
          raw.customImageUrl && !raw.customImageUrl.startsWith('/assets/modules/')
        );

      const needsCatalogReplace =
        raw.id !== matchedOfficial.id ||
        'code' in rawAny ||
        !Array.isArray(rawAny.ageGroups) ||
        rawAny.ageGroups.length === 0 ||
        !sameStringArray(rawAny.ageGroups, matchedOfficial.ageGroups) ||
        !sameStringArray(
          rawAny.filterCategories,
          matchedOfficial.filterCategories
        ) ||
        raw.title !== matchedOfficial.title ||
        raw.officialTitle !== matchedOfficial.officialTitle ||
        raw.shortTitle !== matchedOfficial.shortTitle ||
        raw.displayTitle !== matchedOfficial.displayTitle ||
        raw.category !== matchedOfficial.category ||
        raw.categoryId !== matchedOfficial.categoryId ||
        raw.description !== matchedOfficial.description ||
        raw.badgeLabel !== matchedOfficial.badgeLabel ||
        (!hasUserCustomImg &&
          (raw.illustrationValue !== matchedOfficial.illustrationValue ||
            raw.customImageUrl !== matchedOfficial.customImageUrl ||
            raw.visualMode !== matchedOfficial.visualMode)) ||
        raw.updatedAt !== matchedOfficial.updatedAt;

      if (needsCatalogReplace) {
        const synced: LibraryModule = {
          ...matchedOfficial,
          imageMediaId: raw.imageMediaId ?? matchedOfficial.imageMediaId,
          customImageUrl: hasUserCustomImg
            ? raw.customImageUrl
            : matchedOfficial.customImageUrl,
          illustrationValue: hasUserCustomImg
            ? raw.customImageUrl || ''
            : matchedOfficial.illustrationValue,
          visualMode: 'image',
          cardBgColor: raw.cardBgColor || matchedOfficial.cardBgColor,
          accentColor: raw.cardBgColor || matchedOfficial.accentColor,
          isActive:
            raw.isActive !== undefined ? raw.isActive : matchedOfficial.isActive,
        };
        resolvedById.set(synced.id, synced);
        modulesToSave.set(synced.id, synced);
      } else {
        resolvedById.set(raw.id, raw);
      }
      continue;
    }

    if (isObsoleteBuiltinModule(raw)) {
      idsToDelete.push(raw.id);
      continue;
    }

    const normalized = normalizeLibraryModule(raw);
    if ('code' in rawAny || !Array.isArray(rawAny.ageGroups)) {
      modulesToSave.set(normalized.id, normalized);
    }
    resolvedById.set(normalized.id, normalized);
  }

  for (const official of KIBERONE_CURRICULUM_MODULES) {
    if (!resolvedById.has(official.id)) {
      resolvedById.set(official.id, official);
      modulesToSave.set(official.id, official);
    }
  }

  if (idsToDelete.length > 0 || modulesToSave.size > 0) {
    await Promise.all([
      ...idsToDelete.map((id) => deleteItem(STORE_MODULE_LIBRARY, id)),
      ...Array.from(modulesToSave.values()).map((m) =>
        putItem(STORE_MODULE_LIBRARY, m)
      ),
    ]);
  }

  const merged = Array.from(resolvedById.values());
  return merged.sort((a, b) => {
    const orderA = OFFICIAL_MODULE_ORDER.get(a.id);
    const orderB = OFFICIAL_MODULE_ORDER.get(b.id);
    if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
    if (orderA !== undefined) return -1;
    if (orderB !== undefined) return 1;
    return (a.officialTitle || a.title).localeCompare(
      b.officialTitle || b.title,
      'ru'
    );
  });
}

export const saveLibraryModule = (mod: LibraryModule) =>
  putItem(STORE_MODULE_LIBRARY, mod);
export const deleteLibraryModule = (id: string) =>
  deleteItem(STORE_MODULE_LIBRARY, id);

// Module Categories
export async function getAllCategories(): Promise<ModuleCategoryConfig[]> {
  const existing = await readStore<ModuleCategoryConfig>(STORE_MODULE_CATEGORIES);
  if (existing.length === 0) {
    await Promise.all(
      MODULE_CATEGORIES.map((c) => putItem(STORE_MODULE_CATEGORIES, c))
    );
    return [...MODULE_CATEGORIES];
  }

  const officialById = new Map(MODULE_CATEGORIES.map((c) => [c.id, c]));
  const existingById = new Map(existing.map((c) => [c.id, c]));
  const toSave: ModuleCategoryConfig[] = [];
  const toDelete: string[] = [];
  const resolved: ModuleCategoryConfig[] = [];

  for (const cat of existing) {
    const official = officialById.get(cat.id);
    if (official) {
      if (
        cat.name !== official.name ||
        cat.shortName !== official.shortName ||
        cat.description !== official.description ||
        cat.accentColor !== official.accentColor ||
        cat.order !== official.order
      ) {
        toSave.push(official);
        resolved.push(official);
      } else {
        resolved.push(cat);
      }
    } else if (cat.isBuiltIn || !cat.id.startsWith('cat-')) {
      toDelete.push(cat.id);
    } else {
      resolved.push(cat);
    }
  }

  for (const official of MODULE_CATEGORIES) {
    if (!existingById.has(official.id)) {
      toSave.push(official);
      resolved.push(official);
    }
  }

  if (toDelete.length > 0 || toSave.length > 0) {
    await Promise.all([
      ...toDelete.map((id) => deleteItem(STORE_MODULE_CATEGORIES, id)),
      ...toSave.map((c) => putItem(STORE_MODULE_CATEGORIES, c)),
    ]);
  }

  return resolved.sort((a, b) => a.order - b.order);
}

export const saveCategory = (cat: ModuleCategoryConfig) =>
  putItem(STORE_MODULE_CATEGORIES, cat);
export const deleteCategory = (id: string) =>
  deleteItem(STORE_MODULE_CATEGORIES, id);

// Unified Skills Directory
export async function getAllSkillsCatalog(): Promise<SkillDefinition[]> {
  const existing = await readStore<SkillDefinition>(STORE_SKILL_LIBRARY);
  if (existing.length === 0) {
    await Promise.all(
      UNIFIED_SKILLS_CATALOG.map((s) => putItem(STORE_SKILL_LIBRARY, s))
    );
    return [...UNIFIED_SKILLS_CATALOG];
  }
  const existingIds = new Set(existing.map((s) => s.id));
  const missing = UNIFIED_SKILLS_CATALOG.filter((s) => !existingIds.has(s.id));
  if (missing.length > 0) {
    await Promise.all(missing.map((s) => putItem(STORE_SKILL_LIBRARY, s)));
  }
  return [...existing, ...missing];
}

export const saveSkillDefinition = (skill: SkillDefinition) =>
  putItem(STORE_SKILL_LIBRARY, skill);
export const deleteSkillDefinition = (id: string) =>
  deleteItem(STORE_SKILL_LIBRARY, id);

// Group Curriculum Templates
export async function getAllGroupTemplates(): Promise<GroupCurriculumTemplate[]> {
  const existing = await readStore<GroupCurriculumTemplate>(STORE_GROUP_TEMPLATES);
  if (existing.length === 0) {
    await Promise.all(
      DEFAULT_GROUP_TEMPLATES.map((t) => putItem(STORE_GROUP_TEMPLATES, t))
    );
    return [...DEFAULT_GROUP_TEMPLATES];
  }
  return existing.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export const saveGroupTemplate = (tpl: GroupCurriculumTemplate) =>
  putItem(STORE_GROUP_TEMPLATES, tpl);
export const deleteGroupTemplate = (id: string) =>
  deleteItem(STORE_GROUP_TEMPLATES, id);

// Journal Templates
export async function getAllTemplates(): Promise<JournalTemplate[]> {
  const custom = await readStore<JournalTemplate>(STORE_TEMPLATES);
  return [...SAMPLE_TEMPLATES, ...custom];
}

export const saveTemplate = (tpl: JournalTemplate) =>
  putItem(STORE_TEMPLATES, tpl);
export const deleteTemplate = (id: string) => deleteItem(STORE_TEMPLATES, id);

export interface FullBackupPayload {
  version: number;
  exportedAt: string;
  branches?: Branch[];
  journals: JournalDocument[];
  groups: StudentGroup[];
  residents: ResidentRecord[];
  moduleLibrary: LibraryModule[];
  categories?: ModuleCategoryConfig[];
  skillsCatalog?: SkillDefinition[];
  groupTemplates?: GroupCurriculumTemplate[];
  templates: JournalTemplate[];
  media: MediaAsset[];
}

export async function exportFullBackupPayload(): Promise<FullBackupPayload> {
  const [
    branches,
    journals,
    groups,
    residents,
    moduleLibrary,
    categories,
    skillsCatalog,
    groupTemplates,
    customTemplates,
    customMedia,
  ] = await Promise.all([
    getAllBranches(),
    getAllJournals(),
    getAllGroups(),
    getAllResidents(),
    getAllLibraryModules(),
    getAllCategories(),
    getAllSkillsCatalog(),
    getAllGroupTemplates(),
    readStore<JournalTemplate>(STORE_TEMPLATES),
    readStore<MediaAsset>(STORE_MEDIA),
  ]);

  return {
    version: 7,
    exportedAt: new Date().toISOString(),
    branches,
    journals,
    groups,
    residents,
    moduleLibrary,
    categories,
    skillsCatalog,
    groupTemplates,
    templates: customTemplates,
    media: customMedia,
  };
}

export async function restoreFullBackupPayload(
  payload: Partial<FullBackupPayload>
): Promise<{ journalsCount: number }> {
  const journals = Array.isArray(payload.journals) ? payload.journals : [];
  await Promise.all([
    ...(Array.isArray(payload.branches)
      ? payload.branches.map((b) => putItem(STORE_BRANCHES, b))
      : []),
    ...journals.map((j) => putItem(STORE_JOURNALS, j)),
    ...(Array.isArray(payload.groups)
      ? payload.groups.map((g) => putItem(STORE_GROUPS, g))
      : []),
    ...(Array.isArray(payload.residents)
      ? payload.residents.map((r) => putItem(STORE_RESIDENTS, r))
      : []),
    ...(Array.isArray(payload.moduleLibrary)
      ? payload.moduleLibrary.map((m) => putItem(STORE_MODULE_LIBRARY, m))
      : []),
    ...(Array.isArray(payload.categories)
      ? payload.categories.map((c) => putItem(STORE_MODULE_CATEGORIES, c))
      : []),
    ...(Array.isArray(payload.skillsCatalog)
      ? payload.skillsCatalog.map((s) => putItem(STORE_SKILL_LIBRARY, s))
      : []),
    ...(Array.isArray(payload.groupTemplates)
      ? payload.groupTemplates.map((gt) => putItem(STORE_GROUP_TEMPLATES, gt))
      : []),
    ...(Array.isArray(payload.templates)
      ? payload.templates
          .filter((t) => !t.isBuiltIn)
          .map((t) => putItem(STORE_TEMPLATES, t))
      : []),
    ...(Array.isArray(payload.media)
      ? payload.media
          .filter((m) => !m.isBuiltIn)
          .map((m) => putItem(STORE_MEDIA, m))
      : []),
  ]);
  return { journalsCount: journals.length };
}

export { formatGroupPeriod };
