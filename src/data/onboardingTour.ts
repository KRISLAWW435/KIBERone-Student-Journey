export const ONBOARDING_STORAGE_KEY = 'kiberone_student_journey_onboarding_v1';

export type TourRouteTarget = 'home' | 'modules' | 'groupEditor' | 'preview';

export interface EditorTourDirective {
  nonce: number;
  tab: 'common' | 'individual';
  commonStep?: 1 | 2 | 3 | 4;
  inspectorMode?: 'content' | 'design';
  inspectorStep?: 'profile' | 'curriculum' | 'projects' | 'pride' | 'mentorNote';
  pageFocus?: 1 | 2 | 'spread';
  selectBlockId?: string | null;
}

export interface OnboardingStepConfig {
  id: string;
  stepNumber: number;
  shortLabel: string;
  title: string;
  description: string;
  extraTip?: string;
  route: TourRouteTarget;
  targetSelector: string;
  fallbackSelector?: string;
  secondarySelector?: string;
  preferredPlacement: 'bottom' | 'top' | 'left' | 'right';
  requiresExistingGroup?: boolean;
  emptyDataNote?: string;
  editorDirective?: Omit<EditorTourDirective, 'nonce'>;
  previewLayout?: 'spread' | 'page1' | 'page2';
}

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'home-overview',
    stepNumber: 1,
    shortLabel: 'Главная страница',
    title: 'Главная страница и основные разделы',
    description:
      'В верхней панели собраны ключевые разделы рабочего пространства: «Группы» для работы с детьми, «Учебная программа» для библиотеки модулей, «Шаблоны», «Медиатека» и кнопка создания группы.',
    extraTip:
      'Вы всегда можете вернуться к списку групп по клику на логотип KIBERone или вкладку «Группы».',
    route: 'home',
    targetSelector: '[data-tour-id="header-nav"]',
    preferredPlacement: 'bottom',
  },
  {
    id: 'groups-and-residents',
    stepNumber: 2,
    shortLabel: 'Группы и резиденты',
    title: 'Группы и резиденты',
    description:
      'Здесь отображаются учебные группы, локации, сроки обучения и прогресс готовности журналов. Внутри карточки можно быстро добавить нового ребёнка или открыть общий редактор группы.',
    extraTip:
      'При добавлении резидента его персональный журнал создаётся автоматически. Используйте «Создать группу» справа вверху, чтобы завести новый поток.',
    route: 'home',
    targetSelector: '[data-tour-id="home-group-card"]',
    fallbackSelector: '[data-tour-id="home-create-group"]',
    preferredPlacement: 'right',
  },
  {
    id: 'modules-library',
    stepNumber: 3,
    shortLabel: 'Библиотека модулей',
    title: 'Библиотека модулей и навыков',
    description:
      'Единый справочник учебных модулей, категорий, навыков и групповых шаблонов. Здесь редактируются названия, понятные описания для родителей, иллюстрации и связанные навыки.',
    extraTip:
      'Во вкладке «Редактор модулей» можно настроить как официальное название, так и короткий заголовок карточки на А4.',
    route: 'modules',
    targetSelector: '[data-tour-id="modules-library-tabs"]',
    preferredPlacement: 'bottom',
  },
  {
    id: 'journal-setup',
    stepNumber: 4,
    shortLabel: 'Создание журнала',
    title: 'Выбор резидента и отчётного периода',
    description:
      'В левой колонке выбирается конкретный резидент группы и отслеживается чек-лист готовности. В разделе «Параметры» задаются отчётный период (даты начала и окончания), локация и наставник.',
    extraTip:
      'Настройки общих данных группы (даты, модули, навыки и блок «Что впереди») применяются ко всем активным ученикам одним нажатием.',
    route: 'groupEditor',
    targetSelector: '[data-tour-id="editor-period-section"]',
    secondarySelector: '[data-tour-id="editor-students-sidebar"]',
    fallbackSelector: '[data-tour-id="home-create-group"]',
    preferredPlacement: 'bottom',
    requiresExistingGroup: true,
    emptyDataNote:
      'В базе пока нет ни одной группы. После завершения тура нажмите «Создать группу» и добавьте первого резидента, чтобы открыть редактор.',
    editorDirective: {
      tab: 'common',
      commonStep: 1,
    },
  },
  {
    id: 'journal-content',
    stepNumber: 5,
    shortLabel: 'Заполнение',
    title: 'Открытия, достижения и проекты',
    description:
      'Во вкладке «Контент» заполняйте индивидуальный журнал по пяти шагам: профиль ученика, модули и навыки, проекты со скриншотами, сильные стороны с моментом гордости и слово наставника.',
    extraTip:
      'Все правки сразу отражаются на макете А4 слева и автоматически сохраняются локально.',
    route: 'groupEditor',
    targetSelector: '[data-tour-id="editor-content-inspector"]',
    fallbackSelector: '[data-tour-id="home-create-group"]',
    preferredPlacement: 'left',
    requiresExistingGroup: true,
    emptyDataNote:
      'Создайте группу и добавьте резидента, чтобы открывать пошаговое заполнение профиля, проектов и достижений.',
    editorDirective: {
      tab: 'individual',
      inspectorMode: 'content',
      inspectorStep: 'projects',
      pageFocus: 'spread',
    },
  },
  {
    id: 'journal-designer',
    stepNumber: 6,
    shortLabel: 'Дизайнер',
    title: 'Оформление, позиции и размеры в Дизайнере',
    description:
      'Во вкладке «Дизайн» меняйте палитру, выбирайте элементы на листе А4 и настраивайте их точные размеры, отступы, поворот и слои. Настройки можно применить к одному ученику, всей группе или всем локациям.',
    extraTip:
      'Структурные блоки перемещаются строго по вертикали (без сдвига композиции), а мишки и декоративные стикеры — свободно в пределах листа А4.',
    route: 'groupEditor',
    targetSelector: '[data-tour-id="editor-design-inspector"]',
    fallbackSelector: '[data-tour-id="home-create-group"]',
    preferredPlacement: 'left',
    requiresExistingGroup: true,
    emptyDataNote:
      'Вкладка «Дизайн» становится доступна в редакторе группы после добавления хотя бы одного резидента.',
    editorDirective: {
      tab: 'individual',
      inspectorMode: 'design',
      pageFocus: 1,
      selectBlockId: 'coverBear',
    },
  },
  {
    id: 'preview-spread',
    stepNumber: 7,
    shortLabel: 'Предпросмотр',
    title: 'Предпросмотр готовых страниц А4',
    description:
      'Режим предпросмотра показывает итоговый разворот или отдельные страницы А4 без отвлекающих панелей. Проверьте масштаб 100%, отступы и перенос текста перед печатью.',
    extraTip:
      'Переключайте вид «Разворот (2 стр.)», «Страница 1» и «Страница 2» в верхней панели.',
    route: 'preview',
    targetSelector: '[data-tour-id="preview-controls"]',
    fallbackSelector: '[data-tour-id="home-create-group"]',
    preferredPlacement: 'bottom',
    requiresExistingGroup: true,
    emptyDataNote:
      'Когда в группе появится журнал резидента, кнопка «Разворот» откроет полноэкранный предпросмотр А4.',
    previewLayout: 'spread',
  },
  {
    id: 'export-pdf-png',
    stepNumber: 8,
    shortLabel: 'Экспорт',
    title: 'Сохранение в PDF, PNG и пакетная выгрузка',
    description:
      'Нажмите «Скачать», чтобы сохранить журнал в формате полного PDF (2 страницы А4), отдельных PDF-страниц, изображений PNG высокого качества или автономной HTML-книги.',
    extraTip:
      'Внутри меню «Скачать» работает автоматическая проверка макета А4. А для готовых журналов всей группы доступна выгрузка единого ZIP-архива.',
    route: 'preview',
    targetSelector: '[data-tour-id="export-menu-button"]',
    fallbackSelector: '[data-tour-id="home-create-group"]',
    preferredPlacement: 'bottom',
    requiresExistingGroup: true,
    emptyDataNote:
      'Экспорт в PDF, PNG и ZIP доступен для любого созданного журнала резидента.',
    previewLayout: 'spread',
  },
];

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return Boolean(window.localStorage.getItem(ONBOARDING_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function markOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ completed: true, completedAt: new Date().toISOString() })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function resetOnboardingStatus(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
