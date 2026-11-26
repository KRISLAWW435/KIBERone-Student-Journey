import {
  AgeCategory,
  GroupCurriculumTemplate,
  JournalStatus,
  LibraryModule,
  ModuleAgeGroup,
  ModuleCategoryConfig,
  ModuleCategoryId,
  SkillDefinition,
  SkillMasteryStatus,
} from '../types/journal';

export const MODULE_AGE_GROUP_OPTIONS: Array<{
  id: ModuleAgeGroup;
  label: string;
  shortLabel: string;
}> = [
  { id: '6-8', label: 'Младшая (6–8 лет)', shortLabel: '6–8 лет' },
  { id: '9-11', label: 'Средняя (9–11 лет)', shortLabel: '9–11 лет' },
  { id: '12-14', label: 'Старшая (12–14 лет)', shortLabel: '12–14 лет' },
];

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
    name: 'Алгоритмы и основы',
    shortName: 'Алгоритмы и основы',
    description:
      'Вводный модуль, алгоритмическое мышление, визуальный и текстовый код, логика и клавиатурная грамотность.',
    accentColor: '#C9F3EE',
    isBuiltIn: true,
    order: 1,
  },
  {
    id: 'games',
    name: 'Игры и геймдизайн',
    shortName: 'Игры и геймдизайн',
    description:
      'Игровые сцены, концепт-документы, Minecraft, Roblox, Construct 3, Godot, Unity 2D и Unreal Engine.',
    accentColor: '#DBEAFE',
    isBuiltIn: true,
    order: 2,
  },
  {
    id: 'design-3d',
    name: 'Дизайн и 3D',
    shortName: 'Дизайн и 3D',
    description:
      'Пиксель-арт, 3D в Tinkercad и Spline, UI/UX в Figma, графика в Photoshop, Blender и After Effects.',
    accentColor: '#DDD6FE',
    isBuiltIn: true,
    order: 3,
  },
  {
    id: 'ai',
    name: 'ИИ и нейросети',
    shortName: 'ИИ и нейросети',
    description:
      'Промпт-инжиниринг, нейросети, AI Storytelling, голосовые навыки, вайбкодинг и Python + AI.',
    accentColor: '#E9D5FF',
    isBuiltIn: true,
    order: 4,
  },
  {
    id: 'web-mobile',
    name: 'Веб и мобильные',
    shortName: 'Веб и мобильные',
    description:
      'Tilda, Thunkable, HTML, CSS, JavaScript, TypeScript, чат-боты и backend-разработка на PHP и SQL.',
    accentColor: '#E0F2FE',
    isBuiltIn: true,
    order: 5,
  },
  {
    id: 'digital-literacy',
    name: 'Грамотность и безопасность',
    shortName: 'Грамотность и безопасность',
    description:
      'Устройство ПК, Word и Excel, презентации PowerPoint, QR-коды, сервисы Яндекса и кибербезопасность.',
    accentColor: '#FEF08A',
    isBuiltIn: true,
    order: 6,
  },
  {
    id: 'advanced-tech',
    name: 'Продвинутые технологии',
    shortName: 'Продвинутые технологии',
    description:
      'Тестирование & Vibe Debugging, этичный хакинг, облака, блокчейн, data science, C# и олимпиадные задачи.',
    accentColor: '#E2E8F0',
    isBuiltIn: true,
    order: 7,
  },
  {
    id: 'financial',
    name: 'Финансы и карьера',
    shortName: 'Финансы и карьера',
    description:
      'Финансовый интеллект, питчинг проектов на открытом уроке, выпускное портфолио и подготовка к ОГЭ.',
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
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  categoryId: ModuleCategoryId;
  ageGroups: ModuleAgeGroup[];
  imageFile: string;
  suggestedSkills: string[];
  badgeLabel: string;
  cardBgColor?: string;
}

function makeModule(spec: SeedSpec): LibraryModule {
  const now = '2026-11-25T20:00:00.000Z';
  const bg = spec.cardBgColor ?? CATEGORY_COLOR_MAP[spec.categoryId] ?? '#C9F3EE';
  const imageUrl = `/assets/modules/${spec.imageFile}`;
  return {
    id: spec.id,
    officialTitle: spec.title,
    displayTitle: spec.shortTitle,
    shortTitle: spec.shortTitle,
    title: spec.title,
    subtitle: spec.subtitle,
    description: spec.description,
    category: spec.categoryId,
    categoryId: spec.categoryId,
    ageGroups: spec.ageGroups,
    illustrationType: 'image',
    illustrationValue: imageUrl,
    visualMode: 'image',
    visualNotes: '',
    imageMediaId: null,
    customImageUrl: imageUrl,
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
  // =========================================================================
  // КАТЕГОРИЯ 1: «Алгоритмы и основы» (10 модулей)
  // =========================================================================
  makeModule({
    id: 'm_creative',
    title: 'Вводный модуль. Креативный инжиниринг и магия ИИ',
    shortTitle: 'Креативный инжиниринг',
    subtitle: 'Старт и ИИ-инструменты',
    description:
      'Первое знакомство с миром IT, где идеи превращаются в цифровые проекты, а ИИ становится помощником в творчестве.',
    categoryId: 'algorithms',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_intro_ai.png',
    suggestedSkills: [
      'skill-creativity',
      'skill-ai-tools',
      'skill-digital-literacy',
      'skill-project-work',
    ],
    badgeLabel: 'Старт',
  }),
  makeModule({
    id: 'm_scratch_junior',
    title: 'Основы программирования в Scratch Junior',
    shortTitle: 'Scratch Junior',
    subtitle: 'Первые алгоритмы',
    description:
      'Истории оживают, персонажи двигаются, а последовательность команд превращается в собственную мини-игру.',
    categoryId: 'algorithms',
    ageGroups: ['6-8'],
    imageFile: 'm_scratch_junior.png',
    suggestedSkills: [
      'skill-visual-coding',
      'skill-algorithmization',
      'skill-sequence',
      'skill-creativity',
    ],
    badgeLabel: 'Scratch Jr',
  }),
  makeModule({
    id: 'm_keyboard',
    title: 'Клавиатурный мастер: скоропечать и полезные горячие клавиши',
    shortTitle: 'Клавиатурный мастер',
    subtitle: 'Слепая печать',
    description:
      'Оказывается, клавиатура умеет больше, чем просто печатать: правильные движения рук и горячие клавиши экономят время.',
    categoryId: 'algorithms',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_keyboard_master.png',
    suggestedSkills: [
      'skill-digital-literacy',
      'skill-autonomy',
      'skill-time-management',
    ],
    badgeLabel: 'Клавиатура',
  }),
  makeModule({
    id: 'm_code_monkey',
    title: 'Логика и алгоритмы через игровые квесты в Code Monkey',
    shortTitle: 'Code Monkey',
    subtitle: 'Игровые квесты',
    description:
      'Приключенческие головоломки раскрывают секрет алгоритмов: чтобы герой дошёл до цели, важен каждый шаг.',
    categoryId: 'algorithms',
    ageGroups: ['6-8'],
    imageFile: 'm_code_monkey.png',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-logic',
      'skill-sequence',
      'skill-problem-solving',
    ],
    badgeLabel: 'Code Monkey',
  }),
  makeModule({
    id: 'm_kodu',
    title: 'Знакомство с 3D. Разработка 3D-миров в Kodu Game Lab',
    shortTitle: 'Kodu Game Lab',
    subtitle: '3D-игры',
    description:
      'За знакомыми игровыми мирами скрывается целая 3D-вселенная, где ландшафт и поведение персонажей подчиняются правилам.',
    categoryId: 'algorithms',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_kodu.webp',
    suggestedSkills: [
      'skill-spatial',
      'skill-visual-coding',
      'skill-game-scenes',
      'skill-game-mechanics',
    ],
    badgeLabel: 'Kodu 3D',
  }),
  makeModule({
    id: 'm_scratch_adv',
    title:
      'Scratch. Продвинутый уровень — создаём игры, как маленькие разработчики!',
    shortTitle: 'Scratch Advanced',
    subtitle: 'Блочные игры PRO',
    description:
      'За простыми блоками Scratch открываются переменные, условия и клоны — всё, что помогает создавать большие игровые истории.',
    categoryId: 'algorithms',
    ageGroups: ['6-8'],
    imageFile: 'm_scratch_advanced.png',
    suggestedSkills: [
      'skill-visual-coding',
      'skill-program-logic',
      'skill-game-mechanics',
      'skill-debugging',
    ],
    badgeLabel: 'Scratch PRO',
  }),
  makeModule({
    id: 'm_run_marco',
    title: 'Алгоритмы приключений: квест-кодинг Run Marco!',
    shortTitle: 'Run Marco!',
    subtitle: 'Квест-кодинг',
    description:
      'Маршруты, повторы и команды складываются в приключение, где логика помогает найти путь к цели.',
    categoryId: 'algorithms',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_run_marco.png',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-logic',
      'skill-sequence',
      'skill-decomposition',
    ],
    badgeLabel: 'Run Marco!',
  }),
  makeModule({
    id: 'm_pictomir',
    title: 'Пиктомир. Интуитивное программирование',
    shortTitle: 'Пиктомир',
    subtitle: 'Алгоритмы для роботов',
    description:
      'Пиктограммы становятся языком роботов: с их помощью можно задавать команды, повторения и целые алгоритмы.',
    categoryId: 'algorithms',
    ageGroups: ['6-8'],
    imageFile: 'm_piktomir.png',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-sequence',
      'skill-logic',
      'skill-analysis',
    ],
    badgeLabel: 'Пиктомир',
  }),
  makeModule({
    id: 'm_blockly',
    title:
      'Blockly. Переходим на текстовый код и учим ребёнка думать, как программист',
    shortTitle: 'Blockly',
    subtitle: 'От блоков к коду',
    description:
      'Визуальные блоки постепенно превращаются в настоящий код, а знакомая логика получает новый текстовый вид.',
    categoryId: 'algorithms',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_blockly.png',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-visual-coding',
      'skill-text-coding',
      'skill-program-logic',
    ],
    badgeLabel: 'Blockly',
  }),
  makeModule({
    id: 'm_turtle',
    title: 'Исполнители алгоритмов: чертежник и черепаха',
    shortTitle: 'Чертёжник и черепаха',
    subtitle: 'Исполнители',
    description:
      'Геометрия оживает в движении: координаты, углы и циклы помогают создавать точные цифровые рисунки.',
    categoryId: 'algorithms',
    ageGroups: ['6-8'],
    imageFile: 'm_turtle.png',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-spatial',
      'skill-logic',
      'skill-sequence',
    ],
    badgeLabel: 'Чертёжник',
  }),

  // =========================================================================
  // КАТЕГОРИЯ 2: «Игры и геймдизайн» (11 модулей)
  // =========================================================================
  makeModule({
    id: 'm_lua_minecraft',
    title: 'Азы программирования на языке Lua. Minecraft Education',
    shortTitle: 'Lua + Minecraft',
    subtitle: 'Кодинг в Minecraft',
    description:
      'В Minecraft появляется новый уровень возможностей: команды на Lua помогают автоматизировать строительство и управлять помощниками.',
    categoryId: 'games',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_minecraft_lua.png',
    suggestedSkills: [
      'skill-text-coding',
      'skill-algorithmization',
      'skill-syntax',
      'skill-spatial',
    ],
    badgeLabel: 'Lua',
  }),
  makeModule({
    id: 'm_minecraft_mods',
    title: 'Создание модов в Minecraft',
    shortTitle: 'Minecraft Mods',
    subtitle: 'Моддинг',
    description:
      'Знакомая вселенная становится площадкой для собственных идей — новых предметов, существ и игровых механик.',
    categoryId: 'games',
    ageGroups: ['6-8'],
    imageFile: 'm_minecraft_mods.png',
    suggestedSkills: [
      'skill-game-objects',
      'skill-game-mechanics',
      'skill-creativity',
      'skill-project-work',
    ],
    badgeLabel: 'Minecraft',
  }),
  makeModule({
    id: 'm_geometry_dash',
    title: 'Проектирование через геймификацию в Geometry Dash',
    shortTitle: 'Geometry Dash',
    subtitle: 'Дизайн уровней',
    description:
      'За динамичным уровнем скрываются ритм, физика и триггеры — секреты того, почему игра ощущается именно так.',
    categoryId: 'games',
    ageGroups: ['6-8'],
    imageFile: 'm_geometry_dash.png',
    suggestedSkills: [
      'skill-game-design',
      'skill-game-mechanics',
      'skill-game-testing',
      'skill-creativity',
    ],
    badgeLabel: 'Geometry Dash',
  }),
  makeModule({
    id: 'm_construct3',
    title: 'Основы геймдизайна. Проектируем как профи в Construct 3',
    shortTitle: 'Construct 3',
    subtitle: '2D-движок и логика',
    description:
      'У собственной 2D-игры появляются физика, анимации и правила событий — всё, что делает игровой мир живым.',
    categoryId: 'games',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_construct3.png',
    suggestedSkills: [
      'skill-game-design',
      'skill-game-engine',
      'skill-game-mechanics',
      'skill-game-testing',
    ],
    badgeLabel: 'Construct 3',
  }),
  makeModule({
    id: 'm_roblox',
    title: 'Roblox. Структурируем алгоритмы и коды с помощью популярной игры',
    shortTitle: 'Roblox',
    subtitle: 'Roblox Studio & Lua',
    description:
      'В Roblox Studio открывается мир разработки: 3D-пространства, препятствия, чекпоинты и правила, написанные на Lua.',
    categoryId: 'games',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_roblox.png',
    suggestedSkills: [
      'skill-game-scenes',
      'skill-game-mechanics',
      'skill-code-work',
      'skill-spatial',
    ],
    badgeLabel: 'Roblox',
  }),
  makeModule({
    id: 'm_makecode',
    title: 'Основы Python. Программирование мини-игр в MakeCode',
    shortTitle: 'MakeCode',
    subtitle: 'Мини-игры на Python',
    description:
      'Первые строки Python появляются внутри аркадной игры, где координаты, циклы и события сразу видны в действии.',
    categoryId: 'games',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_makecode.png',
    suggestedSkills: [
      'skill-python',
      'skill-syntax',
      'skill-game-mechanics',
      'skill-program-logic',
    ],
    badgeLabel: 'MakeCode',
  }),
  makeModule({
    id: 'm_gamedesign',
    title: 'Геймдизайн. Учимся делать из идеи понятный концепт проекта',
    shortTitle: 'Геймдизайн концепт',
    subtitle: 'Концепт и баланс',
    description:
      'У игровой идеи появляется план: сюжет, механики и игровой цикл складываются в понятный концепт будущего проекта.',
    categoryId: 'games',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_gamedesign_concept.png',
    suggestedSkills: [
      'skill-game-design',
      'skill-ideation',
      'skill-product-thinking',
      'skill-prototyping',
    ],
    badgeLabel: 'Геймдизайн',
  }),
  makeModule({
    id: 'm_pygame',
    title: '2D игра на Python в PyGame',
    shortTitle: 'Python PyGame',
    subtitle: 'Аркада на Python',
    description:
      'За кодом Python скрывается целая 2D-игра: персонажи, управление, столкновения и счёт становятся частью одного мира.',
    categoryId: 'games',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_pygame.png',
    suggestedSkills: [
      'skill-python',
      'skill-text-coding',
      'skill-game-mechanics',
      'skill-debugging',
    ],
    badgeLabel: 'PyGame',
  }),
  makeModule({
    id: 'm_godot',
    title: 'Godot. Основа создания легендарных игр',
    shortTitle: 'Godot',
    subtitle: 'Кроссплатформенный движок',
    description:
      'Игровой проект раскрывается изнутри: сцены, узлы и логика соединяются в собственный прототип.',
    categoryId: 'games',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_godot.png',
    suggestedSkills: [
      'skill-game-engine',
      'skill-game-scenes',
      'skill-game-mechanics',
      'skill-text-coding',
    ],
    badgeLabel: 'Godot',
  }),
  makeModule({
    id: 'm_unity2d',
    title: 'Мир игр на Unity 2D на популярном движке + AI-помощники',
    shortTitle: 'Unity 2D',
    subtitle: 'Unity + C# + AI',
    description:
      'Unity открывает путь к разработке игр: сцены, физика и C# помогают превратить идею в интерактивный мир.',
    categoryId: 'games',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_unity2d.png',
    suggestedSkills: [
      'skill-game-engine',
      'skill-csharp',
      'skill-game-mechanics',
      'skill-ai-dev',
    ],
    badgeLabel: 'Unity 2D',
  }),
  makeModule({
    id: 'm_unreal',
    title: 'Разработка 3D-игр на движке Unreal Engine',
    shortTitle: 'Unreal Engine',
    subtitle: '3D-игры PRO',
    description:
      '3D-миры становятся реалистичнее благодаря освещению, материалам и визуальному программированию Blueprints.',
    categoryId: 'games',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_unreal.png',
    suggestedSkills: [
      'skill-game-engine',
      'skill-game-scenes',
      'skill-spatial',
      'skill-3d-modeling',
    ],
    badgeLabel: 'Unreal',
  }),

  // =========================================================================
  // КАТЕГОРИЯ 3: «Дизайн и 3D» (8 модулей)
  // =========================================================================
  makeModule({
    id: 'm_aseprite',
    title: 'Компьютерная анимация в стиле «Пиксель-арт» в Aseprite',
    shortTitle: 'Aseprite / Пиксель-арт',
    subtitle: 'Пиксельная графика',
    description:
      'Даже крошечные пиксели могут оживать: персонажи, палитры и кадры складываются в собственную анимацию.',
    categoryId: 'design-3d',
    ageGroups: ['6-8'],
    imageFile: 'm_aseprite.png',
    suggestedSkills: [
      'skill-pixel-art',
      'skill-animation',
      'skill-composition',
      'skill-creativity',
    ],
    badgeLabel: 'Aseprite',
  }),
  makeModule({
    id: 'm_tinkercad',
    title: 'Продвинутый уровень в 3D. Tinkercad',
    shortTitle: 'Tinkercad',
    subtitle: '3D-моделирование',
    description:
      'Из простых геометрических форм рождаются сложные 3D-модели, механизмы и объекты для печати.',
    categoryId: 'design-3d',
    ageGroups: ['6-8'],
    imageFile: 'm_tinkercad.png',
    suggestedSkills: [
      'skill-3d-modeling',
      'skill-spatial',
      'skill-prototyping',
      'skill-creativity',
    ],
    badgeLabel: 'Tinkercad',
  }),
  makeModule({
    id: 'm_spline',
    title: '3D-дизайн и моделирование в Spline',
    shortTitle: 'Spline',
    subtitle: 'Интерактивное 3D',
    description:
      'В браузере появляется объёмная сцена с материалами, светом и интерактивными 3D-объектами.',
    categoryId: 'design-3d',
    ageGroups: ['6-8'],
    imageFile: 'm_spline.png',
    suggestedSkills: [
      'skill-3d-modeling',
      'skill-composition',
      'skill-spatial',
      'skill-ui-ux',
    ],
    badgeLabel: 'Spline',
  }),
  makeModule({
    id: 'm_figma',
    title: 'Web-дизайн, проектируем свой сайт с нуля в Figma',
    shortTitle: 'Web-дизайн / Figma',
    subtitle: 'UI/UX и прототипы',
    description:
      'За красивым сайтом стоят композиция, сетки, цвет и типографика — теперь они складываются в собственный макет.',
    categoryId: 'design-3d',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_figma.png',
    suggestedSkills: [
      'skill-ui-ux',
      'skill-composition',
      'skill-prototyping',
      'skill-creativity',
    ],
    badgeLabel: 'Figma',
  }),
  makeModule({
    id: 'm_gif',
    title: 'Gif-анимации: создаем свои стикеры',
    shortTitle: 'GIF-анимация',
    subtitle: 'Стикеры и кадры',
    description:
      'Несколько рисунков превращаются в живой стикер, а персонаж получает движение и настроение.',
    categoryId: 'design-3d',
    ageGroups: ['6-8'],
    imageFile: 'm_gif.png',
    suggestedSkills: [
      'skill-animation',
      'skill-raster-graphics',
      'skill-creativity',
      'skill-storytelling',
    ],
    badgeLabel: 'GIF',
  }),
  makeModule({
    id: 'm_photoshop',
    title: 'Волшебный Photoshop',
    shortTitle: 'Photoshop',
    subtitle: 'Графика и коллажи',
    description:
      'Слои, маски и эффекты открывают новые возможности изображения: от коллажей до выразительных постеров.',
    categoryId: 'design-3d',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_photoshop.png',
    suggestedSkills: [
      'skill-raster-graphics',
      'skill-composition',
      'skill-creativity',
      'skill-project-work',
    ],
    badgeLabel: 'Photoshop',
  }),
  makeModule({
    id: 'm_blender',
    title: '3D-моделирование. Blender для детей',
    shortTitle: 'Blender 3D',
    subtitle: '3D-сцены и рендер',
    description:
      'Обычные формы обретают объём, материалы и свет, а финальный рендер показывает мир с новой стороны.',
    categoryId: 'design-3d',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_blender.png',
    suggestedSkills: [
      'skill-3d-modeling',
      'skill-spatial',
      'skill-composition',
      'skill-project-work',
    ],
    badgeLabel: 'Blender',
  }),
  makeModule({
    id: 'm_motion',
    title: 'Основы motion design и создания анимаций в After Effects',
    shortTitle: 'Motion Design',
    subtitle: 'Анимация и видео',
    description:
      'Текст и графика начинают двигаться: ключевые кадры и ритм превращают статичный дизайн в анимацию.',
    categoryId: 'design-3d',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_motion_design.png',
    suggestedSkills: [
      'skill-animation',
      'skill-composition',
      'skill-storytelling',
      'skill-creativity',
    ],
    badgeLabel: 'Motion',
  }),

  // =========================================================================
  // КАТЕГОРИЯ 4: «ИИ и нейросети» (8 модулей)
  // =========================================================================
  makeModule({
    id: 'm_prompt_eng',
    title: 'Промпт-инжиниринг: учимся правильно давать задачи ИИ',
    shortTitle: 'Prompt Engineering',
    subtitle: 'Эффективные запросы',
    description:
      'Оказывается, результат нейросети зависит от задачи: точные инструкции и контекст помогают получать более подходящие ответы.',
    categoryId: 'ai',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_prompt_engineering.png',
    suggestedSkills: [
      'skill-prompting',
      'skill-task-setting',
      'skill-ai-eval',
      'skill-analytical',
    ],
    badgeLabel: 'Prompts',
  }),
  makeModule({
    id: 'm_neural_net',
    title: 'Нейросети: современные инструменты для учебы и творчества',
    shortTitle: 'Нейросети',
    subtitle: 'AI для текста и графики',
    description:
      'Нейросети открываются как инструменты для идей, текста, изображений и звука — с вниманием к цифровой этике.',
    categoryId: 'ai',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_neural_networks.png',
    suggestedSkills: [
      'skill-ai-tools',
      'skill-prompting',
      'skill-creativity',
      'skill-ai-eval',
    ],
    badgeLabel: 'AI Tools',
  }),
  makeModule({
    id: 'm_ai_story',
    title: 'Цифровая книга с персонажами и озвучкой - AI Storytelling',
    shortTitle: 'AI Storytelling',
    subtitle: 'Книга и озвучка с ИИ',
    description:
      'У собственной истории появляются персонажи, иллюстрации и голос — так рождается цифровая книга.',
    categoryId: 'ai',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_ai_storytelling.png',
    suggestedSkills: [
      'skill-storytelling',
      'skill-ai-tools',
      'skill-prompting',
      'skill-project-work',
    ],
    badgeLabel: 'Storytelling',
  }),
  makeModule({
    id: 'm_alice',
    title: 'Обучение голосового помощника. Собственный навык для Алисы',
    shortTitle: 'Голосовой помощник',
    subtitle: 'Навык для Алисы',
    description:
      'У голосового помощника появляется собственный сценарий: вопросы, ответы и действия складываются в интерактивный навык.',
    categoryId: 'ai',
    ageGroups: ['6-8'],
    imageFile: 'm_voice_assistant.png',
    suggestedSkills: [
      'skill-automation',
      'skill-logic',
      'skill-task-setting',
      'skill-project-work',
    ],
    badgeLabel: 'Алиса',
  }),
  makeModule({
    id: 'm_python_ai',
    title: 'Язык программирования Python + AI-помощники',
    shortTitle: 'Python + AI',
    subtitle: 'Python с AI-ассистентом',
    description:
      'Python становится понятнее через переменные, условия и циклы, а ИИ помогает разбираться в коде и находить ошибки.',
    categoryId: 'ai',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_python_ai.png',
    suggestedSkills: [
      'skill-python',
      'skill-text-coding',
      'skill-ai-dev',
      'skill-debugging',
    ],
    badgeLabel: 'Python + AI',
  }),
  makeModule({
    id: 'm_kodik',
    title: 'Основы Вайбкодинга. ИИ для программирования Kodik',
    shortTitle: 'Вайбкодинг и Kodik',
    subtitle: 'Создание IT-продуктов с ИИ',
    description:
      'Новая роль в разработке: ставить задачи ИИ, проверять результат и постепенно улучшать собственный цифровой продукт.',
    categoryId: 'ai',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_vibe_coding.png',
    suggestedSkills: [
      'skill-ai-dev',
      'skill-prompting',
      'skill-prototyping',
      'skill-testing',
    ],
    badgeLabel: 'Kodik',
  }),
  makeModule({
    id: 'm_vk_shop',
    title: 'VK-магазин с применением нейросетей',
    shortTitle: 'VK-магазин + ИИ',
    subtitle: 'Витрина и контент с ИИ',
    description:
      'У проекта появляется цифровая витрина: товары, описания и визуальное оформление собираются в магазин ВКонтакте.',
    categoryId: 'ai',
    ageGroups: ['6-8'],
    imageFile: 'm_vk_shop.png',
    suggestedSkills: [
      'skill-ai-tools',
      'skill-product-thinking',
      'skill-composition',
      'skill-project-work',
    ],
    badgeLabel: 'VK Shop',
  }),
  makeModule({
    id: 'm_python_web',
    title: 'Мой первый сайт с мозгами: Python + AI-помощники',
    shortTitle: 'Python + AI Website',
    subtitle: 'Умный веб-проект',
    description:
      'Сайт получает собственную логику: Python помогает обрабатывать данные и превращать страницы в интерактивный продукт.',
    categoryId: 'ai',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_python_web.png',
    suggestedSkills: [
      'skill-python',
      'skill-app-dev',
      'skill-ai-dev',
      'skill-project-work',
    ],
    badgeLabel: 'Python Web',
  }),

  // =========================================================================
  // КАТЕГОРИЯ 5: «Веб и мобильные» (9 модулей)
  // =========================================================================
  makeModule({
    id: 'm_tilda',
    title: 'Интернет-магазин за 2 занятия - Лендинг на Tilda',
    shortTitle: 'Tilda / Лендинг',
    subtitle: 'Конструктор сайтов',
    description:
      'Идея получает собственную веб-страницу: блоки, формы и оформление превращаются в готовый лендинг.',
    categoryId: 'web-mobile',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_tilda.png',
    suggestedSkills: [
      'skill-web-structure',
      'skill-ui-ux',
      'skill-product-thinking',
      'skill-project-work',
    ],
    badgeLabel: 'Tilda',
  }),
  makeModule({
    id: 'm_thunkable',
    title: 'Разработка мобильных приложений в Thunkable',
    shortTitle: 'Thunkable',
    subtitle: 'Мобильные приложения',
    description:
      'Мобильное приложение складывается из экранов, кнопок и переходов — у идеи появляется место в телефоне.',
    categoryId: 'web-mobile',
    ageGroups: ['6-8'],
    imageFile: 'm_thunkable.png',
    suggestedSkills: [
      'skill-app-dev',
      'skill-visual-coding',
      'skill-ui-ux',
      'skill-testing',
    ],
    badgeLabel: 'Thunkable',
  }),
  makeModule({
    id: 'm_html',
    title: 'Web-мастер: первые шаги в мир современных сайтов. Основы HTML',
    shortTitle: 'Основы HTML',
    subtitle: 'Теги и структура',
    description:
      'За каждой веб-страницей обнаруживается структура из тегов, заголовков, изображений и ссылок.',
    categoryId: 'web-mobile',
    ageGroups: ['6-8'],
    imageFile: 'm_html_basics.png',
    suggestedSkills: [
      'skill-html',
      'skill-web-structure',
      'skill-text-coding',
    ],
    badgeLabel: 'HTML',
  }),
  makeModule({
    id: 'm_css',
    title: 'CSS - технологии. Управление элементами сайта',
    shortTitle: 'CSS Технологии',
    subtitle: 'Стили и оформление',
    description:
      'Сайт меняет характер с помощью CSS: цвет, шрифт, отступы и расположение элементов создают его внешний вид.',
    categoryId: 'web-mobile',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_css_tech.png',
    suggestedSkills: [
      'skill-css',
      'skill-web-structure',
      'skill-composition',
    ],
    badgeLabel: 'CSS',
  }),
  makeModule({
    id: 'm_html_css',
    title: 'WEB-мастер. Продвинутый уровень. (HTML+CSS)',
    shortTitle: 'HTML + CSS',
    subtitle: 'Современная вёрстка',
    description:
      'Отдельные элементы складываются в полноценный адаптивный сайт, который подстраивается под разные экраны.',
    categoryId: 'web-mobile',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_html_css.png',
    suggestedSkills: [
      'skill-html',
      'skill-css',
      'skill-web-structure',
      'skill-ui-ux',
    ],
    badgeLabel: 'HTML+CSS',
  }),
  makeModule({
    id: 'm_javascript',
    title: 'Язык программирования JavaScript + AI - помощники',
    shortTitle: 'JavaScript',
    subtitle: 'Интерактивный веб',
    description:
      'Страницы начинают реагировать на действия: клики, события и данные добавляют сайту интерактивность.',
    categoryId: 'web-mobile',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_javascript.png',
    suggestedSkills: [
      'skill-javascript',
      'skill-text-coding',
      'skill-ai-dev',
      'skill-debugging',
    ],
    badgeLabel: 'JS + AI',
  }),
  makeModule({
    id: 'm_typescript',
    title: 'TypeScript + AI: создаём умные веб-приложения',
    shortTitle: 'TypeScript + AI',
    subtitle: 'Типизация и веб-приложения',
    description:
      'За интерактивными приложениями открывается строгая типизация, которая помогает делать код понятнее и надёжнее.',
    categoryId: 'web-mobile',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_typescript.png',
    suggestedSkills: [
      'skill-typescript',
      'skill-app-dev',
      'skill-ai-dev',
      'skill-program-logic',
    ],
    badgeLabel: 'TypeScript',
  }),
  makeModule({
    id: 'm_vk_bot',
    title: 'Чат-бот на Python. Создаем своего чат-бота в VK',
    shortTitle: 'Чат-бот VK',
    subtitle: 'Боты и автоматизация',
    description:
      'У чат-бота появляется характер и сценарий: команды, кнопки и ответы помогают общаться с пользователями.',
    categoryId: 'web-mobile',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_vk_bot.png',
    suggestedSkills: [
      'skill-python',
      'skill-automation',
      'skill-program-logic',
      'skill-project-work',
    ],
    badgeLabel: 'VK Бот',
  }),
  makeModule({
    id: 'm_php_sql',
    title: 'PHP + SQL. Основы backend-разработки',
    shortTitle: 'PHP + SQL',
    subtitle: 'Сервер и базы данных',
    description:
      'За интерфейсом сайта обнаруживается серверная часть, где PHP обрабатывает запросы, а SQL помогает хранить данные.',
    categoryId: 'web-mobile',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_php_sql.png',
    suggestedSkills: [
      'skill-php-sql',
      'skill-text-coding',
      'skill-app-dev',
      'skill-analytical',
    ],
    badgeLabel: 'PHP+SQL',
  }),

  // =========================================================================
  // КАТЕГОРИЯ 6: «Грамотность и безопасность» (6 модулей)
  // =========================================================================
  makeModule({
    id: 'm_pc_device',
    title: 'Устройство компьютера из чего состоит пк и как он работает',
    shortTitle: 'Устройство ПК',
    subtitle: 'Железо и система',
    description:
      'Компьютер раскрывается изнутри: процессор, память, видеокарта и накопители работают как единая система.',
    categoryId: 'digital-literacy',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_pc_device.png',
    suggestedSkills: [
      'skill-pc-hardware',
      'skill-digital-literacy',
      'skill-analysis',
    ],
    badgeLabel: 'ПК',
  }),
  makeModule({
    id: 'm_word_excel',
    title: 'Цифровая база для школьника: используем Word и Excel как профи',
    shortTitle: 'Word + Excel',
    subtitle: 'Документы и таблицы',
    description:
      'Документы и таблицы становятся удобными инструментами: оформление текста, формулы и диаграммы помогают в учёбе и проектах.',
    categoryId: 'digital-literacy',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_word_excel.png',
    suggestedSkills: [
      'skill-docs',
      'skill-tables',
      'skill-digital-literacy',
      'skill-info-search',
    ],
    badgeLabel: 'Word/Excel',
  }),
  makeModule({
    id: 'm_powerpoint',
    title: 'Магия эффектных презентаций PowerPoint',
    shortTitle: 'PowerPoint',
    subtitle: 'Слайды и дизайн',
    description:
      'Презентация превращается в историю проекта, где каждый слайд, акцент и анимация помогают донести идею.',
    categoryId: 'digital-literacy',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_powerpoint.png',
    suggestedSkills: [
      'skill-docs',
      'skill-presentation',
      'skill-composition',
      'skill-creativity',
    ],
    badgeLabel: 'PowerPoint',
  }),
  makeModule({
    id: 'm_qr',
    title: 'QR-код: что это и как его использовать',
    shortTitle: 'QR-код',
    subtitle: 'Цифровые метки',
    description:
      'За квадратным узором скрывается ссылка или информация — теперь понятно, как создавать и безопасно использовать QR-коды.',
    categoryId: 'digital-literacy',
    ageGroups: ['6-8'],
    imageFile: 'm_qr_code.png',
    suggestedSkills: [
      'skill-digital-literacy',
      'skill-info-search',
      'skill-cybersecurity',
    ],
    badgeLabel: 'QR-код',
  }),
  makeModule({
    id: 'm_yandex',
    title: 'Полезные Яндекс сервисы для жизни',
    shortTitle: 'Сервисы Яндекса',
    subtitle: 'Облако и карты',
    description:
      'Повседневные цифровые инструменты помогают находить нужное, хранить файлы и организовывать дела.',
    categoryId: 'digital-literacy',
    ageGroups: ['6-8'],
    imageFile: 'm_yandex_services.png',
    suggestedSkills: [
      'skill-digital-literacy',
      'skill-cloud-tech',
      'skill-info-search',
    ],
    badgeLabel: 'Яндекс',
  }),
  makeModule({
    id: 'm_cyber_security',
    title: 'Основы кибербезопасности',
    shortTitle: 'Кибербезопасность',
    subtitle: 'Защита в сети',
    description:
      'В интернете встречаются не только возможности, но и ловушки: надёжные пароли и внимательность помогают защитить себя.',
    categoryId: 'digital-literacy',
    ageGroups: ['6-8', '9-11'],
    imageFile: 'm_cybersecurity.png',
    suggestedSkills: [
      'skill-cybersecurity',
      'skill-data-protection',
      'skill-digital-literacy',
      'skill-analysis',
    ],
    badgeLabel: 'Security',
  }),

  // =========================================================================
  // КАТЕГОРИЯ 7: «Продвинутые технологии» (5 модулей)
  // =========================================================================
  makeModule({
    id: 'm_vibe_debug',
    title: 'Тестирование & Vibe Debugging. Охотимся за багами',
    shortTitle: 'Vibe Debugging',
    subtitle: 'QA и поиск багов',
    description:
      'Ошибка — не конец проекта, а загадка: тесты, отладчики и ИИ помогают найти причину и исправить её.',
    categoryId: 'advanced-tech',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_vibe_debugging.png',
    suggestedSkills: [
      'skill-testing',
      'skill-debugging',
      'skill-ai-dev',
      'skill-analytical',
    ],
    badgeLabel: 'Vibe Debug',
  }),
  makeModule({
    id: 'm_hacking',
    title: 'Этичный хакинг & AI безопасность',
    shortTitle: 'Ethical Hacking',
    subtitle: 'Безопасность и AI',
    description:
      'Системы можно изучать с другой стороны — искать слабые места, понимать угрозы и находить способы защиты.',
    categoryId: 'advanced-tech',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_ethical_hacking.png',
    suggestedSkills: [
      'skill-cybersecurity',
      'skill-data-protection',
      'skill-ai-eval',
      'skill-analytical',
    ],
    badgeLabel: 'Hacking',
  }),
  makeModule({
    id: 'm_cloud_web3',
    title: 'Современные технологии: облака, блокчейн и data science',
    shortTitle: 'Современные технологии',
    subtitle: 'Cloud, Data & Web3',
    description:
      'За привычными сервисами открывается большой цифровой мир: облака, блокчейн и анализ данных.',
    categoryId: 'advanced-tech',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_cloud_blockchain.png',
    suggestedSkills: [
      'skill-cloud-tech',
      'skill-digital-literacy',
      'skill-analytical',
      'skill-research',
    ],
    badgeLabel: 'Cloud/Data',
  }),
  makeModule({
    id: 'm_csharp',
    title: 'Язык программирования C#',
    shortTitle: 'C#',
    subtitle: 'Разработка на C#',
    description:
      'Знакомство с C# раскрывает язык, на котором создают игры, приложения и программные сервисы.',
    categoryId: 'advanced-tech',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_csharp.png',
    suggestedSkills: [
      'skill-csharp',
      'skill-text-coding',
      'skill-program-logic',
      'skill-problem-solving',
    ],
    badgeLabel: 'C#',
  }),
  makeModule({
    id: 'm_olympiad',
    title: 'Олимпиадное программирование',
    shortTitle: 'Олимпиадное программирование',
    subtitle: 'Алгоритмы PRO',
    description:
      'Сложные задачи требуют не только правильного ответа, но и красивого решения — быстрого, точного и продуманного.',
    categoryId: 'advanced-tech',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_olympiad.png',
    suggestedSkills: [
      'skill-algorithmization',
      'skill-decomposition',
      'skill-nonstandard',
      'skill-problem-solving',
    ],
    badgeLabel: 'Олимпиада',
  }),

  // =========================================================================
  // КАТЕГОРИЯ 8: «Финансы и карьера» (4 модуля)
  // =========================================================================
  makeModule({
    id: 'm_finance',
    title: 'Финансовый интеллект. Авторский модуль',
    shortTitle: 'Финансовый интеллект',
    subtitle: 'Финансы и мышление',
    description:
      'Деньги становятся понятнее через цели, бюджет и риски, а цифровая идея — через её ценность для людей.',
    categoryId: 'financial',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_finance.png',
    suggestedSkills: [
      'skill-financial',
      'skill-product-thinking',
      'skill-analysis',
      'skill-time-management',
    ],
    badgeLabel: 'Финансы',
  }),
  makeModule({
    id: 'm_pitching',
    title: 'Открытый урок. Тренируем навык Питчинга',
    shortTitle: 'Открытый урок',
    subtitle: 'Питчинг проекта',
    description:
      'У проекта появляется голос: рассказ о своей идее, её сильных сторонах и возможностях перед аудиторией.',
    categoryId: 'financial',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_pitching.png',
    suggestedSkills: [
      'skill-presentation',
      'skill-project-work',
      'skill-creativity',
      'skill-autonomy',
    ],
    badgeLabel: 'Питчинг',
  }),
  makeModule({
    id: 'm_graduation',
    title: 'Выпускной и сохранение портфолио',
    shortTitle: 'Выпускной',
    subtitle: 'Итоговое портфолио',
    description:
      'Лучшие проекты собираются в личное цифровое портфолио — наглядную историю пройденного пути.',
    categoryId: 'financial',
    ageGroups: ['6-8', '9-11', '12-14'],
    imageFile: 'm_graduation.png',
    suggestedSkills: [
      'skill-presentation',
      'skill-project-work',
      'skill-autonomy',
      'skill-digital-literacy',
    ],
    badgeLabel: 'Выпускной',
  }),
  makeModule({
    id: 'm_oge',
    title: 'Подготовка к ОГЭ по информатике',
    shortTitle: 'Подготовка к ОГЭ',
    subtitle: 'Экзамен и практика',
    description:
      'Знакомые темы информатики складываются в систему: логика, системы счисления и программирование помогают подготовиться к экзамену.',
    categoryId: 'financial',
    ageGroups: ['6-8'],
    imageFile: 'm_ege_prep.png',
    suggestedSkills: [
      'skill-analysis',
      'skill-algorithmization',
      'skill-text-coding',
      'skill-time-management',
    ],
    badgeLabel: 'ОГЭ',
  }),
];

export const DEFAULT_GROUP_TEMPLATES: GroupCurriculumTemplate[] = [
  {
    id: 'gtpl-junior-start',
    name: 'Младшая 6–8 · Старт и алгоритмы',
    description:
      'Креативный инжиниринг, Scratch Junior и Kodu Game Lab — базовый трек 1 года.',
    ageCategory: '6-8',
    paletteId: 'kiber-classic',
    moduleIds: ['m_creative', 'm_scratch_junior', 'm_kodu'],
    isBuiltIn: true,
    createdAt: '2026-11-25T20:00:00.000Z',
    updatedAt: '2026-11-25T20:00:00.000Z',
  },
  {
    id: 'gtpl-middle-year1',
    name: 'Средняя 9–11 · Старт и алгоритмы',
    description:
      'Креативный инжиниринг, Kodu Game Lab и Blockly — базовый трек.',
    ageCategory: '9-11',
    paletteId: 'kiber-classic',
    moduleIds: ['m_creative', 'm_kodu', 'm_blockly'],
    isBuiltIn: true,
    createdAt: '2026-11-25T20:00:00.000Z',
    updatedAt: '2026-11-25T20:00:00.000Z',
  },
  {
    id: 'gtpl-middle-gamedev',
    name: 'Средняя 9–11 · Геймдев и 3D',
    description:
      'Roblox, Construct 3 и Blender 3D — создание игр и 3D-моделей.',
    ageCategory: '9-11',
    paletteId: 'warm-editorial',
    moduleIds: ['m_roblox', 'm_construct3', 'm_blender'],
    isBuiltIn: true,
    createdAt: '2026-11-25T20:00:00.000Z',
    updatedAt: '2026-11-25T20:00:00.000Z',
  },
  {
    id: 'gtpl-senior-python',
    name: 'Старшая 12–14 · Python & AI Lab',
    description:
      'Python + AI-помощники, 2D-игра в PyGame и чат-бот VK.',
    ageCategory: '12-14',
    paletteId: 'tech-cobalt',
    moduleIds: ['m_python_ai', 'm_pygame', 'm_vk_bot'],
    isBuiltIn: true,
    createdAt: '2026-11-25T20:00:00.000Z',
    updatedAt: '2026-11-25T20:00:00.000Z',
  },
  {
    id: 'gtpl-middle-web',
    name: 'Средняя 9–11 · Веб-разработка и дизайн',
    description:
      'Web-дизайн в Figma, HTML+CSS и JavaScript + AI.',
    ageCategory: '9-11',
    paletteId: 'tech-cobalt',
    moduleIds: ['m_figma', 'm_html_css', 'm_javascript'],
    isBuiltIn: true,
    createdAt: '2026-11-25T20:00:00.000Z',
    updatedAt: '2026-11-25T20:00:00.000Z',
  },
];

const MODULE_AGE_MAP: Record<string, ModuleAgeGroup[]> = Object.fromEntries(
  KIBERONE_CURRICULUM_MODULES.map((m) => [m.id, m.ageGroups])
);

export function normalizeToModuleAgeGroup(
  age?: AgeCategory | string
): ModuleAgeGroup {
  if (age === '6-8' || age === '8-10') return '6-8';
  if (age === '12-14' || age === '14-15') return '12-14';
  return '9-11';
}

export function getModuleAgeGroups(mod: LibraryModule): ModuleAgeGroup[] {
  if (Array.isArray(mod.ageGroups) && mod.ageGroups.length > 0) {
    return mod.ageGroups;
  }
  return MODULE_AGE_MAP[mod.id] ?? ['9-11'];
}

export function getModuleAgeCategories(mod: LibraryModule): ModuleAgeGroup[] {
  return getModuleAgeGroups(mod);
}
