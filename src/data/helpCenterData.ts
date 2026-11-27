import { HelpIllustrationKind } from '../components/onboarding/HelpIllustrations';
import { OnboardingStepConfig } from './onboardingTour';

export type HelpCategoryId =
  | 'groups'
  | 'journals'
  | 'projects'
  | 'design'
  | 'preview'
  | 'backup';

export interface HelpCategory {
  id: HelpCategoryId;
  title: string;
  description: string;
  illustration: HelpIllustrationKind;
}

export interface HelpStep {
  title: string;
  detail: string;
  buttonLabel?: string;
}

export interface HelpArticle {
  id: string;
  categoryId: HelpCategoryId;
  question: string;
  shortSummary: string;
  keywords: string[];
  illustration: HelpIllustrationKind;
  steps: HelpStep[];
  expectedResult: string;
  reminder?: string;
  miniTourSteps: OnboardingStepConfig[];
}

export interface DetailedBackupLessonSection {
  number: number;
  title: string;
  body: string[];
  tip?: string;
  highlightComparison?: boolean;
  isWarning?: boolean;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'groups',
    title: '1. Группы и резиденты',
    description:
      'Создание групп, добавление и редактирование учеников, массовые настройки.',
    illustration: 'groups',
  },
  {
    id: 'journals',
    title: '2. Создание журналов',
    description:
      'Период обучения, пройденные модули, сильные стороны и письмо наставника.',
    illustration: 'journals',
  },
  {
    id: 'projects',
    title: '3. Проекты и изображения',
    description:
      'Добавление проектов, загрузка скриншотов и работа с медиатекой школы.',
    illustration: 'projects',
  },
  {
    id: 'design',
    title: '4. Редактор дизайна',
    description:
      'Размеры блоков, мишка, облачко, цвета, стикеры и перенос дизайна на группу.',
    illustration: 'design',
  },
  {
    id: 'preview',
    title: '5. Предпросмотр и печать',
    description:
      'Переключение страниц, проверка переполнения А4, выгрузка PDF и PNG.',
    illustration: 'preview',
  },
  {
    id: 'backup',
    title: '6. Резервное копирование',
    description:
      'ZIP-бэкап, перенос между компьютерами, объединение данных и конфликты.',
    illustration: 'backup',
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  // =========================================================================
  // 1. ГРУППЫ И РЕЗИДЕНТЫ
  // =========================================================================
  {
    id: 'groups-create',
    categoryId: 'groups',
    question: 'Как создать группу?',
    shortSummary:
      'Заведите учебную группу с локацией, датами обучения и наставником.',
    keywords: [
      'создать группу',
      'новая группа',
      'локация',
      'даты',
      'наставник',
      'поток',
    ],
    illustration: 'groups',
    steps: [
      {
        title: 'Откройте окно создания группы',
        detail:
          'В верхней панели справа нажмите зелёную кнопку создания новой группы.',
        buttonLabel: 'Создать группу',
      },
      {
        title: 'Заполните основные поля',
        detail:
          'Укажите название группы (например, «Python Start · Сб 10:00»), выберите локацию, возрастную категорию, даты начала и окончания периода, а также имя наставника.',
      },
      {
        title: 'Сохраните карточку группы',
        detail:
          'Нажмите кнопку подтверждения в форме — группа сразу появится на главной странице «Группы».',
        buttonLabel: 'Сохранить группу',
      },
    ],
    expectedResult:
      'Новая карточка группы появляется на главном экране, и в неё можно сразу добавлять резидентов.',
    miniTourSteps: [
      {
        id: 'mini-groups-create-1',
        stepNumber: 1,
        shortLabel: 'Создание группы',
        title: 'Кнопка «Создать группу»',
        description:
          'Нажмите эту кнопку справа в верхней панели, чтобы открыть форму новой учебной группы и указать локацию, период и наставника.',
        extraTip:
          'Обучение не создаёт тестовые группы — вы можете нажать кнопку самостоятельно, когда будете готовы.',
        route: 'home',
        targetSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
      },
    ],
  },
  {
    id: 'groups-add-resident',
    categoryId: 'groups',
    question: 'Как добавить резидента?',
    shortSummary:
      'Быстро добавьте ученика в карточке группы или прямо в редакторе.',
    keywords: [
      'добавить резидента',
      'добавить ученика',
      'ребёнок',
      'новый ученик',
      'список группы',
    ],
    illustration: 'groups',
    steps: [
      {
        title: 'Найдите карточку нужной группы',
        detail:
          'На главной странице «Группы» выберите карточку группы, в которую нужно добавить ребёнка.',
      },
      {
        title: 'Нажмите кнопку добавления ученика',
        detail:
          'В нижней части карточки группы нажмите кнопку добавления ученика и введите имя, фамилию и возраст.',
        buttonLabel: 'Добавить ученика',
      },
      {
        title: 'Подтвердите добавление',
        detail:
          'Нажмите «Добавить». Персональный журнал резидента создастся автоматически с общими настройками группы.',
        buttonLabel: 'Добавить',
      },
    ],
    expectedResult:
      'Резидент появляется в списке группы, и на него уже заведён готовый к заполнению журнал А4.',
    miniTourSteps: [
      {
        id: 'mini-groups-add-resident-1',
        stepNumber: 1,
        shortLabel: 'Добавление ученика',
        title: 'Кнопка «Добавить ученика» в карточке группы',
        description:
          'Нажмите «Добавить ученика» внутри карточки нужной группы, введите имя и возраст — журнал создастся автоматически.',
        route: 'home',
        targetSelector: '[data-tour-id="home-add-student"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'top',
        requiresExistingGroup: true,
        emptyDataNote:
          'Сначала создайте первую группу кнопкой «Создать группу», после чего в её карточке появится кнопка «Добавить ученика».',
      },
    ],
  },
  {
    id: 'groups-edit-resident',
    categoryId: 'groups',
    question: 'Как изменить данные резидента?',
    shortSummary:
      'Обновите имя, возраст, фото или переведите ученика в другую группу.',
    keywords: [
      'изменить данные резидента',
      'имя ученика',
      'возраст',
      'перевести ученика',
      'профиль',
    ],
    illustration: 'journals',
    steps: [
      {
        title: 'Откройте журнал нужного резидента',
        detail:
          'На главной странице нажмите на имя ученика в карточке группы либо откройте редактор группы и выберите ребёнка в левой колонке.',
      },
      {
        title: 'Перейдите в раздел «1. Профиль»',
        detail:
          'В правой панели во вкладке «Контент» выберите первый шаг — там можно поправить ФИО, возраст, статус, наставника и период.',
        buttonLabel: '1. Профиль',
      },
      {
        title: 'Перевод в другую группу (при необходимости)',
        detail:
          'Если ребёнок перешёл в другой поток, на главной карточке группы используйте кнопку «Перевести».',
        buttonLabel: 'Перевести',
      },
    ],
    expectedResult:
      'Изменённые имя, возраст и период сразу обновляются в базе и на обложке листа А4.',
    miniTourSteps: [
      {
        id: 'mini-groups-edit-resident-1',
        stepNumber: 1,
        shortLabel: 'Список резидентов',
        title: 'Выбор резидента в левой колонке',
        description:
          'Нажмите на имя ученика слева, чтобы открыть его персональный журнал.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-students-sidebar"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'right',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          inspectorStep: 'profile',
          pageFocus: 1,
        },
      },
      {
        id: 'mini-groups-edit-resident-2',
        stepNumber: 2,
        shortLabel: 'Профиль ученика',
        title: 'Редактирование данных в разделе «1. Профиль»',
        description:
          'Здесь меняются имя, возраст, локация, наставник и отчётный период выбранного резидента.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-content-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          inspectorStep: 'profile',
          pageFocus: 1,
        },
      },
    ],
  },
  {
    id: 'groups-delete-archive',
    categoryId: 'groups',
    question: 'Как удалить или архивировать группу?',
    shortSummary:
      'Как безопасно убрать завершённую группу и сохранить её архив в ZIP.',
    keywords: [
      'удалить группу',
      'архивировать группу',
      'архив',
      'корзина',
      'завершённая группа',
    ],
    illustration: 'groups',
    reminder:
      'Перед удалением завершённой группы обязательно сделайте резервную копию (кнопка «Бэкап» → «Создать резервную копию») — тогда при необходимости её можно будет открыть снова.',
    steps: [
      {
        title: 'Сначала сохраните архивную копию',
        detail:
          'Если группа завершила обучение, выгрузите готовые журналы кнопкой «Выгрузить готовые (ZIP)» или создайте общий файл через «Бэкап», чтобы не потерять материалы.',
        buttonLabel: 'Выгрузить готовые (ZIP)',
      },
      {
        title: 'Нажмите значок корзины в карточке группы',
        detail:
          'В правом верхнем углу карточки группы на главной странице нажмите значок удаления.',
      },
      {
        title: 'Подтвердите действие',
        detail:
          'Появится уточнение «Удалить? Да / Нет». Нажмите «Да» только если уверены — случайное нажатие легко отменить кнопкой «Нет».',
        buttonLabel: 'Да',
      },
    ],
    expectedResult:
      'Лишняя группа удаляется с рабочего экрана, а её журналы при предварительном сохранении остаются у вас в ZIP-архиве.',
    miniTourSteps: [
      {
        id: 'mini-groups-delete-1',
        stepNumber: 1,
        shortLabel: 'Управление группой',
        title: 'Кнопки редактирования и удаления группы',
        description:
          'Справа вверху на карточке группы находятся карандаш (редактировать параметры) и корзина (удалить с подтверждением «Да / Нет»).',
        extraTip:
          'Перед удалением завершённой группы рекомендуем сохранить резервную копию через кнопку «Бэкап».',
        route: 'home',
        targetSelector: '[data-tour-id="home-group-edit"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
      },
    ],
  },
  {
    id: 'groups-bulk-work',
    categoryId: 'groups',
    question: 'Как работать сразу со всей группой?',
    shortSummary:
      'Настройте период, модули, навыки и оформление один раз и примените ко всем ученикам.',
    keywords: [
      'вся группа',
      'общие данные',
      'массово',
      'применить ко всем',
      'сразу со всей группой',
    ],
    illustration: 'groups',
    steps: [
      {
        title: 'Откройте вкладку «Общие данные группы»',
        detail:
          'В редакторе группы в верхней панели выберите вкладку «Общие данные группы».',
        buttonLabel: 'Общие данные группы',
      },
      {
        title: 'Задайте общие параметры',
        detail:
          'Пройдите 4 шага: период и палитра оформления, пройденные модули, общие навыки и раздел «Что впереди?».',
      },
      {
        title: 'Примените настройки ко всем резидентам',
        detail:
          'Нажмите кнопку «Применить ко всем» — общие модули, даты и палитра обновятся у каждого активного ученика группы, не стирая их личные проекты и письма.',
        buttonLabel: 'Применить ко всем',
      },
    ],
    expectedResult:
      'Все активные журналы группы получают единую учебную программу, период и оформление за один клик.',
    miniTourSteps: [
      {
        id: 'mini-groups-bulk-1',
        stepNumber: 1,
        shortLabel: 'Общие данные',
        title: 'Вкладка «Общие данные группы»',
        description:
          'Настройте здесь период, палитру, модули и блок «Что впереди?» один раз — и нажмите «Применить ко всем» в правом верхнем углу этой вкладки.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-period-section"]',
        secondarySelector: '[data-tour-id="editor-common-tab"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'common',
          commonStep: 1,
        },
      },
    ],
  },

  // =========================================================================
  // 2. СОЗДАНИЕ ЖУРНАЛОВ
  // =========================================================================
  {
    id: 'journals-create',
    categoryId: 'journals',
    question: 'Как создать журнал резидента?',
    shortSummary:
      'Журнал создаётся автоматически при добавлении резидента в группу.',
    keywords: [
      'создать журнал',
      'новый журнал',
      'открыть журнал',
      'редактор учеников',
    ],
    illustration: 'journals',
    steps: [
      {
        title: 'Добавьте резидента в группу',
        detail:
          'На главной странице в карточке группы нажмите «Добавить ученика» и укажите имя и возраст. Журнал создаётся автоматически.',
        buttonLabel: 'Добавить ученика',
      },
      {
        title: 'Откройте журнал для заполнения',
        detail:
          'Нажмите на имя ребёнка в карточке группы (или на кнопку «Открыть редактор» и выберите ученика слева).',
      },
      {
        title: 'Заполните 5 шагов в правой панели',
        detail:
          'Во вкладке «Контент» пройдите разделы от профиля до письма наставника — слева сразу виден готовый разворот А4.',
      },
    ],
    expectedResult:
      'У ребёнка открывается личный двухстраничный журнал А4 с общими данными группы.',
    miniTourSteps: [
      {
        id: 'mini-journals-create-1',
        stepNumber: 1,
        shortLabel: 'Карточка группы',
        title: 'Создание и открытие журнала',
        description:
          'Журнал создаётся автоматически сразу после добавления ученика. Нажмите на имя ученика в карточке группы, чтобы начать заполнение.',
        route: 'home',
        targetSelector: '[data-tour-id="home-group-card"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'right',
        requiresExistingGroup: true,
      },
      {
        id: 'mini-journals-create-2',
        stepNumber: 2,
        shortLabel: 'Редактор журнала',
        title: 'Панель заполнения журнала',
        description:
          'Справа переключайтесь между 5 разделами журнала, а слева сразу проверяйте, как всё выглядит на листах А4.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-content-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          inspectorStep: 'profile',
          pageFocus: 'spread',
        },
      },
    ],
  },
  {
    id: 'journals-period',
    categoryId: 'journals',
    question: 'Как заполнить отчётный период?',
    shortSummary:
      'Задайте даты начала и окончания обучения для всей группы или одного ученика.',
    keywords: [
      'отчётный период',
      'даты обучения',
      'период',
      'сентябрь',
      'декабрь',
      'срок',
    ],
    illustration: 'journals',
    steps: [
      {
        title: 'Задайте период сразу для всей группы',
        detail:
          'Откройте «Общие данные группы» → Шаг 1 («Параметры и палитра») и выберите даты начала и окончания периода — строка отчётного периода сформируется автоматически.',
        buttonLabel: 'Общие данные группы',
      },
      {
        title: 'Примените даты ко всем ученикам',
        detail:
          'Нажмите «Применить ко всем», чтобы период обновился сразу на обложках всех журналов группы.',
        buttonLabel: 'Применить ко всем',
      },
      {
        title: 'Индивидуальная правка для одного ребёнка',
        detail:
          'Если ребёнок присоединился позже, откройте «Редактор учеников» → «1. Профиль» и поправьте поле «Период обучения» только у него.',
        buttonLabel: '1. Профиль',
      },
    ],
    expectedResult:
      'Аккуратный отчётный период отображается на первой странице обложки журнала А4.',
    miniTourSteps: [
      {
        id: 'mini-journals-period-1',
        stepNumber: 1,
        shortLabel: 'Период группы',
        title: 'Параметры и отчётный период',
        description:
          'Укажите даты начала и окончания периода в этом блоке — они автоматически подставятся во все журналы после нажатия «Применить ко всем».',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-period-section"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'common',
          commonStep: 1,
        },
      },
    ],
  },
  {
    id: 'journals-modules',
    categoryId: 'journals',
    question: 'Как выбрать пройденные модули?',
    shortSummary:
      'Отметьте модули из библиотеки для всей группы или настройте список у одного ученика.',
    keywords: [
      'модули',
      'программа',
      'открытия',
      'навыки',
      'выбрать модули',
      'скрыть модуль',
    ],
    illustration: 'journals',
    steps: [
      {
        title: 'Выберите модули для всей группы',
        detail:
          'Перейдите в «Общие данные группы» → Шаг 2 («Модули программы») и отметьте пройденные темы из каталога (или примените готовый групповой шаблон).',
        buttonLabel: 'Общие данные группы',
      },
      {
        title: 'Перенесите список на учеников',
        detail:
          'Нажмите «Применить ко всем», чтобы карточки модулей появились на первой странице у всех ребят.',
      },
      {
        title: 'Настройте модули индивидуально (если нужно)',
        detail:
          'Если ребёнок пропустил модуль или прошёл дополнительный, откройте у него вкладку «Контент» → «2. Модули» — там можно скрыть лишнюю карточку или добавить другую.',
        buttonLabel: '2. Модули',
      },
    ],
    expectedResult:
      'На первой странице А4 в блоке «Мои открытия» появляются красивые карточки пройденных модулей и теги навыков.',
    miniTourSteps: [
      {
        id: 'mini-journals-modules-1',
        stepNumber: 1,
        shortLabel: 'Модули группы',
        title: 'Выбор модулей в программе группы',
        description:
          'На втором шаге общих данных отметьте модули, которые прошла группа — отсюда они переносятся всем резидентам.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-common-modules"]',
        fallbackSelector: '[data-tour-id="editor-common-tab"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'common',
          commonStep: 2,
        },
      },
      {
        id: 'mini-journals-modules-2',
        stepNumber: 2,
        shortLabel: 'Личные модули',
        title: 'Точная настройка у конкретного резидента',
        description:
          'В шаге «2. Модули» у каждого ученика можно скрыть отдельный модуль, поменять картинку или добавить тег навыка.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-content-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          inspectorStep: 'curriculum',
          pageFocus: 1,
        },
      },
    ],
  },
  {
    id: 'journals-achievements',
    categoryId: 'journals',
    question: 'Как добавить достижения и сильные стороны?',
    shortSummary:
      'Отметьте сильные качества ребёнка и опишите его главный момент гордости.',
    keywords: [
      'достижения',
      'сильные стороны',
      'гордость',
      'успехи',
      'страница 2',
      'качества',
    ],
    illustration: 'journals',
    steps: [
      {
        title: 'Перейдите в раздел «4. Успехи»',
        detail:
          'В «Редакторе учеников» во вкладке «Контент» нажмите на четвёртую вкладку «4. Успехи» — макет переключится на вторую страницу.',
        buttonLabel: '4. Успехи',
      },
      {
        title: 'Отметьте до 6 сильных сторон',
        detail:
          'Выберите подходящие карточки качеств из готового списка или добавьте собственную сильную сторону. При желании подберите иконку и короткую подпись.',
      },
      {
        title: 'Заполните блок гордости',
        detail:
          'Выберите готовую формулировку или впишите 1–2 тёплых предложения о самом заметном достижении ученика за период.',
      },
    ],
    expectedResult:
      'На второй странице А4 отображаются карточки сильных сторон и выделенный блок с моментом гордости.',
    miniTourSteps: [
      {
        id: 'mini-journals-achievements-1',
        stepNumber: 1,
        shortLabel: 'Достижения',
        title: 'Раздел «4. Успехи» (Сильные стороны и гордость)',
        description:
          'Здесь выбираются сильные стороны резидента и текст для блока «Я особенно горжусь». Все изменения сразу появляются на второй странице А4.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-content-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          inspectorStep: 'pride',
          pageFocus: 2,
        },
      },
    ],
  },
  {
    id: 'journals-mentor-note',
    categoryId: 'journals',
    question: 'Как заполнить письмо наставника?',
    shortSummary:
      'Напишите личное обращение, тёплое напутствие и подпись наставника.',
    keywords: [
      'письмо наставника',
      'слово наставника',
      'отзыв',
      'пожелание',
      'напутствие',
      'подпись',
    ],
    illustration: 'journals',
    steps: [
      {
        title: 'Откройте пятый шаг «5. Письмо»',
        detail:
          'В правой панели во вкладке «Контент» выберите «5. Письмо».',
        buttonLabel: '5. Письмо',
      },
      {
        title: 'Заполните обращение и основной текст',
        detail:
          'Напишите персональное приветствие (например, «Арсений, ты отлично проявил себя!») и 2–4 предложения личного отзыва. Также можно выбрать готовый шаблон текста и адаптировать его под ребёнка.',
      },
      {
        title: 'Проверьте блок «Что впереди?» и подпись',
        detail:
          'Убедитесь, что имя и роль наставника указаны верно, а текст письма полностью помещается в рамку на листе А4 без предупреждения о переполнении.',
      },
    ],
    expectedResult:
      'На второй странице журнала появляется аккуратное письмо наставника с личным обращением к ребёнку.',
    miniTourSteps: [
      {
        id: 'mini-journals-note-1',
        stepNumber: 1,
        shortLabel: 'Письмо наставника',
        title: 'Раздел «5. Письмо»',
        description:
          'Заполните обращение, личный отзыв и подпись наставника. Следите, чтобы текст оставался лаконичным и гармонично помещался на листе А4.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-content-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          inspectorStep: 'mentorNote',
          pageFocus: 2,
        },
      },
    ],
  },

  // =========================================================================
  // 3. ПРОЕКТЫ И ИЗОБРАЖЕНИЯ
  // =========================================================================
  {
    id: 'projects-add',
    categoryId: 'projects',
    question: 'Как добавить проект?',
    shortSummary:
      'Добавьте до 6 проектов ребёнка с названием, описанием и скриншотом.',
    keywords: ['добавить проект', 'проекты', 'работы ученика', 'карточка проекта'],
    illustration: 'projects',
    steps: [
      {
        title: 'Откройте шаг «3. Проекты»',
        detail:
          'В «Редакторе учеников» во вкладке «Контент» перейдите на третью вкладку — «3. Проекты».',
        buttonLabel: '3. Проекты',
      },
      {
        title: 'Нажмите кнопку добавления проекта',
        detail:
          'Нажмите «+ Добавить проект» (или отредактируйте уже созданную карточку проекта).',
        buttonLabel: '+ Добавить проект',
      },
      {
        title: 'Укажите название и краткое описание',
        detail:
          'Напишите, что именно создал ребёнок (например, игру, сайт или 3D-сцену) и чем эта работа интересна родителям.',
      },
    ],
    expectedResult:
      'Карточка нового проекта появляется на первой странице журнала А4.',
    miniTourSteps: [
      {
        id: 'mini-projects-add-1',
        stepNumber: 1,
        shortLabel: 'Проекты',
        title: 'Раздел «3. Проекты»',
        description:
          'Здесь добавляются, редактируются и скрываются проекты ученика. Рекомендуется оставлять от 2 до 4 проектов с короткими подписями.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-content-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          inspectorStep: 'projects',
          pageFocus: 1,
        },
      },
    ],
  },
  {
    id: 'projects-upload-screenshot',
    categoryId: 'projects',
    question: 'Как загрузить скриншот работы?',
    shortSummary:
      'Прикрепите PNG, JPG или WebP изображение прямо в карточку проекта.',
    keywords: [
      'загрузить скриншот',
      'фото проекта',
      'скриншот работы',
      'картинка проекта',
    ],
    illustration: 'projects',
    steps: [
      {
        title: 'Выберите нужный проект в шаге «3. Проекты»',
        detail:
          'Откройте карточку проекта, к которой хотите прикрепить снимок экрана или фото работы.',
      },
      {
        title: 'Нажмите кнопку загрузки изображения',
        detail:
          'Нажмите «Загрузить скриншот» (или «Загрузить файл») и выберите файл PNG, JPG или WebP на компьютере.',
        buttonLabel: 'Загрузить файл',
      },
      {
        title: 'При необходимости поправьте кадрирование',
        detail:
          'Скриншот автоматически встроится в карточку и сохранится в базе приложения — интернет для показа не нужен.',
      },
    ],
    expectedResult:
      'В карточке проекта на первой странице А4 вместо стандартной обложки отображается реальный скриншот работы ученика.',
    miniTourSteps: [
      {
        id: 'mini-projects-upload-1',
        stepNumber: 1,
        shortLabel: 'Загрузка скриншота',
        title: 'Загрузка скриншота в разделе «3. Проекты»',
        description:
          'В каждой карточке проекта есть кнопка загрузки файла с компьютера и кнопка выбора из общей «Медиатеки».',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-content-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          inspectorStep: 'projects',
          pageFocus: 1,
        },
      },
    ],
  },
  {
    id: 'projects-replace-delete-image',
    categoryId: 'projects',
    question: 'Как заменить или удалить изображение?',
    shortSummary:
      'Загрузите новый файл поверх старого или верните аккуратную обложку одним кликом.',
    keywords: [
      'заменить изображение',
      'удалить изображение',
      'поменять картинку',
      'убрать фото',
    ],
    illustration: 'projects',
    steps: [
      {
        title: 'Откройте нужную карточку в «3. Проекты» или «2. Модули»',
        detail:
          'Перейдите к карточке проекта или модуля, картинку которой нужно обновить.',
      },
      {
        title: 'Замена изображения',
        detail:
          'Нажмите «Загрузить файл» или «Выбрать из медиатеки», чтобы поставить другую картинку поверх прежней.',
        buttonLabel: 'Выбрать из медиатеки',
      },
      {
        title: 'Удаление изображения',
        detail:
          'Нажмите кнопку удаления скриншота (или «Удалить картинку») — карточка не сломается, а аккуратно вернётся к тематической иллюстрации.',
      },
    ],
    expectedResult:
      'Старая картинка заменяется новой или аккуратно убирается без пустых рамок на листе А4.',
    miniTourSteps: [
      {
        id: 'mini-projects-replace-1',
        stepNumber: 1,
        shortLabel: 'Замена картинки',
        title: 'Управление изображением в карточке',
        description:
          'В разделе «3. Проекты» (и при редактировании картинки модуля) вы можете загрузить новый файл, выбрать фото из медиатеки или удалить скриншот.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-content-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          inspectorStep: 'projects',
          pageFocus: 1,
        },
      },
    ],
  },
  {
    id: 'projects-no-works',
    categoryId: 'projects',
    question: 'Что делать, если работ ребёнка нет?',
    shortSummary:
      'Используйте аккуратную тематическую обложку по модулю или скройте лишние карточки.',
    keywords: [
      'нет работ',
      'нет скриншотов',
      'нет проектов',
      'заглушка',
      'скрыть проект',
    ],
    illustration: 'projects',
    steps: [
      {
        title: 'Вариант 1: оставить проект с тематической обложкой',
        detail:
          'Если ребёнок делал работу, но скриншот не сохранился, выберите тему проекта (например, Python, Scratch или 3D) — приложение подставит красивую фирменную иллюстрацию без пустой рамки.',
      },
      {
        title: 'Вариант 2: взять общую иллюстрацию из Медиатеки',
        detail:
          'Нажмите «Выбрать из медиатеки» и подставьте подходящую картинку из категории проектов или модулей.',
        buttonLabel: 'Медиатека',
      },
      {
        title: 'Вариант 3: скрыть блок или отдельную карточку',
        detail:
          'Если проектов пока нет совсем, отключите отображение лишней карточки значком глаза или снимите галочку показа блока «Проекты» — страница А4 останется аккуратной.',
      },
    ],
    expectedResult:
      'Журнал выглядит завершённым и аккуратным даже без готовых скриншотов от ученика.',
    miniTourSteps: [
      {
        id: 'mini-projects-noworks-1',
        stepNumber: 1,
        shortLabel: 'Если нет фото',
        title: 'Скрытие проектов или выбор темы обложки',
        description:
          'В шаге «3. Проекты» можно скрыть карточку, переключить её в режим тематической обложки или отключить весь блок проектов.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-content-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          inspectorStep: 'projects',
          pageFocus: 1,
        },
      },
    ],
  },
  {
    id: 'projects-media-library',
    categoryId: 'projects',
    question: 'Как пользоваться библиотекой изображений?',
    shortSummary:
      'Храните логотипы, маскотов, иконки модулей и фоны в единой Медиатеке школы.',
    keywords: [
      'библиотека изображений',
      'медиатека',
      'маскоты',
      'загрузить фото',
      'картинки',
    ],
    illustration: 'projects',
    steps: [
      {
        title: 'Откройте «Медиатеку» из верхней панели',
        detail:
          'Вверху главного экрана нажмите кнопку «Медиатека» — там собраны все встроенные и загруженные вами изображения.',
        buttonLabel: 'Медиатека',
      },
      {
        title: 'Загрузите свои картинки один раз',
        detail:
          'Нажмите загрузку изображения внутри медиатеки и выберите категорию (модули, проекты, маскоты, декор). После этого картинка доступна в любом журнале.',
      },
      {
        title: 'Используйте картинки прямо из редактора',
        detail:
          'В модулях, проектах или вкладке «Дизайн» («+ Картинка») нажимайте выбор из медиатеки, чтобы быстро вставлять уже загруженные файлы.',
      },
    ],
    expectedResult:
      'Нужные иллюстрации и фото хранятся в одном месте, не дублируются и автоматически попадают в ZIP-бэкап.',
    miniTourSteps: [
      {
        id: 'mini-projects-media-1',
        stepNumber: 1,
        shortLabel: 'Медиатека',
        title: 'Кнопка «Медиатека» в верхней панели',
        description:
          'Откройте библиотеку изображений школы отсюда, чтобы загрузить новые картинки или просмотреть встроенных маскотов и иллюстрации модулей.',
        route: 'home',
        targetSelector: '[data-tour-id="media-trigger"]',
        preferredPlacement: 'bottom',
      },
    ],
  },

  // =========================================================================
  // 4. РЕДАКТОР ДИЗАЙНА
  // =========================================================================
  {
    id: 'design-resize-block',
    categoryId: 'design',
    question: 'Как изменить размер блока?',
    shortSummary:
      'Настройте ширину, высоту и отступы любого блока на листе А4 во вкладке «Дизайн».',
    keywords: [
      'размер блока',
      'ширина',
      'высота',
      'масштаб',
      'уменьшить блок',
      'увеличить блок',
    ],
    illustration: 'design',
    steps: [
      {
        title: 'Переключитесь во вкладку «Дизайн»',
        detail:
          'В правой панели редактора учеников откройте вторую вкладку — «Дизайн».',
        buttonLabel: 'Дизайн',
      },
      {
        title: 'Нажмите на нужный блок прямо на листе А4',
        detail:
          'Кликните по обложке, блоку модулей, проектов, гордости, письму наставника или стикеру на листе.',
      },
      {
        title: 'Измените ширину, высоту или масштаб',
        detail:
          'В правой панели появятся ползунки и точные числовые поля размеров. Если нужно вернуть стандарт, нажмите «Сбросить размер».',
        buttonLabel: 'Сбросить размер',
      },
    ],
    expectedResult:
      'Выбранный блок точно меняет размер на листе А4 без искажения композиции.',
    miniTourSteps: [
      {
        id: 'mini-design-resize-1',
        stepNumber: 1,
        shortLabel: 'Вкладка «Дизайн»',
        title: 'Переключатель режима «Дизайн»',
        description:
          'Перейдите во вкладку «Дизайн», затем нажмите на любой блок на листе А4 слева — справа откроются поля ширины, высоты и сброса размеров.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-design-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'design',
          pageFocus: 1,
          designPage: 1,
          selectBlockId: 'modulesBlock',
        },
      },
    ],
  },
  {
    id: 'design-move-bear',
    categoryId: 'design',
    question: 'Как переместить медведя?',
    shortSummary:
      'Перетаскивайте 3D-мишку мышкой по листу А4 или сдвигайте по координатам X/Y.',
    keywords: [
      'переместить медведя',
      'мишка',
      'подвинуть мишку',
      'coverBear',
      'prideBear',
      'nextBear',
    ],
    illustration: 'design',
    steps: [
      {
        title: 'Откройте вкладку «Дизайн»',
        detail:
          'В правой панели переключитесь на вкладку «Дизайн» — объекты на листе станут интерактивными.',
        buttonLabel: 'Дизайн',
      },
      {
        title: 'Выберите мишку на листе А4',
        detail:
          'Нажмите на мишку на обложке (стр. 1) или в нижней/средней части второй страницы и перетащите его мышкой в нужное место.',
      },
      {
        title: 'Подправьте размер, поворот и слой',
        detail:
          'В правой панели можно дополнительно повернуть мишку, изменить размер или поставить поверх/под соседние элементы.',
      },
    ],
    expectedResult:
      'Мишка KIBERone свободно размещается в нужном месте листа А4 и не перекрывает важный текст.',
    miniTourSteps: [
      {
        id: 'mini-design-bear-1',
        stepNumber: 1,
        shortLabel: 'Перемещение мишки',
        title: 'Настройка положения и размера мишки',
        description:
          'Мишка уже выбран на обложке! В режиме «Дизайн» перетаскивайте его прямо по листу А4 мышкой или уточняйте координаты и масштаб в панели справа.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-design-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'design',
          pageFocus: 1,
          designPage: 1,
          selectBlockId: 'coverBear',
        },
      },
    ],
  },
  {
    id: 'design-move-speech-bubble',
    categoryId: 'design',
    question: 'Как изменить положение облачка с текстом?',
    shortSummary:
      'Выберите облачко рядом с мишкой в режиме «Дизайн» и сдвиньте его или измените реплику.',
    keywords: [
      'облачко с текстом',
      'облачко',
      'реплика мишки',
      'положение облачка',
      'coverBubble',
    ],
    illustration: 'design',
    steps: [
      {
        title: 'Откройте вкладку «Дизайн»',
        detail:
          'Переключитесь во вкладку «Дизайн» в правой панели редактора.',
        buttonLabel: 'Дизайн',
      },
      {
        title: 'Нажмите на облачко на странице 1 или странице 2',
        detail:
          'Кликните по облачку с репликой мишки (на обложке стр. 1 или в разделе гордости / «Что впереди?» на стр. 2).',
      },
      {
        title: 'Переместите и при необходимости поправьте текст',
        detail:
          'Перетащите облачко мышкой по листу или используйте поля координат X/Y и размера в правой панели. Текст реплики редактируется по клику на само облачко или в блоке настроек.',
      },
    ],
    expectedResult:
      'Облачко с текстом расположено удобно рядом с мишкой и не закрывает заголовок или другие блоки.',
    miniTourSteps: [
      {
        id: 'mini-design-bubble-1',
        stepNumber: 1,
        shortLabel: 'Облачко мишки',
        title: 'Перемещение и настройка облачка с текстом',
        description:
          'Облачко на обложке выделено. Перетаскивайте его мышкой на листе А4 или меняйте положение X/Y, размер и слой в панели справа.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-design-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'design',
          pageFocus: 1,
          designPage: 1,
          selectBlockId: 'coverBubble',
        },
      },
    ],
  },
  {
    id: 'design-colors',
    categoryId: 'design',
    question: 'Как изменить фон и цвета?',
    shortSummary:
      'Выберите готовую палитру оформления для группы или настройте цвет фона страниц А4.',
    keywords: [
      'фон',
      'цвета',
      'палитра',
      'сетка',
      'оформление',
      'цвет страницы',
    ],
    illustration: 'design',
    steps: [
      {
        title: 'Выбор фирменной палитры',
        detail:
          'Откройте «Общие данные группы» → Шаг 1 («Палитра оформления листов А4») или внизу вкладки «Дизайн» нажмите ссылку «Палитра →». Выберите готовую палитру: «Фирменный KIBERone», «Тёплая журнальная бумага», «Техно-кобальт» или «Солнечная лаборатория».',
        buttonLabel: 'Палитра →',
      },
      {
        title: 'Цвет фона и сетка во вкладке «Дизайн»',
        detail:
          'В правой панели «Дизайн» можно также поменять фон блока «Что впереди?» на стр. 2 и включить/отключить сетку выравнивания на листе А4.',
      },
      {
        title: 'Применение ко всей группе',
        detail:
          'Чтобы новая палитра появилась у всех учеников, нажмите «Применить ко всем» в общих данных или перенесите оформление через «Область применения дизайна».',
      },
    ],
    expectedResult:
      'Журнал получает единую гармоничную цветовую схему без ручного подбора каждого оттенка.',
    miniTourSteps: [
      {
        id: 'mini-design-colors-1',
        stepNumber: 1,
        shortLabel: 'Палитра цветов',
        title: 'Выбор палитры оформления листов А4',
        description:
          'В общих данных группы выберите одну из четырёх палитр, подходящую по возрасту и настроению группы, затем нажмите «Применить ко всем».',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-palette-card"]',
        fallbackSelector: '[data-tour-id="editor-period-section"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        scrollIntoView: true,
        editorDirective: {
          tab: 'common',
          commonStep: 1,
        },
      },
    ],
  },
  {
    id: 'design-stickers-decor',
    categoryId: 'design',
    question: 'Как добавить стикер или декоративное изображение?',
    shortSummary:
      'Добавляйте на страницы А4 стикеры, декоративные картинки, иконки, скотч и надписи.',
    keywords: [
      'стикер',
      'декоративное изображение',
      'скотч',
      'иконка',
      'картинка',
      'украсить',
    ],
    illustration: 'design',
    steps: [
      {
        title: 'Откройте вкладку «Дизайн»',
        detail:
          'Выберите страницу («Стр. 1» или «Стр. 2»), на которую хотите добавить декор.',
        buttonLabel: 'Дизайн',
      },
      {
        title: 'Найдите панель «Добавить на страницу»',
        detail:
          'Нажмите «+ Стикер», «+ Картинка», «+ Иконка», «+ Текст» или «+ Скотч (клейкая лента)».',
        buttonLabel: '+ Стикер',
      },
      {
        title: 'Разместите элемент на листе',
        detail:
          'Новый стикер или картинка появится на листе А4 — перетащите его в нужное место, измените размер и поворот.',
      },
    ],
    expectedResult:
      'На выбранной странице А4 появляется дополнительный декоративный элемент, который не перекрывает текст.',
    miniTourSteps: [
      {
        id: 'mini-design-stickers-1',
        stepNumber: 1,
        shortLabel: 'Стикеры и декор',
        title: 'Панель «Добавить на страницу»',
        description:
          'Нажимайте «+ Стикер», «+ Картинка», «+ Иконка» или «+ Скотч», чтобы добавить декоративные элементы на выбранный лист А4.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-design-add"]',
        fallbackSelector: '[data-tour-id="editor-design-inspector"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        scrollIntoView: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'design',
          pageFocus: 1,
          designPage: 1,
        },
      },
    ],
  },
  {
    id: 'design-apply-group',
    categoryId: 'design',
    question: 'Как применять дизайн ко всей группе?',
    shortSummary:
      'Скопируйте расположение блоков, цвета и стикеры одного ученика на всю группу или все локации.',
    keywords: [
      'применить дизайн',
      'ко всей группе',
      'дизайн на группу',
      'перенести оформление',
      'область применения',
    ],
    illustration: 'design',
    steps: [
      {
        title: 'Настройте оформление в одном журнале',
        detail:
          'Во вкладке «Дизайн» доведите до идеального вида страницы одного резидента — личные тексты и фото других детей не пострадают.',
      },
      {
        title: 'Выберите «Вся группа» или «Все группы»',
        detail:
          'В блоке «Область применения дизайна» в верхней части панели «Дизайн» переключите область с «Только этот ученик» на «Вся группа».',
        buttonLabel: 'Вся группа',
      },
      {
        title: 'Нажмите кнопку применения дизайна',
        detail:
          'Нажмите «Применить текущий дизайн ко всем в выбранной области» и подтвердите действие. Если нужно, в верхней полоске появится кнопка отмены.',
        buttonLabel: 'Применить текущий дизайн ко всем в выбранной области',
      },
    ],
    expectedResult:
      'Оформление, палитра, позиции мишек и стикеров переносятся на всю группу с полным сохранением личных текстов и проектов учеников.',
    miniTourSteps: [
      {
        id: 'mini-design-apply-1',
        stepNumber: 1,
        shortLabel: 'Дизайн для группы',
        title: 'Блок «Область применения дизайна»',
        description:
          'Переключите область на «Вся группа» и нажмите кнопку применения, чтобы перенести оформление на всех учеников группы без потери их личных текстов.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-design-apply"]',
        fallbackSelector: '[data-tour-id="editor-design-inspector"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        scrollIntoView: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'design',
          pageFocus: 1,
          designPage: 1,
        },
      },
    ],
  },
  {
    id: 'design-reset',
    categoryId: 'design',
    question: 'Как вернуть исходное оформление?',
    shortSummary:
      'Отмените последнее действие кнопкой «Отменить» или сбросьте размеры и позиции блоков.',
    keywords: [
      'вернуть исходное',
      'сбросить оформление',
      'отменить',
      'сбросить размер',
      'сбросить позицию',
    ],
    illustration: 'design',
    steps: [
      {
        title: 'Быстрая отмена последних правок',
        detail:
          'В верхней панели редактора нажимайте кнопку «Отменить» (или Ctrl+Z), чтобы шаг за шагом откатить недавние изменения.',
        buttonLabel: 'Отменить',
      },
      {
        title: 'Сброс конкретного блока на А4',
        detail:
          'Во вкладке «Дизайн» выделите смещённый блок и нажмите значок сброса (круглая стрелка «Сбросить позицию, размер и слой») или кнопку «Сбросить размер».',
        buttonLabel: 'Сбросить размер',
      },
      {
        title: 'Возврат исходной палитры',
        detail:
          'В «Общих данных группы» выберите палитру «Фирменный KIBERone» и примените её ко всем.',
      },
    ],
    expectedResult:
      'Сдвинутый блок или цвета возвращаются в аккуратное стандартное положение.',
    miniTourSteps: [
      {
        id: 'mini-design-reset-1',
        stepNumber: 1,
        shortLabel: 'Отмена правок',
        title: 'Кнопки «Отменить» и «Вернуть»',
        description:
          'Если оформление сбилось, сразу нажмите «Отменить» вверху — история действий вернёт прежний вид.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-undo-redo"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'design',
          pageFocus: 1,
        },
      },
      {
        id: 'mini-design-reset-2',
        stepNumber: 2,
        shortLabel: 'Сброс блока',
        title: 'Сброс позиции и размера блока',
        description:
          'Когда на листе выбран объект, вверху панели свойств справа доступна круглая стрелка сброса позиции, размера и слоя.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-design-inspector"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'left',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'design',
          pageFocus: 1,
          designPage: 1,
          selectBlockId: 'coverBear',
        },
      },
    ],
  },

  // =========================================================================
  // 5. ПРЕДПРОСМОТР И ПЕЧАТЬ
  // =========================================================================
  {
    id: 'preview-switch-pages',
    categoryId: 'preview',
    question: 'Как переключать страницы?',
    shortSummary:
      'Смотрите Страницу 1, Страницу 2 или полный разворот из двух листов А4.',
    keywords: [
      'переключать страницы',
      'стр 1',
      'стр 2',
      'разворот',
      'страница 1',
      'страница 2',
    ],
    illustration: 'preview',
    steps: [
      {
        title: 'В редакторе журнала',
        detail:
          'Над холстом А4 нажимайте кнопки «Стр. 1», «Стр. 2» или «Обе» — лист переключится мгновенно.',
        buttonLabel: 'Стр. 2',
      },
      {
        title: 'На экране «Разворот» (предпросмотр)',
        detail:
          'Нажмите «Разворот» в верхней панели редактора, а затем вверху выбирайте «Разворот (2 стр.)», «Страница 1» или «Страница 2».',
        buttonLabel: 'Разворот',
      },
    ],
    expectedResult:
      'Вы видите либо одну выбранную страницу крупно, либо сразу оба листа журнала рядом.',
    miniTourSteps: [
      {
        id: 'mini-preview-pages-1',
        stepNumber: 1,
        shortLabel: 'Переключение в редакторе',
        title: 'Кнопки «Стр. 1», «Стр. 2» и «Обе»',
        description:
          'Переключайте вид прямо в редакторе, чтобы сосредоточиться на одной странице или проверить весь разворот целиком.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="editor-page-switcher"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          pageFocus: 'spread',
        },
      },
      {
        id: 'mini-preview-pages-2',
        stepNumber: 2,
        shortLabel: 'Предпросмотр',
        title: 'Переключение видов в режиме «Разворот»',
        description:
          'В полном предпросмотре можно переключать «Разворот (2 стр.)», «Страница 1» и «Страница 2», а также масштаб 100% (А4).',
        route: 'preview',
        targetSelector: '[data-tour-id="preview-controls"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        previewLayout: 'spread',
      },
    ],
  },
  {
    id: 'preview-check-before-print',
    categoryId: 'preview',
    question: 'Как проверить журнал перед печатью?',
    shortSummary:
      'Откройте предпросмотр 100% А4 и загляните в встроенную «Проверку А4» в меню выгрузки.',
    keywords: [
      'проверить перед печатью',
      'проверка А4',
      'печать',
      'масштаб 100%',
      'качество',
    ],
    illustration: 'preview',
    steps: [
      {
        title: 'Откройте полноэкранный предпросмотр',
        detail:
          'Нажмите кнопку «Разворот» в шапке редактора и при необходимости выберите масштаб «100% (А4)».',
        buttonLabel: 'Разворот',
      },
      {
        title: 'Запустите проверку в меню «Скачать»',
        detail:
          'Нажмите кнопку «Скачать» — верхняя плашка «Проверка А4 пройдена» (или количество замечаний) покажет, всё ли в порядке с количеством карточек, длиной текстов и скриншотами.',
        buttonLabel: 'Скачать',
      },
      {
        title: 'При необходимости распечатайте',
        detail:
          'Для надёжной печати сначала скачайте «Полный PDF» и печатайте уже PDF-файл без полей (либо воспользуйтесь пунктом «Системная печать А4»).',
      },
    ],
    expectedResult:
      'Вы заранее видите любые недочёты и уверены, что на бумаге А4 всё напечатается чётко и без обрезанных строк.',
    miniTourSteps: [
      {
        id: 'mini-preview-check-1',
        stepNumber: 1,
        shortLabel: 'Проверка перед печатью',
        title: 'Режим предпросмотра А4',
        description:
          'Здесь макет показан без панелей редактирования. Включите «100% (А4)» для оценки реального размера шрифтов и отступов.',
        route: 'preview',
        targetSelector: '[data-tour-id="preview-controls"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        previewLayout: 'spread',
      },
      {
        id: 'mini-preview-check-2',
        stepNumber: 2,
        shortLabel: 'Меню проверки и печати',
        title: 'Кнопка «Скачать» с проверкой А4',
        description:
          'Откройте «Скачать», чтобы увидеть статус «Проверка А4» и скачать PDF/PNG или отправить страницу в печать.',
        route: 'preview',
        targetSelector: '[data-tour-id="export-menu-button"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        previewLayout: 'spread',
      },
    ],
  },
  {
    id: 'preview-overflow-warning',
    categoryId: 'preview',
    question: 'Что означает предупреждение о переполнении А4?',
    shortSummary:
      'Оно предупреждает, что текста или блоков стало больше высоты листа А4 — ничего не удаляется, но перед печатью стоит чуть сократить текст.',
    keywords: [
      'переполнение А4',
      'предупреждение',
      'выходят за пределы',
      'не помещается',
      'обрезается',
    ],
    illustration: 'overflow-a4',
    steps: [
      {
        title: 'Почему появляется жёлтое предупреждение',
        detail:
          'Когда описаний проектов, модулей или текста в письме наставника слишком много, содержимое начинает выходить за нижнюю границу стандартного листа А4.',
      },
      {
        title: 'Данные не теряются и не обрезаются',
        detail:
          'Редактор ничего не удаляет автоматически — ваш текст сохраняется полностью. Но при печати на обычном листе А4 нижний край может не поместиться.',
      },
      {
        title: 'Как быстро исправить переполнение',
        detail:
          'Сократите слишком длинные абзацы, скройте лишние карточки проектов/модулей или слегка уменьшите высоту/отступы блоков во вкладке «Дизайн».',
      },
    ],
    expectedResult:
      'Жёлтая полоса предупреждения исчезает, а оба листа идеально укладываются в формат А4.',
    miniTourSteps: [
      {
        id: 'mini-preview-overflow-1',
        stepNumber: 1,
        shortLabel: 'Проверка макета А4',
        title: 'Кнопка «Скачать» и индикатор замечаний',
        description:
          'На кнопке «Скачать» при замечаниях загорается цветная точка, а внутри меню можно нажать «Детали», чтобы увидеть список длинных текстов и переполнений.',
        route: 'groupEditor',
        targetSelector: '[data-tour-id="export-menu-button"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        editorDirective: {
          tab: 'individual',
          inspectorMode: 'content',
          pageFocus: 'spread',
        },
      },
    ],
  },
  {
    id: 'preview-download-pdf',
    categoryId: 'preview',
    question: 'Как скачать PDF?',
    shortSummary:
      'Выгрузите полный PDF-файл из двух страниц А4, одну страницу или архив на всю группу.',
    keywords: [
      'скачать pdf',
      'пдф',
      'полный pdf',
      'выгрузить журнал',
      'zip всей группы',
    ],
    illustration: 'preview',
    steps: [
      {
        title: 'Откройте меню «Скачать»',
        detail:
          'Вверху редактора или в режиме «Разворот» нажмите зелёную кнопку «Скачать».',
        buttonLabel: 'Скачать',
      },
      {
        title: 'Выберите нужный вариант PDF',
        detail:
          'Нажмите «Полный PDF» (обе страницы А4 в одном файле) либо «Страница 1 — PDF» / «Страница 2 — PDF».',
        buttonLabel: 'Полный PDF',
      },
      {
        title: 'Выгрузка сразу на всю группу',
        detail:
          'Чтобы скачать PDF сразу для всех готовых учеников группы, нажмите чёрную кнопку «Выгрузить готовые (ZIP)» в редакторе или на карточке группы.',
        buttonLabel: 'Выгрузить готовые (ZIP)',
      },
    ],
    expectedResult:
      'Готовый PDF-файл сохраняется в папку «Загрузки» на вашем компьютере и готов к отправке родителям или печати.',
    miniTourSteps: [
      {
        id: 'mini-preview-pdf-1',
        stepNumber: 1,
        shortLabel: 'Выгрузка PDF',
        title: 'Кнопка «Скачать» для PDF и PNG',
        description:
          'Нажмите здесь и выберите «Полный PDF», чтобы получить готовый двухстраничный журнал в формате А4.',
        route: 'preview',
        targetSelector: '[data-tour-id="export-menu-button"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        previewLayout: 'spread',
      },
    ],
  },
  {
    id: 'preview-download-png',
    categoryId: 'preview',
    question: 'Как скачать отдельные страницы в PNG?',
    shortSummary:
      'Сохраните страницы журнала как качественные картинки для отправки в мессенджере.',
    keywords: [
      'скачать png',
      'пнг',
      'отдельные страницы',
      'картинки',
      'изображения страниц',
    ],
    illustration: 'preview',
    steps: [
      {
        title: 'Откройте меню «Скачать»',
        detail:
          'Нажмите зелёную кнопку «Скачать» в редакторе группы или на экране «Разворот».',
        buttonLabel: 'Скачать',
      },
      {
        title: 'Выберите пункт «Страницы PNG»',
        detail:
          'Нажмите «Страницы PNG» — приложение сформирует два отдельных изображения высокого качества (для 1-й и 2-й страницы).',
        buttonLabel: 'Страницы PNG',
      },
    ],
    expectedResult:
      'В папке «Загрузки» появляются две картинки PNG высокого разрешения, удобные для отправки родителям в WhatsApp или Telegram.',
    miniTourSteps: [
      {
        id: 'mini-preview-png-1',
        stepNumber: 1,
        shortLabel: 'Экспорт в PNG',
        title: 'Меню «Скачать» → «Страницы PNG»',
        description:
          'Откройте кнопку «Скачать» и нажмите «Страницы PNG», чтобы сохранить обе страницы А4 как отдельные картинки.',
        route: 'preview',
        targetSelector: '[data-tour-id="export-menu-button"]',
        fallbackSelector: '[data-tour-id="home-create-group"]',
        preferredPlacement: 'bottom',
        requiresExistingGroup: true,
        previewLayout: 'spread',
      },
    ],
  },

  // =========================================================================
  // 6. РЕЗЕРВНОЕ КОПИРОВАНИЕ
  // =========================================================================
  {
    id: 'backup-where-data',
    categoryId: 'backup',
    question: 'Что хранится в приложении и где находятся данные?',
    shortSummary:
      'Все группы, журналы, шаблоны, медиатека и фото хранятся прямо на вашем компьютере в браузере (или в программе).',
    keywords: [
      'где хранятся данные',
      'что хранится',
      'indexeddb',
      'хранилище браузера',
      'без интернета',
    ],
    illustration: 'backup',
    reminder:
      'Поскольку данные хранятся локально, очистка истории и данных сайтов в браузере без предварительной резервной копии удалит журналы.',
    steps: [
      {
        title: 'Какие данные сохраняются локально',
        detail:
          'Локации, учебные группы, списки резидентов, все журналы и их дизайн, ваши модули, шаблоны, медиатека, загруженные скриншоты и настройки обучения.',
      },
      {
        title: 'Где это физически находится',
        detail:
          'В защищённом локальном хранилище этого браузера на вашем компьютере (а при установке настольной программы Electron — внутри папки программы). Внешних серверов и чужих облаков нет.',
      },
      {
        title: 'Как проверить занятое место и защиту',
        detail:
          'Нажмите кнопку «Бэкап» в верхней панели — сверху показан блок «Хранилище браузера» с объёмом и кнопкой «Защитить хранилище».',
        buttonLabel: 'Бэкап',
      },
    ],
    expectedResult:
      'Вы точно понимаете, где лежат журналы и как защитить их от случайной очистки браузера.',
    miniTourSteps: [
      {
        id: 'mini-backup-where-1',
        stepNumber: 1,
        shortLabel: 'Раздел «Бэкап»',
        title: 'Кнопка «Бэкап» — управление данными и копиями',
        description:
          'Нажмите «Бэкап», чтобы увидеть объём занятого места, включить защиту хранилища и сохранить или загрузить резервную копию.',
        route: 'home',
        targetSelector: '[data-tour-id="backup-trigger"]',
        fallbackSelector: '[data-tour-id="header-nav"]',
        preferredPlacement: 'bottom',
      },
    ],
  },
  {
    id: 'backup-what-is',
    categoryId: 'backup',
    question: 'Что такое резервная копия?',
    shortSummary:
      'Это один ZIP-файл со всей вашей базой — страховка на случай переустановки и способ перенести работу на другой компьютер.',
    keywords: [
      'что такое резервная копия',
      'зачем бэкап',
      'страховка',
      'zip файл',
    ],
    illustration: 'backup',
    steps: [
      {
        title: 'Все данные в одном файле',
        detail:
          'Резервная копия собирает в единый ZIP-архив все ваши группы, учеников, журналы, скриншоты, медиатеку, шаблоны и настройки.',
      },
      {
        title: 'Зачем она нужна',
        detail:
          '1) Чтобы ничего не пропало при случайной очистке браузера или смене компьютера. 2) Чтобы перенести журналы с одного компьютера на другой или в программу Electron.',
      },
      {
        title: 'Сохраняются все связи и картинки',
        detail:
          'После загрузки копии каждый ученик остаётся в своей группе, а все загруженные фотографии и настройки дизайна открываются без потерь.',
      },
    ],
    expectedResult:
      'У вас есть один понятный файл-страховка, который полностью восстанавливает рабочую базу.',
    miniTourSteps: [
      {
        id: 'mini-backup-what-1',
        stepNumber: 1,
        shortLabel: 'Резервная копия',
        title: 'Где создаётся резервная копия',
        description:
          'Откройте «Бэкап» в шапке и нажмите «Создать резервную копию» — скачается один ZIP-архив со всей базой.',
        route: 'home',
        targetSelector: '[data-tour-id="backup-trigger"]',
        fallbackSelector: '[data-tour-id="header-nav"]',
        preferredPlacement: 'bottom',
      },
    ],
  },
  {
    id: 'backup-download-zip',
    categoryId: 'backup',
    question: 'Как скачать полный ZIP-бэкап?',
    shortSummary:
      'Два клика: откройте «Бэкап» вверху и нажмите «Создать резервную копию».',
    keywords: [
      'скачать zip',
      'скачать бэкап',
      'создать резервную копию',
      'выгрузить базу',
    ],
    illustration: 'backup',
    steps: [
      {
        title: 'Нажмите «Бэкап» в верхней панели',
        detail:
          'Кнопка «Бэкап» со значком шестерёнки находится на главной странице в верхней панели рядом с «Медиатекой».',
        buttonLabel: 'Бэкап',
      },
      {
        title: 'Нажмите «Создать резервную копию»',
        detail:
          'В открывшемся окне нажмите тёмную кнопку «Создать резервную копию».',
        buttonLabel: 'Создать резервную копию',
      },
      {
        title: 'Дождитесь сохранения файла',
        detail:
          'Через пару секунд браузер скачает файл вида kiberone-student-journey-backup-ГГГГ-ММ-ДД.zip.',
      },
    ],
    expectedResult:
      'Полный ZIP-архив со всеми журналами и изображениями сохранён на компьютер.',
    miniTourSteps: [
      {
        id: 'mini-backup-download-1',
        stepNumber: 1,
        shortLabel: 'Скачивание ZIP-бэкапа',
        title: 'Кнопка «Бэкап» в верхней панели',
        description:
          'Нажмите сюда и выберите «Создать резервную копию» — браузер сразу сохранит ZIP-архив со всей базой и фотографиями.',
        route: 'home',
        targetSelector: '[data-tour-id="backup-trigger"]',
        fallbackSelector: '[data-tour-id="header-nav"]',
        preferredPlacement: 'bottom',
      },
    ],
  },
  {
    id: 'backup-find-archive',
    categoryId: 'backup',
    question: 'Где найти скачанный архив?',
    shortSummary:
      'Ищите файл kiberone-student-journey-backup-...zip в папке «Загрузки» (Downloads) и перенесите в надёжное место.',
    keywords: [
      'где найти архив',
      'скачанный файл',
      'загрузки',
      'downloads',
      'куда скачался',
    ],
    illustration: 'backup',
    steps: [
      {
        title: 'Откройте папку «Загрузки» (Downloads)',
        detail:
          'В браузере нажмите значок стрелки скачивания справа вверху (или сочетание Ctrl+J) и выберите «Показать в папке». Либо откройте «Проводник» → «Загрузки».',
      },
      {
        title: 'Найдите файл по имени',
        detail:
          'Файл всегда начинается с kiberone-student-journey-backup- и заканчивается на .zip.',
      },
      {
        title: 'Переместите в надёжное хранилище',
        detail:
          'Не оставляйте важную копию только в «Загрузках» — переложите или скопируйте файл в отдельную папку «Бэкапы KIBERone», на флешку или в облако (Яндекс Диск / Google Диск).',
      },
    ],
    expectedResult:
      'Вы легко находите архив и храните его в безопасной папке или в облаке.',
    miniTourSteps: [
      {
        id: 'mini-backup-find-1',
        stepNumber: 1,
        shortLabel: 'Поиск архива',
        title: 'Где скачивается архив',
        description:
          'После нажатия «Создать резервную копию» внутри окна «Бэкап» файл сохраняется в стандартную папку «Загрузки» вашего браузера.',
        route: 'home',
        targetSelector: '[data-tour-id="backup-trigger"]',
        fallbackSelector: '[data-tour-id="header-nav"]',
        preferredPlacement: 'bottom',
      },
    ],
  },
  {
    id: 'backup-how-often',
    categoryId: 'backup',
    question: 'Как часто сохранять копии?',
    shortSummary:
      'Делайте копию раз в неделю, после большого заполнения журналов и обязательно перед любым переносом или очисткой браузера.',
    keywords: [
      'как часто',
      'регулярность',
      'когда сохранять',
      'график бэкапов',
    ],
    illustration: 'backup',
    reminder:
      'Никогда не очищайте кеш и данные браузера и не запускайте полное восстановление без свежей резервной копии на руках.',
    steps: [
      {
        title: 'После каждого рабочего блока с журналами',
        detail:
          'Заполнили группу, загрузили скриншоты или подготовили выпуск — нажмите «Бэкап» → «Создать резервную копию». Это занимает 3 секунды.',
      },
      {
        title: 'Минимум 1 раз в неделю при активной работе',
        detail:
          'Храните последние 2–3 файла с датами в названии, чтобы всегда можно было вернуться на шаг назад.',
      },
      {
        title: 'Обязательно перед любыми изменениями на компьютере',
        detail:
          'Перед переносом на другой ПК, обновлением системы, чисткой браузера или полным восстановлением базы.',
      },
    ],
    expectedResult:
      'У вас всегда под рукой актуальная копия журналов без риска потерять результаты работы.',
    miniTourSteps: [
      {
        id: 'mini-backup-often-1',
        stepNumber: 1,
        shortLabel: 'Регулярный бэкап',
        title: 'Быстрое создание копии через «Бэкап»',
        description:
          'Открывайте «Бэкап» после крупной сессии заполнения журналов и нажимайте «Создать резервную копию».',
        route: 'home',
        targetSelector: '[data-tour-id="backup-trigger"]',
        fallbackSelector: '[data-tour-id="header-nav"]',
        preferredPlacement: 'bottom',
      },
    ],
  },
  {
    id: 'backup-transfer-pc',
    categoryId: 'backup',
    question: 'Как перенести данные на другой компьютер?',
    shortSummary:
      'Сохраните ZIP-архив на первом компьютере, передайте файл на второй и загрузите его через режим «Перенести и объединить данные».',
    keywords: [
      'другой компьютер',
      'перенос',
      'перенести данные',
      'electron',
      'второй пк',
    ],
    illustration: 'backup',
    reminder:
      'Перед загрузкой чужого или старого архива сделайте свежий ZIP-бэкап на текущем компьютере на всякий случай.',
    steps: [
      {
        title: 'Шаг 1 (на первом компьютере): скачайте архив',
        detail:
          'Откройте «Бэкап» → нажмите «Создать резервную копию» и перешлите полученный ZIP-файл на второй компьютер (на флешке, через облако или почту).',
        buttonLabel: 'Создать резервную копию',
      },
      {
        title: 'Шаг 2 (на втором компьютере): выберите основной режим',
        detail:
          'Откройте приложение (на сайте или в программе на компьютере), нажмите «Бэкап» и убедитесь, что выбран режим «Перенести и объединить данные».',
        buttonLabel: 'Перенести и объединить данные',
      },
      {
        title: 'Шаг 3: проверьте сводку и подтвердите',
        detail:
          'Нажмите «Восстановить из копии», выберите ZIP-файл, посмотрите сколько новых записей и обновлений найдено и нажмите «Подтвердить и объединить».',
        buttonLabel: 'Подтвердить и объединить',
      },
    ],
    expectedResult:
      'Новые группы, ученики, журналы и фото перенесены на второй компьютер, а всё, что уже было на нём, осталось в сохранности.',
    miniTourSteps: [
      {
        id: 'mini-backup-transfer-1',
        stepNumber: 1,
        shortLabel: 'Перенос между ПК',
        title: 'Кнопка «Бэкап» для переноса данных',
        description:
          'Отсюда скачивается ZIP-архив на первом компьютере и загружается на втором через режим «Перенести и объединить данные».',
        route: 'home',
        targetSelector: '[data-tour-id="backup-trigger"]',
        fallbackSelector: '[data-tour-id="header-nav"]',
        preferredPlacement: 'bottom',
      },
    ],
  },
  {
    id: 'backup-merge-vs-replace',
    categoryId: 'backup',
    question: 'Чем отличается объединение данных от полного восстановления?',
    shortSummary:
      '«Перенести и объединить данные» аккуратно добавляет новое и сохраняет текущее, а «Полностью восстановить базу» заменяет всё содержимым файла.',
    keywords: [
      'отличие',
      'объединение',
      'полное восстановление',
      'перенести и объединить',
      'полностью восстановить базу',
    ],
    illustration: 'backup-compare',
    reminder:
      'Если сомневаетесь, какой режим выбрать — выбирайте «Перенести и объединить данные»: он ничего не удаляет.',
    steps: [
      {
        title: 'Когда выбирать «Перенести и объединить данные»',
        detail:
          'Всегда при переносе между компьютерами, когда на этом компьютере уже есть группы и журналы. Режим добавит новые записи, обновит изменившиеся, сохранит всё локальное и спросит вас при конфликте.',
        buttonLabel: 'Перенести и объединить данные',
      },
      {
        title: 'Когда выбирать «Полностью восстановить базу»',
        detail:
          'Когда нужно целиком откатиться на старую точку сохранения или перенести точную копию базы на пустой/новый компьютер, заменив всё, что есть сейчас.',
        buttonLabel: 'Полностью восстановить базу',
      },
      {
        title: 'Страховка перед любой операцией',
        detail:
          'Перед применением любого из режимов приложение автоматически сохраняет запасную копию текущего состояния — после импорта её можно скачать или вернуть нажатием «Вернуть как было».',
        buttonLabel: 'Вернуть как было',
      },
    ],
    expectedResult:
      'Вы уверенно выбираете нужный режим и не рискуете случайно перезаписать рабочие журналы.',
    miniTourSteps: [
      {
        id: 'mini-backup-compare-1',
        stepNumber: 1,
        shortLabel: 'Два режима импорта',
        title: 'Выбор режима в окне «Бэкап»',
        description:
          'Внутри «Бэкап» доступны только два понятных варианта: основной «Перенести и объединить данные» и «Полностью восстановить базу».',
        route: 'home',
        targetSelector: '[data-tour-id="backup-trigger"]',
        fallbackSelector: '[data-tour-id="header-nav"]',
        preferredPlacement: 'bottom',
      },
    ],
  },
  {
    id: 'backup-conflicts',
    categoryId: 'backup',
    question: 'Как разрешать конфликты при объединении?',
    shortSummary:
      'Если один журнал меняли на двух компьютерах, выберите «Версия на этом компьютере» или «Версия из загруженного файла».',
    keywords: [
      'конфликты',
      'две версии',
      'разрешить конфликт',
      'на этом компьютере',
      'из загруженного файла',
    ],
    illustration: 'backup-compare',
    steps: [
      {
        title: 'Почему возникает конфликт',
        detail:
          'Если один и тот же журнал или группу отредактировали и на первом, и на втором компьютере после последнего обмена копиями, приложение не будет механически смешивать тексты.',
      },
      {
        title: 'Посмотрите дату и источник каждой версии',
        detail:
          'В окне предпросмотра для каждого совпадения показаны: «Версия на этом компьютере» и «Версия из загруженного файла» с датой и временем последнего изменения и указанием, откуда пришёл файл.',
        buttonLabel: 'Версия из загруженного файла',
      },
      {
        title: 'Выберите нужный вариант для каждого конфликта',
        detail:
          'Нажмите на подходящую карточку (если конфликтов много — можно нажать «Все с этого компьютера» или «Все из файла»), затем нажмите «Подтвердить и объединить».',
        buttonLabel: 'Подтвердить и объединить',
      },
    ],
    expectedResult:
      'В базе остаётся выбранная вами цельная версия журнала без обрывков и склеенных фраз.',
    miniTourSteps: [
      {
        id: 'mini-backup-conflicts-1',
        stepNumber: 1,
        shortLabel: 'Конфликты в «Бэкап»',
        title: 'Где проверяются конфликты перед импортом',
        description:
          'После выбора архива в «Бэкап» появится экран проверки со счётчиками и карточками конфликтов, где ничего не перезапишется без вашего выбора.',
        route: 'home',
        targetSelector: '[data-tour-id="backup-trigger"]',
        fallbackSelector: '[data-tour-id="header-nav"]',
        preferredPlacement: 'bottom',
      },
    ],
  },
  {
    id: 'backup-error-recovery',
    categoryId: 'backup',
    question: 'Что делать, если восстановление завершилось ошибкой?',
    shortSummary:
      'Не паникуйте: ваши прежние данные автоматически сохраняются в безопасности, а файл можно перепроверить.',
    keywords: [
      'ошибка восстановления',
      'не загружается архив',
      'повреждён',
      'откат',
      'вернуть как было',
    ],
    illustration: 'backup',
    steps: [
      {
        title: 'Прежние данные не потеряны',
        detail:
          'Перед изменением базы приложение всегда делает автоматическую запасную копию. Если во время записи произойдёт сбой, прежнее состояние возвращается автоматически.',
      },
      {
        title: 'Кнопка быстрого отката',
        detail:
          'Если импорт всё же прошёл, но вы поняли, что выбрали не тот файл — снова откройте «Бэкап» и нажмите «Вернуть как было» внизу окна (или скачайте запасную копию кнопкой «Скачать копию»).',
        buttonLabel: 'Вернуть как было',
      },
      {
        title: 'Почему файл может не открываться',
        detail:
          'Проверьте, что загружаете именно целый .zip-архив (не распакованную папку и не сторонний файл) и что он скачался с первого компьютера до конца.',
      },
    ],
    expectedResult:
      'Вы сохраняете текущую базу в целости или возвращаетесь к состоянию до переноса в один клик.',
    miniTourSteps: [
      {
        id: 'mini-backup-error-1',
        stepNumber: 1,
        shortLabel: 'Безопасный откат',
        title: 'Запасная копия и кнопка «Вернуть как было»',
        description:
          'Внутри «Бэкап» после импорта всегда доступна плашка с запасной копией — можно скачать её или нажать «Вернуть как было».',
        route: 'home',
        targetSelector: '[data-tour-id="backup-trigger"]',
        fallbackSelector: '[data-tour-id="header-nav"]',
        preferredPlacement: 'bottom',
      },
    ],
  },
];

export const POPULAR_HELP_ARTICLE_IDS: string[] = [
  'groups-create',
  'groups-add-resident',
  'projects-upload-screenshot',
  'design-move-bear',
  'preview-overflow-warning',
  'backup-transfer-pc',
];

export const BACKUP_DETAILED_LESSON: {
  title: string;
  subtitle: string;
  sections: DetailedBackupLessonSection[];
  miniTourSteps: OnboardingStepConfig[];
} = {
  title: 'Подробный урок: резервное копирование и перенос данных',
  subtitle:
    'Всё, что нужно знать управляющей о сохранности журналов, переносе между компьютерами и восстановлении базы.',
  sections: [
    {
      number: 1,
      title: 'Какие данные хранятся в приложении',
      body: [
        'В приложении сохраняются все ваши локации, учебные группы, списки резидентов, заполненные журналы А4, настройки дизайна, библиотека модулей, шаблоны групп и журналов, загруженные скриншоты проектов, медиатека школы и статус обучения.',
        'Всё это хранится прямо на вашем компьютере (в локальной базе браузера или в папке программы на компьютере), поэтому приложение работает быстро и даже без интернета.',
      ],
    },
    {
      number: 2,
      title: 'Зачем нужна резервная копия',
      body: [
        'Резервная копия — это ваша страховка. Она спасает, если нужно пересесть за другой компьютер, перенести базу из браузера в установленную программу (Electron), переустановить систему или случайно кто-то очистит историю браузера.',
        'Один ZIP-архив содержит все тексты, связи между учениками и группами, цвета и фотографии — ничего не теряется.',
      ],
    },
    {
      number: 3,
      title: 'Как скачать ZIP-архив',
      body: [
        '1. На главной странице в верхней панели нажмите кнопку «Бэкап».',
        '2. В окне нажмите тёмную кнопку «Создать резервную копию».',
        '3. Подождите 1–3 секунды — браузер сам скачает единый ZIP-файл со всей базой.',
      ],
      tip: 'Если вы собираетесь что-то восстанавливать на этом компьютере — всегда сначала нажмите «Создать резервную копию».',
    },
    {
      number: 4,
      title: 'Как найти архив на компьютере',
      body: [
        'Скачанный файл по умолчанию попадает в папку «Загрузки» (Downloads).',
        'Его легко узнать по названию: kiberone-student-journey-backup-ГГГГ-ММ-ДД.zip (где указана дата сохранения).',
      ],
    },
    {
      number: 5,
      title: 'Где безопасно хранить архив',
      body: [
        'Лучше не оставлять копии только в папке «Загрузки», чтобы случайно не удалить при чистке диска.',
        'Скопируйте ZIP-файл в отдельную папку (например, «Архив журналов KIBERone»), на флешку или загрузите в облачное хранилище (Яндекс Диск, Google Диск).',
      ],
    },
    {
      number: 6,
      title: 'Как перенести архив на другой компьютер',
      body: [
        'Передайте скачанный ZIP-файл на второй компьютер любым удобным способом (через облако, флешку или мессенджер/почту как файл).',
        'Откройте KIBERone Student Journey на втором компьютере (на сайте или в программе на компьютере) и нажмите вверху «Бэкап».',
      ],
    },
    {
      number: 7,
      title: 'Как объединить данные с уже существующей базой',
      body: [
        'Если на втором компьютере уже есть свои группы и журналы, оставьте выбранным основной режим «Перенести и объединить данные» и нажмите «Восстановить из копии».',
        'Приложение покажет сводку: сколько новых записей добавится, сколько обновится и есть ли совпадения (конфликты), когда один журнал правили на обоих компьютерах. При конфликте вы сами выбираете, какую версию оставить — с этого компьютера или из файла.',
      ],
    },
    {
      number: 8,
      title: 'Как полностью восстановить базу',
      body: [
        'Если компьютер пустой или вам нужно полностью откатить всю базу на состояние старого архива, выберите вариант «Полностью восстановить базу» и загрузите нужный файл.',
        'После вашего подтверждения текущая база целиком заменится данными из архива.',
      ],
      tip: 'Перед полным восстановлением обязательно создайте свежую резервную копию текущих данных — на случай, если передумаете.',
    },
    {
      number: 9,
      title: 'Чем отличаются эти два действия',
      body: [
        'Главное правило: для обычного переноса работы с одного компьютера на другой выбирайте «Перенести и объединить данные» — он не удаляет то, что уже есть на компьютере. А «Полностью восстановить базу» используйте только тогда, когда нужно целиком заменить всё текущее содержимое архивом.',
      ],
      highlightComparison: true,
    },
    {
      number: 10,
      title: 'Почему нельзя очищать данные браузера без резервной копии',
      body: [
        'Поскольку журналы не отправляются на внешний сервер и живут прямо в хранилище вашего браузера, кнопка «Очистить историю и данные сайтов» удалит все группы, учеников и картинки с этого компьютера.',
        'Поэтому перед любой чисткой браузера, сменой профиля или переустановкой Windows обязательно скачайте свежий ZIP-архив через «Бэкап» и включите кнопку «Защитить хранилище».',
      ],
      isWarning: true,
    },
  ],
  miniTourSteps: [
    {
      id: 'mini-backup-lesson-1',
      stepNumber: 1,
      shortLabel: 'Урок: Бэкап',
      title: 'Кнопка «Бэкап» — ваш центр сохранности данных',
      description:
        'Нажмите сюда, чтобы проверить память браузера, включить защиту от автоочистки, скачать ZIP-архив или безопасно перенести данные с другого компьютера.',
      extraTip:
        'Перед любым восстановлением базы делайте свежую резервную копию — это займёт 2 секунды и полностью защитит от случайной потери данных.',
      route: 'home',
      targetSelector: '[data-tour-id="backup-trigger"]',
      fallbackSelector: '[data-tour-id="header-nav"]',
      preferredPlacement: 'bottom',
    },
  ],
};

export function getHelpArticlesByCategory(
  categoryId: HelpCategoryId
): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.categoryId === categoryId);
}

export function searchHelpArticles(query: string): HelpArticle[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const categoryTitleMap = new Map(
    HELP_CATEGORIES.map((c) => [c.id, c.title.toLowerCase()])
  );

  const scored = HELP_ARTICLES.map((article) => {
    const q = article.question.toLowerCase();
    const s = article.shortSummary.toLowerCase();
    const kw = article.keywords.join(' ').toLowerCase();
    const cat = categoryTitleMap.get(article.categoryId) ?? '';
    const stepsText = article.steps
      .map((st) => `${st.title} ${st.detail} ${st.buttonLabel ?? ''}`)
      .join(' ')
      .toLowerCase();
    const haystack = `${q} ${s} ${kw} ${cat} ${stepsText}`;

    const allMatched = tokens.every((tok) => haystack.includes(tok));
    if (!allMatched) return null;

    let score = 0;
    for (const tok of tokens) {
      if (q.includes(tok)) score += 10;
      if (kw.includes(tok)) score += 6;
      if (s.includes(tok)) score += 4;
      if (stepsText.includes(tok)) score += 2;
    }
    return { article, score };
  }).filter((item): item is { article: HelpArticle; score: number } =>
    Boolean(item)
  );

  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.article);
}
