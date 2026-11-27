import JSZip from 'jszip';
import { ONBOARDING_STORAGE_KEY } from '../data/onboardingTour';
import {
  exportFullBackupPayload,
  FullBackupPayload,
  replaceAllStoresFromBackup,
  STORAGE_DB_NAME,
  STORAGE_DB_VERSION,
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

export const BACKUP_FORMAT = 'kiberone-journey-backup' as const;
export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_SCHEMA_VERSION = STORAGE_DB_VERSION;
export const BACKUP_ASSET_URI_PREFIX = 'backup-asset://';

export interface BackupSettingsSnapshot {
  localStorage: Record<string, string>;
}

export interface BackupAssetIndexEntry {
  assetUri: string;
  zipPath: string;
  mimeType: string;
  byteLength: number;
}

export interface BackupManifest {
  app: string;
  format: typeof BACKUP_FORMAT;
  backupVersion: number;
  schemaVersion: number;
  exportedAt: string;
  sourcePlatform: 'web' | 'electron';
  targetCompatibility: Array<'web' | 'electron'>;
  idbName: string;
  assetProtocol: typeof BACKUP_ASSET_URI_PREFIX;
  counts: {
    branches: number;
    groups: number;
    residents: number;
    journals: number;
    moduleLibrary: number;
    categories: number;
    skillsCatalog: number;
    groupTemplates: number;
    templates: number;
    media: number;
    extractedImages: number;
    localStorageKeys: number;
  };
  localStorageKeys: string[];
}

export interface InspectedBackupArchive {
  kind: 'zip' | 'json';
  fileName: string;
  fileSizeBytes: number;
  backupVersion: number;
  schemaVersion: number;
  exportedAt: string;
  sourcePlatform: string;
  counts: {
    branches: number;
    groups: number;
    residents: number;
    journals: number;
    moduleLibrary: number;
    categories: number;
    skillsCatalog: number;
    groupTemplates: number;
    templates: number;
    media: number;
    images: number;
    settingsKeys: number;
  };
  payload: FullBackupPayload;
  settings: BackupSettingsSnapshot;
}

export interface StorageStatusInfo {
  estimateSupported: boolean;
  persistSupported: boolean;
  persisted: boolean | null;
  usageBytes: number | null;
  quotaBytes: number | null;
  availableBytes: number | null;
  usagePercent: number | null;
}

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

const EXT_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

function uint8ArrayToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  const CHUNK_SIZE = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const cleaned = base64.replace(/\s+/g, '');
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(cleaned, 'base64'));
  }
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const DATA_IMAGE_BASE64_RE =
  /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i;

interface ExtractedImageRecord {
  assetUri: string;
  zipPath: string;
  mimeType: string;
  bytes: Uint8Array;
}

function extractImagesRecursively<T>(
  value: T,
  byDataUrl: Map<string, ExtractedImageRecord>,
  records: ExtractedImageRecord[]
): T {
  if (typeof value === 'string') {
    const match = DATA_IMAGE_BASE64_RE.exec(value);
    if (!match) return value;

    const mimeType = match[1].toLowerCase();
    const base64Body = match[2].replace(/\s+/g, '');
    const normalizedKey = `data:${mimeType};base64,${base64Body}`;

    const existing = byDataUrl.get(normalizedKey);
    if (existing) {
      return existing.assetUri as unknown as T;
    }

    const ext = MIME_TO_EXT[mimeType] ?? 'bin';
    const indexStr = String(records.length + 1).padStart(3, '0');
    const zipPath = `assets/images/img-${indexStr}.${ext}`;
    const assetUri = `${BACKUP_ASSET_URI_PREFIX}${zipPath}`;
    const bytes = base64ToUint8Array(base64Body);

    const entry: ExtractedImageRecord = {
      assetUri,
      zipPath,
      mimeType,
      bytes,
    };
    byDataUrl.set(normalizedKey, entry);
    records.push(entry);
    return assetUri as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      extractImagesRecursively(item, byDataUrl, records)
    ) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = extractImagesRecursively(v, byDataUrl, records);
    }
    return out as T;
  }

  return value;
}

function restoreImageUrisRecursively<T>(
  value: T,
  uriToDataUrl: Map<string, string>,
  missingUris: Set<string>
): T {
  if (typeof value === 'string') {
    if (!value.startsWith(BACKUP_ASSET_URI_PREFIX)) return value;
    const restored = uriToDataUrl.get(value);
    if (!restored) {
      missingUris.add(value);
      return value;
    }
    return restored as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      restoreImageUrisRecursively(item, uriToDataUrl, missingUris)
    ) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = restoreImageUrisRecursively(v, uriToDataUrl, missingUris);
    }
    return out as T;
  }

  return value;
}

function countUniqueDataImages(value: unknown, found = new Set<string>()): number {
  if (typeof value === 'string') {
    if (DATA_IMAGE_BASE64_RE.test(value)) {
      found.add(value);
    }
    return found.size;
  }
  if (Array.isArray(value)) {
    for (const item of value) countUniqueDataImages(item, found);
    return found.size;
  }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) {
      countUniqueDataImages(v, found);
    }
  }
  return found.size;
}

export const SYNC_BASELINE_STORAGE_KEY = 'kiberone_sync_baseline_v1';

export interface SyncBaselineEntry {
  updatedAt: string;
  hash: string;
}

export type SyncBaselineMap = Record<string, SyncBaselineEntry>;

function canonicalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalizeValue);
  }
  if (value && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const val = (value as Record<string, unknown>)[key];
      if (val !== undefined) {
        sorted[key] = canonicalizeValue(val);
      }
    }
    return sorted;
  }
  return value;
}

function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function hashJournalCanonical(journal: JournalDocument): string {
  const { completionProgress: _ignored, ...rest } = journal;
  return fnv1aHash(JSON.stringify(canonicalizeValue(rest)));
}

export function hashEntityCanonical(entity: unknown): string {
  return fnv1aHash(JSON.stringify(canonicalizeValue(entity)));
}

export function loadSyncBaseline(): SyncBaselineMap {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(SYNC_BASELINE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as SyncBaselineMap) : {};
  } catch {
    return {};
  }
}

export function saveSyncBaseline(baseline: SyncBaselineMap): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      SYNC_BASELINE_STORAGE_KEY,
      JSON.stringify(baseline)
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function recordSyncBaselineFromPayload(
  payload: Partial<FullBackupPayload>
): void {
  const next = loadSyncBaseline();
  for (const j of payload.journals ?? []) {
    next[`journal:${j.id}`] = {
      updatedAt: j.updatedAt,
      hash: hashJournalCanonical(j),
    };
  }
  for (const g of payload.groups ?? []) {
    next[`group:${g.id}`] = {
      updatedAt: g.updatedAt,
      hash: hashEntityCanonical(g),
    };
  }
  for (const r of payload.residents ?? []) {
    next[`resident:${r.id}`] = {
      updatedAt: r.updatedAt,
      hash: hashEntityCanonical(r),
    };
  }
  for (const b of payload.branches ?? []) {
    next[`branch:${b.id}`] = {
      updatedAt: b.updatedAt,
      hash: hashEntityCanonical(b),
    };
  }
  saveSyncBaseline(next);
}

export function collectLocalStorageSettings(): BackupSettingsSnapshot {
  const localStorageData: Record<string, string> = {};
  if (typeof window === 'undefined' || !window.localStorage) {
    return { localStorage: localStorageData };
  }
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || key === SYNC_BASELINE_STORAGE_KEY) continue;
      if (key === ONBOARDING_STORAGE_KEY || key.startsWith('kiberone_')) {
        const val = window.localStorage.getItem(key);
        if (val !== null) {
          localStorageData[key] = val;
        }
      }
    }
  } catch {
    // Ignore storage access restrictions
  }
  return { localStorage: localStorageData };
}

export function restoreLocalStorageSettings(
  settings?: BackupSettingsSnapshot
): void {
  if (typeof window === 'undefined' || !window.localStorage || !settings) {
    return;
  }
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (
        key &&
        key !== SYNC_BASELINE_STORAGE_KEY &&
        (key === ONBOARDING_STORAGE_KEY || key.startsWith('kiberone_'))
      ) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }
    for (const [key, value] of Object.entries(settings.localStorage || {})) {
      if (key !== SYNC_BASELINE_STORAGE_KEY && typeof value === 'string') {
        window.localStorage.setItem(key, value);
      }
    }
  } catch {
    // Ignore storage quota or security errors
  }
}

export async function buildBackupZipFromPayload(
  payload: FullBackupPayload,
  settings: BackupSettingsSnapshot,
  filenamePrefix = 'kiberone-student-journey-backup'
): Promise<{
  blob: Blob;
  filename: string;
  manifest: BackupManifest;
}> {

  const byDataUrl = new Map<string, ExtractedImageRecord>();
  const extractedImages: ExtractedImageRecord[] = [];

  const sanitizedData = {
    branches: extractImagesRecursively(
      payload.branches ?? [],
      byDataUrl,
      extractedImages
    ),
    groups: extractImagesRecursively(
      payload.groups ?? [],
      byDataUrl,
      extractedImages
    ),
    residents: extractImagesRecursively(
      payload.residents ?? [],
      byDataUrl,
      extractedImages
    ),
    journals: extractImagesRecursively(
      payload.journals ?? [],
      byDataUrl,
      extractedImages
    ),
    moduleLibrary: extractImagesRecursively(
      payload.moduleLibrary ?? [],
      byDataUrl,
      extractedImages
    ),
    categories: extractImagesRecursively(
      payload.categories ?? [],
      byDataUrl,
      extractedImages
    ),
    skillsCatalog: extractImagesRecursively(
      payload.skillsCatalog ?? [],
      byDataUrl,
      extractedImages
    ),
    groupTemplates: extractImagesRecursively(
      payload.groupTemplates ?? [],
      byDataUrl,
      extractedImages
    ),
    templates: extractImagesRecursively(
      payload.templates ?? [],
      byDataUrl,
      extractedImages
    ),
    media: extractImagesRecursively(
      payload.media ?? [],
      byDataUrl,
      extractedImages
    ),
  };

  const localStorageKeys = Object.keys(settings.localStorage);
  const manifest: BackupManifest = {
    app: 'KIBERone Student Journey',
    format: BACKUP_FORMAT,
    backupVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: payload.exportedAt,
    sourcePlatform: 'web',
    targetCompatibility: ['web', 'electron'],
    idbName: STORAGE_DB_NAME,
    assetProtocol: BACKUP_ASSET_URI_PREFIX,
    counts: {
      branches: sanitizedData.branches.length,
      groups: sanitizedData.groups.length,
      residents: sanitizedData.residents.length,
      journals: sanitizedData.journals.length,
      moduleLibrary: sanitizedData.moduleLibrary.length,
      categories: sanitizedData.categories.length,
      skillsCatalog: sanitizedData.skillsCatalog.length,
      groupTemplates: sanitizedData.groupTemplates.length,
      templates: sanitizedData.templates.length,
      media: sanitizedData.media.length,
      extractedImages: extractedImages.length,
      localStorageKeys: localStorageKeys.length,
    },
    localStorageKeys,
  };

  const assetIndex: BackupAssetIndexEntry[] = extractedImages.map((img) => ({
    assetUri: img.assetUri,
    zipPath: img.zipPath,
    mimeType: img.mimeType,
    byteLength: img.bytes.byteLength,
  }));

  const zip = new JSZip();
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('data/branches.json', JSON.stringify(sanitizedData.branches, null, 2));
  zip.file('data/groups.json', JSON.stringify(sanitizedData.groups, null, 2));
  zip.file('data/residents.json', JSON.stringify(sanitizedData.residents, null, 2));
  zip.file('data/journals.json', JSON.stringify(sanitizedData.journals, null, 2));
  zip.file(
    'data/moduleLibrary.json',
    JSON.stringify(sanitizedData.moduleLibrary, null, 2)
  );
  zip.file(
    'data/categories.json',
    JSON.stringify(sanitizedData.categories, null, 2)
  );
  zip.file(
    'data/skillsCatalog.json',
    JSON.stringify(sanitizedData.skillsCatalog, null, 2)
  );
  zip.file(
    'data/groupTemplates.json',
    JSON.stringify(sanitizedData.groupTemplates, null, 2)
  );
  zip.file(
    'data/templates.json',
    JSON.stringify(sanitizedData.templates, null, 2)
  );
  zip.file('data/media.json', JSON.stringify(sanitizedData.media, null, 2));
  zip.file('data/settings.json', JSON.stringify(settings, null, 2));
  zip.file('assets/index.json', JSON.stringify(assetIndex, null, 2));

  for (const img of extractedImages) {
    zip.file(img.zipPath, img.bytes, { binary: true });
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const filename = `${filenamePrefix}-${stamp}.zip`;

  return { blob, filename, manifest };
}

export async function createBackupZipBlob(): Promise<{
  blob: Blob;
  filename: string;
  manifest: BackupManifest;
}> {
  const payload = await exportFullBackupPayload();
  const settings = collectLocalStorageSettings();
  recordSyncBaselineFromPayload(payload);
  return buildBackupZipFromPayload(payload, settings);
}

async function readInputBytes(
  input: File | Blob | ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (typeof input.arrayBuffer === 'function') {
    const buf = await input.arrayBuffer();
    return new Uint8Array(buf);
  }
  const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () =>
      reject(reader.error ?? new Error('Не удалось прочитать файл'));
    reader.readAsArrayBuffer(input);
  });
  return new Uint8Array(buf);
}

function assertValidRecordArray<T extends { id?: unknown }>(
  value: unknown,
  label: string
): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Некорректная структура раздела «${label}» в резервной копии.`);
  }
  for (let i = 0; i < value.length; i++) {
    const item = value[i] as { id?: unknown } | null;
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id) {
      throw new Error(
        `Повреждена запись #${i + 1} в разделе «${label}»: отсутствует уникальный ID.`
      );
    }
  }
  return value as T[];
}

export async function inspectBackupFile(
  input: File | Blob | ArrayBuffer | Uint8Array,
  explicitFileName?: string
): Promise<InspectedBackupArchive> {
  const bytes = await readInputBytes(input);
  const fileName =
    explicitFileName ?? (input instanceof File ? input.name : 'backup');
  const fileSizeBytes = bytes.byteLength;

  if (fileSizeBytes === 0) {
    throw new Error('Выбранный файл резервной копии пуст.');
  }

  const isZipMagic =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);

  if (isZipMagic || fileName.toLowerCase().endsWith('.zip')) {
    return inspectZipArchive(bytes, fileName, fileSizeBytes);
  }

  return inspectLegacyJsonArchive(bytes, fileName, fileSizeBytes);
}

async function inspectZipArchive(
  bytes: Uint8Array,
  fileName: string,
  fileSizeBytes: number
): Promise<InspectedBackupArchive> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(bytes);
  } catch {
    throw new Error(
      'Не удалось открыть ZIP-архив. Проверьте, что файл не повреждён.'
    );
  }

  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error(
      'В архиве отсутствует manifest.json. Это не резервная копия KIBERone Student Journey.'
    );
  }

  let manifest: Partial<BackupManifest>;
  try {
    manifest = JSON.parse(await manifestFile.async('string')) as Partial<BackupManifest>;
  } catch {
    throw new Error('Файл manifest.json внутри архива повреждён.');
  }

  if (manifest.format !== BACKUP_FORMAT) {
    throw new Error(
      'Неизвестный формат резервной копии (ожидается kiberone-journey-backup).'
    );
  }

  const backupVersion = Number(manifest.backupVersion);
  if (
    !Number.isInteger(backupVersion) ||
    backupVersion < 1 ||
    backupVersion > BACKUP_FORMAT_VERSION
  ) {
    throw new Error(
      `Версия формата архива (${String(manifest.backupVersion)}) не поддерживается текущей версией приложения (макс. v${BACKUP_FORMAT_VERSION}).`
    );
  }

  const schemaVersion = Number(manifest.schemaVersion);
  if (
    !Number.isInteger(schemaVersion) ||
    schemaVersion < 1 ||
    schemaVersion > BACKUP_SCHEMA_VERSION
  ) {
    throw new Error(
      `Версия схемы данных (${String(manifest.schemaVersion)}) не поддерживается (макс. v${BACKUP_SCHEMA_VERSION}).`
    );
  }

  const readJsonFromZip = async (
    path: string,
    required: boolean
  ): Promise<unknown> => {
    const file = zip.file(path);
    if (!file) {
      if (required) {
        throw new Error(`В архиве отсутствует обязательный файл ${path}.`);
      }
      return undefined;
    }
    try {
      return JSON.parse(await file.async('string'));
    } catch {
      throw new Error(`Файл ${path} внутри архива повреждён.`);
    }
  };

  const [
    rawBranches,
    rawGroups,
    rawResidents,
    rawJournals,
    rawModules,
    rawCategories,
    rawSkills,
    rawGroupTemplates,
    rawTemplates,
    rawMedia,
    rawSettings,
    rawAssetIndex,
  ] = await Promise.all([
    readJsonFromZip('data/branches.json', true),
    readJsonFromZip('data/groups.json', true),
    readJsonFromZip('data/residents.json', true),
    readJsonFromZip('data/journals.json', true),
    readJsonFromZip('data/moduleLibrary.json', false),
    readJsonFromZip('data/categories.json', false),
    readJsonFromZip('data/skillsCatalog.json', false),
    readJsonFromZip('data/groupTemplates.json', false),
    readJsonFromZip('data/templates.json', false),
    readJsonFromZip('data/media.json', false),
    readJsonFromZip('data/settings.json', false),
    readJsonFromZip('assets/index.json', false),
  ]);

  const assetIndexEntries = Array.isArray(rawAssetIndex)
    ? (rawAssetIndex as BackupAssetIndexEntry[])
    : [];
  const mimeByZipPath = new Map<string, string>();
  for (const entry of assetIndexEntries) {
    if (entry?.zipPath && entry?.mimeType) {
      mimeByZipPath.set(entry.zipPath, entry.mimeType);
    }
  }

  const uriToDataUrl = new Map<string, string>();
  const assetFiles = Object.values(zip.files).filter(
    (f) => !f.dir && f.name.startsWith('assets/images/')
  );

  for (const file of assetFiles) {
    const fileBytes = await file.async('uint8array');
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const mimeType =
      mimeByZipPath.get(file.name) ??
      EXT_TO_MIME[ext] ??
      'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${uint8ArrayToBase64(fileBytes)}`;
    uriToDataUrl.set(`${BACKUP_ASSET_URI_PREFIX}${file.name}`, dataUrl);
  }

  const missingUris = new Set<string>();
  const restoreUris = <T>(val: T): T =>
    restoreImageUrisRecursively(val, uriToDataUrl, missingUris);

  const branches = assertValidRecordArray<Branch>(
    restoreUris(rawBranches),
    'Локации'
  );
  const groups = assertValidRecordArray<StudentGroup>(
    restoreUris(rawGroups),
    'Группы'
  );
  const residents = assertValidRecordArray<ResidentRecord>(
    restoreUris(rawResidents),
    'Резиденты'
  );
  const journals = assertValidRecordArray<JournalDocument>(
    restoreUris(rawJournals),
    'Журналы'
  );
  const moduleLibrary = rawModules
    ? assertValidRecordArray<LibraryModule>(
        restoreUris(rawModules),
        'Библиотека модулей'
      )
    : undefined;
  const categories = rawCategories
    ? assertValidRecordArray<ModuleCategoryConfig>(
        restoreUris(rawCategories),
        'Категории модулей'
      )
    : undefined;
  const skillsCatalog = rawSkills
    ? assertValidRecordArray<SkillDefinition>(
        restoreUris(rawSkills),
        'Справочник навыков'
      )
    : undefined;
  const groupTemplates = rawGroupTemplates
    ? assertValidRecordArray<GroupCurriculumTemplate>(
        restoreUris(rawGroupTemplates),
        'Групповые шаблоны'
      )
    : undefined;
  const templates = rawTemplates
    ? assertValidRecordArray<JournalTemplate>(
        restoreUris(rawTemplates),
        'Шаблоны журналов'
      )
    : [];
  const media = rawMedia
    ? assertValidRecordArray<MediaAsset>(restoreUris(rawMedia), 'Медиатека')
    : [];

  if (missingUris.size > 0) {
    throw new Error(
      `В архиве отсутствуют файлы изображений (${missingUris.size}), на которые ссылаются данные.`
    );
  }

  const settingsObj: BackupSettingsSnapshot =
    rawSettings &&
    typeof rawSettings === 'object' &&
    'localStorage' in rawSettings &&
    rawSettings.localStorage &&
    typeof (rawSettings as BackupSettingsSnapshot).localStorage === 'object'
      ? {
          localStorage: {
            ...(rawSettings as BackupSettingsSnapshot).localStorage,
          },
        }
      : { localStorage: {} };

  const payload: FullBackupPayload = {
    version: schemaVersion,
    exportedAt: String(manifest.exportedAt || new Date().toISOString()),
    branches,
    groups,
    residents,
    journals,
    moduleLibrary: moduleLibrary ?? [],
    categories,
    skillsCatalog,
    groupTemplates,
    templates,
    media,
  };

  return {
    kind: 'zip',
    fileName,
    fileSizeBytes,
    backupVersion,
    schemaVersion,
    exportedAt: payload.exportedAt,
    sourcePlatform: String(manifest.sourcePlatform || 'web'),
    counts: {
      branches: branches.length,
      groups: groups.length,
      residents: residents.length,
      journals: journals.length,
      moduleLibrary: moduleLibrary?.length ?? 0,
      categories: categories?.length ?? 0,
      skillsCatalog: skillsCatalog?.length ?? 0,
      groupTemplates: groupTemplates?.length ?? 0,
      templates: templates.filter((t) => !t.isBuiltIn).length,
      media: media.filter((m) => !m.isBuiltIn).length,
      images: assetFiles.length,
      settingsKeys: Object.keys(settingsObj.localStorage).length,
    },
    payload,
    settings: settingsObj,
  };
}

async function inspectLegacyJsonArchive(
  bytes: Uint8Array,
  fileName: string,
  fileSizeBytes: number
): Promise<InspectedBackupArchive> {
  let parsed: unknown;
  try {
    const text = new TextDecoder('utf-8').decode(bytes);
    parsed = JSON.parse(text);
  } catch {
    throw new Error(
      'Не удалось прочитать файл. Выберите корректный ZIP-архив или JSON-файл резервной копии.'
    );
  }

  if (Array.isArray(parsed)) {
    const journals = assertValidRecordArray<JournalDocument>(parsed, 'Журналы');
    const payload: FullBackupPayload = {
      version: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      journals,
      groups: [],
      residents: [],
      moduleLibrary: [],
      templates: [],
      media: [],
    };
    return {
      kind: 'json',
      fileName,
      fileSizeBytes,
      backupVersion: 0,
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: payload.exportedAt,
      sourcePlatform: 'web',
      counts: {
        branches: 0,
        groups: 0,
        residents: 0,
        journals: journals.length,
        moduleLibrary: 0,
        categories: 0,
        skillsCatalog: 0,
        groupTemplates: 0,
        templates: 0,
        media: 0,
        images: countUniqueDataImages(journals),
        settingsKeys: 0,
      },
      payload,
      settings: { localStorage: {} },
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Некорректный формат файла резервной копии.');
  }

  const obj = parsed as Partial<FullBackupPayload> & {
    resident?: unknown;
    id?: unknown;
  };

  if (typeof obj.id === 'string' && obj.resident) {
    const singleJournal = obj as unknown as JournalDocument;
    const payload: FullBackupPayload = {
      version: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      journals: [singleJournal],
      groups: [],
      residents: [],
      moduleLibrary: [],
      templates: [],
      media: [],
    };
    return {
      kind: 'json',
      fileName,
      fileSizeBytes,
      backupVersion: 0,
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: payload.exportedAt,
      sourcePlatform: 'web',
      counts: {
        branches: 0,
        groups: 0,
        residents: 0,
        journals: 1,
        moduleLibrary: 0,
        categories: 0,
        skillsCatalog: 0,
        groupTemplates: 0,
        templates: 0,
        media: 0,
        images: countUniqueDataImages(singleJournal),
        settingsKeys: 0,
      },
      payload,
      settings: { localStorage: {} },
    };
  }

  const version = Number(obj.version ?? BACKUP_SCHEMA_VERSION);
  if (!Number.isInteger(version) || version < 1 || version > BACKUP_SCHEMA_VERSION) {
    throw new Error(
      `Версия JSON-бэкапа (${String(obj.version)}) не поддерживается (макс. v${BACKUP_SCHEMA_VERSION}).`
    );
  }

  if (
    !Array.isArray(obj.journals) &&
    !Array.isArray(obj.groups) &&
    !Array.isArray(obj.residents)
  ) {
    throw new Error(
      'JSON-файл не содержит разделов journals, groups или residents.'
    );
  }

  const branches = Array.isArray(obj.branches)
    ? assertValidRecordArray<Branch>(obj.branches, 'Локации')
    : undefined;
  const groups = Array.isArray(obj.groups)
    ? assertValidRecordArray<StudentGroup>(obj.groups, 'Группы')
    : [];
  const residents = Array.isArray(obj.residents)
    ? assertValidRecordArray<ResidentRecord>(obj.residents, 'Резиденты')
    : [];
  const journals = Array.isArray(obj.journals)
    ? assertValidRecordArray<JournalDocument>(obj.journals, 'Журналы')
    : [];
  const moduleLibrary = Array.isArray(obj.moduleLibrary)
    ? assertValidRecordArray<LibraryModule>(
        obj.moduleLibrary,
        'Библиотека модулей'
      )
    : [];
  const templates = Array.isArray(obj.templates)
    ? assertValidRecordArray<JournalTemplate>(obj.templates, 'Шаблоны')
    : [];
  const media = Array.isArray(obj.media)
    ? assertValidRecordArray<MediaAsset>(obj.media, 'Медиатека')
    : [];

  const payload: FullBackupPayload = {
    version,
    exportedAt: String(obj.exportedAt || new Date().toISOString()),
    branches,
    groups,
    residents,
    journals,
    moduleLibrary,
    categories: Array.isArray(obj.categories) ? obj.categories : undefined,
    skillsCatalog: Array.isArray(obj.skillsCatalog)
      ? obj.skillsCatalog
      : undefined,
    groupTemplates: Array.isArray(obj.groupTemplates)
      ? obj.groupTemplates
      : undefined,
    templates,
    media,
  };

  return {
    kind: 'json',
    fileName,
    fileSizeBytes,
    backupVersion: 0,
    schemaVersion: version,
    exportedAt: payload.exportedAt,
    sourcePlatform: 'web',
    counts: {
      branches: branches?.length ?? 0,
      groups: groups.length,
      residents: residents.length,
      journals: journals.length,
      moduleLibrary: moduleLibrary.length,
      categories: payload.categories?.length ?? 0,
      skillsCatalog: payload.skillsCatalog?.length ?? 0,
      groupTemplates: payload.groupTemplates?.length ?? 0,
      templates: templates.filter((t) => !t.isBuiltIn).length,
      media: media.filter((m) => !m.isBuiltIn).length,
      images: countUniqueDataImages(payload),
      settingsKeys: 0,
    },
    payload,
    settings: { localStorage: {} },
  };
}

export async function applyInspectedBackup(
  inspected: InspectedBackupArchive
): Promise<{ journalsCount: number }> {
  const result = await replaceAllStoresFromBackup(inspected.payload);
  restoreLocalStorageSettings(inspected.settings);
  recordSyncBaselineFromPayload(inspected.payload);
  return result;
}

export async function getStorageStatus(): Promise<StorageStatusInfo> {
  const hasStorageApi =
    typeof navigator !== 'undefined' && Boolean(navigator.storage);
  const estimateSupported =
    hasStorageApi && typeof navigator.storage.estimate === 'function';
  const persistSupported =
    hasStorageApi &&
    typeof navigator.storage.persist === 'function' &&
    typeof navigator.storage.persisted === 'function';

  let persisted: boolean | null = null;
  let usageBytes: number | null = null;
  let quotaBytes: number | null = null;
  let availableBytes: number | null = null;
  let usagePercent: number | null = null;

  if (persistSupported) {
    try {
      persisted = await navigator.storage.persisted();
    } catch {
      persisted = null;
    }
  }

  if (estimateSupported) {
    try {
      const estimate = await navigator.storage.estimate();
      usageBytes = typeof estimate.usage === 'number' ? estimate.usage : null;
      quotaBytes = typeof estimate.quota === 'number' ? estimate.quota : null;
      if (usageBytes !== null && quotaBytes !== null) {
        availableBytes = Math.max(0, quotaBytes - usageBytes);
        usagePercent =
          quotaBytes > 0
            ? Math.min(100, Math.round((usageBytes / quotaBytes) * 1000) / 10)
            : 0;
      }
    } catch {
      usageBytes = null;
      quotaBytes = null;
    }
  }

  return {
    estimateSupported,
    persistSupported,
    persisted,
    usageBytes,
    quotaBytes,
    availableBytes,
    usagePercent,
  };
}

export async function requestPersistentStorage(): Promise<StorageStatusInfo> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.storage &&
    typeof navigator.storage.persist === 'function'
  ) {
    try {
      await navigator.storage.persist();
    } catch {
      // Browser may deny persistence in incognito or unsupported contexts
    }
  }
  return getStorageStatus();
}

export function formatStorageBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) {
    return '—';
  }
  if (bytes < 1024) return `${Math.round(bytes)} Б`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} КБ`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} МБ`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} ГБ`;
}
