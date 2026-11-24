import {
  DEFAULT_GROUP_TEMPLATES,
  KIBERONE_CURRICULUM_MODULES,
  MODULE_CATEGORIES,
  UNIFIED_SKILLS_CATALOG,
} from '../data/curriculumCatalog';
import {
  BUILTIN_MEDIA_ASSETS,
  SAMPLE_GROUPS,
  SAMPLE_JOURNALS,
  SAMPLE_RESIDENTS,
  SAMPLE_TEMPLATES,
} from '../data/presets';
import {
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

const DB_NAME = 'kiberone_student_journey_db';
const DB_VERSION = 3;

const STORE_JOURNALS = 'journals';
const STORE_MEDIA = 'media';
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
    request.onupgradeneeded = () => {
      const db = request.result;
      const stores = [
        STORE_JOURNALS,
        STORE_MEDIA,
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
  return {
    ...doc,
    status: doc.status || 'draft',
    page1: {
      ...p1,
      confirmedSkills,
      suggestedSkillsPool: p1.suggestedSkillsPool ?? [],
    },
  };
}

function normalizeLibraryModule(mod: LibraryModule): LibraryModule {
  return {
    ...mod,
    officialTitle: mod.officialTitle || mod.title,
    displayTitle: mod.displayTitle || mod.title,
    category: mod.category || 'algorithms',
    iconKey: mod.iconKey || 'blocks',
    visualMode: mod.visualMode || (mod.customImageUrl ? 'image' : 'illustration'),
    suggestedSkills: mod.suggestedSkills ?? [],
    relatedSkills: mod.relatedSkills ?? [],
    isActive: mod.isActive !== undefined ? mod.isActive : true,
    isEditable: mod.isEditable !== undefined ? mod.isEditable : true,
  };
}

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

export const saveJournal = (doc: JournalDocument) => putItem(STORE_JOURNALS, doc);
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
  return existing.sort(
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
  return existing.sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));
}

export const saveResident = (res: ResidentRecord) => putItem(STORE_RESIDENTS, res);
export const deleteResident = (id: string) => deleteItem(STORE_RESIDENTS, id);

// Module Library (with seamless v2 -> v3 catalog upgrade & non-destructive seeding)
const LEGACY_V2_STUB_IDS = new Set([
  'lib-kodu',
  'lib-python',
  'lib-animaker',
  'lib-blender',
  'lib-roblox',
  'lib-web',
]);

export async function getAllLibraryModules(): Promise<LibraryModule[]> {
  const existing = await readStore<LibraryModule>(STORE_MODULE_LIBRARY);
  if (existing.length === 0) {
    await Promise.all(
      KIBERONE_CURRICULUM_MODULES.map((m) => putItem(STORE_MODULE_LIBRARY, m))
    );
    return [...KIBERONE_CURRICULUM_MODULES];
  }

  // Upgrade from v2 stub seed or add missing official curriculum modules without overwriting user edits
  const existingIds = new Set(existing.map((m) => m.id));
  const isPureLegacyV2Seed = existing.every((m) => LEGACY_V2_STUB_IDS.has(m.id));
  const missingOfficial = KIBERONE_CURRICULUM_MODULES.filter(
    (m) => !existingIds.has(m.id)
  );

  if (isPureLegacyV2Seed) {
    await Promise.all([
      ...existing.map((m) => deleteItem(STORE_MODULE_LIBRARY, m.id)),
      ...KIBERONE_CURRICULUM_MODULES.map((m) => putItem(STORE_MODULE_LIBRARY, m)),
    ]);
    return [...KIBERONE_CURRICULUM_MODULES];
  }

  if (missingOfficial.length > 0) {
    await Promise.all(
      missingOfficial.map((m) => putItem(STORE_MODULE_LIBRARY, m))
    );
  }

  const merged = [...existing.map(normalizeLibraryModule), ...missingOfficial];
  return merged.sort((a, b) => {
    const codeA = a.code || 'M999';
    const codeB = b.code || 'M999';
    return codeA.localeCompare(codeB, 'ru');
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
  const existingIds = new Set(existing.map((c) => c.id));
  const missing = MODULE_CATEGORIES.filter((c) => !existingIds.has(c.id));
  if (missing.length > 0) {
    await Promise.all(missing.map((c) => putItem(STORE_MODULE_CATEGORIES, c)));
  }
  return [...existing, ...missing].sort((a, b) => a.order - b.order);
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
    version: 3,
    exportedAt: new Date().toISOString(),
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
