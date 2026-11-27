import 'fake-indexeddb/auto';
import JSZip from 'jszip';
import { beforeEach, describe, expect, it } from 'vitest';
import { DESIGN_PALETTES } from '../../data/presets';
import {
  clearAllDatabaseStores,
  getAllBranches,
  getAllGroups,
  getAllJournals,
  getAllMediaAssets,
  getAllResidents,
  saveBranch,
  saveGroup,
  saveJournal,
  saveMediaAsset,
  saveResident,
} from '../../db/storage';
import {
  Branch,
  JournalDocument,
  MediaAsset,
  ResidentRecord,
  StudentGroup,
} from '../../types/journal';
import {
  analyzeBackupImport,
  clearLastAutoSafetyBackup,
  executeAnalyzedBackupImport,
  getLastAutoSafetyBackup,
  restoreFromLastAutoSafetyBackup,
} from '../backupMerge';
import {
  buildBackupZipFromPayload,
  createBackupZipBlob,
  inspectBackupFile,
  SYNC_BASELINE_STORAGE_KEY,
} from '../backupService';
import { createStudentJournal } from '../journalProgress';

const PNG_A =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const PNG_B =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNk+M9QzwAEjDAGACCKAoFF72wPAAAAAElFTkSuQmCC';

function setupMockLocalStorage() {
  const store = new Map<string, string>();
  const mockLocalStorage = {
    get length() {
      return store.size;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
  Object.defineProperty(globalThis, 'window', {
    value: { localStorage: mockLocalStorage },
    configurable: true,
    writable: true,
  });
  return store;
}

function makeFixture(
  suffix: string,
  updatedAt = '2026-11-20T10:00:00.000Z'
): {
  branch: Branch;
  group: StudentGroup;
  resident: ResidentRecord;
  journal: JournalDocument;
} {
  const branch: Branch = {
    id: `branch-${suffix}`,
    name: `Локация ${suffix}`,
    address: `ул. Тестовая, ${suffix}`,
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt,
  };
  const group: StudentGroup = {
    id: `grp-${suffix}`,
    name: `Группа ${suffix}`,
    branchId: branch.id,
    mentorName: `Ментор ${suffix}`,
    startDate: '2026-09-01',
    endDate: '2026-12-25',
    ageCategory: '9-11',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt,
    commonData: {
      paletteId: DESIGN_PALETTES[0].id,
      modules: [],
      skills: [],
      nextChapterTitle: 'Что впереди?',
      nextChapterDescription: 'Новые открытия',
      nextChapterTopics: [],
    },
  };
  const resident: ResidentRecord = {
    id: `res-${suffix}`,
    groupId: group.id,
    branchId: branch.id,
    fullName: `Ученик ${suffix}`,
    age: '10 лет',
    ageCategory: '9-11',
    mentorName: `Ментор ${suffix}`,
    status: 'active',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt,
  };
  const journal = createStudentJournal(resident, group, branch);
  journal.id = `journal-${suffix}`;
  journal.createdAt = '2026-11-01T10:00:00.000Z';
  journal.updatedAt = updatedAt;
  resident.journalId = journal.id;

  return { branch, group, resident, journal };
}

async function seedFixtureToDb(f: ReturnType<typeof makeFixture>) {
  await Promise.all([
    saveBranch(f.branch),
    saveGroup(f.group),
    saveResident(f.resident),
    saveJournal(f.journal),
  ]);
}

async function createElectronStyleZip(
  f: ReturnType<typeof makeFixture>,
  extraMedia: MediaAsset[] = []
): Promise<Uint8Array> {
  const { blob } = await buildBackupZipFromPayload(
    {
      version: 7,
      exportedAt: '2026-11-25T12:00:00.000Z',
      branches: [f.branch],
      groups: [f.group],
      residents: [f.resident],
      journals: [f.journal],
      moduleLibrary: [],
      templates: [],
      media: extraMedia,
    },
    { localStorage: {} }
  );

  // Rewrite manifest.sourcePlatform to 'electron' to verify Electron -> Web import
  const zip = await JSZip.loadAsync(new Uint8Array(await blob.arrayBuffer()));
  const manifest = JSON.parse(await zip.file('manifest.json')!.async('string'));
  manifest.sourcePlatform = 'electron';
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  return zip.generateAsync({ type: 'uint8array' });
}

describe('Task 50: Merge, updates-only, conflicts & safety rollback', () => {
  beforeEach(async () => {
    setupMockLocalStorage();
    clearLastAutoSafetyBackup();
    await clearAllDatabaseStores();
  });

  it('1) импорт новых записей из Electron/Web ZIP без потери локальных данных', async () => {
    const localFix = makeFixture('pc1', '2026-11-20T10:00:00.000Z');
    await seedFixtureToDb(localFix);

    const remoteFix = makeFixture('pc2', '2026-11-22T10:00:00.000Z');
    remoteFix.journal.page1.projects.push({
      id: 'proj-remote-new',
      title: 'Проект с другого ПК',
      caption: 'Скриншот из Electron',
      description: 'Импортирован в объединённую базу',
      fallbackTheme: 'python',
      isRealScreenshot: true,
      imageUrl: PNG_B,
    });
    const remoteMedia: MediaAsset = {
      id: 'media-pc2',
      name: 'Electron Image',
      category: 'projects',
      url: PNG_B,
      mimeType: 'image/png',
      isBuiltIn: false,
      createdAt: '2026-11-22T10:00:00.000Z',
    };

    const zipBytes = await createElectronStyleZip(remoteFix, [remoteMedia]);
    const inspected = await inspectBackupFile(zipBytes, 'from-electron.zip');
    expect(inspected.sourcePlatform).toBe('electron');

    const analysis = await analyzeBackupImport(inspected, 'merge');
    expect(analysis.summary.conflictsCount).toBe(0);
    expect(analysis.summary.newCounts.groups).toBe(1);
    expect(analysis.summary.newCounts.residents).toBe(1);
    expect(analysis.summary.newCounts.journals).toBe(1);
    expect(analysis.summary.newCounts.projects).toBe(3); // 2 starter + 1 added
    expect(analysis.summary.newCounts.media).toBe(1);
    expect(analysis.summary.newCounts.images).toBe(1);
    expect(analysis.summary.localOnlyPreservedCount).toBe(3); // pc1 group + resident + journal

    await executeAnalyzedBackupImport(analysis, {});

    const [groups, residents, journals, media] = await Promise.all([
      getAllGroups(),
      getAllResidents(),
      getAllJournals(),
      getAllMediaAssets(),
    ]);

    expect(groups.map((g) => g.id)).toEqual(
      expect.arrayContaining([localFix.group.id, remoteFix.group.id])
    );
    expect(residents.map((r) => r.id)).toEqual(
      expect.arrayContaining([localFix.resident.id, remoteFix.resident.id])
    );
    expect(journals.map((j) => j.id)).toEqual(
      expect.arrayContaining([localFix.journal.id, remoteFix.journal.id])
    );
    expect(media.some((m) => m.id === 'media-pc2' && m.url === PNG_B)).toBe(
      true
    );
    const importedJournal = journals.find((j) => j.id === remoteFix.journal.id);
    expect(
      importedJournal?.page1.projects.some((p) => p.id === 'proj-remote-new')
    ).toBe(true);
  });

  it('2) повторный импорт того же архива не создаёт дубликатов', async () => {
    const fix = makeFixture('dup', '2026-11-20T10:00:00.000Z');
    await seedFixtureToDb(fix);

    const { blob, filename } = await createBackupZipBlob();
    const zipBytes = new Uint8Array(await blob.arrayBuffer());
    const inspected = await inspectBackupFile(zipBytes, filename);

    const analysis1 = await analyzeBackupImport(inspected, 'merge');
    expect(analysis1.summary.newCounts.total).toBe(0);
    expect(analysis1.summary.updatedCounts.total).toBe(0);
    expect(analysis1.summary.conflictsCount).toBe(0);
    expect(analysis1.summary.unchangedCount).toBeGreaterThan(0);

    await executeAnalyzedBackupImport(analysis1, {});
    const groupsAfter1 = await getAllGroups();
    const journalsAfter1 = await getAllJournals();

    // Repeat import a second time
    const analysis2 = await analyzeBackupImport(inspected, 'merge');
    expect(analysis2.summary.newCounts.total).toBe(0);
    expect(analysis2.summary.updatedCounts.total).toBe(0);
    expect(analysis2.summary.conflictsCount).toBe(0);
    await executeAnalyzedBackupImport(analysis2, {});

    const groupsAfter2 = await getAllGroups();
    const journalsAfter2 = await getAllJournals();
    expect(groupsAfter2.length).toBe(groupsAfter1.length);
    expect(journalsAfter2.length).toBe(journalsAfter1.length);
  });

  it('3) обновление существующего журнала по updatedAt и режим updates_only без добавления новых групп', async () => {
    const shared = makeFixture('upd', '2026-11-20T10:00:00.000Z');
    await seedFixtureToDb(shared);
    // Export establishes baseline on PC1
    await createBackupZipBlob();

    // On PC2, journal gets updated + new project added; also an unrelated new group exists on PC2
    const updatedFromPc2 = makeFixture('upd', '2026-11-25T15:00:00.000Z');
    updatedFromPc2.journal.page2.mentorNote.body =
      'Обновлённый отзыв наставника с другого ПК';
    updatedFromPc2.journal.page1.projects.push({
      id: 'proj-added-on-pc2',
      title: 'Новый проект PC2',
      caption: 'Финальная игра',
      description: 'Создан на втором компьютере',
      fallbackTheme: 'game3d',
      isRealScreenshot: true,
      imageUrl: PNG_A,
    });

    const unrelatedPc2 = makeFixture('unrelated', '2026-11-25T15:00:00.000Z');
    const { blob } = await buildBackupZipFromPayload(
      {
        version: 7,
        exportedAt: '2026-11-25T16:00:00.000Z',
        branches: [updatedFromPc2.branch, unrelatedPc2.branch],
        groups: [updatedFromPc2.group, unrelatedPc2.group],
        residents: [updatedFromPc2.resident, unrelatedPc2.resident],
        journals: [updatedFromPc2.journal, unrelatedPc2.journal],
        moduleLibrary: [],
        templates: [],
        media: [],
      },
      { localStorage: {} }
    );

    const inspected = await inspectBackupFile(
      new Uint8Array(await blob.arrayBuffer()),
      'updates.zip'
    );

    // Test updates_only mode: updates existing journal, skips unrelatedPc2
    const analysis = await analyzeBackupImport(inspected, 'updates_only');
    expect(analysis.summary.conflictsCount).toBe(0);
    expect(analysis.summary.updatedCounts.journals).toBe(1);
    expect(analysis.summary.newCounts.groups).toBe(0);
    expect(analysis.summary.newCounts.journals).toBe(0);
    expect(analysis.summary.newCounts.projects).toBe(1);

    await executeAnalyzedBackupImport(analysis, {});

    const [groups, journals] = await Promise.all([
      getAllGroups(),
      getAllJournals(),
    ]);
    expect(groups.some((g) => g.id === unrelatedPc2.group.id)).toBe(false);
    const updatedJ = journals.find((j) => j.id === shared.journal.id);
    expect(updatedJ?.page2.mentorNote.body).toBe(
      'Обновлённый отзыв наставника с другого ПК'
    );
    expect(
      updatedJ?.page1.projects.some((p) => p.id === 'proj-added-on-pc2')
    ).toBe(true);
  });

  it('4) обнаружение конфликта двух версий, выбор исходной или импортируемой версии без механического сложения', async () => {
    const baseFix = makeFixture('conf', '2026-11-20T10:00:00.000Z');
    await seedFixtureToDb(baseFix);
    // Record baseline
    await createBackupZipBlob();

    // Edit on PC1
    const pc1Journal: JournalDocument = {
      ...baseFix.journal,
      updatedAt: '2026-11-24T11:00:00.000Z',
      page2: {
        ...baseFix.journal.page2,
        mentorNote: {
          ...baseFix.journal.page2.mentorNote,
          body: 'Версия текста с первого компьютера',
        },
      },
    };
    await saveJournal(pc1Journal);

    // Edit on PC2 independently
    const pc2Fix = makeFixture('conf', '2026-11-24T14:30:00.000Z');
    pc2Fix.journal.page2.mentorNote.body = 'Версия текста со второго компьютера';
    pc2Fix.journal.page2.prideText = 'Победил в хакатоне на втором ПК';

    const zipBytes = await createElectronStyleZip(pc2Fix);
    const inspected = await inspectBackupFile(zipBytes, 'conflict.zip');

    const analysis = await analyzeBackupImport(inspected, 'merge');
    expect(analysis.summary.conflictsCount).toBe(1);
    const conflict = analysis.conflicts[0];
    expect(conflict.entityType).toBe('journal');
    expect(conflict.id).toBe(baseFix.journal.id);
    expect(conflict.localUpdatedAt).toBe('2026-11-24T11:00:00.000Z');
    expect(conflict.incomingUpdatedAt).toBe('2026-11-24T14:30:00.000Z');
    expect(conflict.changedAreas).toContain('Письмо наставника');

    // Must not execute while conflict is unresolved
    await expect(
      executeAnalyzedBackupImport(analysis, { [conflict.key]: 'unresolved' })
    ).rejects.toThrow(/Выберите версию/);

    // Choice 1: keep-local
    await executeAnalyzedBackupImport(analysis, {
      [conflict.key]: 'keep-local',
    });
    let reloaded = (await getAllJournals()).find(
      (j) => j.id === baseFix.journal.id
    )!;
    expect(reloaded.page2.mentorNote.body).toBe(
      'Версия текста с первого компьютера'
    );

    // Re-test Choice 2: use-incoming (must replace whole journal without mechanically merging texts)
    window.localStorage.setItem(
      SYNC_BASELINE_STORAGE_KEY,
      JSON.stringify({
        [`journal:${baseFix.journal.id}`]: {
          updatedAt: '2026-11-20T10:00:00.000Z',
          hash: 'old-base-hash',
        },
      })
    );
    const analysis2 = await analyzeBackupImport(inspected, 'merge');
    expect(analysis2.summary.conflictsCount).toBe(1);
    await executeAnalyzedBackupImport(analysis2, {
      [analysis2.conflicts[0].key]: 'use-incoming',
    });
    reloaded = (await getAllJournals()).find(
      (j) => j.id === baseFix.journal.id
    )!;
    expect(reloaded.page2.mentorNote.body).toBe(
      'Версия текста со второго компьютера'
    );
    expect(reloaded.page2.mentorNote.body).not.toContain('первого компьютера');
    expect(reloaded.page2.prideText).toBe('Победил в хакатоне на втором ПК');
  });

  it('5) сохранение локальных данных и 6) автоматическое восстановление после ошибки с созданием страхующей копии', async () => {
    const localOnly = makeFixture('local-only', '2026-11-20T10:00:00.000Z');
    localOnly.journal.page2.mentorNote.body = 'Ценный локальный текст';
    await seedFixtureToDb(localOnly);

    const incomingFix = makeFixture('incoming-new', '2026-11-25T10:00:00.000Z');
    const zipBytes = await createElectronStyleZip(incomingFix);
    const inspected = await inspectBackupFile(zipBytes, 'incoming.zip');

    const analysis = await analyzeBackupImport(inspected, 'merge');
    expect(analysis.summary.newCounts.journals).toBe(1);
    expect(analysis.summary.localOnlyPreservedCount).toBe(3);

    // Simulate a failure mid-way during merge commit
    await expect(
      executeAnalyzedBackupImport(
        analysis,
        {},
        {
          beforeCommitHook: () => {
            throw new Error('Симулированный сбой записи');
          },
        }
      )
    ).rejects.toThrow(/Симулированный сбой записи/);

    // Verify automatic rollback restored exact pre-merge state (incomingFix was rolled back, localOnly intact!)
    const journalsAfterError = await getAllJournals();
    expect(
      journalsAfterError.some((j) => j.id === incomingFix.journal.id)
    ).toBe(false);
    const localRestored = journalsAfterError.find(
      (j) => j.id === localOnly.journal.id
    );
    expect(localRestored?.page2.mentorNote.body).toBe('Ценный локальный текст');

    // Verify safety backup was created and manual rollback helper works
    const safety = getLastAutoSafetyBackup();
    expect(safety).not.toBeNull();
    expect(safety?.filename).toMatch(/^kiberone-auto-safety-backup-.*\.zip$/);

    // Now perform clean merge without error
    await executeAnalyzedBackupImport(analysis, {});
    const journalsMerged = await getAllJournals();
    expect(journalsMerged.some((j) => j.id === localOnly.journal.id)).toBe(true);
    expect(journalsMerged.some((j) => j.id === incomingFix.journal.id)).toBe(
      true
    );

    // And manual rollback restores back to pre-merge state
    const rolledBack = await restoreFromLastAutoSafetyBackup();
    expect(rolledBack).toBe(true);
    const journalsRolledBack = await getAllJournals();
    expect(journalsRolledBack.some((j) => j.id === localOnly.journal.id)).toBe(
      true
    );
    expect(
      journalsRolledBack.some((j) => j.id === incomingFix.journal.id)
    ).toBe(false);
  });
});
