import { SAMPLE_JOURNALS } from '../data/presets';
import {
  exportFullBackupPayload,
  FullBackupPayload,
  mergeIntoStoresFromBackup,
  replaceAllStoresFromBackup,
} from '../db/storage';
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
  applyInspectedBackup,
  BackupSettingsSnapshot,
  buildBackupZipFromPayload,
  collectLocalStorageSettings,
  hashEntityCanonical,
  hashJournalCanonical,
  InspectedBackupArchive,
  loadSyncBaseline,
  recordSyncBaselineFromPayload,
  restoreLocalStorageSettings,
  SYNC_BASELINE_STORAGE_KEY,
  SyncBaselineEntry,
} from './backupService';

export type BackupImportMode = 'merge' | 'replace' | 'updates_only';

export type ConflictResolutionChoice =
  | 'unresolved'
  | 'keep-local'
  | 'use-incoming';

export interface MergeConflictItem {
  key: string;
  entityType: 'journal' | 'group';
  id: string;
  title: string;
  subtitle: string;
  localUpdatedAt: string;
  incomingUpdatedAt: string;
  changedAreas: string[];
  localRecord: JournalDocument | StudentGroup;
  incomingRecord: JournalDocument | StudentGroup;
}

export interface MergePreviewSummary {
  newCounts: {
    branches: number;
    groups: number;
    residents: number;
    journals: number;
    projects: number;
    images: number;
    templates: number;
    media: number;
    moduleLibrary: number;
    groupTemplates: number;
    total: number;
  };
  updatedCounts: {
    branches: number;
    groups: number;
    residents: number;
    journals: number;
    moduleLibrary: number;
    groupTemplates: number;
    total: number;
  };
  unchangedCount: number;
  conflictsCount: number;
  localOnlyPreservedCount: number;
}

export interface AnalyzedBackupImport {
  mode: BackupImportMode;
  inspected: InspectedBackupArchive;
  summary: MergePreviewSummary;
  conflicts: MergeConflictItem[];
  plan: {
    branchesToWrite: Branch[];
    groupsToWrite: StudentGroup[];
    residentsToWrite: ResidentRecord[];
    journalsToWrite: JournalDocument[];
    modulesToWrite: LibraryModule[];
    categoriesToWrite: ModuleCategoryConfig[];
    skillsToWrite: SkillDefinition[];
    groupTemplatesToWrite: GroupCurriculumTemplate[];
    templatesToWrite: JournalTemplate[];
    mediaToWrite: MediaAsset[];
    newLocalStorageEntries: Record<string, string>;
  };
}

export interface AutoSafetyBackupRecord {
  createdAt: string;
  filename: string;
  blob: Blob;
  payload: FullBackupPayload;
  settings: BackupSettingsSnapshot;
}

let lastAutoSafetyBackup: AutoSafetyBackupRecord | null = null;

export function getLastAutoSafetyBackup(): AutoSafetyBackupRecord | null {
  return lastAutoSafetyBackup;
}

export function clearLastAutoSafetyBackup(): void {
  lastAutoSafetyBackup = null;
}

const SAMPLE_JOURNAL_BASELINES: Record<string, SyncBaselineEntry> =
  Object.fromEntries(
    SAMPLE_JOURNALS.map((j) => [
      `journal:${j.id}`,
      {
        updatedAt: j.updatedAt,
        hash: hashJournalCanonical(j),
      },
    ])
  );

const DATA_IMAGE_RE = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i;

function collectDataImagesFromValue(
  value: unknown,
  out = new Set<string>()
): Set<string> {
  if (typeof value === 'string') {
    if (DATA_IMAGE_RE.test(value)) {
      out.add(value);
    }
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectDataImagesFromValue(item, out);
    return out;
  }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectDataImagesFromValue(v, out);
    }
  }
  return out;
}

function compareIsoTimestamps(a?: string, b?: string): number {
  const ta = a ? Date.parse(a) : NaN;
  const tb = b ? Date.parse(b) : NaN;
  if (Number.isFinite(ta) && Number.isFinite(tb)) {
    if (ta > tb) return 1;
    if (ta < tb) return -1;
    return 0;
  }
  if (Number.isFinite(ta) && !Number.isFinite(tb)) return 1;
  if (!Number.isFinite(ta) && Number.isFinite(tb)) return -1;
  return 0;
}

function describeJournalDifferences(
  local: JournalDocument,
  incoming: JournalDocument
): string[] {
  const areas: string[] = [];
  if (
    hashEntityCanonical(local.resident) !==
    hashEntityCanonical(incoming.resident)
  ) {
    areas.push('Данные резидента');
  }
  if (
    hashEntityCanonical(local.page1.modules) !==
    hashEntityCanonical(incoming.page1.modules)
  ) {
    areas.push('Модули');
  }
  if (
    hashEntityCanonical(local.page1.skills) !==
      hashEntityCanonical(incoming.page1.skills) ||
    hashEntityCanonical(local.page1.confirmedSkills) !==
      hashEntityCanonical(incoming.page1.confirmedSkills)
  ) {
    areas.push('Навыки');
  }
  if (
    hashEntityCanonical(local.page1.projects) !==
    hashEntityCanonical(incoming.page1.projects)
  ) {
    areas.push('Проекты');
  }
  if (
    hashEntityCanonical(local.page2.strengths) !==
      hashEntityCanonical(incoming.page2.strengths) ||
    local.page2.prideText !== incoming.page2.prideText
  ) {
    areas.push('Сильные стороны и гордость');
  }
  if (
    hashEntityCanonical(local.page2.mentorNote) !==
    hashEntityCanonical(incoming.page2.mentorNote)
  ) {
    areas.push('Письмо наставника');
  }
  if (
    hashEntityCanonical(local.page2.nextChapter) !==
    hashEntityCanonical(incoming.page2.nextChapter)
  ) {
    areas.push('Что впереди');
  }
  if (areas.length === 0) {
    areas.push('Оформление / статус');
  }
  return areas;
}

function describeGroupDifferences(
  local: StudentGroup,
  incoming: StudentGroup
): string[] {
  const areas: string[] = [];
  if (
    local.name !== incoming.name ||
    local.mentorName !== incoming.mentorName ||
    local.branchId !== incoming.branchId ||
    local.startDate !== incoming.startDate ||
    local.endDate !== incoming.endDate
  ) {
    areas.push('Параметры группы');
  }
  if (
    hashEntityCanonical(local.commonData) !==
    hashEntityCanonical(incoming.commonData)
  ) {
    areas.push('Общая программа группы');
  }
  if (areas.length === 0) {
    areas.push('Служебные поля');
  }
  return areas;
}

export async function analyzeBackupImport(
  inspected: InspectedBackupArchive,
  mode: BackupImportMode
): Promise<AnalyzedBackupImport> {
  const localPayload = await exportFullBackupPayload();
  const localSettings = collectLocalStorageSettings();
  const baseline = loadSyncBaseline();

  const localBranchById = new Map(
    (localPayload.branches ?? []).map((b) => [b.id, b])
  );
  const localGroupById = new Map(
    (localPayload.groups ?? []).map((g) => [g.id, g])
  );
  const localResidentById = new Map(
    (localPayload.residents ?? []).map((r) => [r.id, r])
  );
  const localJournalById = new Map(
    (localPayload.journals ?? []).map((j) => [j.id, j])
  );
  const localModuleById = new Map(
    (localPayload.moduleLibrary ?? []).map((m) => [m.id, m])
  );
  const localCategoryById = new Map(
    (localPayload.categories ?? []).map((c) => [c.id, c])
  );
  const localSkillById = new Map(
    (localPayload.skillsCatalog ?? []).map((s) => [s.id, s])
  );
  const localGroupTplById = new Map(
    (localPayload.groupTemplates ?? []).map((gt) => [gt.id, gt])
  );
  const localTemplateById = new Map(
    (localPayload.templates ?? [])
      .filter((t) => !t.isBuiltIn)
      .map((t) => [t.id, t])
  );
  const localMediaById = new Map(
    (localPayload.media ?? [])
      .filter((m) => !m.isBuiltIn)
      .map((m) => [m.id, m])
  );

  const localImages = collectDataImagesFromValue(localPayload);

  const incomingBranches = inspected.payload.branches ?? [];
  const incomingGroups = inspected.payload.groups ?? [];
  const incomingResidents = inspected.payload.residents ?? [];
  const incomingJournals = inspected.payload.journals ?? [];
  const incomingModules = inspected.payload.moduleLibrary ?? [];
  const incomingCategories = inspected.payload.categories ?? [];
  const incomingSkills = inspected.payload.skillsCatalog ?? [];
  const incomingGroupTemplates = inspected.payload.groupTemplates ?? [];
  const incomingTemplates = (inspected.payload.templates ?? []).filter(
    (t) => !t.isBuiltIn
  );
  const incomingMedia = (inspected.payload.media ?? []).filter(
    (m) => !m.isBuiltIn
  );

  const branchesToWrite: Branch[] = [];
  const groupsToWrite: StudentGroup[] = [];
  const residentsToWrite: ResidentRecord[] = [];
  const journalsToWrite: JournalDocument[] = [];
  const modulesToWrite: LibraryModule[] = [];
  const categoriesToWrite: ModuleCategoryConfig[] = [];
  const skillsToWrite: SkillDefinition[] = [];
  const groupTemplatesToWrite: GroupCurriculumTemplate[] = [];
  const templatesToWrite: JournalTemplate[] = [];
  const mediaToWrite: MediaAsset[] = [];
  const conflicts: MergeConflictItem[] = [];

  const newCounts = {
    branches: 0,
    groups: 0,
    residents: 0,
    journals: 0,
    projects: 0,
    images: 0,
    templates: 0,
    media: 0,
    moduleLibrary: 0,
    groupTemplates: 0,
    total: 0,
  };

  const updatedCounts = {
    branches: 0,
    groups: 0,
    residents: 0,
    journals: 0,
    moduleLibrary: 0,
    groupTemplates: 0,
    total: 0,
  };

  let unchangedCount = 0;

  if (mode === 'replace') {
    for (const b of incomingBranches) {
      const local = localBranchById.get(b.id);
      if (!local) newCounts.branches++;
      else if (hashEntityCanonical(local) === hashEntityCanonical(b))
        unchangedCount++;
      else updatedCounts.branches++;
      branchesToWrite.push(b);
    }
    for (const g of incomingGroups) {
      const local = localGroupById.get(g.id);
      if (!local) newCounts.groups++;
      else if (hashEntityCanonical(local) === hashEntityCanonical(g))
        unchangedCount++;
      else updatedCounts.groups++;
      groupsToWrite.push(g);
    }
    for (const r of incomingResidents) {
      const local = localResidentById.get(r.id);
      if (!local) newCounts.residents++;
      else if (hashEntityCanonical(local) === hashEntityCanonical(r))
        unchangedCount++;
      else updatedCounts.residents++;
      residentsToWrite.push(r);
    }
    for (const j of incomingJournals) {
      const local = localJournalById.get(j.id);
      if (!local) {
        newCounts.journals++;
        newCounts.projects += (j.page1?.projects ?? []).length;
      } else if (hashJournalCanonical(local) === hashJournalCanonical(j)) {
        unchangedCount++;
      } else {
        updatedCounts.journals++;
        const localProjIds = new Set(
          (local.page1?.projects ?? []).map((p) => p.id)
        );
        newCounts.projects += (j.page1?.projects ?? []).filter(
          (p) => !localProjIds.has(p.id)
        ).length;
      }
      journalsToWrite.push(j);
    }
    for (const t of incomingTemplates) {
      const local = localTemplateById.get(t.id);
      if (!local) newCounts.templates++;
      else if (hashEntityCanonical(local) === hashEntityCanonical(t))
        unchangedCount++;
      templatesToWrite.push(t);
    }
    for (const m of incomingMedia) {
      const local = localMediaById.get(m.id);
      if (!local) newCounts.media++;
      else if (hashEntityCanonical(local) === hashEntityCanonical(m))
        unchangedCount++;
      mediaToWrite.push(m);
    }
    for (const mod of incomingModules) {
      const local = localModuleById.get(mod.id);
      if (!local) newCounts.moduleLibrary++;
      else if (hashEntityCanonical(local) === hashEntityCanonical(mod))
        unchangedCount++;
      else updatedCounts.moduleLibrary++;
      modulesToWrite.push(mod);
    }
    for (const gt of incomingGroupTemplates) {
      const local = localGroupTplById.get(gt.id);
      if (!local) newCounts.groupTemplates++;
      else if (hashEntityCanonical(local) === hashEntityCanonical(gt))
        unchangedCount++;
      else updatedCounts.groupTemplates++;
      groupTemplatesToWrite.push(gt);
    }

    const incomingImages = collectDataImagesFromValue(inspected.payload);
    for (const img of incomingImages) {
      if (!localImages.has(img)) newCounts.images++;
    }

    newCounts.total =
      newCounts.branches +
      newCounts.groups +
      newCounts.residents +
      newCounts.journals +
      newCounts.templates +
      newCounts.media +
      newCounts.moduleLibrary +
      newCounts.groupTemplates;
    updatedCounts.total =
      updatedCounts.branches +
      updatedCounts.groups +
      updatedCounts.residents +
      updatedCounts.journals +
      updatedCounts.moduleLibrary +
      updatedCounts.groupTemplates;

    return {
      mode,
      inspected,
      summary: {
        newCounts,
        updatedCounts,
        unchangedCount,
        conflictsCount: 0,
        localOnlyPreservedCount: 0,
      },
      conflicts: [],
      plan: {
        branchesToWrite,
        groupsToWrite,
        residentsToWrite,
        journalsToWrite,
        modulesToWrite,
        categoriesToWrite: incomingCategories,
        skillsToWrite: incomingSkills,
        groupTemplatesToWrite,
        templatesToWrite,
        mediaToWrite,
        newLocalStorageEntries: inspected.settings.localStorage,
      },
    };
  }

  // Merge or updates_only mode
  const isUpdatesOnly = mode === 'updates_only';
  const importedMediaIds = new Set<string>();
  const importedDataObjects: unknown[] = [];

  // 1. Branches
  for (const incoming of incomingBranches) {
    const local = localBranchById.get(incoming.id);
    if (!local) {
      if (!isUpdatesOnly) {
        branchesToWrite.push(incoming);
        newCounts.branches++;
      }
      continue;
    }
    if (hashEntityCanonical(local) === hashEntityCanonical(incoming)) {
      unchangedCount++;
      continue;
    }
    if (compareIsoTimestamps(incoming.updatedAt, local.updatedAt) > 0) {
      branchesToWrite.push(incoming);
      updatedCounts.branches++;
    } else {
      unchangedCount++;
    }
  }

  // 2. Groups (with conflict detection on shared edits)
  const incomingGroupById = new Map(incomingGroups.map((g) => [g.id, g]));
  for (const incoming of incomingGroups) {
    const local = localGroupById.get(incoming.id);
    if (!local) {
      if (!isUpdatesOnly) {
        groupsToWrite.push(incoming);
        importedDataObjects.push(incoming);
        newCounts.groups++;
      }
      continue;
    }
    if (hashEntityCanonical(local) === hashEntityCanonical(incoming)) {
      unchangedCount++;
      continue;
    }

    const baseEntry = baseline[`group:${incoming.id}`];
    const localChanged = baseEntry
      ? hashEntityCanonical(local) !== baseEntry.hash
      : false;
    const incomingChanged = baseEntry
      ? hashEntityCanonical(incoming) !== baseEntry.hash
      : true;
    const timeDiff = compareIsoTimestamps(incoming.updatedAt, local.updatedAt);

    const isConflict =
      (baseEntry && localChanged && incomingChanged) ||
      timeDiff === 0 ||
      (!isUpdatesOnly && !baseEntry && timeDiff < 0);

    if (isConflict) {
      conflicts.push({
        key: `group:${incoming.id}`,
        entityType: 'group',
        id: incoming.id,
        title: `Группа: ${local.name}`,
        subtitle: `Наставник: ${local.mentorName || incoming.mentorName || 'не указан'}`,
        localUpdatedAt: local.updatedAt,
        incomingUpdatedAt: incoming.updatedAt,
        changedAreas: describeGroupDifferences(local, incoming),
        localRecord: local,
        incomingRecord: incoming,
      });
      continue;
    }

    if (timeDiff > 0 && (!baseEntry || !localChanged)) {
      groupsToWrite.push(incoming);
      importedDataObjects.push(incoming);
      updatedCounts.groups++;
    } else {
      unchangedCount++;
    }
  }

  // 3. Residents
  for (const incoming of incomingResidents) {
    const local = localResidentById.get(incoming.id);
    if (!local) {
      if (!isUpdatesOnly) {
        residentsToWrite.push(incoming);
        newCounts.residents++;
      }
      continue;
    }
    if (hashEntityCanonical(local) === hashEntityCanonical(incoming)) {
      unchangedCount++;
      continue;
    }
    if (compareIsoTimestamps(incoming.updatedAt, local.updatedAt) > 0) {
      residentsToWrite.push(incoming);
      updatedCounts.residents++;
    } else {
      unchangedCount++;
    }
  }

  // 4. Journals (core conflict-aware entity)
  for (const incoming of incomingJournals) {
    const local = localJournalById.get(incoming.id);
    if (!local) {
      if (!isUpdatesOnly) {
        journalsToWrite.push(incoming);
        importedDataObjects.push(incoming);
        newCounts.journals++;
        newCounts.projects += (incoming.page1?.projects ?? []).length;
        for (const mod of incoming.page1?.modules ?? []) {
          if (mod.imageMediaId) importedMediaIds.add(mod.imageMediaId);
        }
      }
      continue;
    }

    if (hashJournalCanonical(local) === hashJournalCanonical(incoming)) {
      unchangedCount++;
      continue;
    }

    const baseEntry =
      baseline[`journal:${incoming.id}`] ??
      SAMPLE_JOURNAL_BASELINES[`journal:${incoming.id}`];
    const localChanged = baseEntry
      ? hashJournalCanonical(local) !== baseEntry.hash
      : false;
    const incomingChanged = baseEntry
      ? hashJournalCanonical(incoming) !== baseEntry.hash
      : true;
    const timeDiff = compareIsoTimestamps(incoming.updatedAt, local.updatedAt);

    const isConflict =
      (baseEntry && localChanged && incomingChanged) ||
      timeDiff === 0 ||
      (!isUpdatesOnly && !baseEntry && timeDiff < 0);

    if (isConflict) {
      const grpName =
        localGroupById.get(local.groupId || '')?.name ||
        incomingGroupById.get(incoming.groupId || '')?.name ||
        'Без группы';
      conflicts.push({
        key: `journal:${incoming.id}`,
        entityType: 'journal',
        id: incoming.id,
        title: `Журнал: ${local.resident.fullName || incoming.resident.fullName}`,
        subtitle: `Группа: ${grpName} · ${local.resident.period || incoming.resident.period}`,
        localUpdatedAt: local.updatedAt,
        incomingUpdatedAt: incoming.updatedAt,
        changedAreas: describeJournalDifferences(local, incoming),
        localRecord: local,
        incomingRecord: incoming,
      });
      continue;
    }

    if (timeDiff > 0 && (!baseEntry || !localChanged)) {
      journalsToWrite.push(incoming);
      importedDataObjects.push(incoming);
      updatedCounts.journals++;
      const localProjIds = new Set(
        (local.page1?.projects ?? []).map((p) => p.id)
      );
      newCounts.projects += (incoming.page1?.projects ?? []).filter(
        (p) => !localProjIds.has(p.id)
      ).length;
      for (const mod of incoming.page1?.modules ?? []) {
        if (mod.imageMediaId) importedMediaIds.add(mod.imageMediaId);
      }
    } else {
      unchangedCount++;
    }
  }

  // 5. Module Library
  for (const incoming of incomingModules) {
    const local = localModuleById.get(incoming.id);
    if (!local) {
      if (!isUpdatesOnly) {
        modulesToWrite.push(incoming);
        importedDataObjects.push(incoming);
        newCounts.moduleLibrary++;
        if (incoming.imageMediaId) importedMediaIds.add(incoming.imageMediaId);
      }
      continue;
    }
    if (hashEntityCanonical(local) === hashEntityCanonical(incoming)) {
      unchangedCount++;
      continue;
    }
    if (compareIsoTimestamps(incoming.updatedAt, local.updatedAt) > 0) {
      modulesToWrite.push(incoming);
      importedDataObjects.push(incoming);
      updatedCounts.moduleLibrary++;
      if (incoming.imageMediaId) importedMediaIds.add(incoming.imageMediaId);
    } else {
      unchangedCount++;
    }
  }

  // 6. Group Curriculum Templates
  for (const incoming of incomingGroupTemplates) {
    const local = localGroupTplById.get(incoming.id);
    if (!local) {
      if (!isUpdatesOnly) {
        groupTemplatesToWrite.push(incoming);
        newCounts.groupTemplates++;
      }
      continue;
    }
    if (hashEntityCanonical(local) === hashEntityCanonical(incoming)) {
      unchangedCount++;
      continue;
    }
    if (compareIsoTimestamps(incoming.updatedAt, local.updatedAt) > 0) {
      groupTemplatesToWrite.push(incoming);
      updatedCounts.groupTemplates++;
    } else {
      unchangedCount++;
    }
  }

  // 7. Categories, Skills, Custom Templates (append new IDs only in merge mode, never duplicate)
  if (!isUpdatesOnly) {
    for (const cat of incomingCategories) {
      if (!localCategoryById.has(cat.id)) {
        categoriesToWrite.push(cat);
      } else {
        unchangedCount++;
      }
    }
    for (const skill of incomingSkills) {
      if (!localSkillById.has(skill.id)) {
        skillsToWrite.push(skill);
      } else {
        unchangedCount++;
      }
    }
    for (const tpl of incomingTemplates) {
      if (!localTemplateById.has(tpl.id)) {
        templatesToWrite.push(tpl);
        importedDataObjects.push(tpl);
        newCounts.templates++;
      } else {
        unchangedCount++;
      }
    }
  }

  // 8. Custom Media Assets (new media in merge mode, or referenced by updated records in updates_only mode)
  for (const asset of incomingMedia) {
    if (localMediaById.has(asset.id)) {
      unchangedCount++;
      continue;
    }
    if (!isUpdatesOnly || importedMediaIds.has(asset.id)) {
      mediaToWrite.push(asset);
      importedDataObjects.push(asset);
      newCounts.media++;
    }
  }

  // Count newly imported unique images (base64 data URLs not yet present locally)
  const incomingImages = collectDataImagesFromValue(importedDataObjects);
  for (const img of incomingImages) {
    if (!localImages.has(img)) {
      newCounts.images++;
    }
  }

  // Count local-only items preserved (never deleted)
  const incomingGroupIds = new Set(incomingGroups.map((g) => g.id));
  const incomingResidentIds = new Set(incomingResidents.map((r) => r.id));
  const incomingJournalIds = new Set(incomingJournals.map((j) => j.id));
  const localOnlyPreservedCount =
    (localPayload.groups ?? []).filter((g) => !incomingGroupIds.has(g.id))
      .length +
    (localPayload.residents ?? []).filter((r) => !incomingResidentIds.has(r.id))
      .length +
    (localPayload.journals ?? []).filter((j) => !incomingJournalIds.has(j.id))
      .length;

  // Settings (only add missing keys in merge mode, never overwrite existing settings)
  const newLocalStorageEntries: Record<string, string> = {};
  if (!isUpdatesOnly) {
    for (const [key, val] of Object.entries(
      inspected.settings.localStorage || {}
    )) {
      if (
        key !== SYNC_BASELINE_STORAGE_KEY &&
        !(key in localSettings.localStorage)
      ) {
        newLocalStorageEntries[key] = val;
      }
    }
  }

  newCounts.total =
    newCounts.branches +
    newCounts.groups +
    newCounts.residents +
    newCounts.journals +
    newCounts.templates +
    newCounts.media +
    newCounts.moduleLibrary +
    newCounts.groupTemplates;

  updatedCounts.total =
    updatedCounts.branches +
    updatedCounts.groups +
    updatedCounts.residents +
    updatedCounts.journals +
    updatedCounts.moduleLibrary +
    updatedCounts.groupTemplates;

  return {
    mode,
    inspected,
    summary: {
      newCounts,
      updatedCounts,
      unchangedCount,
      conflictsCount: conflicts.length,
      localOnlyPreservedCount,
    },
    conflicts,
    plan: {
      branchesToWrite,
      groupsToWrite,
      residentsToWrite,
      journalsToWrite,
      modulesToWrite,
      categoriesToWrite,
      skillsToWrite,
      groupTemplatesToWrite,
      templatesToWrite,
      mediaToWrite,
      newLocalStorageEntries,
    },
  };
}

export async function executeAnalyzedBackupImport(
  analysis: AnalyzedBackupImport,
  conflictChoices: Record<string, ConflictResolutionChoice> = {},
  options?: {
    beforeCommitHook?: () => Promise<void> | void;
  }
): Promise<{
  mode: BackupImportMode;
  appliedJournals: number;
  appliedGroups: number;
  resolvedIncomingConflicts: number;
  safetyBackup: AutoSafetyBackupRecord;
}> {
  if (analysis.mode !== 'replace') {
    for (const conflict of analysis.conflicts) {
      const choice = conflictChoices[conflict.key] ?? 'unresolved';
      if (choice === 'unresolved') {
        throw new Error(
          `Выберите версию для конфликта «${conflict.title}» перед подтверждением.`
        );
      }
    }
  }

  // Step 1: Automatically create a safety backup of the current database BEFORE any changes
  const preImportPayload = await exportFullBackupPayload();
  const preImportSettings = collectLocalStorageSettings();
  const safetyZip = await buildBackupZipFromPayload(
    preImportPayload,
    preImportSettings,
    'kiberone-auto-safety-backup'
  );
  const safetyBackup: AutoSafetyBackupRecord = {
    createdAt: new Date().toISOString(),
    filename: safetyZip.filename,
    blob: safetyZip.blob,
    payload: preImportPayload,
    settings: preImportSettings,
  };
  lastAutoSafetyBackup = safetyBackup;

  if (analysis.mode === 'replace') {
    try {
      if (options?.beforeCommitHook) {
        await options.beforeCommitHook();
      }
      const res = await applyInspectedBackup(analysis.inspected);
      return {
        mode: 'replace',
        appliedJournals: res.journalsCount,
        appliedGroups: (analysis.inspected.payload.groups ?? []).length,
        resolvedIncomingConflicts: 0,
        safetyBackup,
      };
    } catch (err) {
      await replaceAllStoresFromBackup(preImportPayload);
      restoreLocalStorageSettings(preImportSettings);
      throw err;
    }
  }

  // Merge / updates_only execution
  const finalBranches = [...analysis.plan.branchesToWrite];
  const finalGroups = [...analysis.plan.groupsToWrite];
  const finalResidents = [...analysis.plan.residentsToWrite];
  const finalJournals = [...analysis.plan.journalsToWrite];
  const finalMedia = [...analysis.plan.mediaToWrite];
  const incomingMediaById = new Map(
    (analysis.inspected.payload.media ?? [])
      .filter((m) => !m.isBuiltIn)
      .map((m) => [m.id, m])
  );
  const plannedMediaIds = new Set(finalMedia.map((m) => m.id));

  let resolvedIncomingConflicts = 0;
  for (const conflict of analysis.conflicts) {
    const choice = conflictChoices[conflict.key] ?? 'keep-local';
    if (choice !== 'use-incoming') continue;
    resolvedIncomingConflicts++;
    if (conflict.entityType === 'journal') {
      const incomingJournal = conflict.incomingRecord as JournalDocument;
      finalJournals.push(incomingJournal);
      for (const mod of incomingJournal.page1?.modules ?? []) {
        if (
          mod.imageMediaId &&
          !plannedMediaIds.has(mod.imageMediaId) &&
          incomingMediaById.has(mod.imageMediaId)
        ) {
          finalMedia.push(incomingMediaById.get(mod.imageMediaId)!);
          plannedMediaIds.add(mod.imageMediaId);
        }
      }
    } else if (conflict.entityType === 'group') {
      finalGroups.push(conflict.incomingRecord as StudentGroup);
    }
  }

  const mergePayload: Partial<FullBackupPayload> = {
    branches: finalBranches,
    groups: finalGroups,
    residents: finalResidents,
    journals: finalJournals,
    moduleLibrary: analysis.plan.modulesToWrite,
    categories: analysis.plan.categoriesToWrite,
    skillsCatalog: analysis.plan.skillsToWrite,
    groupTemplates: analysis.plan.groupTemplatesToWrite,
    templates: analysis.plan.templatesToWrite,
    media: finalMedia,
  };

  try {
    await mergeIntoStoresFromBackup(mergePayload);

    if (options?.beforeCommitHook) {
      await options.beforeCommitHook();
    }

    if (
      typeof window !== 'undefined' &&
      window.localStorage &&
      Object.keys(analysis.plan.newLocalStorageEntries).length > 0
    ) {
      for (const [k, v] of Object.entries(
        analysis.plan.newLocalStorageEntries
      )) {
        window.localStorage.setItem(k, v);
      }
    }

    // Update sync baseline for the post-merge state
    const mergedSnapshot = await exportFullBackupPayload();
    recordSyncBaselineFromPayload(mergedSnapshot);

    return {
      mode: analysis.mode,
      appliedJournals: finalJournals.length,
      appliedGroups: finalGroups.length,
      resolvedIncomingConflicts,
      safetyBackup,
    };
  } catch (err) {
    // Automatic recovery from pre-merge safety backup on any error
    await replaceAllStoresFromBackup(preImportPayload);
    restoreLocalStorageSettings(preImportSettings);
    recordSyncBaselineFromPayload(preImportPayload);
    throw err;
  }
}

export async function restoreFromLastAutoSafetyBackup(): Promise<boolean> {
  if (!lastAutoSafetyBackup) return false;
  await replaceAllStoresFromBackup(lastAutoSafetyBackup.payload);
  restoreLocalStorageSettings(lastAutoSafetyBackup.settings);
  recordSyncBaselineFromPayload(lastAutoSafetyBackup.payload);
  return true;
}
