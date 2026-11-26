import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { DESIGN_PALETTES } from '../../data/presets';
import {
  getAllJournals,
  getAllLibraryModules,
  saveJournal,
  saveLibraryModule,
} from '../../db/storage';
import { Branch, ResidentRecord, StudentGroup } from '../../types/journal';
import { createStudentJournal } from '../journalProgress';

describe('IndexedDB storage persistence (fake-indexeddb)', () => {
  beforeEach(() => {
    // Каждый тест использует уникальные ID, чтобы не конфликтовать с сидами
  });

  it('сохраняет и загружает журнал с параметрами кадрирования модулей и реальным скриншотом', async () => {
    const resident: ResidentRecord = {
      id: 'res-idb-1',
      groupId: 'grp-idb-1',
      branchId: 'branch-1',
      fullName: 'Мария Соколова',
      age: '11 лет',
      ageCategory: '9-11',
      mentorName: 'Алексей',
      status: 'active',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    };
    const group: StudentGroup = {
      id: 'grp-idb-1',
      name: 'Web & Design',
      branchId: 'branch-1',
      mentorName: 'Алексей',
      ageCategory: '9-11',
      startDate: '2026-09-01',
      endDate: '2026-12-25',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
      commonData: {
        paletteId: DESIGN_PALETTES[0].id,
        modules: [
          {
            id: 'mod-crop-1',
            title: 'Figma Дизайн',
            subtitle: 'Интерфейсы',
            description: 'Прототипирование макетов',
            cardBgColor: '#B8F2F5',
            size: 'normal',
            order: 1,
            visualMode: 'image',
            customImageUrl: '/assets/modules/m_figma.png',
            imageScale: 1.45,
            imagePosX: -12,
            imagePosY: 18,
          },
        ],
        skills: [],
        nextChapterTitle: 'Что интересного впереди?',
        nextChapterDescription: 'Дальше больше!',
        nextChapterTopics: [],
      },
    };
    const branch: Branch = {
      id: 'branch-1',
      name: 'Локация 1',
      address: 'ул. Мира, 5',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    };

    const doc = createStudentJournal(resident, group, branch);
    doc.page1.projects[0] = {
      ...doc.page1.projects[0],
      isRealScreenshot: true,
      imageUrl: 'data:image/png;base64,AAAA',
    };

    await saveJournal(doc);
    const all = await getAllJournals();
    const loaded = all.find((j) => j.id === doc.id);

    expect(loaded).toBeDefined();
    expect(loaded?.id).toBe(doc.id);
    expect(loaded?.page1.modules[0].imageScale).toBe(1.45);
    expect(loaded?.page1.modules[0].imagePosX).toBe(-12);
    expect(loaded?.page1.modules[0].imagePosY).toBe(18);
    expect(loaded?.page1.projects[0].isRealScreenshot).toBe(true);
  });

  it('сохраняет параметры масштаба и сдвига модуля библиотеки в IndexedDB', async () => {
    const initialModules = await getAllLibraryModules();
    const target = initialModules[0];
    expect(target).toBeDefined();

    const updated = {
      ...target,
      imageScale: 1.75,
      imagePosX: 15,
      imagePosY: -10,
    };

    await saveLibraryModule(updated);
    const reloaded = await getAllLibraryModules();
    const found = reloaded.find((m) => m.id === target.id);

    expect(found).toBeDefined();
    expect(found?.imageScale).toBe(1.75);
    expect(found?.imagePosX).toBe(15);
    expect(found?.imagePosY).toBe(-10);
  });
});
