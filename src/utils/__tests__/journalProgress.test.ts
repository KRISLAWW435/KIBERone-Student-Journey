import { describe, expect, it } from 'vitest';
import {
  ASSETS,
  DESIGN_PALETTES,
  DEFAULT_SPEECH_BUBBLE_TEXT,
  MENTOR_NOTE_TEMPLATES,
  STRENGTH_LIBRARY,
} from '../../data/presets';
import {
  Branch,
  JournalDocument,
  ResidentRecord,
  StudentGroup,
} from '../../types/journal';
import {
  KIBERONE_CURRICULUM_MODULES,
} from '../../data/curriculumCatalog';
import {
  applyDesignSnapshotToJournal,
  computeActiveModuleSuggestedSkillIds,
  computeJournalProgress,
  createStudentJournal,
  DEFAULT_PAGE2_SECTION_ORDER,
  formatGroupPeriod,
  formatRuDate,
  getPrideTemplatesForModules,
  hasJournalDesignChanged,
  MAX_PAGE1_MODULES,
  MAX_PAGE1_PROJECTS,
  MENTOR_BODY_MAX_CHARS,
  MENTOR_GREETING_MAX_CHARS,
  MENTOR_SIGNATURE_MAX_CHARS,
  normalizePage2SectionOrder,
  PAGE1_CARD_LIMIT_MESSAGE,
  STRENGTH_EXAMPLE_MAX_CHARS,
  UNIVERSAL_PRIDE_TEMPLATES,
} from '../journalProgress';

function createBaseResident(overrides: Partial<ResidentRecord> = {}): ResidentRecord {
  return {
    id: 'res-test-1',
    groupId: 'grp-test-1',
    branchId: 'branch-1',
    fullName: 'Новый резидент',
    age: '',
    ageCategory: '9-11',
    mentorName: 'Иван Петров',
    status: 'active',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  };
}

function createBaseGroup(overrides: Partial<StudentGroup> = {}): StudentGroup {
  return {
    id: 'grp-test-1',
    name: 'Python Start · Ср 17:00',
    branchId: 'branch-1',
    mentorName: 'Иван Петров',
    ageCategory: '9-11',
    startDate: '2026-09-01',
    endDate: '2026-12-25',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    commonData: {
      paletteId: DESIGN_PALETTES[0].id,
      modules: [],
      skills: [],
      nextChapterTitle: 'Что интересного впереди?',
      nextChapterDescription: 'Тебя ждут новые интересные модули:',
      nextChapterTopics: [{ id: 'nt-1', title: 'Python', iconKey: 'python' }],
    },
    ...overrides,
  };
}

const TEST_BRANCH: Branch = {
  id: 'branch-1',
  name: 'Локация 1',
  address: 'ул. Ленина, 10',
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
};

describe('formatRuDate и formatGroupPeriod', () => {
  it('корректно форматирует ISO дату в формат ДД.ММ.ГГГГ', () => {
    expect(formatRuDate('2026-09-01')).toBe('01.09.2026');
    expect(formatRuDate('2026-12-25T12:00:00.000Z')).toBe('25.12.2026');
    expect(formatRuDate('')).toBe('');
  });

  it('корректно формирует учебный период группы', () => {
    expect(formatGroupPeriod('2026-09-01', '2026-12-25')).toBe(
      'с 01.09.2026 по 25.12.2026'
    );
    expect(formatGroupPeriod('2026-09-01', '')).toBe('с 01.09.2026');
    expect(formatGroupPeriod('', '2026-12-25')).toBe('по 25.12.2026');
    expect(formatGroupPeriod('', '')).toBe('Учебный период');
  });
});

describe('computeJournalProgress', () => {
  it('для журнала с дефолтными текстами и шаблонными проектами возвращает прогресс 0/5 (не ready)', () => {
    const resident = createBaseResident();
    const group = createBaseGroup();
    const doc = createStudentJournal(resident, group, TEST_BRANCH);

    const progress = computeJournalProgress(doc);

    expect(progress.filledBlocks).toBe(0);
    expect(progress.totalBlocks).toBe(5);
    expect(progress.statusLevel).toBe('not_started');
    expect(progress.statusLevel).not.toBe('ready');

    const projectsBlock = progress.blocks.find((b) => b.id === 'projects');
    expect(projectsBlock?.completed).toBe(false);
  });

  it('если у ученика заполнены имя и возраст, но проекты не изменены — статус не ready и блок «Проекты» не выполнен', () => {
    const resident = createBaseResident({
      fullName: 'Артём Смирнов',
      age: '10 лет',
    });
    const group = createBaseGroup();
    const doc = createStudentJournal(resident, group, TEST_BRANCH);

    const progress = computeJournalProgress(doc);

    expect(progress.filledBlocks).toBe(1);
    expect(progress.statusLevel).toBe('not_started');
    expect(progress.blocks.find((b) => b.id === 'profile')?.completed).toBe(true);
    expect(progress.blocks.find((b) => b.id === 'projects')?.completed).toBe(false);
  });

  it('если загружен реальный скриншот в проект — блок «Проекты» становится Готово', () => {
    const resident = createBaseResident({
      fullName: 'Артём Смирнов',
      age: '10 лет',
    });
    const group = createBaseGroup();
    const doc = createStudentJournal(resident, group, TEST_BRANCH);

    doc.page1.projects[0] = {
      ...doc.page1.projects[0],
      isRealScreenshot: true,
      imageUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    };

    const progress = computeJournalProgress(doc);
    const projectsBlock = progress.blocks.find((b) => b.id === 'projects');

    expect(projectsBlock?.completed).toBe(true);
    expect(progress.filledBlocks).toBe(2);
    expect(progress.statusLevel).toBe('in_progress');
  });

  it('если изменен текст «Момент гордости» и добавлена сильная сторона — блок «Момент гордости» становится Готово', () => {
    const resident = createBaseResident({
      fullName: 'Артём Смирнов',
      age: '10 лет',
    });
    const group = createBaseGroup();
    const doc = createStudentJournal(resident, group, TEST_BRANCH);

    // Без сильной стороны блок не засчитывается
    doc.page2.prideText = 'Самостоятельно собрал 3D-уровень и помог другу.';
    let progress = computeJournalProgress(doc);
    expect(progress.blocks.find((b) => b.id === 'pride')?.completed).toBe(false);

    // После добавления видимой сильной стороны блок становится Готово
    doc.page2.strengths = [
      {
        id: 'str-1',
        title: 'Логическое мышление',
        example: 'Уверенно строит алгоритмы и условия.',
        iconKey: 'logic',
        bgColor: '#B8F2F5',
      },
    ];
    progress = computeJournalProgress(doc);
    expect(progress.blocks.find((b) => b.id === 'pride')?.completed).toBe(true);
  });

  it('если все 5 блоков заполнены — общий статус становится ready', () => {
    const resident = createBaseResident({
      fullName: 'Артём Смирнов',
      age: '10 лет',
    });
    const group = createBaseGroup({
      commonData: {
        paletteId: DESIGN_PALETTES[0].id,
        modules: [
          {
            id: 'm-1',
            title: 'Python-разработка',
            subtitle: 'Основы языка',
            description: 'Переменные, циклы и мини-игры на Python.',
            cardBgColor: '#FFF8B8',
            size: 'normal',
            order: 1,
            visualMode: 'image',
            customImageUrl: ASSETS.logo,
            imageScale: 1.15,
            imagePosX: 0,
            imagePosY: -4,
          },
        ],
        skills: [
          {
            id: 'sk-1',
            label: 'Работа с циклами и условиями',
            bgColor: '#FFE14D',
            status: 'independent',
          },
        ],
        nextChapterTitle: 'Что интересного впереди?',
        nextChapterDescription: 'Тебя ждут новые интересные модули:',
        nextChapterTopics: [{ id: 'nt-1', title: 'Python', iconKey: 'python' }],
      },
    });

    const doc: JournalDocument = createStudentJournal(resident, group, TEST_BRANCH);
    doc.page1.coverSpeechBubbleText = DEFAULT_SPEECH_BUBBLE_TEXT;
    doc.page1.projects[0] = {
      ...doc.page1.projects[0],
      title: 'Космический шутер на Python',
      isRealScreenshot: true,
      imageUrl:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    };
    doc.page2.prideText = 'Создал свою игру с подсчётом очков и защитил проект!';
    doc.page2.strengths = [
      {
        id: 'str-1',
        title: 'Креативность',
        example: 'Придумывает яркие игровые механики.',
        iconKey: 'creativity',
        bgColor: '#B8F2F5',
      },
    ];
    doc.page2.mentorNote = {
      ...doc.page2.mentorNote,
      greeting: 'Артём, ты большой молодец!',
      body: 'За этот модуль ты уверенно освоил циклы, условия и собрал собственный проект без подсказок.',
      signature: 'Твой наставник, Иван',
    };

    const progress = computeJournalProgress(doc);

    expect(progress.filledBlocks).toBe(5);
    expect(progress.totalBlocks).toBe(5);
    expect(progress.label).toBe('Заполнено 5 из 5 блоков');
    expect(progress.statusLevel).toBe('ready');
    expect(progress.blocks.every((b) => b.completed)).toBe(true);
  });
});

describe('computeActiveModuleSuggestedSkillIds и getPrideTemplatesForModules', () => {
  it('собирает suggestedSkills только от активных модулей, без дублей и с fallback на каталог', () => {
    const mod1 = KIBERONE_CURRICULUM_MODULES.find((m) => m.id === 'm_python_ai')!;
    const mod2 = KIBERONE_CURRICULUM_MODULES.find((m) => m.id === 'm_pygame')!;

    const skills = computeActiveModuleSuggestedSkillIds(
      [
        {
          id: 'mod-1',
          libraryModuleId: mod1.id,
          title: mod1.shortTitle,
          subtitle: mod1.subtitle,
          description: mod1.description,
          cardBgColor: mod1.cardBgColor,
          size: 'normal',
          order: 1,
          suggestedSkills: ['skill-python', 'skill-logic'],
        },
        {
          id: 'mod-2',
          libraryModuleId: mod2.id,
          title: mod2.shortTitle,
          subtitle: mod2.subtitle,
          description: mod2.description,
          cardBgColor: mod2.cardBgColor,
          size: 'normal',
          order: 2,
          // Без явного suggestedSkills — берёт из каталога; skill-python пересекается с mod-1
        },
        {
          id: 'mod-hidden',
          libraryModuleId: 'm_roblox',
          title: 'Roblox',
          subtitle: '3D',
          description: 'Hidden module',
          cardBgColor: '#DBEAFE',
          size: 'normal',
          order: 3,
          hidden: true,
          suggestedSkills: ['skill-3d-modeling'],
        },
      ],
      KIBERONE_CURRICULUM_MODULES
    );

    expect(skills).toContain('skill-python');
    expect(skills).toContain('skill-logic');
    expect(skills).not.toContain('skill-3d-modeling');
    // Без дубликатов
    expect(new Set(skills).size).toBe(skills.length);
  });

  it('подбирает релевантные шаблоны для «Момента гордости» в зависимости от модулей', () => {
    const pythonTemplates = getPrideTemplatesForModules([
      {
        id: 'm1',
        libraryModuleId: 'm_python_ai',
        title: 'Python + AI',
        subtitle: 'Разработка на Python',
        description: '',
        cardBgColor: '#FFF',
        size: 'normal',
        order: 1,
      },
    ]);
    expect(pythonTemplates).toContain('Написан первый рабочий код на Python');
    expect(pythonTemplates).toContain(UNIVERSAL_PRIDE_TEMPLATES[0]);

    const robloxTemplates = getPrideTemplatesForModules([
      {
        id: 'm2',
        libraryModuleId: 'm_roblox',
        title: 'Roblox',
        subtitle: '3D-игры',
        description: '',
        cardBgColor: '#FFF',
        size: 'normal',
        order: 1,
      },
    ]);
    expect(robloxTemplates).toContain('Создана собственная игровая карта в Roblox');

    const fallbackTemplates = getPrideTemplatesForModules([]);
    expect(fallbackTemplates.length).toBeGreaterThanOrEqual(4);
    expect(fallbackTemplates).toContain(UNIVERSAL_PRIDE_TEMPLATES[0]);
  });

  it('шаблоны письма наставника, гордости и сильных сторон гендерно-нейтральны и без (а)/(ла), а лимиты А4 заданы корректно', () => {
    expect(MENTOR_GREETING_MAX_CHARS).toBe(60);
    expect(MENTOR_BODY_MAX_CHARS).toBe(280);
    expect(MENTOR_SIGNATURE_MAX_CHARS).toBe(50);

    const allModuleTemplates = getPrideTemplatesForModules(
      KIBERONE_CURRICULUM_MODULES.map((m, idx) => ({
        id: `m-${idx}`,
        libraryModuleId: m.id,
        title: m.title,
        subtitle: m.subtitle || '',
        description: '',
        category: m.category,
        cardBgColor: '#FFF',
        size: 'normal' as const,
        order: idx + 1,
      }))
    );

    const textsToCheck = [
      ...UNIVERSAL_PRIDE_TEMPLATES,
      ...getPrideTemplatesForModules([]),
      ...allModuleTemplates,
      ...MENTOR_NOTE_TEMPLATES.flatMap((t) => [t.greeting, t.body]),
      ...STRENGTH_LIBRARY.map((s) => s.defaultExample),
    ];

    const forbiddenSlashOrParenthesis = /\(а\)|\(ла\)|\/а\b/i;
    const forbiddenGenderedForms =
      /\b(поработал|проявил|создал|написал|разработал|собрал|разобрался|довёл|сверстал|освоил|нашёл|сам)\b/i;

    for (const txt of textsToCheck) {
      expect(txt).not.toMatch(forbiddenSlashOrParenthesis);
      expect(txt).not.toMatch(forbiddenGenderedForms);
    }

    for (const tpl of MENTOR_NOTE_TEMPLATES) {
      expect(tpl.greeting.length).toBeLessThanOrEqual(MENTOR_GREETING_MAX_CHARS);
      expect(tpl.body.length).toBeLessThanOrEqual(MENTOR_BODY_MAX_CHARS);
    }
  });
});

describe('applyDesignSnapshotToJournal (Глобальное применение дизайна)', () => {
  it('копирует фон, стикеры, позиции блоков и стили, не перезаписывая личный контент ученика', () => {
    expect(STRENGTH_EXAMPLE_MAX_CHARS).toBe(180);

    const group = createBaseGroup();
    const res1 = createBaseResident({
      id: 'res-1',
      fullName: 'Иван Первый',
      age: '10 лет',
      journalId: 'j-1',
    });
    const res2 = createBaseResident({
      id: 'res-2',
      fullName: 'Мария Вторая',
      age: '11 лет',
      journalId: 'j-2',
    });

    const source = createStudentJournal(res1, group, TEST_BRANCH);
    source.page1.coverBgStart = '#1E293B';
    source.page1.coverBgEnd = '#0F172A';
    source.page1.background = { color: '#FEFCE8', showGrid: true, gridStyle: 'lines' };
    source.page1.objectLayouts = {
      coverBear: { x: 24, y: -12, scale: 1.15, rotation: 5, zIndex: 25 },
    };
    source.page1.decorElements = [
      {
        id: 'dec-custom-1',
        kind: 'sticker',
        stickerText: 'TOP CODER',
        x: 120,
        y: 80,
        width: 110,
        height: 44,
        rotation: -6,
        color: '#0D9488',
        opacity: 1,
        zIndex: 30,
      },
    ];
    source.page2.prideBgColor = '#A7F3D0';
    source.page2.mentorNote = {
      ...source.page2.mentorNote,
      greeting: 'Ваня, супер!',
      body: 'Личное письмо для Вани, которое не должно попасть Маше.',
      signature: 'Наставник Вани',
      fontStyle: 'sans',
      fontSize: 21,
      tiltDeg: 1.5,
    };
    source.page2.nextChapter.bgColor = '#E0E7FF';
    source.page2.nextChapter.bearScale = 1.25;

    const target = createStudentJournal(res2, group, TEST_BRANCH);
    target.page1.projects[0].title = 'Уникальный проект Маши';
    target.page2.prideText = 'Маша заняла 1 место на хакатоне!';
    target.page2.mentorNote = {
      ...target.page2.mentorNote,
      greeting: 'Маша, ты молодец!',
      body: 'Личное письмо специально для Маши.',
      signature: 'Твой наставник, Иван',
    };

    const updated = applyDesignSnapshotToJournal(target, source);

    // Дизайн и макет перенесены
    expect(updated.page1.coverBgStart).toBe('#1E293B');
    expect(updated.page1.coverBgEnd).toBe('#0F172A');
    expect(updated.page1.background?.color).toBe('#FEFCE8');
    expect(updated.page1.background?.showGrid).toBe(true);
    expect(updated.page1.objectLayouts?.coverBear?.x).toBe(24);
    expect(updated.page1.decorElements).toHaveLength(1);
    expect(updated.page1.decorElements?.[0].stickerText).toBe('TOP CODER');
    expect(updated.page2.prideBgColor).toBe('#A7F3D0');
    expect(updated.page2.mentorNote.fontStyle).toBe('sans');
    expect(updated.page2.mentorNote.fontSize).toBe(21);
    expect(updated.page2.mentorNote.tiltDeg).toBe(1.5);
    expect(updated.page2.nextChapter.bgColor).toBe('#E0E7FF');
    expect(updated.page2.nextChapter.bearScale).toBe(1.25);

    // Клонирование массивов/объектов не шарит ссылки с источником
    expect(updated.page1.decorElements?.[0]).not.toBe(source.page1.decorElements?.[0]);
    expect(updated.page1.objectLayouts?.coverBear).not.toBe(
      source.page1.objectLayouts?.coverBear
    );

    // Личный контент Маши полностью сохранён
    expect(updated.id).toBe('j-2');
    expect(updated.resident.fullName).toBe('Мария Вторая');
    expect(updated.resident.age).toBe('11 лет');
    expect(updated.page1.projects[0].title).toBe('Уникальный проект Маши');
    expect(updated.page2.prideText).toBe('Маша заняла 1 место на хакатоне!');
    expect(updated.page2.mentorNote.greeting).toBe('Маша, ты молодец!');
    expect(updated.page2.mentorNote.body).toBe('Личное письмо специально для Маши.');
  });

  it('переносит визуальные настройки совпадающих модулей и их transform, не затрагивая личные проекты и тексты', () => {
    const group = createBaseGroup({
      commonData: {
        paletteId: DESIGN_PALETTES[0].id,
        modules: [
          {
            id: 'mod-common-1',
            libraryModuleId: 'm_python_ai',
            title: 'Python + AI',
            subtitle: 'База Python',
            description: 'Исходное описание модуля',
            cardBgColor: '#FFF8B8',
            size: 'normal',
            order: 1,
            visualMode: 'image',
            customImageUrl: '/assets/modules/m_python_ai.png',
            imageScale: 1,
            imagePosX: 0,
            imagePosY: 0,
          },
        ],
        skills: [],
        nextChapterTitle: 'Дальше',
        nextChapterDescription: 'Описание',
        nextChapterTopics: [],
      },
    });

    const source = createStudentJournal(
      createBaseResident({ id: 'r1', fullName: 'Иван', journalId: 'j-src' }),
      group,
      TEST_BRANCH
    );
    const target = createStudentJournal(
      createBaseResident({ id: 'r2', fullName: 'Анна', journalId: 'j-tgt' }),
      group,
      TEST_BRANCH
    );

    const srcModId = source.page1.modules[0].id;
    const tgtModId = target.page1.modules[0].id;
    source.page1.modules[0] = {
      ...source.page1.modules[0],
      customImageUrl: '/assets/modules/m_figma.png',
      imageScale: 1.4,
      imagePosX: 8,
      imagePosY: -6,
      cardBgColor: '#DBEAFE',
      layoutVariant: 'badge-top',
      size: 'compact',
      description: 'Текст, отредактированный только у источника',
    };
    source.page1.objectLayouts = {
      ...source.page1.objectLayouts,
      [`module-${srcModId}`]: { x: 12, y: -8, scale: 1.05, rotation: 2, zIndex: 20 },
      [`project-${source.page1.projects[0].id}`]: { x: 99, y: 99, scale: 1.5, rotation: 15, zIndex: 20 },
    };

    target.page1.modules[0] = {
      ...target.page1.modules[0],
      description: 'Персональное описание Анны',
    };
    target.page1.objectLayouts = {
      ...target.page1.objectLayouts,
      [`project-${target.page1.projects[0].id}`]: { x: -10, y: 5, scale: 0.95, rotation: -2, zIndex: 18 },
    };

    const updated = applyDesignSnapshotToJournal(target, source);

    expect(updated.page1.modules[0].customImageUrl).toBe('/assets/modules/m_figma.png');
    expect(updated.page1.modules[0].imageScale).toBe(1.4);
    expect(updated.page1.modules[0].imagePosX).toBe(8);
    expect(updated.page1.modules[0].imagePosY).toBe(-6);
    expect(updated.page1.modules[0].cardBgColor).toBe('#DBEAFE');
    expect(updated.page1.modules[0].layoutVariant).toBe('badge-top');
    expect(updated.page1.modules[0].size).toBe('compact');
    expect(updated.page1.modules[0].description).toBe('Персональное описание Анны');

    expect(updated.page1.objectLayouts?.[`module-${tgtModId}`]).toEqual({
      x: 12,
      y: -8,
      scale: 1.05,
      rotation: 2,
      zIndex: 20,
    });
    expect(
      updated.page1.objectLayouts?.[`project-${target.page1.projects[0].id}`]
    ).toEqual({ x: -10, y: 5, scale: 0.95, rotation: -2, zIndex: 18 });
  });
});

describe('hasJournalDesignChanged', () => {
  it('отличает визуальные изменения дизайна от редактирования личных текстов ученика', () => {
    const group = createBaseGroup();
    const res = createBaseResident({ id: 'r-sig', fullName: 'Олег', journalId: 'j-sig' });
    const base = createStudentJournal(res, group, TEST_BRANCH);

    const textEdited: JournalDocument = {
      ...base,
      resident: { ...base.resident, fullName: 'Олег Сидоров' },
      page1: {
        ...base.page1,
        projects: base.page1.projects.map((p, i) =>
          i === 0 ? { ...p, title: 'Новое название проекта' } : p
        ),
      },
      page2: {
        ...base.page2,
        prideText: 'Обновлённый момент гордости',
        mentorNote: { ...base.page2.mentorNote, body: 'Новый текст письма' },
      },
    };
    expect(hasJournalDesignChanged(base, textEdited)).toBe(false);

    const stickerEdited: JournalDocument = {
      ...base,
      page1: {
        ...base.page1,
        decorElements: [
          ...(base.page1.decorElements ?? []),
          {
            id: 'dec-sig-1',
            kind: 'sticker',
            stickerText: 'WOW',
            x: 100,
            y: 100,
            width: 80,
            height: 80,
            rotation: 0,
            color: '#F59E0B',
            opacity: 1,
            zIndex: 20,
          },
        ],
      },
    };
    expect(hasJournalDesignChanged(base, stickerEdited)).toBe(true);

    const layoutEdited: JournalDocument = {
      ...base,
      page2: {
        ...base.page2,
        objectLayouts: {
          ...(base.page2.objectLayouts ?? {}),
          nextBear: { x: 10, y: 15, scale: 1.2, rotation: 0, zIndex: 25 },
        },
      },
    };
    expect(hasJournalDesignChanged(base, layoutEdited)).toBe(true);
  });
});

describe('Задача №40: лимиты стр. 1, последовательность стр. 2 и размеры объектов', () => {
  it('экспортирует лимиты максимум 6 модулей и 6 проектов и корректное сообщение', () => {
    expect(MAX_PAGE1_MODULES).toBe(6);
    expect(MAX_PAGE1_PROJECTS).toBe(6);
    expect(PAGE1_CARD_LIMIT_MESSAGE).toContain(
      'Достигнуто максимальное количество карточек'
    );
  });

  it('поддерживает строгий порядок блоков второй страницы: Сильные стороны -> Гордость -> Письмо наставника -> Карта будущего', () => {
    expect(DEFAULT_PAGE2_SECTION_ORDER).toEqual([
      'strengths',
      'pride',
      'mentorNote',
      'nextChapter',
    ]);
    expect(normalizePage2SectionOrder(undefined)).toEqual([
      'strengths',
      'pride',
      'mentorNote',
      'nextChapter',
    ]);
    expect(normalizePage2SectionOrder([])).toEqual([
      'strengths',
      'pride',
      'mentorNote',
      'nextChapter',
    ]);
    expect(
      normalizePage2SectionOrder(['pride', 'pride', 'mentorNote'])
    ).toEqual(['pride', 'mentorNote', 'strengths', 'nextChapter']);
  });

  it('отслеживает и переносит независимые width, height и preserveAspectRatio для карточек и медведя', () => {
    const group = createBaseGroup();
    const res1 = createBaseResident({
      id: 'res-40-1',
      fullName: 'Саша Один',
      journalId: 'j-40-1',
    });
    const res2 = createBaseResident({
      id: 'res-40-2',
      fullName: 'Даша Два',
      journalId: 'j-40-2',
    });

    const base = createStudentJournal(res1, group, TEST_BRANCH);
    const resized: JournalDocument = {
      ...base,
      page2: {
        ...base.page2,
        objectLayouts: {
          ...(base.page2.objectLayouts ?? {}),
          pride: {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            zIndex: 10,
            width: 390,
            height: 290,
            preserveAspectRatio: false,
          },
          mentorNote: {
            x: 12,
            y: -6,
            scale: 1,
            rotation: 0,
            zIndex: 10,
            width: 320,
            height: 410,
            preserveAspectRatio: true,
          },
          prideBear: {
            x: 8,
            y: 4,
            scale: 1,
            rotation: 0,
            zIndex: 20,
            width: 260,
            height: 200,
            preserveAspectRatio: false,
          },
        },
      },
    };

    expect(hasJournalDesignChanged(base, resized)).toBe(true);

    const target = createStudentJournal(res2, group, TEST_BRANCH);
    const applied = applyDesignSnapshotToJournal(target, resized);

    expect(applied.page2.objectLayouts?.pride).toEqual({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      zIndex: 10,
      width: 390,
      height: 290,
      preserveAspectRatio: false,
    });
    expect(applied.page2.objectLayouts?.mentorNote).toEqual({
      x: 12,
      y: -6,
      scale: 1,
      rotation: 0,
      zIndex: 10,
      width: 320,
      height: 410,
      preserveAspectRatio: true,
    });
    expect(applied.page2.objectLayouts?.prideBear).toEqual({
      x: 8,
      y: 4,
      scale: 1,
      rotation: 0,
      zIndex: 20,
      width: 260,
      height: 200,
      preserveAspectRatio: false,
    });
  });
});

describe('Задача №44: геометки маршрута и настройки декора/линии в nextChapter', () => {
  it('поддерживает 5 ярких цветов геометок и подбирает свободный цвет при добавлении', async () => {
    const {
      NEXT_PIN_COLOR_OPTIONS,
      getNextPinPalette,
      pickNextAvailablePinColor,
    } = await import('../../data/presets');

    expect(NEXT_PIN_COLOR_OPTIONS.map((o) => o.id)).toEqual([
      'teal',
      'yellow',
      'coral',
      'purple',
      'blue',
    ]);

    expect(getNextPinPalette('coral').hex).toBe('#FB7185');
    expect(getNextPinPalette(undefined, 3).id).toBe('purple');

    const picked = pickNextAvailablePinColor([
      { pinColor: '#14B8A6' },
      { pinColor: '#FB7185' },
    ]);
    expect(picked).toBe('#FACC15');
  });

  it('переносит showDecor, showRouteLine и bgColor при копировании дизайна без перезаписи личных направлений', () => {
    const group = createBaseGroup();
    const res1 = createBaseResident({
      id: 'res-44-1',
      fullName: 'Максим',
      journalId: 'j-44-1',
    });
    const res2 = createBaseResident({
      id: 'res-44-2',
      fullName: 'Алина',
      journalId: 'j-44-2',
    });

    const source = createStudentJournal(res1, group, TEST_BRANCH);
    source.page2.nextChapter.bgColor = '#EDE9FE';
    source.page2.nextChapter.showDecor = false;
    source.page2.nextChapter.showRouteLine = false;
    source.page2.nextChapter.topics = [
      {
        id: 't1',
        title: 'Секретный курс Максима',
        iconKey: 'python',
        pinColor: '#FB7185',
      },
    ];

    const target = createStudentJournal(res2, group, TEST_BRANCH);
    target.page2.nextChapter.topics = [
      {
        id: 'a1',
        title: '3D-моделирование Алины',
        iconKey: 'cube3d',
        pinColor: '#8B5CF6',
      },
    ];

    expect(hasJournalDesignChanged(target, source)).toBe(true);
    const updated = applyDesignSnapshotToJournal(target, source);

    expect(updated.page2.nextChapter.bgColor).toBe('#EDE9FE');
    expect(updated.page2.nextChapter.showDecor).toBe(false);
    expect(updated.page2.nextChapter.showRouteLine).toBe(false);
    expect(updated.page2.nextChapter.topics).toEqual([
      {
        id: 'a1',
        title: '3D-моделирование Алины',
        iconKey: 'cube3d',
        pinColor: '#8B5CF6',
      },
    ]);
  });
});




