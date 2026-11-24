import {
  AgeCategory,
  GroupCurriculumTemplate,
  JournalStatus,
  LibraryModule,
  ModuleCategoryConfig,
  ModuleCategoryId,
  ModuleIllustrationKey,
  ModuleLucideIconKey,
  SkillDefinition,
  SkillMasteryStatus,
} from '../types/journal';

export const JOURNAL_STATUS_OPTIONS: Array<{
  id: JournalStatus;
  label: string;
  badgeClass: string;
  barClass: string;
}> = [
  {
    id: 'not_started',
    label: 'Не начат',
    badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    barClass: 'bg-zinc-300',
  },
  {
    id: 'draft',
    label: 'Черновик',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    barClass: 'bg-amber-400',
  },
  {
    id: 'in_progress',
    label: 'Заполняется',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    barClass: 'bg-sky-400',
  },
  {
    id: 'needs_review',
    label: 'Требует проверки',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    barClass: 'bg-purple-400',
  },
  {
    id: 'ready',
    label: 'Готов к экспорту',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barClass: 'bg-emerald-500',
  },
  {
    id: 'exported',
    label: 'Экспортирован',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    barClass: 'bg-[#0D9488]',
  },
];

export function getJournalStatusMeta(status: JournalStatus | string) {
  return (
    JOURNAL_STATUS_OPTIONS.find((s) => s.id === status) ??
    JOURNAL_STATUS_OPTIONS[1]
  );
}

export const SKILL_MASTERY_OPTIONS: Array<{
  id: SkillMasteryStatus;
  label: string;
  shortLabel: string;
  badgeClass: string;
}> = [
  {
    id: 'familiar',
    label: 'Знакомится',
    shortLabel: 'Знакомится',
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
  {
    id: 'with-support',
    label: 'Осваивает с поддержкой',
    shortLabel: 'С поддержкой',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    id: 'independent',
    label: 'Применяет самостоятельно',
    shortLabel: 'Самостоятельно',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'new-tasks',
    label: 'Применяет в новых задачах',
    shortLabel: 'В новых задачах',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
  },
];

export function getSkillMasteryMeta(status: SkillMasteryStatus) {
  return (
    SKILL_MASTERY_OPTIONS.find((s) => s.id === status) ??
    SKILL_MASTERY_OPTIONS[2]
  );
}

export const MODULE_CATEGORIES: ModuleCategoryConfig[] = [
  {
    id: 'algorithms',
    name: 'Первые шаги и алгоритмы',
    shortName: 'Алгоритмы',
    description:
      'Визуальное программирование, логика последовательностей и первые проекты.',
    accentColor: '#C9F3EE',
    isBuiltIn: true,
    order: 1,
  },
  {
    id: 'games',
    name: 'Создание игр и игровые движки',
    shortName: 'Игры',
    description:
      'Игровые сцены, механики, модификации и разработка игр на профессиональных движках.',
    accentColor: '#DBEAFE',
    isBuiltIn: true,
    order: 2,
  },
  {
    id: 'digital-literacy',
    name: 'Цифровая грамотность и безопасность',
    shortName: 'Цифровая грамотность',
    description:
      'Устройство ПК, офисные и облачные сервисы, кибербезопасность.',
    accentColor: '#FEF08A',
    isBuiltIn: true,
    order: 3,
  },
  {
    id: 'ai',
    name: 'Искусственный интеллект и AI-продукты',
    shortName: 'AI и нейросети',
    description:
      'Промпт-инжиниринг, нейросети, голосовые навыки и создание умных продуктов с AI.',
    accentColor: '#E9D5FF',
    isBuiltIn: true,
    order: 4,
  },
  {
    id: 'design-3d',
    name: 'Дизайн, анимация и 3D',
    shortName: 'Дизайн и 3D',
    description:
      'Графика, UI/UX в Figma, пиксель-арт, покадровая и motion-анимация, 3D-моделирование.',
    accentColor: '#DDD6FE',
    isBuiltIn: true,
    order: 5,
  },
  {
    id: 'web-mobile',
    name: 'Сайты и мобильные приложения',
    shortName: 'Веб и мобильные',
    description:
      'HTML/CSS, JavaScript, боты и Mini App, мобильные приложения и базы данных.',
    accentColor: '#E0F2FE',
    isBuiltIn: true,
    order: 6,
  },
  {
    id: 'advanced-tech',
    name: 'Продвинутое программирование и технологии',
    shortName: 'Продвинутые технологии',
    description:
      'Тестирование, C#, облака, этичный хакинг, игровые движки и олимпиадные задачи.',
    accentColor: '#E2E8F0',
    isBuiltIn: true,
    order: 7,
  },
  {
    id: 'financial',
    name: 'Финансовая грамотность',
    shortName: 'Финансы',
    description:
      'Осознанное управление личными ресурсами, планирование и финансовый интеллект.',
    accentColor: '#D1FAE5',
    isBuiltIn: true,
    order: 8,
  },
];

export const UNIFIED_SKILLS_CATALOG: SkillDefinition[] = [
  // 1. Алгоритмическое мышление
  { id: 'skill-logic', label: 'Логическое мышление', group: 'Алгоритмическое мышление', defaultColor: '#48C9D8', isBuiltIn: true },
  { id: 'skill-algorithmization', label: 'Алгоритмическое мышление', group: 'Алгоритмическое мышление', defaultColor: '#FF8A75', isBuiltIn: true },
  { id: 'skill-sequence', label: 'Последовательность действий', group: 'Алгоритмическое мышление', defaultColor: '#A7F3D0', isBuiltIn: true },
  { id: 'skill-decomposition', label: 'Декомпозиция задач', group: 'Алгоритмическое мышление', defaultColor: '#7DD3FC', isBuiltIn: true },
  { id: 'skill-analysis', label: 'Анализ условий задачи', group: 'Алгоритмическое мышление', defaultColor: '#FDE68A', isBuiltIn: true },
  { id: 'skill-problem-solving', label: 'Поиск решений', group: 'Алгоритмическое мышление', defaultColor: '#FFE047', isBuiltIn: true },
  { id: 'skill-spatial', label: 'Пространственное мышление', group: 'Алгоритмическое мышление', defaultColor: '#BAE6FD', isBuiltIn: true },

  // 2. Программирование
  { id: 'skill-visual-coding', label: 'Визуальное программирование', group: 'Программирование', defaultColor: '#6EE7B7', isBuiltIn: true },
  { id: 'skill-text-coding', label: 'Текстовое программирование', group: 'Программирование', defaultColor: '#7DD3FC', isBuiltIn: true },
  { id: 'skill-code-work', label: 'Работа с кодом', group: 'Программирование', defaultColor: '#93C5FD', isBuiltIn: true },
  { id: 'skill-syntax', label: 'Понимание синтаксиса', group: 'Программирование', defaultColor: '#FDE68A', isBuiltIn: true },
  { id: 'skill-python', label: 'Программирование на Python', group: 'Программирование', defaultColor: '#FFE047', isBuiltIn: true },
  { id: 'skill-csharp', label: 'Синтаксис C#', group: 'Программирование', defaultColor: '#CBD5E1', isBuiltIn: true },
  { id: 'skill-program-logic', label: 'Логика программ', group: 'Программирование', defaultColor: '#48C9D8', isBuiltIn: true },
  { id: 'skill-debugging', label: 'Отладка и поиск ошибок', group: 'Программирование', defaultColor: '#FECDD3', isBuiltIn: true },

  // 3. Разработка игр
  { id: 'skill-game-design', label: 'Проектирование игр', group: 'Разработка игр', defaultColor: '#93C5FD', isBuiltIn: true },
  { id: 'skill-game-mechanics', label: 'Создание игровых механик', group: 'Разработка игр', defaultColor: '#6EE7B7', isBuiltIn: true },
  { id: 'skill-game-objects', label: 'Работа с игровыми объектами', group: 'Разработка игр', defaultColor: '#FDE68A', isBuiltIn: true },
  { id: 'skill-game-scenes', label: 'Проектирование игровых сцен и миров', group: 'Разработка игр', defaultColor: '#A7F3D0', isBuiltIn: true },
  { id: 'skill-game-engine', label: 'Работа с игровым движком', group: 'Разработка игр', defaultColor: '#BFDBFE', isBuiltIn: true },
  { id: 'skill-game-testing', label: 'Тестирование игр', group: 'Разработка игр', defaultColor: '#FECDD3', isBuiltIn: true },

  // 4. Веб-разработка
  { id: 'skill-html', label: 'Основы HTML', group: 'Веб-разработка', defaultColor: '#BAE6FD', isBuiltIn: true },
  { id: 'skill-css', label: 'Стилизация CSS', group: 'Веб-разработка', defaultColor: '#7DD3FC', isBuiltIn: true },
  { id: 'skill-javascript', label: 'Программирование на JavaScript', group: 'Веб-разработка', defaultColor: '#FFE047', isBuiltIn: true },
  { id: 'skill-typescript', label: 'Основы TypeScript', group: 'Веб-разработка', defaultColor: '#93C5FD', isBuiltIn: true },
  { id: 'skill-web-structure', label: 'Структура веб-страниц', group: 'Веб-разработка', defaultColor: '#C4B5FD', isBuiltIn: true },
  { id: 'skill-app-dev', label: 'Проектирование и разработка приложений', group: 'Веб-разработка', defaultColor: '#A5F3FC', isBuiltIn: true },
  { id: 'skill-php-sql', label: 'Работа с PHP и SQL', group: 'Веб-разработка', defaultColor: '#DDD6FE', isBuiltIn: true },
  { id: 'skill-automation', label: 'Автоматизация и чат-боты', group: 'Веб-разработка', defaultColor: '#6EE7B7', isBuiltIn: true },

  // 5. Дизайн и творчество
  { id: 'skill-composition', label: 'Визуальная композиция', group: 'Дизайн и творчество', defaultColor: '#DDD6FE', isBuiltIn: true },
  { id: 'skill-ui-ux', label: 'UI/UX-дизайн интерфейсов', group: 'Дизайн и творчество', defaultColor: '#C4B5FD', isBuiltIn: true },
  { id: 'skill-raster-graphics', label: 'Работа с изображениями и цветом', group: 'Дизайн и творчество', defaultColor: '#FBCFE8', isBuiltIn: true },
  { id: 'skill-pixel-art', label: 'Пиксельная графика', group: 'Дизайн и творчество', defaultColor: '#FDE68A', isBuiltIn: true },
  { id: 'skill-3d-modeling', label: '3D-моделирование', group: 'Дизайн и творчество', defaultColor: '#BFDBFE', isBuiltIn: true },
  { id: 'skill-animation', label: 'Покадровая и motion-анимация', group: 'Дизайн и творчество', defaultColor: '#E9D5FF', isBuiltIn: true },
  { id: 'skill-storytelling', label: 'Визуальное повествование и сюжеты', group: 'Дизайн и творчество', defaultColor: '#FED7AA', isBuiltIn: true },

  // 6. Работа с AI
  { id: 'skill-prompting', label: 'Промпт-инжиниринг', group: 'Работа с AI', defaultColor: '#E9D5FF', isBuiltIn: true },
  { id: 'skill-task-setting', label: 'Постановка задач и структурирование', group: 'Работа с AI', defaultColor: '#C4B5FD', isBuiltIn: true },
  { id: 'skill-ai-tools', label: 'Работа с AI-инструментами', group: 'Работа с AI', defaultColor: '#DDD6FE', isBuiltIn: true },
  { id: 'skill-ai-eval', label: 'Критическая оценка ответов AI', group: 'Работа с AI', defaultColor: '#FBCFE8', isBuiltIn: true },
  { id: 'skill-ai-dev', label: 'AI-assisted development', group: 'Работа с AI', defaultColor: '#A5F3FC', isBuiltIn: true },

  // 7. Цифровая грамотность
  { id: 'skill-pc-hardware', label: 'Понимание устройства ПК', group: 'Цифровая грамотность', defaultColor: '#FEF08A', isBuiltIn: true },
  { id: 'skill-digital-literacy', label: 'Цифровая грамотность', group: 'Цифровая грамотность', defaultColor: '#FDE68A', isBuiltIn: true },
  { id: 'skill-info-search', label: 'Поиск и организация информации', group: 'Цифровая грамотность', defaultColor: '#BAE6FD', isBuiltIn: true },
  { id: 'skill-docs', label: 'Оформление документов и презентаций', group: 'Цифровая грамотность', defaultColor: '#FED7AA', isBuiltIn: true },
  { id: 'skill-tables', label: 'Работа с таблицами и данными', group: 'Цифровая грамотность', defaultColor: '#A7F3D0', isBuiltIn: true },
  { id: 'skill-cybersecurity', label: 'Цифровая безопасность', group: 'Цифровая грамотность', defaultColor: '#FECDD3', isBuiltIn: true },
  { id: 'skill-data-protection', label: 'Защита личных данных и анализ рисков', group: 'Цифровая грамотность', defaultColor: '#FF8A75', isBuiltIn: true },
  { id: 'skill-cloud-tech', label: 'Понимание облачных технологий и данных', group: 'Цифровая грамотность', defaultColor: '#E2E8F0', isBuiltIn: true },

  // 8. Проектная деятельность
  { id: 'skill-ideation', label: 'Генерация идей', group: 'Проектная деятельность', defaultColor: '#FFE047', isBuiltIn: true },
  { id: 'skill-product-thinking', label: 'Продуктовое мышление', group: 'Проектная деятельность', defaultColor: '#FF8A75', isBuiltIn: true },
  { id: 'skill-prototyping', label: 'Прототипирование', group: 'Проектная деятельность', defaultColor: '#C4B5FD', isBuiltIn: true },
  { id: 'skill-testing', label: 'Тестирование и проверка результатов', group: 'Проектная деятельность', defaultColor: '#48C9D8', isBuiltIn: true },
  { id: 'skill-project-work', label: 'Проектная деятельность', group: 'Проектная деятельность', defaultColor: '#6EE7B7', isBuiltIn: true },
  { id: 'skill-presentation', label: 'Представление цифрового продукта', group: 'Проектная деятельность', defaultColor: '#FED7AA', isBuiltIn: true },

  // 9. Личностные и универсальные навыки
  { id: 'skill-creativity', label: 'Креативное мышление', group: 'Личностные и универсальные навыки', defaultColor: '#FFE047', isBuiltIn: true },
  { id: 'skill-autonomy', label: 'Самостоятельность', group: 'Личностные и универсальные навыки', defaultColor: '#C4B5FD', isBuiltIn: true },
  { id: 'skill-analytical', label: 'Аналитическое мышление', group: 'Личностные и универсальные навыки', defaultColor: '#FECDD3', isBuiltIn: true },
  { id: 'skill-nonstandard', label: 'Решение нестандартных задач', group: 'Личностные и универсальные навыки', defaultColor: '#FF8A75', isBuiltIn: true },
  { id: 'skill-research', label: 'Исследовательский подход', group: 'Личностные и универсальные навыки', defaultColor: '#A7F3D0', isBuiltIn: true },
  { id: 'skill-financial', label: 'Финансовая грамотность и планирование', group: 'Личностные и универсальные навыки', defaultColor: '#D1FAE5', isBuiltIn: true },
  { id: 'skill-time-management', label: 'Стратегия решения и управление временем', group: 'Личностные и универсальные навыки', defaultColor: '#E2E8F0', isBuiltIn: true },
];

export const SKILL_LABEL_BY_ID: Record<string, string> = Object.fromEntries(
  UNIFIED_SKILLS_CATALOG.map((s) => [s.id, s.label])
);

const CATEGORY_COLOR_MAP: Record<string, string> = Object.fromEntries(
  MODULE_CATEGORIES.map((c) => [c.id, c.accentColor])
);

interface SeedSpec {
  id: string;
  code: string;
  officialTitle: string;
  displayTitle: string;
  subtitle: string;
  description: string;
  category: ModuleCategoryId;
  filterCategories?: ModuleCategoryId[];
  illustrationKey: ModuleIllustrationKey;
  iconKey: ModuleLucideIconKey;
  visualNotes: string;
  suggestedSkills: string[];
  badgeLabel: string;
  cardBgColor?: string;
}

function makeModule(spec: SeedSpec): LibraryModule {
  const now = '2026-09-01T10:00:00.000Z';
  const bg = spec.cardBgColor ?? CATEGORY_COLOR_MAP[spec.category] ?? '#C9F3EE';
  return {
    id: spec.id,
    code: spec.code,
    officialTitle: spec.officialTitle,
    displayTitle: spec.displayTitle,
    title: spec.displayTitle,
    subtitle: spec.subtitle,
    description: spec.description,
    category: spec.category,
    filterCategories: spec.filterCategories,
    illustrationKey: spec.illustrationKey,
    iconKey: spec.iconKey,
    visualMode: 'illustration',
    visualNotes: spec.visualNotes,
    imageMediaId: null,
    cardBgColor: bg,
    accentColor: bg,
    suggestedSkills: spec.suggestedSkills,
    relatedSkills: spec.suggestedSkills.map(
      (sid) => SKILL_LABEL_BY_ID[sid] ?? sid
    ),
    badgeLabel: spec.badgeLabel,
    isActive: true,
    isEditable: true,
    createdAt: now,
    updatedAt: now,
  };
}

export const KIBERONE_CURRICULUM_MODULES: LibraryModule[] = [
  // КАТЕГОРИЯ 1. ПЕРВЫЕ ШАГИ И АЛГОРИТМЫ
  makeModule({
    id: 'module-creative-engineering',
    code: 'M001',
    officialTitle: 'Вводный модуль. Креативный инжиниринг и магия ИИ',
    displayTitle: 'Креативный инжиниринг',
    subtitle: 'Старт и AI',
    description:
      'Знакомство с технологиями, креативным мышлением и возможностями искусственного интеллекта. Первые эксперименты с цифровыми инструментами и поиск необычных решений.',
    category: 'algorithms',
    illustrationKey: 'ai',
    iconKey: 'lightbulb',
    visualNotes: 'лампочка, цифровые идеи, нейросеть, творческая лаборатория',
    suggestedSkills: [
      'skill-creativity',
      'skill-ideation',
      'skill-nonstandard',
      'skill-digital-literacy',
      'skill-ai-tools',
      'skill-research',
    ],
    badgeLabel: 'Старт + ИИ',
  }),
  makeModule({
    id: 'module-scratch-junior',
    code: 'M002',
    officialTitle: 'Основы программирования в Scratch Junior',
    displayTitle: 'Scratch Junior',
    subtitle: 'Блочный код',
    description:
      'Первые шаги в программировании через визуальные блоки. Создание простых интерактивных историй и управление персонажами с помощью последовательности команд.',
    category: 'algorithms',
    illustrationKey: 'scratch',
    iconKey: 'blocks',
    visualNotes: 'цветные блоки программирования, персонажи, планшет',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-sequence',
      'skill-visual-coding',
      'skill-logic',
      'skill-storytelling',
    ],
    badgeLabel: 'Алгоритмы',
  }),
  makeModule({
    id: 'module-code-monkey',
    code: 'M003',
    officialTitle: 'Логика и алгоритмы через игровые квесты Code Monkey',
    displayTitle: 'Code Monkey',
    subtitle: 'Игровые квесты',
    description:
      'Решение игровых головоломок с помощью алгоритмов и последовательных команд. Знакомство с логикой программирования через игровые задачи.',
    category: 'algorithms',
    illustrationKey: 'algorithms',
    iconKey: 'rocket',
    visualNotes: 'обезьянка, бананы, игровой маршрут, блоки команд',
    suggestedSkills: [
      'skill-logic',
      'skill-algorithmization',
      'skill-sequence',
      'skill-problem-solving',
      'skill-spatial',
    ],
    badgeLabel: 'Логика',
  }),
  makeModule({
    id: 'module-kodu-game-lab',
    code: 'M004',
    officialTitle: 'Знакомство с 3D. Разработка 3D-миров в Kodu Game Lab',
    displayTitle: 'Kodu Game Lab',
    subtitle: '3D-игры',
    description:
      'Знакомство с визуальным программированием и создание собственных трёхмерных миров, игровых персонажей и игровых ситуаций.',
    category: 'algorithms',
    illustrationKey: 'kodu',
    iconKey: 'gamepad',
    visualNotes: 'объёмные игровые блоки, 3D-остров, контроллер',
    suggestedSkills: [
      'skill-visual-coding',
      'skill-spatial',
      'skill-game-scenes',
      'skill-algorithmization',
      'skill-game-mechanics',
    ],
    badgeLabel: '3D-миры',
  }),
  makeModule({
    id: 'module-scratch-advanced',
    code: 'M005',
    officialTitle: 'Scratch. Продвинутый уровень - создаём игры, как маленькие разработчики!',
    displayTitle: 'Scratch Advanced',
    subtitle: 'Игры в Scratch',
    description:
      'Продолжение работы в Scratch и создание собственных интерактивных игр с персонажами, событиями и игровыми механиками.',
    category: 'algorithms',
    illustrationKey: 'scratch',
    iconKey: 'blocks',
    visualNotes: 'Scratch-блоки, игровые персонажи, сцена игры',
    suggestedSkills: [
      'skill-visual-coding',
      'skill-program-logic',
      'skill-game-design',
      'skill-game-objects',
      'skill-algorithmization',
    ],
    badgeLabel: 'Scratch',
  }),
  makeModule({
    id: 'module-run-marco',
    code: 'M006',
    officialTitle: 'Алгоритмы приключений: квест-кодинг Run Marco! Учимся думать, как разработчики.',
    displayTitle: 'Run Marco!',
    subtitle: 'Квест-кодинг',
    description:
      'Прохождение алгоритмических приключений, в которых необходимо составлять последовательности команд и находить правильный путь к решению задачи.',
    category: 'algorithms',
    illustrationKey: 'algorithms',
    iconKey: 'rocket',
    visualNotes: 'игровой квест, карта маршрута, команды движения',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-logic',
      'skill-sequence',
      'skill-problem-solving',
      'skill-analysis',
    ],
    badgeLabel: 'Квест-кодинг',
  }),
  makeModule({
    id: 'module-piktomir',
    code: 'M007',
    officialTitle: 'Алгоритмические головоломки. Пиктомир',
    displayTitle: 'Пиктомир',
    subtitle: 'Алгоритмы',
    description:
      'Решение алгоритмических головоломок и освоение принципов построения команд для виртуальных исполнителей.',
    category: 'algorithms',
    illustrationKey: 'algorithms',
    iconKey: 'blocks',
    visualNotes: 'пиктограммы, геометрическая сетка, стрелки и маршруты',
    suggestedSkills: [
      'skill-logic',
      'skill-algorithmization',
      'skill-spatial',
      'skill-analysis',
      'skill-sequence',
    ],
    badgeLabel: 'Пиктомир',
  }),
  makeModule({
    id: 'module-blockly',
    code: 'M008',
    officialTitle: 'Текстовый код и мышление программиста. Blockly',
    displayTitle: 'Blockly',
    subtitle: 'Логика и код',
    description:
      'Знакомство с принципами программного кода через визуальные конструкции и переход к более структурированному пониманию команд.',
    category: 'algorithms',
    illustrationKey: 'scratch',
    iconKey: 'code',
    visualNotes: 'цветные блоки кода, окно программирования',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-task-setting',
      'skill-program-logic',
      'skill-syntax',
      'skill-problem-solving',
    ],
    badgeLabel: 'Blockly',
  }),

  // КАТЕГОРИЯ 2. СОЗДАНИЕ ИГР И ИГРОВЫЕ ДВИЖКИ
  makeModule({
    id: 'module-lua-minecraft',
    code: 'M009',
    officialTitle: 'Азы программирования на языке Lua. Minecraft Education.',
    displayTitle: 'Lua + Minecraft',
    subtitle: 'Код в игре',
    description:
      'Знакомство с программированием на языке Lua в контексте игровой среды Minecraft Education и изучение принципов взаимодействия команд с игровым миром.',
    category: 'games',
    illustrationKey: 'roblox',
    iconKey: 'code',
    visualNotes: 'пиксельный игровой мир, кубы, код',
    suggestedSkills: [
      'skill-text-coding',
      'skill-syntax',
      'skill-logic',
      'skill-algorithmization',
      'skill-game-mechanics',
    ],
    badgeLabel: 'Lua',
  }),
  makeModule({
    id: 'module-construct-2',
    code: 'M010',
    officialTitle: 'Игры без кода: проектируем как профи на Construct 2',
    displayTitle: 'Construct 2',
    subtitle: '2D-движок',
    description:
      'Создание игровых проектов без традиционного написания программного кода. Знакомство с игровыми событиями, объектами и механиками.',
    category: 'games',
    illustrationKey: 'kodu',
    iconKey: 'gamepad',
    visualNotes: 'игровая сцена, объекты, редактор Construct',
    suggestedSkills: [
      'skill-game-design',
      'skill-game-mechanics',
      'skill-game-scenes',
      'skill-decomposition',
      'skill-game-testing',
    ],
    badgeLabel: 'Construct 2',
  }),
  makeModule({
    id: 'module-roblox',
    code: 'M011',
    officialTitle: 'Roblox. Структурируем алгоритмы и коды с помощью популярной игры',
    displayTitle: 'Roblox',
    subtitle: 'Игровые миры',
    description:
      'Знакомство с игровым проектированием и алгоритмическими принципами через популярную игровую среду Roblox.',
    category: 'games',
    illustrationKey: 'roblox',
    iconKey: 'gamepad',
    visualNotes: '3D-персонажи, игровой мир, кубические объекты',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-game-mechanics',
      'skill-game-objects',
      'skill-task-setting',
      'skill-problem-solving',
    ],
    badgeLabel: 'Roblox',
  }),
  makeModule({
    id: 'module-minecraft-mods',
    code: 'M012',
    officialTitle: 'Создание модов в Minecraft',
    displayTitle: 'Minecraft Mods',
    subtitle: 'Модификации',
    description:
      'Знакомство с возможностями изменения игровой среды и создание собственных элементов и модификаций для Minecraft.',
    category: 'games',
    illustrationKey: 'kodu',
    iconKey: 'blocks',
    visualNotes: 'кубы Minecraft, игровые предметы, редактор модификаций',
    suggestedSkills: [
      'skill-project-work',
      'skill-game-objects',
      'skill-logic',
      'skill-digital-literacy',
      'skill-testing',
    ],
    badgeLabel: 'Minecraft',
  }),
  makeModule({
    id: 'module-unity-2d',
    code: 'M013',
    officialTitle: 'Мир игр на Unity 2D на популярном движке + AI-помощники',
    displayTitle: 'Unity 2D',
    subtitle: 'Unity + AI',
    description:
      'Знакомство с разработкой двухмерных игр в Unity, созданием игровых сцен, объектов и взаимодействий с использованием AI-помощников.',
    category: 'games',
    illustrationKey: 'kodu',
    iconKey: 'gamepad',
    visualNotes: 'игровая 2D-сцена, Unity, персонаж',
    suggestedSkills: [
      'skill-game-design',
      'skill-game-engine',
      'skill-game-scenes',
      'skill-game-mechanics',
      'skill-ai-dev',
      'skill-testing',
    ],
    badgeLabel: 'Unity 2D',
  }),
  // Deduplicated M014 & M051 -> single canonical Unreal Engine entry with filterCategories
  makeModule({
    id: 'module-unreal-engine',
    code: 'M014',
    officialTitle: 'Разработка игр на движке Unreal',
    displayTitle: 'Unreal Engine',
    subtitle: '3D-движок',
    description:
      'Знакомство с возможностями игрового движка Unreal Engine и процессом создания 3D-игровых пространств, объектов и интерактивных проектов.',
    category: 'games',
    filterCategories: ['games', 'advanced-tech'],
    illustrationKey: 'design3d',
    iconKey: 'box',
    visualNotes: 'трёхмерная игровая сцена, игровой движок Unreal Engine',
    suggestedSkills: [
      'skill-game-design',
      'skill-game-engine',
      'skill-game-scenes',
      'skill-game-objects',
      'skill-spatial',
      'skill-project-work',
    ],
    badgeLabel: 'Unreal',
  }),
  // Deduplicated M015 & M052 -> single canonical Godot entry with filterCategories
  makeModule({
    id: 'module-godot',
    code: 'M015',
    officialTitle: 'Godot. Основа создания легендарных игр',
    displayTitle: 'Godot',
    subtitle: 'Игровой движок',
    description:
      'Знакомство с игровым движком Godot, организацией сцен, логикой взаимодействий и основными этапами создания собственного игрового проекта.',
    category: 'games',
    filterCategories: ['games', 'advanced-tech'],
    illustrationKey: 'kodu',
    iconKey: 'gamepad',
    visualNotes: 'игровой редактор Godot, персонаж, игровая сцена',
    suggestedSkills: [
      'skill-game-design',
      'skill-game-engine',
      'skill-game-scenes',
      'skill-game-mechanics',
      'skill-project-work',
    ],
    badgeLabel: 'Godot',
  }),

  // КАТЕГОРИЯ 3. ЦИФРОВАЯ ГРАМОТНОСТЬ И БЕЗОПАСНОСТЬ
  makeModule({
    id: 'module-pc-hardware',
    code: 'M016',
    officialTitle: 'Устройство компьютера: из чего состоит пк и как он работает',
    displayTitle: 'Устройство компьютера',
    subtitle: 'Архитектура ПК',
    description:
      'Знакомство с основными компонентами компьютера, их назначением и принципами взаимодействия.',
    category: 'digital-literacy',
    illustrationKey: 'hardware',
    iconKey: 'cpu',
    visualNotes: 'компьютер в разобранном виде, комплектующие',
    suggestedSkills: [
      'skill-pc-hardware',
      'skill-digital-literacy',
      'skill-analysis',
      'skill-research',
    ],
    badgeLabel: 'Железо',
  }),
  makeModule({
    id: 'module-word-excel',
    code: 'M017',
    officialTitle: 'Цифровая база для школьника: используем Word и Excel как профи',
    displayTitle: 'Word + Excel',
    subtitle: 'Документы и таблицы',
    description:
      'Освоение инструментов для работы с документами, таблицами и организацией информации.',
    category: 'digital-literacy',
    illustrationKey: 'office',
    iconKey: 'fileSpreadsheet',
    visualNotes: 'документы, таблицы, офисные приложения',
    suggestedSkills: [
      'skill-docs',
      'skill-info-search',
      'skill-tables',
      'skill-digital-literacy',
    ],
    badgeLabel: 'Office',
  }),
  makeModule({
    id: 'module-powerpoint',
    code: 'M018',
    officialTitle: 'Магия эффектных презентаций PowerPoint',
    displayTitle: 'PowerPoint',
    subtitle: 'Презентации',
    description:
      'Создание выразительных презентаций, работа с композицией слайдов, визуальными материалами и представлением информации.',
    category: 'digital-literacy',
    illustrationKey: 'office',
    iconKey: 'presentation',
    visualNotes: 'презентационные слайды, экран, иллюстрации',
    suggestedSkills: [
      'skill-docs',
      'skill-composition',
      'skill-info-search',
      'skill-presentation',
    ],
    badgeLabel: 'Слайды',
  }),
  makeModule({
    id: 'module-qr-tech',
    code: 'M019',
    officialTitle: 'QR-код: что это и как его использовать',
    displayTitle: 'QR-технологии',
    subtitle: 'Цифровые ссылки',
    description:
      'Знакомство с QR-кодами, принципами их использования и способами быстрого доступа к цифровой информации.',
    category: 'digital-literacy',
    illustrationKey: 'hardware',
    iconKey: 'qr',
    visualNotes: 'QR-код, смартфон, цифровые ссылки',
    suggestedSkills: [
      'skill-digital-literacy',
      'skill-info-search',
      'skill-project-work',
    ],
    badgeLabel: 'QR',
  }),
  makeModule({
    id: 'module-yandex-services',
    code: 'M020',
    officialTitle: 'Полезные Яндекс-сервисы для жизни',
    displayTitle: 'Сервисы Яндекса',
    subtitle: 'Облачные сервисы',
    description:
      'Знакомство с цифровыми сервисами Яндекса и их применением для учёбы, поиска информации и повседневных задач.',
    category: 'digital-literacy',
    illustrationKey: 'cloud',
    iconKey: 'cloud',
    visualNotes: 'поисковая строка, облако, браузер',
    suggestedSkills: [
      'skill-digital-literacy',
      'skill-info-search',
      'skill-cloud-tech',
    ],
    badgeLabel: 'Сервисы',
  }),
  makeModule({
    id: 'module-cybersecurity',
    code: 'M021',
    officialTitle: 'Основы кибербезопасности',
    displayTitle: 'Кибербезопасность',
    subtitle: 'Защита данных',
    description:
      'Знакомство с правилами безопасного поведения в интернете, защитой личных данных и основными цифровыми угрозами.',
    category: 'digital-literacy',
    illustrationKey: 'security',
    iconKey: 'shield',
    visualNotes: 'щит, замок, компьютер, защищённые данные',
    suggestedSkills: [
      'skill-cybersecurity',
      'skill-data-protection',
      'skill-digital-literacy',
      'skill-analysis',
    ],
    badgeLabel: 'Безопасность',
  }),

  // КАТЕГОРИЯ 4. ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ И AI-ПРОДУКТЫ
  makeModule({
    id: 'module-prompt-engineering',
    code: 'M022',
    officialTitle: 'Промпт-инжиниринг: учимся правильно давать задачи ИИ',
    displayTitle: 'Prompt Engineering',
    subtitle: 'Задачи для ИИ',
    description:
      'Изучение способов взаимодействия с нейросетями через правильно сформулированные запросы и постановку задач.',
    category: 'ai',
    illustrationKey: 'ai',
    iconKey: 'sparkles',
    visualNotes: 'диалог с AI, текстовый запрос, цифровая голова',
    suggestedSkills: [
      'skill-prompting',
      'skill-task-setting',
      'skill-ai-eval',
      'skill-ai-tools',
    ],
    badgeLabel: 'Prompts',
  }),
  makeModule({
    id: 'module-neural-networks',
    code: 'M023',
    officialTitle: 'Нейросети: современные инструменты для учебы и творчества',
    displayTitle: 'Нейросети',
    subtitle: 'AI для учёбы',
    description:
      'Знакомство с современными инструментами искусственного интеллекта и их применением в учебных и творческих задачах.',
    category: 'ai',
    illustrationKey: 'ai',
    iconKey: 'bot',
    visualNotes: 'нейросеть, цифровые изображения, AI-символ',
    suggestedSkills: [
      'skill-ai-tools',
      'skill-creativity',
      'skill-task-setting',
      'skill-ai-eval',
    ],
    badgeLabel: 'Нейросети',
  }),
  makeModule({
    id: 'module-ai-storytelling',
    code: 'M024',
    officialTitle: 'Цифровая книга с персонажами и озвучкой - AI Storytelling',
    displayTitle: 'AI Storytelling',
    subtitle: 'Цифровая книга',
    description:
      'Создание собственной цифровой истории с персонажами, иллюстрациями и озвучкой с использованием AI-инструментов.',
    category: 'ai',
    illustrationKey: 'animaker',
    iconKey: 'bookOpen',
    visualNotes: 'открытая книга, персонажи, звуковые волны',
    suggestedSkills: [
      'skill-storytelling',
      'skill-creativity',
      'skill-ai-tools',
      'skill-composition',
    ],
    badgeLabel: 'Storytelling',
  }),
  makeModule({
    id: 'module-vibe-coding',
    code: 'M025',
    officialTitle: 'Vibe Coding & AI-инжиниринг',
    displayTitle: 'Vibe Coding',
    subtitle: 'AI-разработка',
    description:
      'Знакомство с новым подходом к созданию цифровых продуктов при помощи AI-инструментов и последовательной постановки задач.',
    category: 'ai',
    illustrationKey: 'ai',
    iconKey: 'terminal',
    visualNotes: 'AI-ассистент, окно кода, цифровой проект',
    suggestedSkills: [
      'skill-ai-dev',
      'skill-task-setting',
      'skill-decomposition',
      'skill-code-work',
      'skill-testing',
    ],
    badgeLabel: 'Vibe Coding',
  }),
  makeModule({
    id: 'module-ai-product-lab',
    code: 'M026',
    officialTitle: 'AI Product Lab. Собираем MVP за 3 занятия – как взрослые IT-команды',
    displayTitle: 'AI Product Lab',
    subtitle: 'Продукт и MVP',
    description:
      'Знакомство с процессом создания цифрового продукта: от идеи и определения задачи до прототипа и первого MVP.',
    category: 'ai',
    illustrationKey: 'ai',
    iconKey: 'rocket',
    visualNotes: 'прототип приложения, доска идей, продуктовые карточки',
    suggestedSkills: [
      'skill-product-thinking',
      'skill-ideation',
      'skill-prototyping',
      'skill-ai-dev',
      'skill-project-work',
    ],
    badgeLabel: 'Product Lab',
  }),
  makeModule({
    id: 'module-voice-assistant-alice',
    code: 'M027',
    officialTitle: 'Обучение голосового помощника. Собственный навык для Алисы',
    displayTitle: 'Голосовой помощник',
    subtitle: 'Навык для Алисы',
    description:
      'Разработка собственного сценария взаимодействия с голосовым помощником и знакомство с принципами голосовых интерфейсов.',
    category: 'ai',
    illustrationKey: 'chatbot',
    iconKey: 'bot',
    visualNotes: 'голосовой помощник, микрофон, звуковые волны',
    suggestedSkills: [
      'skill-automation',
      'skill-logic',
      'skill-task-setting',
      'skill-testing',
    ],
    badgeLabel: 'Voice AI',
  }),
  makeModule({
    id: 'module-python-ai',
    code: 'M028',
    officialTitle: 'Язык программирования Python + AI-помощники',
    displayTitle: 'Python + AI',
    subtitle: 'Код и AI',
    description:
      'Изучение основ текстового программирования на Python с использованием AI-помощников для решения задач и работы с кодом.',
    category: 'ai',
    illustrationKey: 'python',
    iconKey: 'code',
    visualNotes: 'логотип Python, окно кода, AI-ассистент',
    suggestedSkills: [
      'skill-text-coding',
      'skill-python',
      'skill-algorithmization',
      'skill-code-work',
      'skill-ai-dev',
      'skill-debugging',
    ],
    badgeLabel: 'Python + AI',
  }),
  makeModule({
    id: 'module-python-ai-website',
    code: 'M029',
    officialTitle: 'Мой первый сайт с мозгами: Python + AI',
    displayTitle: 'Python + AI Website',
    subtitle: 'Умный сайт',
    description:
      'Создание собственного сайта с использованием Python и инструментов искусственного интеллекта.',
    category: 'ai',
    illustrationKey: 'web',
    iconKey: 'globe',
    visualNotes: 'браузер, сайт, элементы AI',
    suggestedSkills: [
      'skill-app-dev',
      'skill-python',
      'skill-web-structure',
      'skill-ai-tools',
      'skill-testing',
    ],
    badgeLabel: 'Python Web',
  }),
  makeModule({
    id: 'module-ai-vk-store',
    code: 'M030',
    officialTitle: 'Нейросети и VK-магазин',
    displayTitle: 'AI + VK Магазин',
    subtitle: 'Цифровой бизнес',
    description:
      'Знакомство с возможностями нейросетей при создании и оформлении цифрового магазина в экосистеме VK.',
    category: 'ai',
    illustrationKey: 'ai',
    iconKey: 'sparkles',
    visualNotes: 'интернет-магазин, карточки товаров, нейросеть',
    suggestedSkills: [
      'skill-product-thinking',
      'skill-ai-tools',
      'skill-presentation',
      'skill-project-work',
    ],
    badgeLabel: 'AI + VK',
  }),
  makeModule({
    id: 'module-typescript-ai',
    code: 'M031',
    officialTitle: 'TypeScript + AI: создаём умные веб-приложения',
    displayTitle: 'TypeScript + AI',
    subtitle: 'Веб-приложения',
    description:
      'Знакомство с разработкой веб-приложений на TypeScript и использованием AI-помощников в процессе программирования.',
    category: 'ai',
    illustrationKey: 'typescript',
    iconKey: 'terminal',
    visualNotes: 'редактор кода, TypeScript, AI-интерфейс',
    suggestedSkills: [
      'skill-text-coding',
      'skill-typescript',
      'skill-code-work',
      'skill-app-dev',
      'skill-ai-dev',
      'skill-debugging',
    ],
    badgeLabel: 'TypeScript',
  }),

  // КАТЕГОРИЯ 5. ДИЗАЙН, АНИМАЦИЯ И 3D
  makeModule({
    id: 'module-pixel-art-aseprite',
    code: 'M032',
    officialTitle: 'Компьютерная анимация в стиле «Пиксель-арт» в Aseprite',
    displayTitle: 'Pixel Art / Aseprite',
    subtitle: 'Пиксель-арт',
    description:
      'Создание пиксельных изображений и анимаций, знакомство с визуальным представлением движения.',
    category: 'design-3d',
    illustrationKey: 'pixel',
    iconKey: 'palette',
    visualNotes: 'пиксельный персонаж, сетка пикселей, Aseprite',
    suggestedSkills: [
      'skill-pixel-art',
      'skill-raster-graphics',
      'skill-composition',
      'skill-animation',
      'skill-creativity',
    ],
    badgeLabel: 'Pixel Art',
  }),
  makeModule({
    id: 'module-tinkercad-3d',
    code: 'M033',
    officialTitle: 'Продвинутый уровень в 3D. Tinkercad',
    displayTitle: 'Tinkercad 3D',
    subtitle: '3D-модели',
    description:
      'Продолжение работы с трёхмерными объектами и освоение более сложных приёмов 3D-моделирования.',
    category: 'design-3d',
    illustrationKey: 'design3d',
    iconKey: 'box',
    visualNotes: 'разноцветные 3D-фигуры, геометрические объекты',
    suggestedSkills: [
      'skill-3d-modeling',
      'skill-spatial',
      'skill-prototyping',
      'skill-composition',
    ],
    badgeLabel: 'Tinkercad',
  }),
  makeModule({
    id: 'module-web-design-figma',
    code: 'M034',
    officialTitle: 'Веб-дизайн, проектируем свой сайт с нуля в Figma',
    displayTitle: 'Веб-дизайн / Figma',
    subtitle: 'UI/UX в Figma',
    description:
      'Проектирование внешнего вида сайта, знакомство с интерфейсами, композицией и визуальной организацией веб-страниц.',
    category: 'design-3d',
    illustrationKey: 'web',
    iconKey: 'palette',
    visualNotes: 'макет сайта, Figma, UI-карточки',
    suggestedSkills: [
      'skill-ui-ux',
      'skill-composition',
      'skill-prototyping',
      'skill-web-structure',
    ],
    badgeLabel: 'Figma',
  }),
  makeModule({
    id: 'module-gif-animation',
    code: 'M035',
    officialTitle: 'Gif-анимация',
    displayTitle: 'GIF Animation',
    subtitle: 'Покадровая анимация',
    description:
      'Создание коротких анимированных изображений и знакомство с принципами последовательной смены кадров.',
    category: 'design-3d',
    illustrationKey: 'animaker',
    iconKey: 'film',
    visualNotes: 'последовательность кадров, анимированные изображения',
    suggestedSkills: [
      'skill-animation',
      'skill-composition',
      'skill-creativity',
      'skill-storytelling',
    ],
    badgeLabel: 'GIF',
  }),
  makeModule({
    id: 'module-photoshop',
    code: 'M036',
    officialTitle: 'Волшебный Photoshop',
    displayTitle: 'Photoshop',
    subtitle: 'Растровая графика',
    description:
      'Знакомство с возможностями графического редактора и создание цифровых изображений с использованием инструментов обработки графики.',
    category: 'design-3d',
    illustrationKey: 'pixel',
    iconKey: 'palette',
    visualNotes: 'графический редактор, слои, цифровая иллюстрация',
    suggestedSkills: [
      'skill-raster-graphics',
      'skill-composition',
      'skill-creativity',
    ],
    badgeLabel: 'Photoshop',
  }),
  makeModule({
    id: 'module-blender-3d',
    code: 'M037',
    officialTitle: '3D-моделирование. Blender для детей',
    displayTitle: 'Blender 3D',
    subtitle: '3D-графика',
    description:
      'Знакомство с трёхмерным моделированием и создание собственных объёмных объектов в Blender.',
    category: 'design-3d',
    illustrationKey: 'blender',
    iconKey: 'box',
    visualNotes: '3D-объекты, Blender, объёмные формы',
    suggestedSkills: [
      'skill-3d-modeling',
      'skill-spatial',
      'skill-composition',
      'skill-project-work',
    ],
    badgeLabel: 'Blender',
  }),
  makeModule({
    id: 'module-motion-design',
    code: 'M038',
    officialTitle: 'Motion Дизайн. Оживляем предметы',
    displayTitle: 'Motion Design',
    subtitle: 'Анимация графики',
    description:
      'Знакомство с анимацией графических объектов и созданием движения в цифровых композициях.',
    category: 'design-3d',
    illustrationKey: 'animaker',
    iconKey: 'film',
    visualNotes: 'движущиеся геометрические формы, таймлайн анимации',
    suggestedSkills: [
      'skill-animation',
      'skill-composition',
      'skill-creativity',
    ],
    badgeLabel: 'Motion',
  }),

  // КАТЕГОРИЯ 6. САЙТЫ И МОБИЛЬНЫЕ ПРИЛОЖЕНИЯ
  makeModule({
    id: 'module-tilda-landing',
    code: 'M039',
    officialTitle: 'Интернет-магазин за 2 занятия - Лендинг на Tilda',
    displayTitle: 'Tilda / Лендинг',
    subtitle: 'Конструктор сайтов',
    description:
      'Создание веб-страницы интернет-магазина, знакомство с конструированием сайтов и представлением товаров в интернете.',
    category: 'web-mobile',
    illustrationKey: 'web',
    iconKey: 'globe',
    visualNotes: 'макет интернет-магазина, браузер, карточки товаров',
    suggestedSkills: [
      'skill-web-structure',
      'skill-ui-ux',
      'skill-presentation',
      'skill-product-thinking',
    ],
    badgeLabel: 'Tilda',
  }),
  makeModule({
    id: 'module-thunkable',
    code: 'M040',
    officialTitle: 'Разработка мобильных приложений в Thunkable',
    displayTitle: 'Thunkable',
    subtitle: 'Мобильные приложения',
    description:
      'Проектирование и создание простых мобильных приложений с помощью визуальных инструментов.',
    category: 'web-mobile',
    illustrationKey: 'mobile',
    iconKey: 'smartphone',
    visualNotes: 'смартфон, экран приложения, интерфейсные блоки',
    suggestedSkills: [
      'skill-app-dev',
      'skill-ui-ux',
      'skill-visual-coding',
      'skill-prototyping',
    ],
    badgeLabel: 'Mobile',
  }),
  makeModule({
    id: 'module-html-basics',
    code: 'M041',
    officialTitle: 'Web-мастер: первые шаги в мир современных сайтов. Основы HTML',
    displayTitle: 'HTML Basics',
    subtitle: 'Основы вёрстки',
    description:
      'Первое знакомство с языком HTML и структурой веб-страниц. Создание базовых элементов собственного сайта.',
    category: 'web-mobile',
    illustrationKey: 'web',
    iconKey: 'globe',
    visualNotes: 'браузер, HTML-разметка, теги',
    suggestedSkills: [
      'skill-html',
      'skill-web-structure',
      'skill-creativity',
    ],
    badgeLabel: 'HTML',
  }),
  makeModule({
    id: 'module-html-css',
    code: 'M042',
    officialTitle: 'Web-мастер (HTML+CSS)',
    displayTitle: 'HTML + CSS',
    subtitle: 'Сайты и стили',
    description:
      'Изучение основ веб-разработки и оформление веб-страниц с помощью HTML и CSS.',
    category: 'web-mobile',
    illustrationKey: 'web',
    iconKey: 'code',
    visualNotes: 'окно браузера, CSS-код, элементы сайта',
    suggestedSkills: [
      'skill-html',
      'skill-css',
      'skill-web-structure',
      'skill-ui-ux',
    ],
    badgeLabel: 'HTML+CSS',
  }),
  makeModule({
    id: 'module-javascript',
    code: 'M043',
    officialTitle: 'JavaScript для детей: учимся создавать игры, квесты и сайты',
    displayTitle: 'JavaScript',
    subtitle: 'Интерактивный веб',
    description:
      'Знакомство с JavaScript через создание интерактивных элементов, игровых механик и веб-проектов.',
    category: 'web-mobile',
    illustrationKey: 'typescript',
    iconKey: 'code',
    visualNotes: 'JavaScript, интерактивная кнопка, окно кода',
    suggestedSkills: [
      'skill-javascript',
      'skill-algorithmization',
      'skill-program-logic',
      'skill-app-dev',
    ],
    badgeLabel: 'JS',
  }),
  makeModule({
    id: 'module-python-telegram-bot',
    code: 'M044',
    officialTitle: 'Умный чат-бот на Python на Telegram',
    displayTitle: 'Python Telegram Bot',
    subtitle: 'Боты на Python',
    description:
      'Создание собственного чат-бота на Python и знакомство с логикой автоматизированного общения в мессенджере.',
    category: 'web-mobile',
    illustrationKey: 'chatbot',
    iconKey: 'bot',
    visualNotes: 'Telegram-бот, диалоговые окна, Python',
    suggestedSkills: [
      'skill-python',
      'skill-automation',
      'skill-logic',
      'skill-testing',
    ],
    badgeLabel: 'TG Bot',
  }),
  makeModule({
    id: 'module-telegram-mini-app',
    code: 'M045',
    officialTitle: 'Создание Mini App для Telegram',
    displayTitle: 'Telegram Mini App',
    subtitle: 'Мини-приложения',
    description:
      'Знакомство с созданием мини-приложений для Telegram и проектированием небольших интерактивных цифровых продуктов.',
    category: 'web-mobile',
    illustrationKey: 'mobile',
    iconKey: 'smartphone',
    visualNotes: 'смартфон, Telegram-интерфейс, мини-приложение',
    suggestedSkills: [
      'skill-app-dev',
      'skill-ui-ux',
      'skill-project-work',
      'skill-product-thinking',
    ],
    badgeLabel: 'Mini App',
  }),
  makeModule({
    id: 'module-php-sql',
    code: 'M046',
    officialTitle: 'PHP+SQL',
    displayTitle: 'PHP + SQL',
    subtitle: 'Сервер и БД',
    description:
      'Знакомство с PHP и SQL, основами серверной логики и взаимодействия программ с базами данных.',
    category: 'web-mobile',
    illustrationKey: 'database',
    iconKey: 'database',
    visualNotes: 'база данных, таблицы, PHP-код',
    suggestedSkills: [
      'skill-php-sql',
      'skill-tables',
      'skill-app-dev',
      'skill-code-work',
    ],
    badgeLabel: 'PHP+SQL',
  }),

  // КАТЕГОРИЯ 7. ПРОДВИНУТОЕ ПРОГРАММИРОВАНИЕ И ТЕХНОЛОГИИ
  makeModule({
    id: 'module-testing-vibe-debug',
    code: 'M047',
    officialTitle: 'Тестирование & Vibe Debug. Охотники за багами',
    displayTitle: 'Testing & Debug',
    subtitle: 'Поиск багов',
    description:
      'Знакомство с поиском ошибок, проверкой работы программ и исправлением обнаруженных проблем.',
    category: 'advanced-tech',
    illustrationKey: 'testing',
    iconKey: 'bug',
    visualNotes: 'лупа, баг, окно кода, инструменты тестировщика',
    suggestedSkills: [
      'skill-testing',
      'skill-debugging',
      'skill-analysis',
      'skill-analytical',
    ],
    badgeLabel: 'QA & Debug',
  }),
  makeModule({
    id: 'module-modern-tech-cloud',
    code: 'M048',
    officialTitle: 'Облачные технологии. Блокчейн. Data science. Современные технологии',
    displayTitle: 'Современные технологии',
    subtitle: 'Cloud, Data & Web3',
    description:
      'Знакомство с современными цифровыми технологиями, облачными инструментами, блокчейном и анализом данных.',
    category: 'advanced-tech',
    illustrationKey: 'cloud',
    iconKey: 'cloud',
    visualNotes: 'облако, блокчейн-структура, диаграмма данных',
    suggestedSkills: [
      'skill-digital-literacy',
      'skill-cloud-tech',
      'skill-analytical',
      'skill-research',
    ],
    badgeLabel: 'Cloud & Data',
  }),
  makeModule({
    id: 'module-ethical-hacking',
    code: 'M049',
    officialTitle: 'Этичный хакинг & AI безопасность',
    displayTitle: 'Ethical Hacking',
    subtitle: 'Киберзащита & AI',
    description:
      'Знакомство с принципами этичной проверки безопасности цифровых систем и ответственным использованием технологий.',
    category: 'advanced-tech',
    illustrationKey: 'security',
    iconKey: 'shield',
    visualNotes: 'щит, цифровой замок, защищённая система',
    suggestedSkills: [
      'skill-cybersecurity',
      'skill-data-protection',
      'skill-ai-eval',
      'skill-analytical',
    ],
    badgeLabel: 'Sec & AI',
  }),
  makeModule({
    id: 'module-csharp',
    code: 'M050',
    officialTitle: 'Язык программирования C#',
    displayTitle: 'C#',
    subtitle: 'Разработка на C#',
    description:
      'Знакомство с языком программирования C# и основами создания программ с помощью текстового кода.',
    category: 'advanced-tech',
    illustrationKey: 'typescript',
    iconKey: 'terminal',
    visualNotes: 'C#, окно кода, программные конструкции',
    suggestedSkills: [
      'skill-text-coding',
      'skill-csharp',
      'skill-algorithmization',
      'skill-program-logic',
      'skill-problem-solving',
    ],
    badgeLabel: 'C#',
  }),
  // NOTE: M051 (Unreal) & M052 (Godot) deduplicated cleanly via M014 & M015 filterCategories
  makeModule({
    id: 'module-olympiad-programming',
    code: 'M053',
    officialTitle: 'Олимпиадное программирование',
    displayTitle: 'Олимпиадное программирование',
    subtitle: 'Алгоритмы PRO',
    description:
      'Решение сложных алгоритмических задач и развитие навыков программирования в формате интеллектуальных соревнований.',
    category: 'advanced-tech',
    illustrationKey: 'olympiad',
    iconKey: 'trophy',
    visualNotes: 'код, кубок, математические и алгоритмические схемы',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-analysis',
      'skill-decomposition',
      'skill-problem-solving',
      'skill-code-work',
      'skill-logic',
    ],
    badgeLabel: 'Олимпиады',
  }),
  makeModule({
    id: 'module-olympiad-prep',
    code: 'M054',
    officialTitle: 'Подготовка к олимпиадам',
    displayTitle: 'Подготовка к олимпиадам',
    subtitle: 'Практикум задач',
    description:
      'Практическая работа над задачами олимпиадного формата, развитие навыков анализа и самостоятельного поиска решений.',
    category: 'advanced-tech',
    illustrationKey: 'olympiad',
    iconKey: 'trophy',
    visualNotes: 'олимпийская медаль, код, задача, таймер',
    suggestedSkills: [
      'skill-problem-solving',
      'skill-analytical',
      'skill-time-management',
      'skill-autonomy',
      'skill-testing',
    ],
    badgeLabel: 'Практикум',
  }),

  // КАТЕГОРИЯ 8. ФИНАНСОВАЯ ГРАМОТНОСТЬ
  makeModule({
    id: 'module-financial-intelligence',
    code: 'M055',
    officialTitle: 'Финансовый интеллект вместе с KIBERone. Эксклюзив от Ольги Гогаладзе',
    displayTitle: 'Финансовый интеллект',
    subtitle: 'Финансы и цели',
    description:
      'Знакомство с основами финансовой грамотности, осознанным отношением к деньгам и принципами принятия финансовых решений.',
    category: 'financial',
    illustrationKey: 'finance',
    iconKey: 'wallet',
    visualNotes: 'кошелёк, монеты, графики, финансовая цель',
    suggestedSkills: [
      'skill-financial',
      'skill-analysis',
      'skill-time-management',
      'skill-autonomy',
    ],
    badgeLabel: 'Финансы',
  }),
];

export const DEFAULT_GROUP_TEMPLATES: GroupCurriculumTemplate[] = [
  {
    id: 'gtpl-junior-start',
    name: 'Старт и алгоритмы (8–10 лет)',
    description:
      'Креативный инжиниринг, Scratch Junior и 3D-миры Kodu Game Lab для младшей группы.',
    ageCategory: '8-10',
    paletteId: 'kiber-classic',
    moduleIds: [
      'module-creative-engineering',
      'module-scratch-junior',
      'module-kodu-game-lab',
    ],
    isBuiltIn: true,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'gtpl-gamedev-middle',
    name: 'Геймдев и 3D (9–12 лет)',
    description:
      'Minecraft Lua, Roblox и Blender 3D — классический игровой трек.',
    ageCategory: '11-13',
    paletteId: 'warm-editorial',
    moduleIds: [
      'module-lua-minecraft',
      'module-roblox',
      'module-blender-3d',
    ],
    isBuiltIn: true,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'gtpl-python-ai',
    name: 'Python & AI Lab (11–13 лет)',
    description:
      'Промпт-инжиниринг, программирование на Python с AI и создание Telegram-бота.',
    ageCategory: '11-13',
    paletteId: 'tech-cobalt',
    moduleIds: [
      'module-prompt-engineering',
      'module-python-ai',
      'module-python-telegram-bot',
    ],
    isBuiltIn: true,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'gtpl-web-pro',
    name: 'Веб-продукты и TypeScript (14–15 лет)',
    description:
      'Figma, HTML+CSS и TypeScript + AI для старших резидентов.',
    ageCategory: '14-15',
    paletteId: 'tech-cobalt',
    moduleIds: [
      'module-web-design-figma',
      'module-html-css',
      'module-typescript-ai',
    ],
    isBuiltIn: true,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
];

const MODULE_AGE_MAP: Record<string, AgeCategory[]> = {
  // 8–10 (Младшая группа)
  'module-creative-engineering': ['8-10'],
  'module-scratch-junior': ['8-10'],
  'module-code-monkey': ['8-10'],
  'module-run-marco': ['8-10'],
  'module-piktomir': ['8-10'],
  'module-blockly': ['8-10'],
  'module-pixel-art-aseprite': ['8-10', '11-13'],
  'module-tinkercad-3d': ['8-10', '11-13'],
  'module-gif-animation': ['8-10', '11-13'],
  'module-qr-tech': ['8-10', '11-13'],
  'module-kodu-game-lab': ['8-10', '11-13'],
  'module-scratch-advanced': ['8-10', '11-13'],
  'module-lua-minecraft': ['8-10', '11-13'],
  'module-roblox': ['8-10', '11-13'],
  'module-pc-hardware': ['8-10', '11-13'],
  'module-word-excel': ['8-10', '11-13'],
  'module-powerpoint': ['8-10', '11-13'],
  'module-yandex-services': ['8-10', '11-13'],
  'module-ai-storytelling': ['8-10', '11-13'],
  'module-thunkable': ['8-10', '11-13'],
  'module-cybersecurity': ['8-10', '11-13', '14-15'],
  'module-financial-intelligence': ['8-10', '11-13', '14-15'],

  // 11–13 (Средняя группа)
  'module-construct-2': ['11-13'],
  'module-html-basics': ['11-13'],
  'module-minecraft-mods': ['11-13', '14-15'],
  'module-unity-2d': ['11-13', '14-15'],
  'module-godot': ['11-13', '14-15'],
  'module-prompt-engineering': ['11-13', '14-15'],
  'module-neural-networks': ['11-13', '14-15'],
  'module-vibe-coding': ['11-13', '14-15'],
  'module-voice-assistant-alice': ['11-13', '14-15'],
  'module-python-ai': ['11-13', '14-15'],
  'module-web-design-figma': ['11-13', '14-15'],
  'module-photoshop': ['11-13', '14-15'],
  'module-blender-3d': ['11-13', '14-15'],
  'module-motion-design': ['11-13', '14-15'],
  'module-tilda-landing': ['11-13', '14-15'],
  'module-html-css': ['11-13', '14-15'],
  'module-javascript': ['11-13', '14-15'],
  'module-python-telegram-bot': ['11-13', '14-15'],
  'module-olympiad-programming': ['11-13', '14-15'],
  'module-olympiad-prep': ['11-13', '14-15'],

  // 14–15 (Старшая группа)
  'module-unreal-engine': ['14-15'],
  'module-ai-product-lab': ['14-15'],
  'module-python-ai-website': ['14-15'],
  'module-ai-vk-store': ['14-15'],
  'module-typescript-ai': ['14-15'],
  'module-telegram-mini-app': ['14-15'],
  'module-php-sql': ['14-15'],
  'module-testing-vibe-debug': ['14-15'],
  'module-modern-tech-cloud': ['14-15'],
  'module-ethical-hacking': ['14-15'],
  'module-csharp': ['14-15'],
};

export function getModuleAgeCategories(mod: LibraryModule): AgeCategory[] {
  if (mod.ageCategories && mod.ageCategories.length > 0) {
    return mod.ageCategories;
  }
  return MODULE_AGE_MAP[mod.id] ?? ['8-10', '11-13', '14-15'];
}

