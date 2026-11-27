import 'fake-indexeddb/auto';
import JSZip from 'jszip';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DESIGN_PALETTES } from '../../data/presets';
import {
  clearAllDatabaseStores,
  getAllBranches,
  getAllGroups,
  getAllJournals,
  getAllMediaAssets,
  getAllResidents,
  getAllTemplates,
  saveBranch,
  saveGroup,
  saveJournal,
  saveMediaAsset,
  saveResident,
  saveTemplate,
} from '../../db/storage';
import {
  Branch,
  JournalTemplate,
  MediaAsset,
  ResidentRecord,
  StudentGroup,
} from '../../types/journal';
import {
  applyInspectedBackup,
  BACKUP_ASSET_URI_PREFIX,
  BACKUP_FORMAT,
  BACKUP_FORMAT_VERSION,
  BACKUP_SCHEMA_VERSION,
  createBackupZipBlob,
  formatStorageBytes,
  getStorageStatus,
  inspectBackupFile,
  requestPersistentStorage,
} from '../backupService';
import { createStudentJournal } from '../journalProgress';

const SAMPLE_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const SAMPLE_JPG_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

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

describe('Backup & Restore Service (Web -> Electron ZIP)', () => {
  beforeEach(async () => {
    setupMockLocalStorage();
    await clearAllDatabaseStores();
  });

  it('экспортирует единый ZIP-архив со всеми сущностями, настройками и изображениями и полностью восстанавливает после очистки', async () => {
    window.localStorage.setItem(
      'kiberone_student_journey_onboarding_v1',
      JSON.stringify({ completed: true, completedAt: '2026-11-27T10:00:00.000Z' })
    );

    const branch: Branch = {
      id: 'branch-test-47',
      name: 'Тестовая локация 47',
      address: 'ул. Кибер, 10',
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
    };

    const mediaAsset: MediaAsset = {
      id: 'media-test-47',
      name: 'Загруженная картинка модуля',
      category: 'projects',
      url: SAMPLE_PNG_DATA_URL,
      mimeType: 'image/png',
      isBuiltIn: false,
      createdAt: '2026-11-01T10:00:00.000Z',
    };

    const group: StudentGroup = {
      id: 'grp-test-47',
      name: 'Тестовая группа 47',
      branchId: branch.id,
      mentorName: 'Иван Наставников',
      startDate: '2026-09-01',
      endDate: '2026-12-25',
      ageCategory: '9-11',
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
      commonData: {
        paletteId: DESIGN_PALETTES[0].id,
        modules: [
          {
            id: 'mod-test-47',
            title: 'Python Start',
            subtitle: 'Основы кода',
            description: 'Первые программы на Python',
            cardBgColor: '#B8F2F5',
            size: 'normal',
            order: 1,
            visualMode: 'image',
            imageMediaId: mediaAsset.id,
            customImageUrl: SAMPLE_PNG_DATA_URL,
          },
        ],
        skills: [],
        nextChapterTitle: 'Дальше больше',
        nextChapterDescription: 'Новые проекты',
        nextChapterTopics: [],
      },
    };

    const resident: ResidentRecord = {
      id: 'res-test-47',
      groupId: group.id,
      branchId: branch.id,
      fullName: 'Максим Архивов',
      age: '10 лет',
      ageCategory: '9-11',
      mentorName: 'Иван Наставников',
      status: 'active',
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
    };

    const journal = createStudentJournal(resident, group, branch);
    resident.journalId = journal.id;
    journal.page1.projects[0] = {
      ...journal.page1.projects[0],
      isRealScreenshot: true,
      imageUrl: SAMPLE_PNG_DATA_URL,
    };
    journal.page2.mentorNote.mentorPhotoUrl = SAMPLE_JPG_DATA_URL;

    const customTemplate: JournalTemplate = {
      id: 'tpl-test-47',
      name: 'Пользовательский шаблон 47',
      description: 'Описание шаблона',
      ageCategory: '9-11',
      isBuiltIn: false,
      createdAt: '2026-11-01T10:00:00.000Z',
      snapshot: {
        resident: journal.resident,
        page1: journal.page1,
        page2: journal.page2,
      },
    };

    await Promise.all([
      saveBranch(branch),
      saveMediaAsset(mediaAsset),
      saveGroup(group),
      saveResident(resident),
      saveJournal(journal),
      saveTemplate(customTemplate),
    ]);

    // 1. Create ZIP backup
    const { blob, filename, manifest } = await createBackupZipBlob();
    expect(filename).toMatch(/^kiberone-student-journey-backup-.*\.zip$/);
    expect(manifest.format).toBe(BACKUP_FORMAT);
    expect(manifest.backupVersion).toBe(BACKUP_FORMAT_VERSION);
    expect(manifest.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(manifest.targetCompatibility).toContain('electron');
    expect(manifest.counts.extractedImages).toBe(2); // 1 PNG (deduplicated) + 1 JPG
    expect(manifest.counts.localStorageKeys).toBe(1);

    // Inspect raw ZIP structure for Electron readiness
    const zipBytes = new Uint8Array(await blob.arrayBuffer());
    const rawZip = await JSZip.loadAsync(zipBytes);
    expect(rawZip.file('manifest.json')).not.toBeNull();
    expect(rawZip.file('data/branches.json')).not.toBeNull();
    expect(rawZip.file('data/groups.json')).not.toBeNull();
    expect(rawZip.file('data/residents.json')).not.toBeNull();
    expect(rawZip.file('data/journals.json')).not.toBeNull();
    expect(rawZip.file('data/templates.json')).not.toBeNull();
    expect(rawZip.file('data/media.json')).not.toBeNull();
    expect(rawZip.file('data/settings.json')).not.toBeNull();
    expect(rawZip.file('assets/index.json')).not.toBeNull();

    const rawJournalsText = await rawZip.file('data/journals.json')!.async('string');
    expect(rawJournalsText).toContain(BACKUP_ASSET_URI_PREFIX);
    expect(rawJournalsText).not.toContain('data:image/png;base64');

    // 2. Clear IndexedDB & localStorage completely
    await clearAllDatabaseStores();
    window.localStorage.clear();
    expect(window.localStorage.length).toBe(0);

    // 3. Inspect archive before confirming (must NOT mutate DB)
    const inspected = await inspectBackupFile(zipBytes, filename);
    expect(inspected.kind).toBe('zip');
    expect(inspected.backupVersion).toBe(BACKUP_FORMAT_VERSION);
    expect(inspected.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(inspected.counts.images).toBe(2);
    expect(inspected.counts.templates).toBe(1);
    expect(inspected.counts.media).toBe(1);

    // 4. Apply inspected backup
    await applyInspectedBackup(inspected);

    // 5. Verify exact IDs, relationships, images, and localStorage settings
    const [branches, groups, residents, journals, templates, media] =
      await Promise.all([
        getAllBranches(),
        getAllGroups(),
        getAllResidents(),
        getAllJournals(),
        getAllTemplates(),
        getAllMediaAssets(),
      ]);

    expect(branches.some((b) => b.id === branch.id)).toBe(true);
    const restoredGroup = groups.find((g) => g.id === group.id);
    expect(restoredGroup).toBeDefined();
    expect(restoredGroup?.branchId).toBe(branch.id);

    const restoredResident = residents.find((r) => r.id === resident.id);
    expect(restoredResident).toBeDefined();
    expect(restoredResident?.groupId).toBe(group.id);
    expect(restoredResident?.journalId).toBe(journal.id);

    const restoredJournal = journals.find((j) => j.id === journal.id);
    expect(restoredJournal).toBeDefined();
    expect(restoredJournal?.residentId).toBe(resident.id);
    expect(restoredJournal?.groupId).toBe(group.id);
    expect(restoredJournal?.page1.projects[0].imageUrl).toBe(SAMPLE_PNG_DATA_URL);
    expect(restoredJournal?.page2.mentorNote.mentorPhotoUrl).toBe(
      SAMPLE_JPG_DATA_URL
    );
    expect(restoredJournal?.page1.modules[0].imageMediaId).toBe(mediaAsset.id);

    expect(media.find((m) => m.id === mediaAsset.id)?.url).toBe(
      SAMPLE_PNG_DATA_URL
    );
    expect(templates.find((t) => t.id === customTemplate.id)?.name).toBe(
      customTemplate.name
    );
    expect(
      window.localStorage.getItem('kiberone_student_journey_onboarding_v1')
    ).toContain('"completed":true');
  });

  it('отклоняет архив с неподдерживаемой версией или отсутствующим изображением и не повреждает данные', async () => {
    const existingGroup: StudentGroup = {
      id: 'grp-keep-safe',
      name: 'Существующая группа',
      branchId: 'branch-1',
      mentorName: 'Ментор',
      startDate: '2026-09-01',
      endDate: '2026-12-25',
      ageCategory: '9-11',
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
    };
    await saveGroup(existingGroup);

    // Unsupported version
    const futureZip = new JSZip();
    futureZip.file(
      'manifest.json',
      JSON.stringify({
        format: BACKUP_FORMAT,
        backupVersion: 99,
        schemaVersion: BACKUP_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
      })
    );
    const futureBytes = await futureZip.generateAsync({ type: 'uint8array' });
    await expect(inspectBackupFile(futureBytes, 'future.zip')).rejects.toThrow(
      /не поддерживается/
    );

    // Missing referenced image asset
    const brokenZip = new JSZip();
    brokenZip.file(
      'manifest.json',
      JSON.stringify({
        format: BACKUP_FORMAT,
        backupVersion: BACKUP_FORMAT_VERSION,
        schemaVersion: BACKUP_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
      })
    );
    brokenZip.file('data/branches.json', '[]');
    brokenZip.file('data/groups.json', '[]');
    brokenZip.file('data/residents.json', '[]');
    brokenZip.file(
      'data/journals.json',
      JSON.stringify([
        {
          id: 'j-broken',
          page1: {
            projects: [{ id: 'p1', imageUrl: 'backup-asset://assets/images/missing.png' }],
          },
        },
      ])
    );
    const brokenBytes = await brokenZip.generateAsync({ type: 'uint8array' });
    await expect(inspectBackupFile(brokenBytes, 'broken.zip')).rejects.toThrow(
      /отсутствуют файлы изображений/
    );

    const groupsAfter = await getAllGroups();
    expect(groupsAfter.some((g) => g.id === 'grp-keep-safe')).toBe(true);
  });

  it('корректно обрабатывает navigator.storage.estimate() и navigator.storage.persist()', async () => {
    const mockEstimate = vi.fn().mockResolvedValue({
      usage: 2 * 1024 * 1024,
      quota: 100 * 1024 * 1024,
    });
    const mockPersisted = vi.fn().mockResolvedValue(false);
    const mockPersist = vi.fn().mockResolvedValue(true);

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        storage: {
          estimate: mockEstimate,
          persisted: mockPersisted,
          persist: mockPersist,
        },
      },
      configurable: true,
      writable: true,
    });

    const status = await getStorageStatus();
    expect(status.estimateSupported).toBe(true);
    expect(status.persistSupported).toBe(true);
    expect(status.persisted).toBe(false);
    expect(status.usageBytes).toBe(2 * 1024 * 1024);
    expect(status.availableBytes).toBe(98 * 1024 * 1024);
    expect(formatStorageBytes(status.usageBytes)).toBe('2.0 МБ');

    await requestPersistentStorage();
    expect(mockPersist).toHaveBeenCalledTimes(1);
  });
});
